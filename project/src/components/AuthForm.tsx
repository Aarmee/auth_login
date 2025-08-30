import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'register';
  onToggleMode: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { error, token } = await signIn(email, password);
        if (error) {
          setError(error);
        } else if (token) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1200);
        }
      } else {
        const { error, message } = await signUp(email, password, { full_name: fullName });
        if (error) {
          setError(error);
        } else {
          setSuccess(message || 'Registration successful! You can now log in.');
          setTimeout(() => {
            onToggleMode();
            setSuccess('');
          }, 1500);
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 blur-md scale-125"
        style={{ filter: 'blur(6px) brightness(0.7)', objectPosition: 'center' }}
      >
        <source src="https://res.cloudinary.com/dyeviud0s/video/upload/v1754151843/PixVerse_V4.5_Image_Text_360P_i_want_secure_wh_on4bgb.mp4" type="video/mp4" />
      </video>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-white/20 backdrop-blur-lg border border-white/30" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
        <div className="bg-gradient-to-br from-[#0f2027]/80 via-[#2c5364]/80 to-[#203a43]/80 p-8 text-center rounded-t-2xl border-b border-white/20">
          <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-lg">
            <User className="w-8 h-8 text-[#2c5364]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg tracking-wide">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-white/80 mt-2 text-base font-medium">
            {isLogin ? 'Access your dashboard securely' : 'Join and experience innovation'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-[#ffdde1]/80 border border-[#ee9ca7]/60 rounded-lg p-4 flex items-center space-x-3 shadow">
              <AlertCircle className="w-5 h-5 text-[#ee9ca7] flex-shrink-0" />
              <span className="text-[#d7263d] text-sm font-semibold">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-[#c6ffdd]/80 border border-[#fbd786]/60 rounded-lg p-4 flex items-center space-x-3 shadow">
              <span className="text-[#11998e] text-sm font-semibold">{success}</span>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-white/30 bg-white/40 text-[#203a43] rounded-lg focus:ring-2 focus:ring-[#11998e] focus:border-transparent transition-all duration-200 placeholder:text-[#203a43]/60"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-white/30 bg-white/40 text-[#203a43] rounded-lg focus:ring-2 focus:ring-[#11998e] focus:border-transparent transition-all duration-200 placeholder:text-[#203a43]/60"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-white/30 bg-white/40 text-[#203a43] rounded-lg focus:ring-2 focus:ring-[#11998e] focus:border-transparent transition-all duration-200 placeholder:text-[#203a43]/60"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-white/30 bg-white/40 text-[#203a43] rounded-lg focus:ring-2 focus:ring-[#11998e] focus:border-transparent transition-all duration-200 placeholder:text-[#203a43]/60"
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#11998e] via-[#38ef7d] to-[#43cea2] hover:from-[#11998e]/90 hover:to-[#43cea2]/90 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>

          {/* Google Login Button */}
          {isLogin && (
            <button
              type="button"
              onClick={() => window.location.href = '/api/auth/google'}
              className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg mt-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 mr-2"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.22 3.22l6.9-6.9C35.64 2.36 30.13 0 24 0 14.64 0 6.4 5.48 2.44 13.44l8.06 6.27C12.7 13.13 17.91 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.54-.14-3.02-.41-4.45H24v8.43h12.45c-.54 2.91-2.18 5.38-4.65 7.04l7.23 5.62C43.6 37.36 46.1 31.44 46.1 24.5z"/><path fill="#FBBC05" d="M10.5 28.73c-1.13-3.36-1.13-6.97 0-10.33l-8.06-6.27C.64 16.36 0 20.07 0 24c0 3.93.64 7.64 2.44 11.27l8.06-6.27z"/><path fill="#EA4335" d="M24 48c6.13 0 11.64-2.03 15.45-5.53l-7.23-5.62c-2.01 1.35-4.59 2.13-8.22 2.13-6.09 0-11.3-3.63-13.5-8.77l-8.06 6.27C6.4 42.52 14.64 48 24 48z"/></g></svg>
              <span>Sign in with Google</span>
            </button>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-[#11998e] hover:text-[#43cea2] font-bold transition-colors duration-200 underline underline-offset-2"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;