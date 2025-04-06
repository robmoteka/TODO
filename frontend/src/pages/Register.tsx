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
  CircularProgress,
  Grid
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Strona rejestracji
 * Umożliwia utworzenie nowego konta użytkownika
 */
const Register: React.FC = () => {
  // Stany formularza
  const [formData, setFormData] = useState({
    nazwa: '',
    email: '',
    haslo: '',
    potwierdzHaslo: '',
    imie: '',
    nazwisko: ''
  });
  
  // Stany błędów formularza
  const [formErrors, setFormErrors] = useState({
    nazwa: '',
    email: '',
    haslo: '',
    potwierdzHaslo: ''
  });
  
  // Pobieranie kontekstu autoryzacji
  const { register, isAuthenticated, error, validationErrors, loading, clearError } = useAuth();
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
      const newErrors = { ...formErrors };
      
      if (validationErrors.nazwa) {
        newErrors.nazwa = validationErrors.nazwa;
      }
      if (validationErrors.email) {
        newErrors.email = validationErrors.email;
      }
      if (validationErrors.haslo) {
        newErrors.haslo = validationErrors.haslo;
      }
      
      setFormErrors(newErrors);
    }
  }, [validationErrors]);
  
  // Obsługa zmiany pól formularza
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Walidacja formularza
  const walidujFormularz = (): boolean => {
    let isValid = true;
    const newErrors = {
      nazwa: '',
      email: '',
      haslo: '',
      potwierdzHaslo: ''
    };
    
    // Walidacja nazwy użytkownika
    if (!formData.nazwa) {
      newErrors.nazwa = 'Nazwa użytkownika jest wymagana';
      isValid = false;
    } else if (formData.nazwa.length < 3) {
      newErrors.nazwa = 'Nazwa użytkownika musi mieć co najmniej 3 znaki';
      isValid = false;
    }
    
    // Walidacja email
    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
      isValid = false;
    }
    
    // Walidacja hasła
    if (!formData.haslo) {
      newErrors.haslo = 'Hasło jest wymagane';
      isValid = false;
    } else if (formData.haslo.length < 6) {
      newErrors.haslo = 'Hasło musi mieć co najmniej 6 znaków';
      isValid = false;
    }
    
    // Walidacja potwierdzenia hasła
    if (formData.haslo !== formData.potwierdzHaslo) {
      newErrors.potwierdzHaslo = 'Hasła nie są identyczne';
      isValid = false;
    }
    
    setFormErrors(newErrors);
    return isValid;
  };
  
  // Obsługa rejestracji
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Czyszczenie poprzednich błędów
    clearError();
    
    // Walidacja formularza
    if (walidujFormularz()) {
      try {
        // Przygotowanie danych do rejestracji
        const userData = {
          nazwa: formData.nazwa,
          email: formData.email,
          haslo: formData.haslo,
          imie: formData.imie || undefined,
          nazwisko: formData.nazwisko || undefined
        };
        
        // Wywołanie funkcji rejestracji z kontekstu
        await register(userData);
      } catch (err) {
        console.error('Błąd rejestracji:', err);
      }
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
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
            Rejestracja
          </Typography>
          
          {/* Wyświetlanie błędu z API */}
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="nazwa"
                  label="Nazwa użytkownika"
                  name="nazwa"
                  autoComplete="username"
                  value={formData.nazwa}
                  onChange={handleChange}
                  error={!!formErrors.nazwa}
                  helperText={formErrors.nazwa}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Adres email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="imie"
                  label="Imię"
                  name="imie"
                  autoComplete="given-name"
                  value={formData.imie}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="nazwisko"
                  label="Nazwisko"
                  name="nazwisko"
                  autoComplete="family-name"
                  value={formData.nazwisko}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="haslo"
                  label="Hasło"
                  type="password"
                  id="haslo"
                  autoComplete="new-password"
                  value={formData.haslo}
                  onChange={handleChange}
                  error={!!formErrors.haslo}
                  helperText={formErrors.haslo}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="potwierdzHaslo"
                  label="Potwierdź hasło"
                  type="password"
                  id="potwierdzHaslo"
                  autoComplete="new-password"
                  value={formData.potwierdzHaslo}
                  onChange={handleChange}
                  error={!!formErrors.potwierdzHaslo}
                  helperText={formErrors.potwierdzHaslo}
                  disabled={loading}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Zarejestruj się'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <MuiLink component={Link} to="/login" variant="body2">
                {"Masz już konto? Zaloguj się"}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
