import { useState } from 'react';
import { Check, Crown, Users, Star } from 'lucide-react';
import PaymentModal from './PaymentModal';

const SubscriptionPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      period: 'forever',
      icon: <Star className="w-6 h-6" />,
      color: 'gray',
      features: [
        '5 Responses',
        'Basic AI responses',
        'Limited diagrams',
        'Community support'
      ],
      limitations: [
        'Limited daily questions',
        'Basic features only'
      ],
      popular: false
    },
    {
      id: 'student',
      name: 'Student Plan',
      price: 1,
      period: 'month',
      icon: <Crown className="w-6 h-6" />,
      color: 'orange',
      features: [
        'Unlimited AI questions',
        'Advanced tutoring',
        'All diagram types',
        'Offline mode',
        'Priority support',
        'Smart doubt solving'
      ],
      limitations: [],
      popular: true
    }
  ];

  const handleUpgrade = (planId) => {
    if (planId === 'free') {
      alert('You are already on the free plan!');
      return;
    }
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (response) => {
    console.log('Payment successful:', response);
    // You can add logic here to update user's subscription status
    alert('Payment successful! Your subscription is now active.');
  };

  const handleSubscriptionUpdate = () => {
    // Trigger refresh of usage data
    setRefreshTrigger(prev => prev + 1);
  };

  const getColorClasses = (color) => {
    const colors = {
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[color] || colors.gray;
  };

  const getButtonClasses = (color, popular) => {
    const baseClasses = 'w-full py-3 px-4 rounded-lg font-semibold transition-colors';
    if (popular) {
      return `${baseClasses} bg-orange-500 hover:bg-orange-600 text-white`;
    }
    const colors = {
      gray: 'bg-gray-500 hover:bg-gray-600 text-white',
      orange: 'bg-orange-500 hover:bg-orange-600 text-white',
      blue: 'bg-blue-500 hover:bg-blue-600 text-white'
    };
    return `${baseClasses} ${colors[color] || colors.gray}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Unlock the full potential of GetSkilled Homework Helper with our premium plans.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl shadow-md border ${
                plan.popular ? 'border-orange-500' : 'border-gray-200'
              } transition-all hover:shadow-lg`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 ${getColorClasses(plan.color)}`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">/{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="px-6 pb-6">
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 mb-1">Limitations:</h4>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="text-xs text-gray-400">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className={getButtonClasses(plan.color, plan.popular)}
                >
                  {plan.id === 'free' ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-3">
            All plans include 24/7 support and regular updates
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>🔒 Secure payments</span>
            <span>💳 All major cards accepted</span>
            <span>🔄 Cancel anytime</span>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
          onSubscriptionUpdate={handleSubscriptionUpdate}
        />
      )}
    </div>
  );
};

export default SubscriptionPlans;
