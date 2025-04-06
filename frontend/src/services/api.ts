import axios from 'axios';

// Konfiguracja bazowego URL dla API
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Tworzenie instancji axios z konfiguracją
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor do dodawania tokenu do nagłówków
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor do obsługi błędów
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Obsługa błędu 401 (nieautoryzowany) - wylogowanie użytkownika
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Eksport instancji API
export default api;
