import { useState, useEffect } from 'react';
import config from '../env-config.js';

const API_BASE_URL = config.API_BASE_URL;

export const useUsage = () => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/chat/usage`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage);
      } else {
        throw new Error('Failed to fetch usage data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching usage:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUsage = () => {
    fetchUsage();
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  return {
    usage,
    loading,
    error,
    refreshUsage,
    isFreeUser: usage?.plan === 'free',
    isAtLimit: usage?.plan === 'free' && usage?.remaining === 0,
    isNearLimit: usage?.plan === 'free' && usage?.remaining <= 1
  };
};
