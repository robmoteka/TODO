import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  Link as MuiLink,
  CircularProgress
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Strona logowania
 * Umożliwia użytkownikowi zalogowanie się do aplikacji
 */
const Login: React.FC = () => {
  // Stany formularza
  const [email, setEmail] = useState<string>('');
  const [haslo, setHaslo] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [hasloError, setHasloError] = useState<string>('');
  
  // Pobieranie kontekstu autoryzacji
  const { login, isAuthenticated, error, validationErrors, loading, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Przekierowanie jeśli użytkownik jest już zalogowany
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Aktualizacja błędów walidacji z API
  useEffect(() => {
    if (validationErrors) {
      if (validationErrors.email) {
        setEmailError(validationErrors.email);
      }
      if (validationErrors.haslo) {
        setHasloError(validationErrors.haslo);
      }
    }
  }, [validationErrors]);
  
  // Walidacja formularza
  const waliduj_formularz = (): boolean => {
    let isValid = true;
    
    // Walidacja email
    if (!email) {
      setEmailError('Email jest wymagany');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Nieprawidłowy format email');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Walidacja hasła
    if (!haslo) {
      setHasloError('Hasło jest wymagane');
      isValid = false;
    } else {
      setHasloError('');
    }
    
    return isValid;
  };
  
  // Obsługa logowania
  const handle_login = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Czyszczenie poprzednich błędów
    clearError();
    
    // Walidacja formularza
    if (waliduj_formularz()) {
      try {
        // Wywołanie funkcji logowania z kontekstu
        await login(email, haslo);
      } catch (err) {
        console.error('Błąd logowania:', err);
      }
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h5">
            Logowanie
          </Typography>
          
          {/* Wyświetlanie błędu z API */}
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handle_login} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adres email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="haslo"
              label="Hasło"
              type="password"
              id="haslo"
              autoComplete="current-password"
              value={haslo}
              onChange={(e) => setHaslo(e.target.value)}
              error={!!hasloError}
              helperText={hasloError}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Zaloguj się'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <MuiLink component={Link} to="/register" variant="body2">
                {"Nie masz konta? Zarejestruj się"}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
