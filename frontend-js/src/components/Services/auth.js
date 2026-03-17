// Services/auth.js
import api from './api';

export const authService = {
    // Note: Plus besoin de getRoles() car les rôles sont hardcodés dans le frontend
    
    // Enregistrement
    register: async (userData) => {
        try {
            const response = await api.post('/register', userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            console.error('Erreur API register:', error);
            throw error;
        }
    },

    // Connexion
    login: async (credentials) => {
        try {
            const response = await api.post('/login', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            console.error('Erreur API login:', error);
            throw error;
        }
    },

    // Déconnexion
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Vérifier l'authentification
    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        
        try {
            const response = await api.get('/user');
            return response.data;
        } catch (error) {
            console.error('Erreur vérification auth:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return false;
        }
    }
};