import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import zadaniaService from '../services/zadania.service';
import { Zadanie } from '../types';

/**
 * Strona edycji zadania
 * Umożliwia użytkownikowi edycję istniejącego zadania w systemie
 */
const EditTask: React.FC = () => {
  // Pobieranie parametrów z URL
  const { id } = useParams<{ id: string }>();
  
  // Stany komponentu
  const [zadanie, setZadanie] = useState<Zadanie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Hook nawigacji
  const navigate = useNavigate();
  
  // Pobieranie danych zadania
  useEffect(() => {
    const pobierz_zadanie = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const dane = await zadaniaService.pobierz_zadanie(id);
        setZadanie(dane);
        setError(null);
      } catch (err: any) {
        console.error('Błąd pobierania zadania:', err);
        setError(err.message || 'Nie udało się pobrać danych zadania');
      } finally {
        setLoading(false);
      }
    };
    
    pobierz_zadanie();
  }, [id]);
  
  /**
   * Obsługa zapisu zmian w zadaniu
   * @param zadanieData - Zaktualizowane dane zadania
   */
  const handle_submit = async (zadanieData: Partial<Zadanie>) => {
    if (!id) return;
    
    // Aktualizacja zadania przez API
    await zadaniaService.aktualizuj_zadanie(id, zadanieData);
    
    // Wyświetlenie komunikatu sukcesu
    setSuccess('Zadanie zostało pomyślnie zaktualizowane!');
    
    // Przekierowanie do szczegółów zadania po 2 sekundach
    setTimeout(() => {
      navigate(`/tasks/${id}`);
    }, 2000);
  };
  
  /**
   * Obsługa anulowania edycji zadania
   */
  const handle_cancel = () => {
    // Powrót do szczegółów zadania
    navigate(`/tasks/${id}`);
  };
  
  // Wyświetlanie ładowania
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Wyświetlanie błędu
  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }
  
  // Wyświetlanie formularza
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edycja zadania
        </Typography>
        
        {/* Komunikat sukcesu */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {/* Formularz zadania */}
        {zadanie && (
          <TaskForm 
            zadanieId={id}
            zadanieDoEdycji={zadanie}
            onSubmit={handle_submit}
            onCancel={handle_cancel}
          />
        )}
      </Box>
    </Container>
  );
};

export default EditTask;
