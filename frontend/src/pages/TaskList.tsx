import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  Button, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Pagination,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  PriorityHigh as PriorityIcon,
  Build as BuildIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import zadaniaService from '../services/zadania.service';
import { Zadanie, StatusZadania, StatusRealizacji } from '../types';

/**
 * Interfejs dla filtrów zadań
 */
interface FiltryZadan {
  szukaj: string;
  priorytet: number | '';
  status: string;
  statusRealizacji: string;
  branza: string;
  strona: number;
  naStronie: number;
}

/**
 * Strona listy zadań
 * Wyświetla wszystkie zadania z możliwością filtrowania i sortowania
 */
const TaskList: React.FC = () => {
  // Stany komponentu
  const [zadania, setZadania] = useState<Zadanie[]>([]);
  const [calkowitaLiczba, setCalkowitaLiczba] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtrVisible, setFiltrVisible] = useState<boolean>(false);
  
  // Stan filtrów
  const [filtry, setFiltry] = useState<FiltryZadan>({
    szukaj: '',
    priorytet: '',
    status: '',
    statusRealizacji: '',
    branza: '',
    strona: 1,
    naStronie: 10
  });
  
  // Hook nawigacji
  const navigate = useNavigate();
  
  // Lista dostępnych branż
  const dostepneBranze = [
    'Mechaniczna',
    'Elektryczna',
    'Automatyka',
    'Hydraulika',
    'Pneumatyka',
    'IT',
    'Produkcja',
    'Logistyka',
    'Jakość'
  ];
  
  // Pobieranie danych zadań
  useEffect(() => {
    const pobierz_zadania = async () => {
      try {
        setLoading(true);
        
        // Przygotowanie parametrów filtrowania
        const params: Record<string, any> = {
          page: filtry.strona,
          limit: filtry.naStronie
        };
        
        // Dodanie pozostałych filtrów
        if (filtry.szukaj) params.search = filtry.szukaj;
        if (filtry.priorytet !== '') params.priorytet = filtry.priorytet;
        if (filtry.status) params.status = filtry.status;
        if (filtry.statusRealizacji) params.statusRealizacji = filtry.statusRealizacji;
        if (filtry.branza) params.branza = filtry.branza;
        
        // Pobranie danych
        const { dane, total } = await zadaniaService.pobierz_zadania(params);
        
        setZadania(dane);
        setCalkowitaLiczba(total);
        setError(null);
      } catch (err: any) {
        console.error('Błąd pobierania zadań:', err);
        setError(err.message || 'Nie udało się pobrać listy zadań');
      } finally {
        setLoading(false);
      }
    };
    
    pobierz_zadania();
  }, [filtry]);
  
  /**
   * Obsługa zmiany strony
   */
  const handle_page_change = (_event: React.ChangeEvent<unknown>, value: number) => {
    setFiltry(prev => ({
      ...prev,
      strona: value
    }));
  };
  
  /**
   * Obsługa zmiany filtrów
   */
  const handle_filter_change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    
    setFiltry(prev => ({
      ...prev,
      [name]: value,
      strona: 1 // Reset strony przy zmianie filtrów
    }));
  };
  
  /**
   * Obsługa wyszukiwania
   */
  const handle_search = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aktualizacja filtrów bez zmiany innych parametrów
    setFiltry(prev => ({
      ...prev,
      strona: 1 // Reset strony przy wyszukiwaniu
    }));
  };
  
  /**
   * Resetowanie filtrów
   */
  const reset_filters = () => {
    setFiltry({
      szukaj: '',
      priorytet: '',
      status: '',
      statusRealizacji: '',
      branza: '',
      strona: 1,
      naStronie: 10
    });
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
  
  /**
   * Skrócenie tekstu do określonej długości
   */
  const skroc_tekst = (tekst: string, dlugosc: number): string => {
    if (tekst.length <= dlugosc) return tekst;
    return tekst.substring(0, dlugosc) + '...';
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Nagłówek */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Lista zadań
          </Typography>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/tasks/create')}
          >
            Nowe zadanie
          </Button>
        </Box>
        
        {/* Wyszukiwarka i filtry */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            {/* Wyszukiwarka */}
            <Grid item xs={12} md={8}>
              <Box component="form" onSubmit={handle_search} sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  name="szukaj"
                  value={filtry.szukaj}
                  onChange={handle_filter_change}
                  placeholder="Szukaj zadań..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: filtry.szukaj ? (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => setFiltry(prev => ({ ...prev, szukaj: '', strona: 1 }))}
                          edge="end"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                />
              </Box>
            </Grid>
            
            {/* Przyciski filtrów */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                variant="outlined" 
                startIcon={<FilterIcon />}
                onClick={() => setFiltrVisible(!filtrVisible)}
              >
                {filtrVisible ? 'Ukryj filtry' : 'Pokaż filtry'}
              </Button>
              
              {Object.values(filtry).some(val => 
                val !== '' && val !== 1 && val !== 10 && val !== 'szukaj' && val !== 'strona' && val !== 'naStronie'
              ) && (
                <Button 
                  variant="outlined" 
                  color="secondary"
                  startIcon={<ClearIcon />}
                  onClick={reset_filters}
                >
                  Wyczyść filtry
                </Button>
              )}
            </Grid>
            
            {/* Filtry */}
            {filtrVisible && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="priorytet-label">Priorytet</InputLabel>
                    <Select
                      labelId="priorytet-label"
                      id="priorytet"
                      name="priorytet"
                      value={filtry.priorytet}
                      label="Priorytet"
                      onChange={handle_filter_change}
                    >
                      <MenuItem value="">Wszystkie</MenuItem>
                      <MenuItem value={1}>1 - Niski</MenuItem>
                      <MenuItem value={2}>2 - Poniżej średniego</MenuItem>
                      <MenuItem value={3}>3 - Średni</MenuItem>
                      <MenuItem value={4}>4 - Wysoki</MenuItem>
                      <MenuItem value={5}>5 - Krytyczny</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="status-label">Status zadania</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      name="status"
                      value={filtry.status}
                      label="Status zadania"
                      onChange={handle_filter_change}
                    >
                      <MenuItem value="">Wszystkie</MenuItem>
                      <MenuItem value={StatusZadania.NOWE}>Nowe</MenuItem>
                      <MenuItem value={StatusZadania.W_TRAKCIE}>W trakcie</MenuItem>
                      <MenuItem value={StatusZadania.ROZWIAZANE}>Rozwiązane</MenuItem>
                      <MenuItem value={StatusZadania.ZAMKNIETE}>Zamknięte</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="status-realizacji-label">Status realizacji</InputLabel>
                    <Select
                      labelId="status-realizacji-label"
                      id="statusRealizacji"
                      name="statusRealizacji"
                      value={filtry.statusRealizacji}
                      label="Status realizacji"
                      onChange={handle_filter_change}
                    >
                      <MenuItem value="">Wszystkie</MenuItem>
                      <MenuItem value={StatusRealizacji.NIEROZPOCZETE}>Nierozpoczęte</MenuItem>
                      <MenuItem value={StatusRealizacji.W_TRAKCIE}>W trakcie</MenuItem>
                      <MenuItem value={StatusRealizacji.WSTRZYMANE}>Wstrzymane</MenuItem>
                      <MenuItem value={StatusRealizacji.ZAKONCZONE}>Zakończone</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="branza-label">Branża</InputLabel>
                    <Select
                      labelId="branza-label"
                      id="branza"
                      name="branza"
                      value={filtry.branza}
                      label="Branża"
                      onChange={handle_filter_change}
                    >
                      <MenuItem value="">Wszystkie</MenuItem>
                      {dostepneBranze.map((branza) => (
                        <MenuItem key={branza} value={branza}>{branza}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
        
        {/* Wyświetlanie błędu */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Wyświetlanie ładowania */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Informacja o liczbie wyników */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Znaleziono {calkowitaLiczba} zadań
              </Typography>
            </Box>
            
            {/* Lista zadań */}
            {zadania.length > 0 ? (
              <Grid container spacing={2}>
                {zadania.map((zadanie) => (
                  <Grid item xs={12} sm={6} md={4} key={zadanie.id}>
                    <Card 
                      elevation={2} 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6
                        }
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        {/* Priorytet i status */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Chip 
                            icon={<PriorityIcon />}
                            label={`Priorytet: ${tekst_priorytetu(zadanie.priorytet)}`}
                            size="small"
                            sx={{ bgcolor: kolor_priorytetu(zadanie.priorytet), color: 'white' }}
                          />
                          
                          <Chip 
                            label={tekst_statusu(zadanie.status)}
                            size="small"
                            color={zadanie.status === StatusZadania.ZAMKNIETE ? 'success' : 'primary'}
                          />
                        </Box>
                        
                        {/* Tytuł */}
                        <Typography variant="h6" component="h2" gutterBottom>
                          {skroc_tekst(zadanie.problem, 50)}
                        </Typography>
                        
                        {/* Maszyna */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <BuildIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {zadanie.maszyna}
                          </Typography>
                        </Box>
                        
                        {/* Branże */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                          <CategoryIcon fontSize="small" sx={{ mr: 1, mt: 0.5 }} />
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {zadanie.branze?.slice(0, 3).map((branza) => (
                              <Chip key={branza} label={branza} size="small" variant="outlined" />
                            ))}
                            {zadanie.branze && zadanie.branze.length > 3 && (
                              <Chip label={`+${zadanie.branze.length - 3}`} size="small" variant="outlined" />
                            )}
                          </Box>
                        </Box>
                        
                        {/* Status realizacji */}
                        <Box sx={{ mt: 2 }}>
                          <Chip 
                            label={tekst_statusu_realizacji(zadanie.procesRealizacji?.statusRealizacji || '')}
                            size="small"
                            sx={{ 
                              bgcolor: kolor_statusu_realizacji(zadanie.procesRealizacji?.statusRealizacji || ''),
                              color: 'white'
                            }}
                          />
                        </Box>
                      </CardContent>
                      
                      <CardActions>
                        <Button 
                          size="small" 
                          onClick={() => navigate(`/tasks/${zadanie.id}`)}
                        >
                          Szczegóły
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Nie znaleziono zadań spełniających kryteria wyszukiwania
                </Typography>
              </Paper>
            )}
            
            {/* Paginacja */}
            {calkowitaLiczba > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={Math.ceil(calkowitaLiczba / filtry.naStronie)} 
                  page={filtry.strona}
                  onChange={handle_page_change}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default TaskList;
