const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { calculateRemainingDoubts } = require('../utils/tokenEstimator');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get user analytics
router.get('/user', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const tokenUsageInfo = user.getTokenUsageInfo();
    const remaining = user.getRemainingResponses();
    
    // Calculate remaining doubts by category
    const remainingDoubts = {
      short: calculateRemainingDoubts(tokenUsageInfo.tokensUsed, tokenUsageInfo.tokenBudget, 'short'),
      medium: calculateRemainingDoubts(tokenUsageInfo.tokensUsed, tokenUsageInfo.tokenBudget, 'medium'),
      long: calculateRemainingDoubts(tokenUsageInfo.tokensUsed, tokenUsageInfo.tokenBudget, 'long')
    };

    // Calculate usage percentage
    const usagePercentage = tokenUsageInfo.tokenBudget > 0 
      ? Math.round((tokenUsageInfo.tokensUsed / tokenUsageInfo.tokenBudget) * 100)
      : 0;

    res.json({
      success: true,
      analytics: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          plan: user.subscription.plan,
          subscriptionValidUntil: user.subscription.subscriptionValidUntil
        },
        usage: {
          responsesToday: user.usageStats.responsesToday,
          totalResponses: user.usageStats.totalResponses,
          remaining: remaining
        },
        tokenUsage: {
          ...tokenUsageInfo,
          usagePercentage,
          remainingDoubts
        },
        planInfo: {
          name: user.subscription.plan === 'free' ? 'Free Plan' : 
                user.subscription.plan === 'student' ? 'Student Plan' : 'Family Plan',
          monthlyBudget: tokenUsageInfo.tokenBudget,
          features: user.subscription.plan === 'free' ? 
            ['5 responses per day', 'Basic features'] :
            user.subscription.plan === 'student' ?
            ['66,000 tokens/month', 'Advanced features', 'Priority support'] :
            ['Unlimited tokens', 'All features', 'Family management']
        }
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// Get system-wide analytics (admin only)
router.get('/system', async (req, res) => {
  try {
    // Check if user is admin (you might want to add role-based access)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const freeUsers = await User.countDocuments({ 'subscription.plan': 'free' });
    const studentUsers = await User.countDocuments({ 'subscription.plan': 'student' });
    const familyUsers = await User.countDocuments({ 'subscription.plan': 'family' });

    // Get active subscriptions
    const activeSubscriptions = await User.countDocuments({
      'subscription.status': 'active',
      'subscription.plan': { $in: ['student', 'family'] }
    });

    // Get token usage statistics
    const tokenStats = await User.aggregate([
      {
        $match: {
          'subscription.plan': 'student',
          'subscription.status': 'active'
        }
      },
      {
        $group: {
          _id: null,
          totalTokensUsed: { $sum: '$tokenUsage.tokensUsedThisMonth' },
          averageTokensUsed: { $avg: '$tokenUsage.tokensUsedThisMonth' },
          maxTokensUsed: { $max: '$tokenUsage.tokensUsedThisMonth' },
          minTokensUsed: { $min: '$tokenUsage.tokensUsedThisMonth' }
        }
      }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await User.countDocuments({
      'usageStats.lastResetDate': { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          free: freeUsers,
          student: studentUsers,
          family: familyUsers,
          activeSubscriptions
        },
        tokenUsage: tokenStats[0] || {
          totalTokensUsed: 0,
          averageTokensUsed: 0,
          maxTokensUsed: 0,
          minTokensUsed: 0
        },
        activity: {
          recentActivity,
          period: '7 days'
        },
        revenue: {
          monthlyStudentRevenue: studentUsers * 1200, // ₹1200 per student
          monthlyFamilyRevenue: familyUsers * 99,    // ₹99 per family (if updated)
          totalMonthlyRevenue: (studentUsers * 1200) + (familyUsers * 99)
        }
      }
    });
  } catch (error) {
    console.error('System analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system analytics'
    });
  }
});

// Get token usage trends (last 30 days)
router.get('/trends', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For now, return current usage info
    // In a real implementation, you'd track daily usage in a separate collection
    const tokenUsageInfo = user.getTokenUsageInfo();
    
    res.json({
      success: true,
      trends: {
        currentMonth: {
          tokensUsed: tokenUsageInfo.tokensUsed,
          tokenBudget: tokenUsageInfo.tokenBudget,
          usagePercentage: Math.round((tokenUsageInfo.tokensUsed / tokenUsageInfo.tokenBudget) * 100)
        },
        // Placeholder for future implementation
        dailyUsage: [],
        weeklyUsage: [],
        monthlyUsage: []
      }
    });
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trends'
    });
  }
});

module.exports = router;
