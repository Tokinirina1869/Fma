import axios from 'axios';

// Définir l'URL de l'API de manière sécurisée
const getApiUrl = () => {
  // Vérifier si on est en développement ou en production
  if (typeof window !== 'undefined') {
    // En environnement navigateur
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Développement local
      return 'http://localhost:8000/api';
    } else {
      // Production - utiliser l'URL relative
      return '/api';
    }
  }
  
  // Fallback par défaut
  return 'http://localhost:8000/api';
};

const API_URL = getApiUrl();

console.log('API URL configurée:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
});

// Intercepteur de requête
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log pour débogage
        console.log(`Requête ${config.method?.toUpperCase()} vers:`, config.baseURL + config.url);
        return config;
    },
    (error) => {
        console.error('Erreur intercepteur requête:', error);
        return Promise.reject(error);
    },
);

// Intercepteur de réponse
api.interceptors.response.use(
    (response) => {
        console.log(`Réponse ${response.status} de:`, response.config.url);
        return response;
    },
    (error) => {
        console.error('Erreur API:', {
            message: error.message,
            code: error.code,
            url: error.config?.url,
            status: error.response?.status,
        });
        
        if (error.code === 'ECONNREFUSED') {
            error.message = 'Serveur backend non disponible. Vérifiez que le serveur est en cours d\'exécution.';
            error.isConnectionError = true;
        } else if (error.message.includes('Network Error')) {
            error.message = 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
            error.isNetworkError = true;
        }
        
        return Promise.reject(error);
    }
);

export default api;