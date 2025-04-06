import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

/**
 * Komponent chroniący ścieżki wymagające autoryzacji
 * Przekierowuje na stronę logowania jeśli użytkownik nie jest zalogowany
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pobieranie stanu autoryzacji z kontekstu
  const { isAuthenticated, loading } = useAuth();

  // Wyświetlanie ładowania podczas sprawdzania autoryzacji
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Przekierowanie na stronę logowania jeśli użytkownik nie jest zalogowany
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Renderowanie chronionej zawartości jeśli użytkownik jest zalogowany
  return <>{children}</>;
};

export default ProtectedRoute;
