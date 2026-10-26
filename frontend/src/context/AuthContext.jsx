import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';
import { setAuthToken } from '../api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setAuthToken(parsed.token);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/users/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      setAuthToken(data.token);
      return { success: true, user: data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await API.post('/users/register', { name, email, password });
      if (data.verificationRequired === true) return { success: true, ...data };
      return {
        success: false,
        error: data.message || 'Email verification is required before you can sign in.',
      };
    } catch (error) {
      return {
        success: false,
        code: error.response?.data?.code,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const { data } = await API.post('/users/verify-email', { email, code });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Could not verify email' };
    }
  };

  const resendVerification = async (email) => {
    try {
      const { data } = await API.post('/users/resend-verification', { email });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Could not resend verification code' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await API.put('/users/profile', profileData);
      const updatedUser = { ...user, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Could not update profile' };
    }
  };

  const requestEmailChange = async (email, currentPassword) => {
    try {
      const { data } = await API.put('/users/profile/email-verification', { email, currentPassword });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Could not send email verification code' };
    }
  };

  const verifyEmailChange = async (code) => {
    try {
      const { data } = await API.put('/users/profile/verify-email', { code });
      const updatedUser = { ...user, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Could not verify email change' };
    }
  };

  const resendEmailChangeCode = async () => {
    try {
      const { data } = await API.post('/users/profile/resend-email-verification');
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Could not resend verification code' };
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      verifyEmail,
      resendVerification,
      updateProfile,
      requestEmailChange,
      verifyEmailChange,
      resendEmailChangeCode,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};