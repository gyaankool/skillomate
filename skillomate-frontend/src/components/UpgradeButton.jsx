import { useState } from 'react';
import { Crown, Zap } from 'lucide-react';
import PaymentModal from './PaymentModal';

const UpgradeButton = ({ 
  variant = 'default', 
  size = 'md', 
  showIcon = true,
  className = '' 
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('student');

  const handleUpgrade = () => {
    setSelectedPlan('student');
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (response) => {
    console.log('Payment successful:', response);
    alert('Payment successful! Your subscription is now active.');
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'outline':
        return 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white';
      case 'ghost':
        return 'text-orange-500 hover:bg-orange-50';
      default:
        return 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <>
      <button
        onClick={handleUpgrade}
        className={`
          ${getVariantClasses()}
          ${getSizeClasses()}
          rounded-lg font-semibold transition-all duration-200
          flex items-center justify-center space-x-2
          ${className}
        `}
      >
        {showIcon && (
          variant === 'ghost' ? (
            <Zap className="w-4 h-4" />
          ) : (
            <Crown className="w-4 h-4" />
          )
        )}
        <span>Upgrade to Premium</span>
      </button>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default UpgradeButton;
