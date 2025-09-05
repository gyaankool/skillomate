
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import login from '../assets/images/login.png'
import google from '../assets/images/google.png'
import { Eye, EyeOff } from 'lucide-react';
import config from '../../env-config.js';

export default function Signup() {
  const API_BASE_URL = config.API_BASE_URL;
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    board: 'CBSE',
    grade: 'Class 1',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          board: formData.board,
          grade: formData.grade
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Google OAuth implementation would go here
    alert('Google signup functionality to be implemented');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#F8A95F]">
      {/* Left Side - Form */}
      <div className="w-full md:w-2/5 md:pt-2 md:pb-4 flex flex-col p-6 md:p-12">
          <h1 className="text-orange-500 font-bold text-2xl mb-10">Skillomate</h1>

        <div className="w-full max-w-xl flex-1 flex items-center">
<div className='w-full'>
          <h2 className="text-3xl text-center md:text-left font-bold text-orange-500 mb-6 md:mb-2">Signup</h2>
          <p className="font-bold mb-6 hidden md:block">Hi, Welcome</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block font-bold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="E.g. joedavis@email.com"
              className="w-full p-3 border rounded mb-4"
              required
            />

            <label className="block font-bold mb-1">Password</label>
            <div className="relative mb-2">
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
            <p className="text-xs text-gray-500 mb-4">
              Password must be at least 6 characters with uppercase, lowercase, and number
            </p>

            <label className="block font-bold mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full p-3 border rounded mb-6"
              required
            />

            <div className="flex space-x-3 mb-4">
              <div className='w-1/2'>
                <label className="block font-bold mb-1">Which Board</label>
                <select
                  name="board"
                  value={formData.board}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-400 outline-none"
                  required
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                </select>
              </div>
              <div className='w-1/2'>
                <label className="block font-bold mb-1">Which Grade</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-400 outline-none"
                  required
                >
                  <option value="Class 1">Class 1</option>
                  <option value="Class 2">Class 2</option>
                  <option value="Class 3">Class 3</option>
                  <option value="Class 4">Class 4</option>
                  <option value="Class 5">Class 5</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 font-bold">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                /> 
                Remember Me
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded mb-2 font-bold ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600'
              } text-white`}
            >
              {loading ? 'Creating Account...' : 'Signup'}
            </button>
          </form>

          <button 
            onClick={handleGoogleSignup}
            className="w-full border flex items-center justify-center gap-2 py-2 rounded mb-6 font-bold bg-white hover:bg-gray-50" 
          >
            <img
              src={google}
              alt="Google"
              className="w-8 h-8"
            />
            <h1 className='text-xl'>Login with Google</h1>
          </button>

          <p className="text-center text-lg font-medium">
            Already have an account?{" "}
            <button 
              onClick={() => navigate('/login')}
              className="text-orange-500 font-medium hover:text-orange-600"
            >
              Login
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


