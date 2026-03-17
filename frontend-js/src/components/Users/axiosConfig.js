import axios from 'axios';

axios.interceptors.request.use(
  config => {
    // Priorité à sessionStorage (session en cours), puis localStorage (session persistante)
    let token = sessionStorage.getItem('token');
    if (!token) {
      token = localStorage.getItem('token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré → déconnexion
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);