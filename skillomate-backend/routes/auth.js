const express = require('express');
const { body } = require('express-validator');
const crypto = require('crypto');


const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../config/smtp');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');
const bcrypt = require('bcryptjs/dist/bcrypt');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('board')
    .isIn(['CBSE', 'ICSE', 'State Board'])
    .withMessage('Please select a valid board'),
  
  body('grade')
    .isIn(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'])
    .withMessage('Please select a valid grade'),
  
  handleValidationErrors
], async (req, res) => {
  try {
    const { username, email, password, board, grade } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      board,
      grade
    });

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Send verification email
    const { subject, html } = emailTemplates.verificationEmail(username, verificationToken);
    await sendEmail(email, subject, html);

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        board: user.board,
        grade: user.grade,
        isEmailVerified: user.isEmailVerified,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        board: user.board,
        grade: user.grade,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    // Send welcome email
    const { subject, html } = emailTemplates.welcomeEmail(user.username);
    await sendEmail(user.email, subject, html);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  handleValidationErrors
], async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email
    const subject = 'Password Reset Request - GetSkilled Homework Helper';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316; text-align: center;">Password Reset Request</h1>
        <p>Hello ${user.username},</p>
        <p>You requested a password reset for your GetSkilled Homework Helper account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 10 minutes.</p>
        <p>Best regards,<br>The GetSkilled Homework Helper Team</p>
      </div>
    `;

    await sendEmail(email, subject, html);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
], async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        board: user.board,
        grade: user.grade,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Private
router.post('/resend-verification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Send verification email
    const { subject, html } = emailTemplates.verificationEmail(user.username, verificationToken);
    await sendEmail(user.email, subject, html);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email resend'
    });
  }
});


// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('user details', user);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        board: user.board,
        grade: user.grade,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Update user profile
router.put('/profile', [
  protect,
  body('board')
    .isIn(['CBSE', 'ICSE', 'State Board'])
    .withMessage('Invalid board selection'),
  body('grade')
    .isIn(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'])
    .withMessage('Invalid grade selection'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { board, grade, profilePicture } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.board = board;
    user.grade = grade;
    if (profilePicture) {
      user.profilePicture = profilePicture;
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        board: user.board,
        grade: user.grade,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});




// Change password
// Change password
router.put('/change-password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
console.log('user details', user);
    // Check if password exists
    // if (!user.password) {
    //   return res.status(400).json({ success: false, message: 'User password not set' });
    // }

    // Verify current password
    // const isMatch = await bcrypt.compare(currentPassword, user.password);
    // if (!isMatch) {
    //   return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    // }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user subscription after successful payment
router.put('/subscription', protect, [
  body('plan')
    .isIn(['free', 'student', 'family'])
    .withMessage('Invalid subscription plan'),
  body('status')
    .isIn(['active', 'inactive', 'cancelled'])
    .withMessage('Invalid subscription status'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { plan, status, startDate, endDate } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update subscription
    user.subscription.plan = plan;
    user.subscription.status = status;
    if (startDate) user.subscription.startDate = new Date(startDate);
    if (endDate) user.subscription.endDate = new Date(endDate);

    // Set subscription validity period and token budget
    console.log('=== SUBSCRIPTION UPDATE ===');
    console.log('Plan:', plan, 'Status:', status);
    console.log('Current user tokenUsage before update:', user.tokenUsage);
    
    if (plan === 'student') {
      // Student plan: 1 month validity + 66,000 tokens
      console.log('🎓 Setting up STUDENT PLAN');
      user.subscription.subscriptionValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      // Ensure tokenUsage object exists
      if (!user.tokenUsage) {
        user.tokenUsage = {};
      }
      
      user.tokenUsage.monthlyTokenBudget = 66000; // 66,000 tokens per month
      user.tokenUsage.tokensUsedThisMonth = 0; // Reset token usage
      user.tokenUsage.lastTokenReset = new Date();
      
      console.log('✅ Student plan token fields set:', {
        monthlyTokenBudget: user.tokenUsage.monthlyTokenBudget,
        tokensUsedThisMonth: user.tokenUsage.tokensUsedThisMonth,
        lastTokenReset: user.tokenUsage.lastTokenReset
      });
    } else if (plan === 'family') {
      // Family plan: 1 month validity, unlimited tokens
      console.log('👨‍👩‍👧‍👦 Setting up FAMILY PLAN');
      user.subscription.subscriptionValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      // Ensure tokenUsage object exists
      if (!user.tokenUsage) {
        user.tokenUsage = {};
      }
      
      user.tokenUsage.monthlyTokenBudget = 999999; // Effectively unlimited
      user.tokenUsage.tokensUsedThisMonth = 0;
      user.tokenUsage.lastTokenReset = new Date();
    } else if (plan === 'free') {
      // Free plan: no token budget
      console.log('🆓 Setting up FREE PLAN');
      user.subscription.subscriptionValidUntil = null;
      
      // Ensure tokenUsage object exists
      if (!user.tokenUsage) {
        user.tokenUsage = {};
      }
      
      user.tokenUsage.monthlyTokenBudget = 0;
      user.tokenUsage.tokensUsedThisMonth = 0;
    }

    // Reset usage stats for premium users
    if (plan !== 'free') {
      user.usageStats.responsesToday = 0;
      user.usageStats.lastResetDate = new Date();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: user.subscription,
      usage: {
        responsesToday: user.usageStats.responsesToday,
        remaining: user.getRemainingResponses(),
        plan: user.subscription.plan,
        tokenUsage: user.getTokenUsageInfo()
      }
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

