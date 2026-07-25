import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check user authentication status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch current user from /auth/me
          // Axios interceptor returns response.data (the ApiResponse body)
          // So response = { success, message, data: <user> }
          const response = await api.get('/auth/me');
          const fetchedUser = response.data;
          setUser(fetchedUser);
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Auth initialization failed:", err.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // Axios interceptor returns response.data (the ApiResponse body)
      // So response = { success, message, data: { user, accessToken } }
      const response = await api.post('/auth/login', { email, password });
      const token = response.data?.accessToken;
      const loggedUser = response.data?.user;

      if (token && loggedUser) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setIsAuthenticated(true);
        return loggedUser;
      } else {
        throw new Error("Invalid response format from login endpoint");
      }
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (signupData) => {
    setIsLoading(true);
    try {
      // Axios interceptor returns response.data (the ApiResponse body)
      // So response = { success, message, data: { id, firstName, ... } }
      const response = await api.post('/auth/signup', signupData);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error("Logout request failed:", err.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
