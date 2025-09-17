import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionPlans from '../components/SubscriptionPlans';
import Sidebar from '../components/Sidebar';
import config from '../../env-config.js';

const API_BASE_URL = config.API_BASE_URL;

const Subscription = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user data
    fetchUserData();
    
    // Listen for subscription updates
    const handleSubscriptionUpdate = () => {
      fetchUserData();
    };
    
    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    
    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        className=""
      />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isCollapsed ? "md:ml-20 ml-0" : "md:ml-64 ml-0"
        } transition-all duration-300`}
      >
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Subscription Plans</h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back, {user?.username || 'User'}! Choose the perfect plan for your learning journey.
            </p>
          </div>
        </div>

        {/* Subscription Plans Component */}
        <SubscriptionPlans />
      </div>
    </div>
  );
};

export default Subscription;
