// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login with:', email);
      const res = await api.post('/auth/login', { email, password });
      console.log('✅ Login response:', res.data);
      
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  // ✅ FIXED: Register function with better response handling
  const register = async (name, email, password, phone = '') => {
    try {
      console.log('📝 Attempting registration for:', email);
      
      const res = await api.post('/auth/register', {
        name,
        email: email.toLowerCase().trim(),
        password,
        phone: phone || '',
        role: 'user'
      });
      
      console.log('✅ Registration response:', res.data);
      
      // ✅ Check if registration was successful
      // Handle different response structures
      if (res.data && (res.data.success === true || res.data.message === 'User registered successfully')) {
        return { 
          success: true,
          message: res.data.message || 'Registration successful!'
        };
      } else {
        return {
          success: false,
          error: res.data?.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Check if error response has a message
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      
      // If the error is actually a success message (some APIs return 400 with success message)
      if (errorMessage.includes('successfully') || errorMessage.includes('registered')) {
        return { 
          success: true,
          message: errorMessage
        };
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};