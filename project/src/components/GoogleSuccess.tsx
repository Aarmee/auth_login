import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GoogleSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();

  // Extract parameters once
  const params = useMemo(() => ({
    token: searchParams.get('token'),
    email: searchParams.get('email')
  }), [searchParams]);

  useEffect(() => {
    if (params.token && params.email) {
      // Update auth context with token and email
      loginWithToken(params.token, params.email);
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // If no token, redirect to login
      navigate('/', { replace: true });
    }
  }, [params.token, params.email, navigate, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing your login...</p>
      </div>
    </div>
  );
};

export default GoogleSuccess;
