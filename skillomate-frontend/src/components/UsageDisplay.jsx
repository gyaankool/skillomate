import { useState, useEffect } from 'react';
import { MessageSquare, Crown, AlertCircle } from 'lucide-react';
import config from '../../env-config.js';

const API_BASE_URL = config.API_BASE_URL;

const UsageDisplay = ({ className = "", refreshTrigger = 0 }) => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageStats();
  }, [refreshTrigger]);

  // Also fetch on component mount
  useEffect(() => {
    fetchUsageStats();
  }, []);

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
      } else {
        console.error('Usage API failed:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-3 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const isFreeUser = usage.plan === 'free';
  const isStudentUser = usage.plan === 'student';
  const isFamilyUser = usage.plan === 'family';
  
  // For free users, check daily limit
  const isNearLimit = isFreeUser && usage.remaining <= 1;
  const isAtLimit = isFreeUser && usage.remaining === 0;
  
  // For student users, extract tokenUsage with defensive coding
  const tokenUsage = usage.tokenUsage || {};
  const isNearTokenLimit = tokenUsage.tokensRemaining <= 1000;
  const isAtTokenLimit = tokenUsage.tokensRemaining <= 0;
  
  // Calculate progress bar width percentage for student users (REMAINING tokens)
  const progressWidth = Math.max(0, (tokenUsage.tokensRemaining / tokenUsage.tokenBudget) * 100);
  

  return (
    <div className={`bg-white rounded-lg p-3 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isFreeUser ? (
            <MessageSquare className="w-4 h-4 text-gray-500 mr-2" />
          ) : (
            <Crown className="w-4 h-4 text-orange-500 mr-2" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isFreeUser ? 'Free Plan' : 
               isStudentUser ? 'Student Plan' : 
               'Family Plan'}
            </p>
            <p className="text-xs text-gray-500">
              {isFreeUser ? (
                `${usage.remaining} of 5 remaining today`
              ) : isStudentUser ? (
                'Monthly usage'
              ) : (
                'Unlimited responses'
              )}
            </p>
          </div>
        </div>
        
        {/* Debug refresh button - Hidden */}
        {/* <button 
          onClick={fetchUsageStats}
          className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
        >
          Refresh
        </button> */}
        
        {(isFreeUser || isStudentUser) && (
          <div className="flex items-center">
            {(isAtLimit || isAtTokenLimit) ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (isNearLimit || isNearTokenLimit) ? (
              <AlertCircle className="w-4 h-4 text-orange-500" />
            ) : (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        )}
      </div>
      
      {isFreeUser && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all ${
                isAtLimit ? 'bg-red-500' : 
                isNearLimit ? 'bg-orange-500' : 
                'bg-green-500'
              }`}
              style={{ 
                width: `${(usage.responsesToday / 5) * 100}%`
              }}
            ></div>
          </div>
        </div>
      )}
      
      {isStudentUser && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                isAtTokenLimit ? 'bg-red-500' : 
                isNearTokenLimit ? 'bg-orange-500' : 
                'bg-green-500'
              }`}
              style={{ 
                width: `${progressWidth}%`
              }}
            ></div>
          </div>
          {/* Token numbers hidden */}
          {/* <p className="text-xs text-gray-600 mt-1">
            {tokenUsage.tokensRemaining || 0} tokens remaining of {tokenUsage.tokenBudget || 0}
          </p> */}
        </div>
      )}
      
    </div>
  );
};

export default UsageDisplay;
