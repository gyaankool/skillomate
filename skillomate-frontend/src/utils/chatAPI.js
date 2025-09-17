import config from '../env-config.js';
import { isUsageLimitError, getUsageLimitData } from './usageUtils';

const API_BASE_URL = config.API_BASE_URL;

// Helper function to make authenticated API requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'Request failed');
    error.response = {
      status: response.status,
      data: errorData
    };
    throw error;
  }

  return response.json();
};

// Create AI session with usage tracking
export const createAISession = async () => {
  try {
    const data = await makeAuthenticatedRequest(`${API_BASE_URL}/chat/ai-session`, {
      method: 'POST'
    });
    return data;
  } catch (error) {
    if (isUsageLimitError(error)) {
      throw {
        type: 'USAGE_LIMIT',
        data: getUsageLimitData(error),
        errorType: error?.response?.data?.error
      };
    }
    throw error;
  }
};

// Send AI message with usage tracking
export const sendAIMessage = async (message, sessionId) => {
  try {
    const data = await makeAuthenticatedRequest(`${API_BASE_URL}/chat/ai-message`, {
      method: 'POST',
      body: JSON.stringify({
        message: message,
        session_id: sessionId
      })
    });
    return data;
  } catch (error) {
    if (isUsageLimitError(error)) {
      throw {
        type: 'USAGE_LIMIT',
        data: getUsageLimitData(error),
        errorType: error?.response?.data?.error
      };
    }
    throw error;
  }
};

// Get usage statistics
export const getUsageStats = async () => {
  try {
    const data = await makeAuthenticatedRequest(`${API_BASE_URL}/chat/usage`);
    return data;
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    throw error;
  }
};

// Update subscription after payment
export const updateSubscription = async (plan, status = 'active') => {
  try {
    const data = await makeAuthenticatedRequest(`${API_BASE_URL}/auth/subscription`, {
      method: 'PUT',
      body: JSON.stringify({
        plan: plan,
        status: status,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    });
    return data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};
