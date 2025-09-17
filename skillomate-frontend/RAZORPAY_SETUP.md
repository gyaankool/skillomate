# Razorpay Integration Setup Guide

## 🚀 Quick Setup

### 1. Get Your Razorpay Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings > API Keys**
3. Copy your **Test Key ID** (starts with `rzp_test_`)

### 2. Configure Frontend

Update the Razorpay configuration in `src/config/razorpay.js`:

```javascript
export const RAZORPAY_CONFIG = {
  keyId: 'rzp_test_your_actual_key_id_here', // Replace with your key
  currency: 'INR',
  companyName: 'GetSkilled Homework Helper',
  companyDescription: 'AI-Powered Learning Platform',
  theme: {
    color: '#f97316'
  }
};
```

### 3. Configure Backend

Add these environment variables to your backend `.env` file:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

### 4. Test the Integration

1. Start your backend server: `npm run dev`
2. Start your frontend: `npm run dev`
3. Navigate to `/subscription` page
4. Click "Upgrade to Student Plan"
5. Use Razorpay test cards for payment

## 🧪 Test Cards

Use these test card numbers for testing:

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## 📁 Files Created

- `src/components/PaymentModal.jsx` - Payment modal component
- `src/components/SubscriptionPlans.jsx` - Subscription plans page
- `src/components/UpgradeButton.jsx` - Reusable upgrade button
- `src/pages/Subscription.jsx` - Subscription page
- `src/config/razorpay.js` - Razorpay configuration

## 🔗 Routes Added

- `/subscription` - Main subscription page

## 🎯 How to Use

### Option 1: Full Subscription Page
Navigate to `/subscription` to see all plans and upgrade.

### Option 2: Add Upgrade Button to Existing Pages
```jsx
import UpgradeButton from '../components/UpgradeButton';

// In your component
<UpgradeButton variant="primary" size="lg" />
```

### Option 3: Custom Payment Modal
```jsx
import PaymentModal from '../components/PaymentModal';

// In your component
<PaymentModal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  plan="student"
  onSuccess={(response) => console.log('Payment successful!')}
/>
```

## 🔧 Customization

### Change Plan Prices
Edit the `planDetails` object in `PaymentModal.jsx`:

```javascript
const planDetails = {
  student: {
    name: 'Student Plan',
    price: 299, // Change this
    features: [...]
  }
};
```

### Change Colors
Update the theme in `razorpay.js`:

```javascript
theme: {
  color: '#your-brand-color'
}
```

## 🚨 Important Notes

1. **Never commit your Razorpay keys** to version control
2. **Use test keys** for development
3. **Switch to live keys** only for production
4. **Test thoroughly** before going live

## 🆘 Troubleshooting

### Payment Not Working?
1. Check if Razorpay keys are correct
2. Verify backend is running on correct port
3. Check browser console for errors
4. Ensure CORS is properly configured

### Modal Not Opening?
1. Check if Razorpay script is loading
2. Verify the key ID is correct
3. Check network requests in browser dev tools

## 📞 Support

For Razorpay-specific issues, check:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)
