// src/components/Users/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../Services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Vérifier sessionStorage d'abord, puis localStorage
        let storedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
        let storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erreur auth:', error);
        // En cas d'erreur, nettoyer tout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  // AJOUTEZ CETTE FONCTION
  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      // Stocker les informations d'authentification
      if (data.token && data.user) {
        const token = data.token;
        const user = data.user;
        
        // Stocker dans localStorage ou sessionStorage selon votre choix
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Mettre à jour le state
        setToken(token);
        setUser(user);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur registration:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};