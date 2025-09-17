import { useState } from 'react';
import { X, Crown, Star, Check } from 'lucide-react';
import PaymentModal from './PaymentModal';

const PaymentPopup = ({ isOpen, onClose, onSuccess, onSubscriptionUpdate }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (response) => {
    setShowPaymentModal(false);
    // Trigger usage refresh
    if (onSubscriptionUpdate) {
      onSubscriptionUpdate();
    }
    onSuccess && onSuccess(response);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Popup */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                You've used all 5 free responses!
              </h3>
              <p className="text-gray-600 mb-6">
                Upgrade to Student Plan to continue asking unlimited questions and unlock advanced features.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 text-center">Student Plan Features:</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Unlimited AI questions</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Advanced tutoring</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">All diagram types</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Priority support</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900">₹1,200</div>
              <div className="text-gray-500">per month</div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleUpgrade}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Upgrade to Student Plan
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Maybe Later
              </button>
            </div>

            {/* Trust indicators */}
            <div className="text-center mt-4">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <span>🔒 Secure payment</span>
                <span>💳 All cards accepted</span>
                <span>🔄 Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan="student"
          onSuccess={handlePaymentSuccess}
          onSubscriptionUpdate={onSubscriptionUpdate}
        />
      )}
    </>
  );
};

export default PaymentPopup;
