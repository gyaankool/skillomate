const User = require('../models/User');
const { estimateRequestTokens, categorizeRequest } = require('../utils/tokenEstimator');

// Middleware to check usage limits before processing requests
const checkUsageLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user message for token estimation
    const userMessage = req.body?.message || req.body?.question || '';
    const context = req.body?.context || {};
    
    // For voice input, we can't estimate tokens until after speech-to-text
    // So we'll use a default estimation
    let estimatedTokens = 0;
    let requestCategory = { category: 'medium' };
    
    if (userMessage) {
      // Regular text input
      estimatedTokens = estimateRequestTokens(userMessage, context);
      requestCategory = categorizeRequest(userMessage);
    } else {
      // Voice input - use default estimation
      estimatedTokens = 200; // Default for voice input
      requestCategory = { category: 'medium' };
    }
    
    console.log('Usage check - User:', user.username, 'Plan:', user.subscription.plan, 
                'Estimated tokens:', estimatedTokens, 'Category:', requestCategory.category);

    // Check if user can make more requests
    if (!user.canMakeRequest()) {
      const remaining = user.getRemainingResponses();
      console.log('Usage limit exceeded - Plan:', user.subscription.plan, 'Remaining:', remaining);
      
      // Different error messages based on plan
      let errorMessage = 'Usage limit reached. Please upgrade to continue.';
      let errorType = 'USAGE_LIMIT_EXCEEDED';
      
      if (user.subscription.plan === 'student') {
        errorMessage = 'Your monthly token limit has been reached. Please upgrade your plan or wait for next cycle.';
        errorType = 'TOKEN_LIMIT_EXCEEDED';
      } else if (user.subscription.plan === 'free') {
        errorMessage = 'Daily limit reached. Please upgrade to continue.';
        errorType = 'DAILY_LIMIT_EXCEEDED';
      }
      
      return res.status(429).json({
        success: false,
        message: errorMessage,
        error: errorType,
        usage: {
          responsesToday: user.usageStats.responsesToday,
          remaining: remaining,
          limit: user.subscription.plan === 'free' ? 5 : user.tokenUsage.monthlyTokenBudget,
          plan: user.subscription.plan,
          tokenUsage: user.getTokenUsageInfo(),
          estimatedTokens: estimatedTokens,
          requestCategory: requestCategory
        },
        upgradeRequired: true
      });
    }
    
    // For student plan, check if user can consume the estimated tokens
    if (user.subscription.plan === 'student' && !user.canConsumeTokens(estimatedTokens)) {
      const tokenInfo = user.getTokenUsageInfo();
      console.log('Token limit would be exceeded - Tokens used:', tokenInfo.tokensUsed, 
                  'Budget:', tokenInfo.tokenBudget, 'Estimated:', estimatedTokens);
      
      return res.status(429).json({
        success: false,
        message: 'Your monthly token limit has been reached. Please upgrade your plan or wait for next cycle.',
        error: 'TOKEN_LIMIT_EXCEEDED',
        usage: {
          responsesToday: user.usageStats.responsesToday,
          remaining: remaining,
          limit: user.tokenUsage.monthlyTokenBudget,
          plan: user.subscription.plan,
          tokenUsage: tokenInfo,
          estimatedTokens: estimatedTokens,
          requestCategory: requestCategory
        },
        upgradeRequired: true
      });
    }
    
    console.log('Usage check passed - User can make request');

    // Add user and token info to request for later usage increment
    req.userData = user;
    req.estimatedTokens = estimatedTokens;
    req.requestCategory = requestCategory;
    next();
  } catch (error) {
    console.error('Usage check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking usage limits'
    });
  }
};

// Middleware to increment usage after successful request
const incrementUsage = async (req, res, next) => {
  try {
    if (req.userData) {
      // Increment daily usage counter (for free users)
      const newCount = await req.userData.incrementUsage();
      
      // Consume tokens (for student plan)
      let tokensConsumed = 0;
      if (req.userData.subscription.plan === 'student' && req.estimatedTokens) {
        console.log('Before consuming tokens:', {
          user: req.userData.username,
          plan: req.userData.subscription.plan,
          estimatedTokens: req.estimatedTokens,
          currentTokensUsed: req.userData.tokenUsage.tokensUsedThisMonth,
          tokenBudget: req.userData.tokenUsage.monthlyTokenBudget
        });
        
        tokensConsumed = await req.userData.consumeTokens(req.estimatedTokens);
        
        console.log('After consuming tokens:', {
          tokensConsumed: req.estimatedTokens,
          totalThisMonth: tokensConsumed,
          tokensRemaining: req.userData.tokenUsage.monthlyTokenBudget - tokensConsumed
        });
      }
      
      // Add usage info to response
      res.locals.usage = {
        responsesToday: newCount,
        remaining: req.userData.getRemainingResponses(),
        plan: req.userData.subscription.plan,
        tokenUsage: req.userData.getTokenUsageInfo(),
        tokensConsumed: tokensConsumed,
        requestCategory: req.requestCategory
      };
    }
    next();
  } catch (error) {
    console.error('Usage increment error:', error);
    // Don't fail the request if usage increment fails
    next();
  }
};

// Middleware to get usage stats (for frontend display)
const getUsageStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // CRITICAL FIX: Ensure student plan users have proper token budget
    if (user.subscription.plan === 'student') {
      // Fix student users with missing or zero token budget
      if (!user.tokenUsage?.monthlyTokenBudget || user.tokenUsage.monthlyTokenBudget === 0) {
        // Ensure tokenUsage object exists
        if (!user.tokenUsage) {
          user.tokenUsage = {};
        }
        
        user.tokenUsage.monthlyTokenBudget = 66000;
        user.tokenUsage.tokensUsedThisMonth = 0;
        user.tokenUsage.lastTokenReset = new Date();
        
        await user.save();
      }
    }

    // Get token usage info AFTER potential fix
    const tokenUsageInfo = user.getTokenUsageInfo();
    const remaining = user.getRemainingResponses();

    // Build the response object
    const responseData = {
      success: true,
      usage: {
        responsesToday: user.usageStats.responsesToday,
        remaining: remaining,
        totalResponses: user.usageStats.totalResponses,
        plan: user.subscription.plan,
        limit: user.subscription.plan === 'free' ? 5 : user.tokenUsage.monthlyTokenBudget,
        tokenUsage: tokenUsageInfo,
        subscriptionValidUntil: user.subscription.subscriptionValidUntil
      }
    };

    
    res.locals.usage = responseData;
    next();
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching usage stats'
    });
  }
};

module.exports = {
  checkUsageLimit,
  incrementUsage,
  getUsageStats
};
