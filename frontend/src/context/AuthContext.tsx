import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Typ dla danych użytkownika
interface User {
  id: string;
  nazwa: string;
  email: string;
  rola: string;
  imie?: string;
  nazwisko?: string;
}

// Typ dla kontekstu autoryzacji
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, haslo: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Dane do rejestracji
interface RegisterData {
  nazwa: string;
  email: string;
  haslo: string;
  imie?: string;
  nazwisko?: string;
}

// Tworzenie kontekstu z domyślnymi wartościami
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
});

/**
 * Hook do używania kontekstu autoryzacji
 * @returns Kontekst autoryzacji
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Dostawca kontekstu autoryzacji
 * @param props - Właściwości komponentu
 * @returns Komponent dostawcy kontekstu
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Stany dla danych użytkownika, tokenu, ładowania i błędów
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Konfiguracja nagłówka autoryzacji dla wszystkich żądań
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  // Ładowanie użytkownika przy montowaniu komponentu
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/user');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError('Sesja wygasła. Zaloguj się ponownie.');
      }

      setLoading(false);
    };

    loadUser();
  }, [token]);

  /**
   * Logowanie użytkownika
   * @param email - Email użytkownika
   * @param haslo - Hasło użytkownika
   */
  const login = async (email: string, haslo: string) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/login', { email, haslo });
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Błąd logowania. Spróbuj ponownie.');
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rejestracja nowego użytkownika
   * @param userData - Dane nowego użytkownika
   */
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register', userData);
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Błąd rejestracji. Spróbuj ponownie.');
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Wylogowanie użytkownika
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  /**
   * Czyszczenie błędów
   */
  const clearError = () => {
    setError(null);
  };

  // Wartość kontekstu do udostępnienia
  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
