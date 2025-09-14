import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_BASE_URL = '/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Something went wrong');
  }

  return response.json();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiCall('/auth/me');
      setUser(response.user);
    } catch (error) {
      // No valid session, user stays null
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      const response = await apiCall('/auth/login', {
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
      await apiCall('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Even if logout fails, clear local state
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      // If it's a customer, they're auto-logged in
      if (userData.role === 'customer' && response.user) {
        setUser(response.user);
      }
      
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (updatedUserData) => {
    // For now, just update local state
    // In a real app, this would make an API call to update user data
    if (user && user.id === updatedUserData.id) {
      setUser(updatedUserData);
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};