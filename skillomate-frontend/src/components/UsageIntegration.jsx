import { useState } from 'react';
import UsageDisplay from './UsageDisplay';
import UsageLimitModal from './UsageLimitModal';
import PaymentModal from './PaymentModal';
import { isUsageLimitError, getUsageLimitData } from '../utils/usageUtils';

// This component shows how to integrate usage limits with your existing chat
const UsageIntegration = ({ children, onChatError }) => {
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [usageData, setUsageData] = useState(null);

  // Handle chat errors and check for usage limits
  const handleChatError = (error) => {
    if (isUsageLimitError(error)) {
      const limitData = getUsageLimitData(error);
      setUsageData(limitData);
      setShowUsageModal(true);
      return true; // Error was handled
    }
    
    // Pass other errors to parent
    if (onChatError) {
      onChatError(error);
    }
    return false; // Error was not handled
  };

  const handleUpgrade = () => {
    setShowUsageModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    // Optionally refresh usage data or show success message
  };

  return (
    <>
      {/* Usage Display - Add this to your Dashboard header */}
      <UsageDisplay className="mb-4" />
      
      {/* Your existing chat component */}
      {children}
      
      {/* Usage Limit Modal */}
      {showUsageModal && (
        <UsageLimitModal
          isOpen={showUsageModal}
          onClose={() => setShowUsageModal(false)}
          onUpgrade={handleUpgrade}
        />
      )}
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan="student"
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default UsageIntegration;
