import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  Button, 
  Divider, 
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  PriorityHigh as PriorityIcon,
  Build as BuildIcon,
  Category as CategoryIcon,
  Comment as CommentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import zadaniaService from '../services/zadania.service';
import { useAuth } from '../context/AuthContext';
import { Zadanie, StatusZadania, StatusRealizacji } from '../types';

/**
 * Strona szczegółów zadania
 * Wyświetla pełne informacje o zadaniu i umożliwia zarządzanie nim
 */
const TaskDetails: React.FC = () => {
  // Pobieranie parametrów z URL
  const { id } = useParams<{ id: string }>();
  
  // Stany komponentu
  const [zadanie, setZadanie] = useState<Zadanie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);
  
  // Pobieranie danych użytkownika z kontekstu
  const { user } = useAuth();
  
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
   * Obsługa przejścia do edycji zadania
   */
  const handle_edit = () => {
    navigate(`/tasks/${id}/edit`);
  };
  
  /**
   * Obsługa usuwania zadania
   */
  const handle_delete = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      await zadaniaService.usun_zadanie(id);
      
      // Przekierowanie do listy zadań
      navigate('/tasks');
    } catch (err: any) {
      console.error('Błąd usuwania zadania:', err);
      setError(err.message || 'Nie udało się usunąć zadania');
      setLoading(false);
    }
  };
  
  /**
   * Sprawdzenie czy użytkownik ma uprawnienia do edycji zadania
   */
  const czy_moze_edytowac = (): boolean => {
    if (!user || !zadanie) return false;
    
    // Autor zadania zawsze może edytować
    if (zadanie.autor?.id === user.id) return true;
    
    // Administratorzy i managerowie mogą edytować wszystkie zadania
    if (user.rola === 'admin' || user.rola === 'manager') return true;
    
    return false;
  };
  
  /**
   * Sprawdzenie czy użytkownik ma uprawnienia do usuwania zadania
   */
  const czy_moze_usunac = (): boolean => {
    if (!user || !zadanie) return false;
    
    // Tylko administratorzy mogą usuwać zadania
    return user.rola === 'admin';
  };
  
  /**
   * Formatowanie daty
   */
  const formatuj_date = (date: Date | string | undefined): string => {
    if (!date) return 'Nie określono';
    
    return format(new Date(date), 'dd MMMM yyyy, HH:mm', { locale: pl });
  };
  
  /**
   * Renderowanie koloru priorytetu
   */
  const kolor_priorytetu = (priorytet: number): string => {
    switch (priorytet) {
      case 1: return '#8bc34a'; // Niski
      case 2: return '#4caf50'; // Poniżej średniego
      case 3: return '#ff9800'; // Średni
      case 4: return '#f44336'; // Wysoki
      case 5: return '#9c27b0'; // Krytyczny
      default: return '#9e9e9e';
    }
  };
  
  /**
   * Renderowanie tekstu priorytetu
   */
  const tekst_priorytetu = (priorytet: number): string => {
    switch (priorytet) {
      case 1: return 'Niski';
      case 2: return 'Poniżej średniego';
      case 3: return 'Średni';
      case 4: return 'Wysoki';
      case 5: return 'Krytyczny';
      default: return 'Nieznany';
    }
  };
  
  /**
   * Renderowanie tekstu statusu zadania
   */
  const tekst_statusu = (status: string): string => {
    switch (status) {
      case StatusZadania.NOWE: return 'Nowe';
      case StatusZadania.W_TRAKCIE: return 'W trakcie';
      case StatusZadania.ROZWIAZANE: return 'Rozwiązane';
      case StatusZadania.ZAMKNIETE: return 'Zamknięte';
      default: return 'Nieznany';
    }
  };
  
  /**
   * Renderowanie tekstu statusu realizacji
   */
  const tekst_statusu_realizacji = (status: string): string => {
    switch (status) {
      case StatusRealizacji.NIEROZPOCZETE: return 'Nierozpoczęte';
      case StatusRealizacji.W_TRAKCIE: return 'W trakcie';
      case StatusRealizacji.WSTRZYMANE: return 'Wstrzymane';
      case StatusRealizacji.ZAKONCZONE: return 'Zakończone';
      default: return 'Nieznany';
    }
  };
  
  /**
   * Renderowanie koloru statusu realizacji
   */
  const kolor_statusu_realizacji = (status: string): string => {
    switch (status) {
      case StatusRealizacji.NIEROZPOCZETE: return '#9e9e9e';
      case StatusRealizacji.W_TRAKCIE: return '#2196f3';
      case StatusRealizacji.WSTRZYMANE: return '#ff9800';
      case StatusRealizacji.ZAKONCZONE: return '#4caf50';
      default: return '#9e9e9e';
    }
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
  
  // Wyświetlanie szczegółów zadania
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Nagłówek */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Szczegóły zadania
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {czy_moze_edytowac() && (
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                onClick={handle_edit}
              >
                Edytuj
              </Button>
            )}
            
            {czy_moze_usunac() && (
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteConfirm(true)}
              >
                Usuń
              </Button>
            )}
          </Box>
        </Box>
        
        {/* Potwierdzenie usunięcia */}
        {deleteConfirm && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => setDeleteConfirm(false)}
                >
                  Anuluj
                </Button>
                <Button 
                  color="error" 
                  size="small"
                  onClick={handle_delete}
                >
                  Usuń
                </Button>
              </Box>
            }
          >
            Czy na pewno chcesz usunąć to zadanie? Tej operacji nie można cofnąć.
          </Alert>
        )}
        
        {zadanie && (
          <>
            {/* Główne informacje */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                {/* Problem */}
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom>
                    {zadanie.problem}
                  </Typography>
                </Grid>
                
                {/* Podstawowe informacje */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PriorityIcon sx={{ mr: 1, color: kolor_priorytetu(zadanie.priorytet) }} />
                    <Typography variant="body1">
                      Priorytet: <strong>{tekst_priorytetu(zadanie.priorytet)}</strong>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BuildIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Maszyna: <strong>{zadanie.maszyna}</strong>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Autor: <strong>{zadanie.autor?.nazwa || 'Nieznany'}</strong>
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ScheduleIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Utworzono: <strong>{formatuj_date(zadanie.dataUtworzenia)}</strong>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ScheduleIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Aktualizacja: <strong>{formatuj_date(zadanie.dataAktualizacji)}</strong>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      label={tekst_statusu(zadanie.status)} 
                      color={zadanie.status === StatusZadania.ZAMKNIETE ? 'success' : 'primary'} 
                      size="small" 
                    />
                  </Box>
                </Grid>
                
                {/* Branże */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CategoryIcon sx={{ mr: 1 }} />
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      Branże:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {zadanie.branze?.map((branza) => (
                        <Chip key={branza} label={branza} size="small" />
                      ))}
                    </Box>
                  </Box>
                </Grid>
                
                {/* Opis */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Szczegółowy opis
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {zadanie.opis}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Proces realizacji */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Proces realizacji
              </Typography>
              
              <Grid container spacing={2}>
                {/* Status realizacji */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      Status realizacji
                    </Typography>
                    <Chip 
                      label={tekst_statusu_realizacji(zadanie.procesRealizacji?.statusRealizacji || '')} 
                      sx={{ bgcolor: kolor_statusu_realizacji(zadanie.procesRealizacji?.statusRealizacji || '') }}
                      color="primary"
                    />
                  </Box>
                </Grid>
                
                {/* Termin realizacji */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      Termin realizacji
                    </Typography>
                    <Typography variant="body2">
                      {formatuj_date(zadanie.procesRealizacji?.terminRealizacji)}
                    </Typography>
                  </Box>
                </Grid>
                
                {/* Postęp realizacji */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      Postęp realizacji: {zadanie.procesRealizacji?.postepRealizacji || 0}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={zadanie.procesRealizacji?.postepRealizacji || 0} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </Grid>
                
                {/* Wykonawcy */}
                <Grid item xs={12}>
                  <Typography variant="body1" gutterBottom>
                    Wykonawcy
                  </Typography>
                  
                  {zadanie.procesRealizacji?.wykonawcy && zadanie.procesRealizacji.wykonawcy.length > 0 ? (
                    <List>
                      {zadanie.procesRealizacji.wykonawcy.map((wykonawca) => (
                        <ListItem key={wykonawca.id}>
                          <ListItemIcon>
                            <Avatar>{wykonawca.imieNazwisko.charAt(0)}</Avatar>
                          </ListItemIcon>
                          <ListItemText 
                            primary={wykonawca.imieNazwisko}
                            secondary={`Rola: ${wykonawca.rola}, Dodano: ${formatuj_date(wykonawca.dataWpisu)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Brak przypisanych wykonawców
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
            
            {/* Proponowane rozwiązania */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Proponowane rozwiązania
                </Typography>
                
                <Button 
                  variant="outlined" 
                  startIcon={<CommentIcon />}
                  size="small"
                  onClick={() => navigate(`/tasks/${id}/solutions/add`)}
                >
                  Dodaj rozwiązanie
                </Button>
              </Box>
              
              {zadanie.proponowaneRozwiazania && zadanie.proponowaneRozwiazania.length > 0 ? (
                <List>
                  {zadanie.proponowaneRozwiazania.map((rozwiazanie) => (
                    <Paper key={rozwiazanie.id} elevation={1} sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ mr: 1 }}>{rozwiazanie.autor.charAt(0)}</Avatar>
                        <Typography variant="subtitle1">
                          {rozwiazanie.autor}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                          {formatuj_date(rozwiazanie.data)}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 1 }}>
                        {rozwiazanie.tresc}
                      </Typography>
                      
                      {rozwiazanie.reakcje && rozwiazanie.reakcje.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          {rozwiazanie.reakcje.map((reakcja, index) => (
                            <Chip 
                              key={index}
                              label={`${reakcja.rodzaj} (${reakcja.liczba})`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                    </Paper>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Brak proponowanych rozwiązań
                </Typography>
              )}
            </Paper>
            
            {/* Uwagi */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Uwagi
                </Typography>
                
                <Button 
                  variant="outlined" 
                  startIcon={<CommentIcon />}
                  size="small"
                  onClick={() => navigate(`/tasks/${id}/comments/add`)}
                >
                  Dodaj uwagę
                </Button>
              </Box>
              
              {zadanie.uwagi && zadanie.uwagi.length > 0 ? (
                <List>
                  {zadanie.uwagi.map((uwaga) => (
                    <Paper key={uwaga.id} elevation={1} sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ mr: 1 }}>{uwaga.autor.charAt(0)}</Avatar>
                        <Typography variant="subtitle1">
                          {uwaga.autor}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                          {formatuj_date(uwaga.data)}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {uwaga.tresc}
                      </Typography>
                    </Paper>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Brak uwag
                </Typography>
              )}
            </Paper>
          </>
        )}
      </Box>
    </Container>
  );
};

export default TaskDetails;
