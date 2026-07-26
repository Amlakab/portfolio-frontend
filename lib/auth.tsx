// lib/auth.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType } from '@/types';
import api from '@/app/utils/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const fetchUserProfile = async (): Promise<User | null> => {
    try {
      const response = await api.get('/auth/profile');
      
      if (response.status === 200) {
        const responseData = response.data;
        const userData = responseData.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string): Promise<User> => {
    try {
      const response = await api.post('/auth/login', {
        phone,
        password
      });

      const responseData = response.data;
      const { token, user: userData } = responseData.data;
      
      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const loginWithOtp = async (phone: string, otp: string): Promise<User> => {
    try {
      const response = await api.post('/auth/login-otp', {
        phone,
        otp
      });

      const responseData = response.data;
      const { token, user: userData } = responseData.data;
      
      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid OTP'); 
      }
      throw new Error(error.response?.data?.message || 'OTP login failed');
    }
  };

const register = async (userData: {
  name: string;
  email: string;
  phone: string;
  background?: string;
  password: string;
  role?: string;
}): Promise<User> => {
  try {
    // Clean and prepare the payload - matches what your backend expects
    const payload: any = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role || 'customer', // Default to customer if not specified
    };

    // Add background if provided
    if (userData.background && userData.background.trim() !== '') {
      payload.background = userData.background;
    }

    // Send to your backend registration endpoint
    const response = await api.post('/auth/register', payload);

    const responseData = response.data;
    
    // Check if response has the expected structure
    if (!responseData.success) {
      throw new Error(responseData.message || 'Registration failed');
    }

    const { user: userDataFromResponse, token } = responseData.data || {};

    // If token and user are returned, store them
    if (token && userDataFromResponse) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userDataFromResponse));
      setUser(userDataFromResponse);
      return userDataFromResponse;
    }

    // If no token returned (maybe login required after registration)
    if (userDataFromResponse) {
      return userDataFromResponse;
    }

    throw new Error('Invalid response from server');
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithOtp,
    register,
    logout,
    isLoading,
    fetchUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};