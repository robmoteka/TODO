import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Typ dla danych użytkownika
interface User {
  id: string;
  nazwa: string;
  email: string;
  rola: string;
  imie?: string;
  nazwisko?: string;
  aktywny?: boolean;
  ostatnieLogowanie?: Date;
}

// Typ dla kontekstu autoryzacji
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
  login: (email: string, haslo: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
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
  validationErrors: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
  updateUser: async () => {},
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null);

  // Ładowanie użytkownika przy montowaniu komponentu
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/ja');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err: any) {
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
   * Funkcja pomocnicza do obsługi błędów API
   * @param err - Błąd z API
   * @param defaultMessage - Domyślna wiadomość błędu
   */
  const handleApiError = (err: any, defaultMessage: string) => {
    if (err.response) {
      // Obsługa błędów walidacji
      if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
        const errors: Record<string, string> = {};
        err.response.data.errors.forEach((error: any) => {
          errors[error.param] = error.msg;
        });
        setValidationErrors(errors);
        setError('Proszę poprawić błędy w formularzu.');
      } else {
        // Obsługa innych błędów
        setError(err.response.data.message || defaultMessage);
      }
    } else {
      setError(defaultMessage);
    }
  };

  /**
   * Logowanie użytkownika
   * @param email - Email użytkownika
   * @param haslo - Hasło użytkownika
   */
  const login = async (email: string, haslo: string) => {
    try {
      setLoading(true);
      setValidationErrors(null);
      
      const res = await api.post('/auth/logowanie', { email, haslo });
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      handleApiError(err, 'Błąd logowania. Spróbuj ponownie.');
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
      setValidationErrors(null);
      
      const res = await api.post('/auth/rejestracja', userData);
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      handleApiError(err, 'Błąd rejestracji. Spróbuj ponownie.');
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aktualizacja danych użytkownika
   * @param userData - Dane do aktualizacji
   */
  const updateUser = async (userData: Partial<User>) => {
    if (!user || !token) {
      setError('Musisz być zalogowany, aby zaktualizować swoje dane.');
      return;
    }

    try {
      setLoading(true);
      setValidationErrors(null);
      
      const res = await api.put(`/users/${user.id}`, userData);
      
      setUser({...user, ...res.data.user});
      setError(null);
    } catch (err: any) {
      handleApiError(err, 'Błąd aktualizacji danych. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Wylogowanie użytkownika
   */
  const logout = async () => {
    try {
      // Wywołanie endpointu wylogowania
      await api.post('/auth/wyloguj');
    } catch (err) {
      console.error('Błąd wylogowania:', err);
    } finally {
      // Nawet jeśli wystąpi błąd, wylogowujemy lokalnie
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setValidationErrors(null);
    }
  };

  /**
   * Czyszczenie błędów
   */
  const clearError = () => {
    setError(null);
    setValidationErrors(null);
  };

  // Wartość kontekstu do udostępnienia
  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    validationErrors,
    login,
    register,
    logout,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
