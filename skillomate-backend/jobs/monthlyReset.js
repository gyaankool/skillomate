/**
 * Monthly Token Reset Job
 * Resets token usage for all users on the 1st of every month
 */

const cron = require('node-cron');
const User = require('../models/User');
const mongoose = require('mongoose');

// Connect to MongoDB if not already connected
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillomate');
      console.log('MongoDB connected for monthly reset job');
    }
  } catch (error) {
    console.error('MongoDB connection error in monthly reset job:', error);
  }
};

// Function to reset monthly tokens for all users
const resetMonthlyTokens = async () => {
  try {
    console.log('Starting monthly token reset job...');
    
    // Connect to database
    await connectDB();
    
    // Find all users with active subscriptions
    const users = await User.find({
      'subscription.status': 'active',
      'subscription.plan': { $in: ['student', 'family'] }
    });
    
    console.log(`Found ${users.length} users to reset tokens for`);
    
    let resetCount = 0;
    let errorCount = 0;
    
    // Reset tokens for each user
    for (const user of users) {
      try {
        await user.resetMonthlyTokens();
        resetCount++;
        console.log(`Reset tokens for user: ${user.username} (${user.subscription.plan})`);
      } catch (error) {
        errorCount++;
        console.error(`Error resetting tokens for user ${user.username}:`, error);
      }
    }
    
    console.log(`Monthly token reset completed. Success: ${resetCount}, Errors: ${errorCount}`);
    
    // Log the reset event
    console.log(`Monthly token reset completed at ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('Error in monthly token reset job:', error);
  }
};

// Schedule the job to run on the 1st of every month at 00:01
const scheduleMonthlyReset = () => {
  // Run on the 1st of every month at 00:01
  cron.schedule('1 0 1 * *', async () => {
    console.log('Monthly token reset job triggered');
    await resetMonthlyTokens();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Indian timezone
  });
  
  console.log('Monthly token reset job scheduled for 1st of every month at 00:01 IST');
};

// Manual reset function (for testing or manual execution)
const manualReset = async () => {
  console.log('Manual monthly token reset triggered');
  await resetMonthlyTokens();
};

// Check if subscription is still valid and reset if expired
const checkAndResetExpiredSubscriptions = async () => {
  try {
    await connectDB();
    
    const now = new Date();
    const expiredUsers = await User.find({
      'subscription.status': 'active',
      'subscription.subscriptionValidUntil': { $lt: now }
    });
    
    console.log(`Found ${expiredUsers.length} users with expired subscriptions`);
    
    for (const user of expiredUsers) {
      // Reset to free plan
      user.subscription.plan = 'free';
      user.subscription.status = 'inactive';
      user.subscription.subscriptionValidUntil = null;
      user.tokenUsage.monthlyTokenBudget = 0;
      user.tokenUsage.tokensUsedThisMonth = 0;
      
      await user.save();
      console.log(`Reset user ${user.username} to free plan due to expired subscription`);
    }
    
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
  }
};

// Schedule daily check for expired subscriptions
const scheduleExpiredSubscriptionCheck = () => {
  // Run daily at 02:00
  cron.schedule('0 2 * * *', async () => {
    console.log('Checking for expired subscriptions...');
    await checkAndResetExpiredSubscriptions();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
  
  console.log('Expired subscription check scheduled for daily at 02:00 IST');
};

module.exports = {
  resetMonthlyTokens,
  scheduleMonthlyReset,
  manualReset,
  checkAndResetExpiredSubscriptions,
  scheduleExpiredSubscriptionCheck
};
