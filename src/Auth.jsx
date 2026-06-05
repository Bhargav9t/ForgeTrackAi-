import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { API_BASE_URL } from './config';

const Auth = ({ theme, onToggleTheme, onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');

    try {
      if (type === 'login') {
        const body = new URLSearchParams();
        body.append('username', formData.email);
        body.append('password', formData.password);

        const res = await fetch(`${API_BASE_URL}/auth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Invalid email or password');
        }
        const data = await res.json();
        localStorage.setItem('access_token', data.access_token);
        if (onAuthenticated) onAuthenticated(data.access_token);
      } else {
        const res = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Registration failed');
        }
        
        // Auto-login
        const body = new URLSearchParams();
        body.append('username', formData.email);
        body.append('password', formData.password);
        const loginRes = await fetch(`${API_BASE_URL}/auth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });
        if (loginRes.ok) {
          const data = await loginRes.json();
          localStorage.setItem('access_token', data.access_token);
          if (onAuthenticated) onAuthenticated(data.access_token);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07070a] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative transition-colors duration-200">
      
      {/* Theme Toggle Button */}
      <button
        onClick={onToggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl border border-gray-205 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer shadow-sm z-50"
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="max-w-5xl w-full bg-white dark:bg-[#0d0d15] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] relative border border-gray-100 dark:border-white/5 transition-all duration-200">
        
        {/* Left Side: Sign In */}
        <div className={`w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center transition-all duration-500 ease-in-out ${!isLogin ? 'opacity-50 pointer-events-none scale-95 blur-[2px]' : 'opacity-100 scale-100'}`}>
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome back</h2>
            <p className="text-gray-550 dark:text-gray-400 mb-8">Sign in to your ForgeTrack dashboard.</p>
            
            <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email address</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 dark:bg-white/[0.02] focus:bg-white dark:focus:bg-white/[0.05]"
                  placeholder="you@example.com" disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password" name="password" value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 dark:bg-white/[0.02] focus:bg-white dark:focus:bg-white/[0.05]"
                  placeholder="••••••••" disabled={loading}
                />
              </div>
              
              {isLogin && error && <p className="text-sm text-red-500 font-medium">{error}</p>}
              
              <button
                type="submit" disabled={loading || !isLogin}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
            
            <p className="mt-8 text-center text-sm text-gray-650 dark:text-gray-400 md:hidden">
              Don't have an account? <button type="button" onClick={(e) => { e.preventDefault(); setIsLogin(false); setError(''); }} className="font-bold text-indigo-650 hover:text-indigo-500 dark:text-indigo-400">Register</button>
            </p>
          </div>
        </div>

        {/* Right Side: Register */}
        <div className={`w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-indigo-50 dark:bg-indigo-950/20 transition-all duration-500 ease-in-out ${isLogin ? 'opacity-50 pointer-events-none scale-95 blur-[2px]' : 'opacity-100 scale-100'}`}>
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-4xl font-extrabold text-indigo-900 dark:text-indigo-200 mb-2">Create Account</h2>
            <p className="text-indigo-600/80 dark:text-indigo-300 mb-8">Join ForgeTrack to accelerate your career.</p>
            
            <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-1">Email address</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-indigo-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white dark:bg-white/[0.02] focus:bg-white dark:focus:bg-white/[0.05]"
                  placeholder="you@example.com" disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-1">Password</label>
                <input
                  type="password" name="password" value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-indigo-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white dark:bg-white/[0.02] focus:bg-white dark:focus:bg-white/[0.05]"
                  placeholder="••••••••" disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-1">Confirm Password</label>
                <input
                  type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-indigo-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white dark:bg-white/[0.02] focus:bg-white dark:focus:bg-white/[0.05]"
                  placeholder="••••••••" disabled={loading}
                />
              </div>

              {!isLogin && error && <p className="text-sm text-red-500 font-medium">{error}</p>}
              
              <button
                type="submit" disabled={loading || isLogin}
                className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>
            
            <p className="mt-8 text-center text-sm text-indigo-800 dark:text-indigo-350 md:hidden">
              Already have an account? <button type="button" onClick={(e) => { e.preventDefault(); setIsLogin(true); setError(''); }} className="font-bold text-indigo-650 hover:text-indigo-900 dark:text-indigo-400">Sign In</button>
            </p>
          </div>
        </div>

        {/* Desktop Overlay Toggle */}
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#0d0d15] rounded-full p-2 border border-gray-100 dark:border-white/5 shadow-xl z-10 transition-all duration-200">
          <div className="flex bg-gray-100 dark:bg-white/[0.04] rounded-full p-1 relative">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors duration-300 cursor-pointer ${isLogin ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-255'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors duration-300 cursor-pointer ${!isLogin ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-255'}`}
            >
              Sign Up
            </button>
            
            {/* Sliding Pill */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-full transition-transform duration-300 ease-out pointer-events-none`}
              style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)', left: '4px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
