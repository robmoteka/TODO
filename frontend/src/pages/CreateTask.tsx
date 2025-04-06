import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Alert 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import zadaniaService from '../services/zadania.service';
import { Zadanie } from '../types';

/**
 * Strona tworzenia nowego zadania
 * Umożliwia użytkownikowi utworzenie nowego zadania w systemie
 */
const CreateTask: React.FC = () => {
  // Stan komunikatu sukcesu
  const [success, setSuccess] = useState<string | null>(null);
  
  // Hook nawigacji
  const navigate = useNavigate();
  
  /**
   * Obsługa zapisu nowego zadania
   * @param zadanieData - Dane nowego zadania
   */
  const handle_submit = async (zadanieData: Partial<Zadanie>) => {
    // Utworzenie zadania przez API
    const noweZadanie = await zadaniaService.utworz_zadanie(zadanieData);
    
    // Wyświetlenie komunikatu sukcesu
    setSuccess('Zadanie zostało pomyślnie utworzone!');
    
    // Przekierowanie do szczegółów zadania po 2 sekundach
    setTimeout(() => {
      navigate(`/tasks/${noweZadanie.id}`);
    }, 2000);
  };
  
  /**
   * Obsługa anulowania tworzenia zadania
   */
  const handle_cancel = () => {
    // Powrót do listy zadań
    navigate('/tasks');
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Utwórz nowe zadanie
        </Typography>
        
        {/* Komunikat sukcesu */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {/* Formularz zadania */}
        <TaskForm 
          onSubmit={handle_submit}
          onCancel={handle_cancel}
        />
      </Box>
    </Container>
  );
};

export default CreateTask;
