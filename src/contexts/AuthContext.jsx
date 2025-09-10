import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('quickmeal_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const users = JSON.parse(localStorage.getItem('quickmeal_users') || '[]');
    const userToLogin = users.find(u => 
      (u.email === userData.emailOrUsername || u.username === userData.emailOrUsername) 
      && u.password === userData.password
    );

    if (userToLogin) {
      setUser(userToLogin);
      localStorage.setItem('quickmeal_user', JSON.stringify(userToLogin));
    }
    return userToLogin;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quickmeal_user');
  };

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('quickmeal_users') || '[]');
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      approved: userData.role === 'customer' ? true : false
    };
    users.push(newUser);
    localStorage.setItem('quickmeal_users', JSON.stringify(users));
    
    if (userData.role === 'customer') {
      setUser(newUser);
      localStorage.setItem('quickmeal_user', JSON.stringify(newUser));
    }
    
    return newUser;
  };

  const updateUser = (updatedUserData) => {
    const users = JSON.parse(localStorage.getItem('quickmeal_users') || '[]');
    const updatedUsers = users.map(u => u.id === updatedUserData.id ? updatedUserData : u);
    localStorage.setItem('quickmeal_users', JSON.stringify(updatedUsers));
    
    if (user && user.id === updatedUserData.id) {
      setUser(updatedUserData);
      localStorage.setItem('quickmeal_user', JSON.stringify(updatedUserData));
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