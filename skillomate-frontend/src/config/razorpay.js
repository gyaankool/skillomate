// Razorpay Configuration
// Replace these with your actual Razorpay keys

export const RAZORPAY_CONFIG = {
  // Test Key ID (for development)
  keyId: 'rzp_live_RGJzEl3CoaDUUx',
  
  // You can also hardcode it here for testing (not recommended for production)
  // keyId: 'rzp_test_1234567890abcdef',
  
  // Currency
  currency: 'INR',
  
  // Company details
  companyName: 'GetSkilled Homework Helper',
  companyDescription: 'AI-Powered Learning Platform',
  
  // Theme colors
  theme: {
    color: '#f97316' // Your brand color
  }
};

// Instructions:
// 1. Go to your Razorpay Dashboard
// 2. Navigate to Settings > API Keys
// 3. Copy your Test Key ID
// 4. Replace 'rzp_test_your_key_id_here' with your actual key
// 5. For production, use your Live Key ID (starts with rzp_live_)
