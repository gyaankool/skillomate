import { useState, useEffect } from 'react';
import { X, Crown, AlertTriangle } from 'lucide-react';
import UpgradeButton from './UpgradeButton';
import config from '../../env-config.js';

const API_BASE_URL = config.API_BASE_URL;

const UsageLimitModal = ({ isOpen, onClose, onUpgrade }) => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchUsageStats();
    }
  }, [isOpen]);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/usage`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage);
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    onUpgrade && onUpgrade();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-orange-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Daily Limit Reached</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading usage information...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-orange-500" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {usage?.plan === 'student' 
                    ? 'Your monthly token limit has been reached!'
                    : 'You\'ve used all 5 free responses today!'
                  }
                </h4>
                <p className="text-gray-600">
                  {usage?.plan === 'student'
                    ? 'Upgrade to Family plan for unlimited tokens or wait for next month\'s reset.'
                    : 'Upgrade to premium to get unlimited AI responses and unlock all features.'
                  }
                </p>
              </div>

              {usage && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h5 className="font-semibold text-gray-900 mb-2">
                    {usage.plan === 'student' ? 'Your Token Usage This Month:' : 'Your Usage Today:'}
                  </h5>
                  <div className="space-y-2">
                    {usage.plan === 'student' ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Usage:</span>
                          <span className="font-semibold">
                            {Math.round(((usage.tokenUsage?.tokensUsed || 0) / (usage.tokenUsage?.tokenBudget || 1)) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Next Reset:</span>
                          <span className="font-semibold text-blue-600">
                            {usage.tokenUsage?.nextReset ? 
                              new Date(usage.tokenUsage.nextReset).toLocaleDateString() : 
                              'N/A'
                            }
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                usage.tokenUsage?.tokensRemaining <= 0 ? 'bg-red-500' : 
                                usage.tokenUsage?.tokensRemaining <= 1000 ? 'bg-orange-500' : 
                                'bg-green-500'
                              }`}
                              style={{ 
                                width: `${Math.max(0, ((usage.tokenUsage?.tokenBudget - (usage.tokenUsage?.tokensUsed || 0)) / (usage.tokenUsage?.tokenBudget || 1)) * 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Responses Used:</span>
                          <span className="font-semibold">{usage.responsesToday}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Remaining:</span>
                          <span className="font-semibold text-red-500">{usage.remaining}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-semibold capitalize">{usage.plan}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <UpgradeButton 
                  variant="primary" 
                  size="lg" 
                  className="w-full"
                  onClick={handleUpgrade}
                />
                <button
                  onClick={onClose}
                  className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Maybe Later
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                {usage?.plan === 'student' 
                  ? 'Your monthly token limit will reset on the 1st of next month.'
                  : 'Your daily limit will reset tomorrow at midnight.'
                }
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsageLimitModal;
