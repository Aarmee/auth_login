import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type AuthContextType = {
  user: { email: string } | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: { full_name?: string }) => Promise<{ error?: string; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string; token?: string }>;
  loginWithToken: (token: string, email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = () => {
      const token = localStorage.getItem('auth_token');
      const email = localStorage.getItem('auth_email');
      
      if (token && email) {
        setUser({ email });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const signUp = async (email: string, password: string, userData?: { full_name?: string }) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: userData?.full_name }),
      });
      const data = await res.json();
      return data;
    } catch {
      return { error: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_email', email);
        setUser({ email });
      }
      return data;
    } catch {
      return { error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken = useCallback((token: string, email: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_email', email);
    setUser({ email });
  }, []);

  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_email');
    await fetch('http://localhost:5000/api/logout', { credentials: 'include' });
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, loginWithToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
