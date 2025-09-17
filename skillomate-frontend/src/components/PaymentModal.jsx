import { useState } from 'react';
import { X, CreditCard, CheckCircle } from 'lucide-react';
import config from '../../env-config.js';
import { RAZORPAY_CONFIG } from '../config/razorpay.js';

const API_BASE_URL = config.API_BASE_URL;

const PaymentModal = ({ isOpen, onClose, plan, onSuccess, onSubscriptionUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const planDetails = {
    student: {
      name: 'Student Plan',
      price: 1,
      features: [
        'Unlimited AI questions',
        'Advanced tutoring',
        'All diagram types',
        'Offline mode',
        'Priority support',
        'Smart doubt solving'
      ]
    }
  };

  const currentPlan = planDetails[plan];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Step 1: Create order on your backend
      const orderResponse = await fetch(`${API_BASE_URL}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: currentPlan.price * 100, // Convert to paise
          currency: 'INR',
          receipt: `getskilled_${plan}_${Date.now()}`,
          plan: plan,
          notes: {
            plan: plan,
            userId: localStorage.getItem('userId') || 'anonymous'
          }
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();
      console.log('Order created:', orderData);

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      if (!orderData || !orderData.id) {
        console.error('Invalid order data:', orderData);
        alert('Failed to create order. Please refresh and try again.');
        setLoading(false);
        return;
      }
``      

      // Step 3: Open Razorpay checkout
      const options = {
        key: RAZORPAY_CONFIG.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GetSkilled Homework Helper',
        description: `${currentPlan.name} Subscription`,
        order_id: orderData.id,
        handler: async function (response) {
          console.log('Payment successful:', response);
          
          try {
            // Update user subscription after successful payment
            const updateResponse = await fetch(`${API_BASE_URL}/auth/subscription`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                plan: plan,
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                // Add these fields
                tokenBudget: plan === 'student' ? 66000 : 0,
                resetTokens: true
              })
            });
            
            if (updateResponse.ok) {
              console.log('Subscription updated successfully');
              
              // Update user data in localStorage
              const userData = JSON.parse(localStorage.getItem('user') || '{}');
              userData.subscription = {
                plan: plan,
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              };
              localStorage.setItem('user', JSON.stringify(userData));
              
              // Trigger usage refresh
              if (onSubscriptionUpdate) {
                onSubscriptionUpdate();
              }
              // Dispatch event to notify subscription page
              window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
                detail: { plan: plan, status: 'active' } 
              }));
            }
          } catch (error) {
            console.error('Error updating subscription:', error);
          }
          
          setPaymentSuccess(true);
          setTimeout(() => {
            onSuccess && onSuccess(response);
            onClose();
          }, 2000);
        },
        prefill: {
          name: localStorage.getItem('username') || '',
          email: localStorage.getItem('email') || '',
        },
        theme: RAZORPAY_CONFIG.theme,
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-sm mx-auto relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">Upgrade to {currentPlan.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {paymentSuccess ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h4>
              <p className="text-gray-600">Your subscription is now active.</p>
            </div>
          ) : (
            <>
              {/* Plan Details */}
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-orange-500 mb-1">
                  ₹{currentPlan.price}
                  <span className="text-sm text-gray-500 font-normal">/month</span>
                </div>
                <p className="text-sm text-gray-600">Get unlimited access to all features</p>
              </div>

              {/* Features */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">What's included:</h4>
                <ul className="space-y-1">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600 text-sm">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors text-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ₹{currentPlan.price}
                  </>
                )}
              </button>

              {/* Security Note */}
              <p className="text-xs text-gray-500 text-center mt-3">
                🔒 Secure payment powered by Razorpay
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
