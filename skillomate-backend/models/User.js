const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  board: {
    type: String,
    required: [true, 'Board selection is required'],
    enum: ['CBSE', 'ICSE', 'State Board']
  },
  grade: {
    type: String,
    required: [true, 'Grade selection is required'],
    enum: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  // Chat sessions reference
  chatSessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  }],
  // User preferences for AI interactions
  aiPreferences: {
    defaultSubject: {
      type: String,
      enum: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Economics'],
      default: 'Mathematics'
    },
    defaultAnswerStyle: {
      type: String,
      enum: ['Simple', 'Detailed', 'Step-by-step', 'Visual', 'Interactive'],
      default: 'Simple'
    },
    enableVoiceInput: {
      type: Boolean,
      default: true
    },
    enableVoiceOutput: {
      type: Boolean,
      default: true
    }
  },
  // Usage tracking for free tier limits
  usageStats: {
    responsesToday: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    },
    totalResponses: {
      type: Number,
      default: 0
    }
  },
  // Subscription information
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'student', 'family'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date,
    subscriptionValidUntil: Date
  },
  // Token-based usage tracking
  tokenUsage: {
    tokensUsedThisMonth: {
      type: Number,
      default: 0
    },
    monthlyTokenBudget: {
      type: Number,
      default: 0 // 0 for free, 66000 for student, unlimited for family
    },
    lastTokenReset: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Method to add chat session
userSchema.methods.addChatSession = function(chatId) {
  if (!this.chatSessions.includes(chatId)) {
    this.chatSessions.push(chatId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove chat session
userSchema.methods.removeChatSession = function(chatId) {
  this.chatSessions = this.chatSessions.filter(id => id.toString() !== chatId.toString());
  return this.save();
};

// Method to get user's chat sessions
userSchema.methods.getChatSessions = function() {
  return this.populate('chatSessions');
};

// Method to check if user can make more requests
userSchema.methods.canMakeRequest = function() {
  // Free users are limited to 5 responses per day
  if (this.subscription.plan === 'free') {
    return this.usageStats.responsesToday < 5;
  }
  
  // Check subscription validity
  if (this.subscription.subscriptionValidUntil && new Date() > this.subscription.subscriptionValidUntil) {
    return false;
  }
  
  // For student plan, check token usage
  if (this.subscription.plan === 'student') {
    return this.tokenUsage.tokensUsedThisMonth < this.tokenUsage.monthlyTokenBudget;
  }
  
  // Family plan has unlimited access
  if (this.subscription.plan === 'family') {
    return true;
  }
  
  return false;
};

// Method to increment usage
userSchema.methods.incrementUsage = async function() {
  // Reset daily counter if it's a new day
  const today = new Date().toDateString();
  const lastReset = new Date(this.usageStats.lastResetDate).toDateString();
  
  console.log('Incrementing usage for user:', this.username, 'Before:', this.usageStats.responsesToday);
  
  if (today !== lastReset) {
    console.log('New day detected, resetting counter');
    this.usageStats.responsesToday = 0;
    this.usageStats.lastResetDate = new Date();
  }
  
  // Increment counters
  this.usageStats.responsesToday += 1;
  this.usageStats.totalResponses += 1;
  
  console.log('After increment:', this.usageStats.responsesToday);
  
  await this.save();
  return this.usageStats.responsesToday;
};

// Method to get remaining free responses
userSchema.methods.getRemainingResponses = function() {
  if (this.subscription.plan === 'free') {
    return Math.max(0, 5 - this.usageStats.responsesToday);
  }
  
  if (this.subscription.plan === 'student') {
    return Math.max(0, this.tokenUsage.monthlyTokenBudget - this.tokenUsage.tokensUsedThisMonth);
  }
  
  if (this.subscription.plan === 'family') {
    return 'unlimited';
  }
  
  return 0;
};

// Method to check if user can consume tokens
userSchema.methods.canConsumeTokens = function(estimatedTokens) {
  if (this.subscription.plan === 'free') {
    return false; // Free users don't use tokens
  }
  
  if (this.subscription.plan === 'family') {
    return true; // Family plan has unlimited tokens
  }
  
  if (this.subscription.plan === 'student') {
    return (this.tokenUsage.tokensUsedThisMonth + estimatedTokens) <= this.tokenUsage.monthlyTokenBudget;
  }
  
  return false;
};

// Method to consume tokens
userSchema.methods.consumeTokens = async function(tokens) {
  if (this.subscription.plan === 'student') {
    this.tokenUsage.tokensUsedThisMonth += tokens;
    await this.save();
    return this.tokenUsage.tokensUsedThisMonth;
  }
  
  return this.tokenUsage.tokensUsedThisMonth;
};

// Method to get token usage info
userSchema.methods.getTokenUsageInfo = function() {
  // Safety check: ensure tokenUsage exists
  if (!this.tokenUsage) {
    this.tokenUsage = {
      tokensUsedThisMonth: 0,
      monthlyTokenBudget: 0,
      lastTokenReset: new Date()
    };
  }
  
  const tokensUsed = this.tokenUsage.tokensUsedThisMonth || 0;
  const tokenBudget = this.tokenUsage.monthlyTokenBudget || 0;
  const tokensRemaining = Math.max(0, tokenBudget - tokensUsed);
  
  return {
    tokensUsed: tokensUsed,
    tokenBudget: tokenBudget,
    tokensRemaining: tokensRemaining,
    lastReset: this.tokenUsage.lastTokenReset || new Date(),
    nextReset: this.getNextTokenResetDate()
  };
};

// Method to get next token reset date
userSchema.methods.getNextTokenResetDate = function() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
};

// Method to reset monthly tokens (called by CRON job)
userSchema.methods.resetMonthlyTokens = async function() {
  this.tokenUsage.tokensUsedThisMonth = 0;
  this.tokenUsage.lastTokenReset = new Date();
  await this.save();
  return true;
};

module.exports = mongoose.model('User', userSchema);
