// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
// Keep API_BASE_URL as '/api' (we put PHP files under public_html/api/auth/)
const API_BASE_URL = '/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const apiCall = async (endpoint, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  // try parse JSON (some endpoints always return JSON)
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) {
    throw new Error('Invalid JSON from server');
  }

  if (!res.ok) {
    const err = (data && data.error) ? data.error : 'Network error';
    throw new Error(err);
  }
  return data;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiCall('/auth/me.php', { method: 'GET' });
      setUser(response.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    // userData should contain: emailOrUsername, password, rememberMe
    try {
      const response = await apiCall('/auth/login.php', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiCall('/auth/logout.php', { method: 'POST' });
    } catch (err) {
      console.warn('Logout API failed, but clearing session anyway:', err);
    } finally {
      setUser(null);
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiCall('/auth/register.php', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (userData.role === 'customer' && response.user) {
        setUser(response.user);
      }
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (updatedUserData) => {
    if (user && user.id === updatedUserData.id) setUser(updatedUserData);
  };

  const value = { user, login, logout, register, updateUser, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
