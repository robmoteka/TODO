import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  Paper, 
  Grid, 
  Chip,
  FormHelperText,
  Alert,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import pl from 'date-fns/locale/pl';
import { useAuth } from '../context/AuthContext';
import { BladAPI } from '../services/zadania.service';
import { Zadanie, StatusZadania, StatusRealizacji } from '../types';

/**
 * Interfejs dla błędów formularza
 */
interface BledyFormularza {
  problem?: string;
  opis?: string;
  priorytet?: string;
  branze?: string;
  maszyna?: string;
  terminRealizacji?: string;
  statusRealizacji?: string;
  [key: string]: string | undefined;
}

/**
 * Interfejs dla właściwości komponentu formularza zadań
 */
interface TaskFormProps {
  zadanieId?: string;
  zadanieDoEdycji?: Partial<Zadanie>;
  onSubmit: (zadanie: Partial<Zadanie>) => Promise<void>;
  onCancel: () => void;
}

/**
 * Komponent formularza zadań
 * Umożliwia tworzenie i edycję zadań z obsługą błędów walidacji
 */
const TaskForm: React.FC<TaskFormProps> = ({ zadanieId, zadanieDoEdycji, onSubmit, onCancel }) => {
  // Pobieranie danych użytkownika z kontekstu
  const { user } = useAuth();
  
  // Stan formularza
  const [formData, setFormData] = useState<Partial<Zadanie>>({
    problem: '',
    opis: '',
    priorytet: 3,
    branze: [],
    maszyna: '',
    status: StatusZadania.NOWE,
    procesRealizacji: {
      statusRealizacji: StatusRealizacji.NIEROZPOCZETE,
      postepRealizacji: 0,
      wykonawcy: [],
      terminRealizacji: new Date()
    }
  });
  
  // Stan błędów formularza
  const [formErrors, setFormErrors] = useState<BledyFormularza>({});
  
  // Stan ładowania i błędów
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Wypełnienie formularza danymi do edycji
  useEffect(() => {
    if (zadanieDoEdycji) {
      setFormData(prev => ({
        ...prev,
        ...zadanieDoEdycji,
        procesRealizacji: {
          ...prev.procesRealizacji,
          ...zadanieDoEdycji.procesRealizacji
        }
      }));
    }
  }, [zadanieDoEdycji]);
  
  // Obsługa zmiany pól tekstowych
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Obsługa zagnieżdżonych pól
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Zadanie],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Czyszczenie błędu dla zmienionego pola
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Obsługa zmiany pól select
  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target;
    
    // Obsługa zagnieżdżonych pól
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Zadanie],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Czyszczenie błędu dla zmienionego pola
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Obsługa zmiany daty
  const handleDateChange = (date: Date | null, fieldName: string) => {
    if (!date) return;
    
    // Obsługa zagnieżdżonych pól
    if (fieldName.includes('.')) {
      const [parent, child] = fieldName.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Zadanie],
          [child]: date
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [fieldName]: date
      }));
    }
    
    // Czyszczenie błędu dla zmienionego pola
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: undefined
      }));
    }
  };
  
  // Obsługa zmiany branż
  const handleBranzeChange = (e: SelectChangeEvent<string[]>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      branze: typeof value === 'string' ? value.split(',') : value
    }));
    
    // Czyszczenie błędu dla branż
    if (formErrors.branze) {
      setFormErrors(prev => ({
        ...prev,
        branze: undefined
      }));
    }
  };
  
  // Walidacja formularza
  const waliduj_formularz = (): boolean => {
    const bledy: BledyFormularza = {};
    let isValid = true;
    
    // Walidacja problemu
    if (!formData.problem) {
      bledy.problem = 'Krótki opis problemu jest wymagany';
      isValid = false;
    } else if (formData.problem.length < 5) {
      bledy.problem = 'Opis problemu musi mieć co najmniej 5 znaków';
      isValid = false;
    }
    
    // Walidacja opisu
    if (!formData.opis) {
      bledy.opis = 'Szczegółowy opis jest wymagany';
      isValid = false;
    } else if (formData.opis.length < 10) {
      bledy.opis = 'Opis musi mieć co najmniej 10 znaków';
      isValid = false;
    }
    
    // Walidacja priorytetu
    if (formData.priorytet === undefined || formData.priorytet < 1 || formData.priorytet > 5) {
      bledy.priorytet = 'Priorytet musi być wartością od 1 do 5';
      isValid = false;
    }
    
    // Walidacja branż
    if (!formData.branze || formData.branze.length === 0) {
      bledy.branze = 'Wybierz co najmniej jedną branżę';
      isValid = false;
    }
    
    // Walidacja maszyny
    if (!formData.maszyna) {
      bledy.maszyna = 'Identyfikator maszyny jest wymagany';
      isValid = false;
    }
    
    // Aktualizacja błędów formularza
    setFormErrors(bledy);
    return isValid;
  };
  
  // Obsługa wysłania formularza
  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Czyszczenie poprzednich błędów
    setError(null);
    
    // Walidacja formularza
    if (waliduj_formularz()) {
      try {
        setLoading(true);
        
        // Przygotowanie danych zadania
        const zadanieData: Partial<Zadanie> = {
          ...formData
        };
        
        // Dodanie danych autora przy tworzeniu nowego zadania
        if (!zadanieId) {
          zadanieData.autor = {
            id: user?.id || '',
            nazwa: user?.nazwa || '',
            email: user?.email || ''
          };
        }
        
        // Wywołanie funkcji zapisu
        await onSubmit(zadanieData);
      } catch (err: any) {
        console.error('Błąd zapisywania zadania:', err);
        
        // Obsługa błędów walidacji z API
        if (err instanceof BladAPI && err.bledyWalidacji) {
          setFormErrors(err.bledyWalidacji);
          setError('Proszę poprawić błędy w formularzu');
        } else {
          setError(err.message || 'Wystąpił błąd podczas zapisywania zadania');
        }
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {zadanieId ? 'Edycja zadania' : 'Nowe zadanie'}
      </Typography>
      
      {/* Wyświetlanie błędu */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handle_submit} noValidate>
        <Grid container spacing={2}>
          {/* Problem */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="problem"
              name="problem"
              label="Krótki opis problemu"
              value={formData.problem || ''}
              onChange={handleChange}
              error={!!formErrors.problem}
              helperText={formErrors.problem}
              disabled={loading}
            />
          </Grid>
          
          {/* Opis */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="opis"
              name="opis"
              label="Szczegółowy opis"
              multiline
              rows={4}
              value={formData.opis || ''}
              onChange={handleChange}
              error={!!formErrors.opis}
              helperText={formErrors.opis}
              disabled={loading}
            />
          </Grid>
          
          {/* Priorytet */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!formErrors.priorytet}>
              <InputLabel id="priorytet-label">Priorytet</InputLabel>
              <Select
                labelId="priorytet-label"
                id="priorytet"
                name="priorytet"
                value={formData.priorytet || 3}
                label="Priorytet"
                onChange={handleSelectChange}
                disabled={loading}
              >
                <MenuItem value={1}>1 - Niski</MenuItem>
                <MenuItem value={2}>2 - Poniżej średniego</MenuItem>
                <MenuItem value={3}>3 - Średni</MenuItem>
                <MenuItem value={4}>4 - Wysoki</MenuItem>
                <MenuItem value={5}>5 - Krytyczny</MenuItem>
              </Select>
              {formErrors.priorytet && <FormHelperText>{formErrors.priorytet}</FormHelperText>}
            </FormControl>
          </Grid>
          
          {/* Maszyna */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="maszyna"
              name="maszyna"
              label="Identyfikator maszyny"
              value={formData.maszyna || ''}
              onChange={handleChange}
              error={!!formErrors.maszyna}
              helperText={formErrors.maszyna}
              disabled={loading}
            />
          </Grid>
          
          {/* Branże */}
          <Grid item xs={12}>
            <FormControl fullWidth error={!!formErrors.branze}>
              <InputLabel id="branze-label">Branże</InputLabel>
              <Select
                labelId="branze-label"
                id="branze"
                name="branze"
                multiple
                value={formData.branze || []}
                label="Branże"
                onChange={handleBranzeChange}
                disabled={loading}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {dostepneBranze.map((branza) => (
                  <MenuItem key={branza} value={branza}>
                    {branza}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.branze && <FormHelperText>{formErrors.branze}</FormHelperText>}
            </FormControl>
          </Grid>
          
          {/* Termin realizacji */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
              <DatePicker
                label="Termin realizacji"
                value={formData.procesRealizacji?.terminRealizacji || null}
                onChange={(date) => handleDateChange(date, 'procesRealizacji.terminRealizacji')}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors['procesRealizacji.terminRealizacji'],
                    helperText: formErrors['procesRealizacji.terminRealizacji']
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          {/* Status realizacji */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!formErrors['procesRealizacji.statusRealizacji']}>
              <InputLabel id="status-realizacji-label">Status realizacji</InputLabel>
              <Select
                labelId="status-realizacji-label"
                id="statusRealizacji"
                name="procesRealizacji.statusRealizacji"
                value={formData.procesRealizacji?.statusRealizacji || StatusRealizacji.NIEROZPOCZETE}
                label="Status realizacji"
                onChange={handleSelectChange}
                disabled={loading}
              >
                <MenuItem value={StatusRealizacji.NIEROZPOCZETE}>Nierozpoczęte</MenuItem>
                <MenuItem value={StatusRealizacji.W_TRAKCIE}>W trakcie</MenuItem>
                <MenuItem value={StatusRealizacji.WSTRZYMANE}>Wstrzymane</MenuItem>
                <MenuItem value={StatusRealizacji.ZAKONCZONE}>Zakończone</MenuItem>
              </Select>
              {formErrors['procesRealizacji.statusRealizacji'] && (
                <FormHelperText>{formErrors['procesRealizacji.statusRealizacji']}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Przyciski */}
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : (zadanieId ? 'Zapisz zmiany' : 'Utwórz zadanie')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TaskForm;
