// src/components/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../Services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Vérifier l'authentification au chargement
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await api.get('/me');
                    setUser(response.data.user);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Erreur vérification auth:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Fonction d'inscription
    const register = async (userData) => {
        try {
            const response = await api.post('/register', userData);
            const { user, token } = response.data;
            
            // Stocker le token et les infos utilisateur
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Mettre à jour le state
            setUser(user);
            setIsAuthenticated(true);
            
            return { success: true, user };
        } 
        catch (error) {
            console.error('Erreur inscription:', error);
            throw error;
        }
    };

    // Fonction de connexion
    const login = async (credentials) => {
        try {
            const response = await api.post('/login', credentials);
            const { user, token } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            setUser(user);
            setIsAuthenticated(true);
            
            return { success: true, user };
        } catch (error) {
            console.error('Erreur connexion:', error);
            throw error;
        }
    };

    // Fonction de déconnexion
    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            register,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};