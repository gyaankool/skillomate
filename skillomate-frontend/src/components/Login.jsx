import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import login from '../assets/images/login.png';
import google from '../assets/images/google.png';
import { Eye, EyeOff } from 'lucide-react';
import config from '../../env-config.js';

export default function Login() {
  const navigate = useNavigate();
  const API_BASE_URL = config.API_BASE_URL;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    alert('Google login will be implemented soon!');
  };

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#FFFFFF] to-[#F8A95F]">
      {/* Left Side - Form */}
      <div className="w-full md:w-2/5 flex flex-col p-6 md:p-12">
          <h1 className="text-orange-500  font-bold text-lg md:text-2xl mb-12">Skillomate</h1>
       
        <div className="w-full max-w-xl flex-1 flex items-center">
          <div className='w-full'>
          <h2 className="text-3xl text-center md:text-left font-medium text-orange-500 mb-2">Login</h2>
          <p className="font-bold mb-8 text-center md:text-left">Hi, Welcome back</p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="E.g. joedavis@email.com"
              className="w-full p-3 border rounded mb-6"
              required
            />

            <label className="block font-bold mb-2">Password</label>
            <div className="relative mb-8">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full p-3 border rounded pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between mb-8">
              <label className="flex items-center gap-2 font-bold">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                /> 
                Remember Me
              </label>
              <a href="#" className="text-orange-500 font-medium">
                Forgot Password?
              </a>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded mb-6 font-bold ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600'
              } text-white`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <button 
            onClick={handleGoogleLogin}
            className="w-full border flex items-center justify-center gap-2 py-3 rounded mb-6 font-bold bg-white hover:bg-gray-50" 
          >
            <img
              src={google}
              alt="Google"
              className="w-8 h-8"
            />
            <h1 className='text-xl'>Login with Google</h1>
          </button>

          <p className="text-center text-lg font-medium">
            Don't have an account?{" "}
            <button 
              onClick={handleCreateAccount}
              className="text-orange-500 font-medium hover:text-orange-600"
            >
              create an account
            </button>
          </p>
        </div>
        </div>
      </div>

      {/* Right Side - Image */}
       <div className="hidden md:flex w-3/5 items-center justify-center relative overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={login}
            alt="Background"
            className="w-[600px] h-[740px] object-cover rounded-[30px]"
          />
          <div className="absolute w-[600px] h-[740px] bg-black/50 rounded-[30px]" />
          
          <div className="absolute left-64  p-6 text-start">
            <h2 className="text-4xl  md:text-5xl font-bold  text-white flex flex-col gap-10">
              <span>Where</span>
              <span className="text-orange-500">Doubt</span>
              <span>Finds{" "}</span>
              <span>It's</span>
              <span className="text-orange-500">Answer</span>
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}


