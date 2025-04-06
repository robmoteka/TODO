import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import { 
  Assignment as TaskIcon, 
  PriorityHigh as HighPriorityIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import zadaniaService from '../services/zadania.service';
import { Zadanie, StatusZadania, StatusRealizacji } from '../types';

/**
 * Komponent Dashboard
 * Wyświetla podsumowanie zadań i statystyki
 */
const Dashboard: React.FC = () => {
  // Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Pobieranie zadań z API
  const { data: zadania, isLoading, error } = useQuery(
    'zadania-dashboard',
    () => zadaniaService.pobierz_zadania({ naStronie: 100 }).then(res => res.dane),
    {
      staleTime: 5 * 60 * 1000, // 5 minut
      refetchOnWindowFocus: false
    }
  );
  
  // Dane dla wykresów
  const [statystyki, setStatystyki] = useState({
    statusy: [] as { name: string; value: number; color: string }[],
    priorytety: [] as { name: string; value: number; color: string }[],
    zadaniaNaDzis: 0,
    zadaniaOpoznione: 0,
    zadaniaWTrakcie: 0,
    zadaniaZakonczone: 0
  });
  
  // Kolory dla wykresów
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Przygotowanie danych dla wykresów po załadowaniu zadań
  useEffect(() => {
    if (zadania && zadania.length > 0) {
      // Liczenie zadań według statusu
      const statusCount = zadania.reduce((acc: Record<string, number>, zadanie: Zadanie) => {
        acc[zadanie.status] = (acc[zadanie.status] || 0) + 1;
        return acc;
      }, {});
      
      // Liczenie zadań według priorytetu
      const priorytetCount = zadania.reduce((acc: Record<string, number>, zadanie: Zadanie) => {
        const priorytetLabel = `Priorytet ${zadanie.priorytet}`;
        acc[priorytetLabel] = (acc[priorytetLabel] || 0) + 1;
        return acc;
      }, {});
      
      // Dane dla wykresu statusów
      const statusData = Object.entries(statusCount).map(([name, value], index) => ({
        name: name === StatusZadania.NOWE ? 'Nowe' : 
              name === StatusZadania.W_TRAKCIE ? 'W trakcie' : 
              name === StatusZadania.ROZWIAZANE ? 'Rozwiązane' : 'Zamknięte',
        value,
        color: COLORS[index % COLORS.length]
      }));
      
      // Dane dla wykresu priorytetów
      const priorytetData = Object.entries(priorytetCount).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }));
      
      // Zliczanie zadań na dziś, opóźnionych, w trakcie i zakończonych
      const dzisiaj = new Date();
      dzisiaj.setHours(0, 0, 0, 0);
      
      const zadaniaNaDzis = zadania.filter(zadanie => {
        if (!zadanie.procesRealizacji.terminRealizacji) return false;
        const terminDate = new Date(zadanie.procesRealizacji.terminRealizacji);
        terminDate.setHours(0, 0, 0, 0);
        return terminDate.getTime() === dzisiaj.getTime() && 
               zadanie.procesRealizacji.statusRealizacji !== StatusRealizacji.ZAKONCZONE;
      }).length;
      
      const zadaniaOpoznione = zadania.filter(zadanie => {
        if (!zadanie.procesRealizacji.terminRealizacji) return false;
        const terminDate = new Date(zadanie.procesRealizacji.terminRealizacji);
        return terminDate < dzisiaj && 
               zadanie.procesRealizacji.statusRealizacji !== StatusRealizacji.ZAKONCZONE;
      }).length;
      
      const zadaniaWTrakcie = zadania.filter(zadanie => 
        zadanie.procesRealizacji.statusRealizacji === StatusRealizacji.W_TRAKCIE
      ).length;
      
      const zadaniaZakonczone = zadania.filter(zadanie => 
        zadanie.procesRealizacji.statusRealizacji === StatusRealizacji.ZAKONCZONE
      ).length;
      
      // Aktualizacja statystyk
      setStatystyki({
        statusy: statusData,
        priorytety: priorytetData,
        zadaniaNaDzis,
        zadaniaOpoznione,
        zadaniaWTrakcie,
        zadaniaZakonczone
      });
    }
  }, [zadania]);
  
  // Funkcja do nawigacji do szczegółów zadania
  const przejdzDoZadania = (id: string) => {
    navigate(`/tasks/${id}`);
  };
  
  // Wyświetlanie ładowania
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Wyświetlanie błędu
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Wystąpił błąd podczas ładowania danych: {(error as Error).message}
        </Typography>
      </Box>
    );
  }
  
  // Zadania o wysokim priorytecie
  const zadaniaWysokiPriorytet = zadania
    ?.filter(zadanie => zadanie.priorytet >= 4)
    .sort((a, b) => b.priorytet - a.priorytet)
    .slice(0, 5) || [];
  
  // Ostatnio dodane zadania
  const ostatnieZadania = [...(zadania || [])]
    .sort((a, b) => new Date(b.dataUtworzenia).getTime() - new Date(a.dataUtworzenia).getTime())
    .slice(0, 5);
  
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Nagłówek */}
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Witaj, {user?.imie || user?.nazwa}! Oto podsumowanie zadań.
      </Typography>
      
      {/* Karty z podsumowaniem */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#e3f2fd',
              height: '100%'
            }}
          >
            <Typography variant="h6" component="div">
              Zadania na dziś
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 2
              }}
            >
              <ScheduleIcon sx={{ fontSize: 40, color: '#1976d2', mr: 1 }} />
              <Typography variant="h4">{statystyki.zadaniaNaDzis}</Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#ffebee',
              height: '100%'
            }}
          >
            <Typography variant="h6" component="div">
              Opóźnione zadania
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 2
              }}
            >
              <HighPriorityIcon sx={{ fontSize: 40, color: '#d32f2f', mr: 1 }} />
              <Typography variant="h4">{statystyki.zadaniaOpoznione}</Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#fff8e1',
              height: '100%'
            }}
          >
            <Typography variant="h6" component="div">
              W trakcie realizacji
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 2
              }}
            >
              <PendingIcon sx={{ fontSize: 40, color: '#ff9800', mr: 1 }} />
              <Typography variant="h4">{statystyki.zadaniaWTrakcie}</Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#e8f5e9',
              height: '100%'
            }}
          >
            <Typography variant="h6" component="div">
              Zakończone zadania
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 2
              }}
            >
              <CompletedIcon sx={{ fontSize: 40, color: '#4caf50', mr: 1 }} />
              <Typography variant="h4">{statystyki.zadaniaZakonczone}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Wykresy */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Zadania według statusu" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              {statystyki.statusy.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statystyki.statusy}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statystyki.statusy.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography variant="body1">Brak danych do wyświetlenia</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Zadania według priorytetu" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              {statystyki.priorytety.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statystyki.priorytety}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Liczba zadań">
                      {statystyki.priorytety.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography variant="body1">Brak danych do wyświetlenia</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Listy zadań */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Zadania o wysokim priorytecie" />
            <Divider />
            <CardContent>
              {zadaniaWysokiPriorytet.length > 0 ? (
                <List>
                  {zadaniaWysokiPriorytet.map((zadanie) => (
                    <React.Fragment key={zadanie._id}>
                      <ListItem 
                        button 
                        onClick={() => przejdzDoZadania(zadanie._id)}
                        sx={{ 
                          borderLeft: `4px solid ${zadanie.priorytet >= 5 ? '#d32f2f' : '#ff9800'}`,
                          mb: 1,
                          bgcolor: 'background.paper',
                          borderRadius: 1
                        }}
                      >
                        <ListItemIcon>
                          <TaskIcon color={zadanie.priorytet >= 5 ? 'error' : 'warning'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={`#${zadanie.idZadania} - ${zadanie.problem}`}
                          secondary={`Priorytet: ${zadanie.priorytet}, Status: ${zadanie.status}`}
                        />
                        <Chip 
                          label={`P${zadanie.priorytet}`} 
                          color={zadanie.priorytet >= 5 ? 'error' : 'warning'} 
                          size="small" 
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" sx={{ p: 2 }}>
                  Brak zadań o wysokim priorytecie
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Ostatnio dodane zadania" />
            <Divider />
            <CardContent>
              {ostatnieZadania.length > 0 ? (
                <List>
                  {ostatnieZadania.map((zadanie) => (
                    <React.Fragment key={zadanie._id}>
                      <ListItem 
                        button 
                        onClick={() => przejdzDoZadania(zadanie._id)}
                        sx={{ 
                          mb: 1,
                          bgcolor: 'background.paper',
                          borderRadius: 1
                        }}
                      >
                        <ListItemIcon>
                          <TaskIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={`#${zadanie.idZadania} - ${zadanie.problem}`}
                          secondary={`Dodano: ${new Date(zadanie.dataUtworzenia).toLocaleDateString()}`}
                        />
                        <Chip 
                          label={zadanie.status === StatusZadania.NOWE ? 'Nowe' : 
                                zadanie.status === StatusZadania.W_TRAKCIE ? 'W trakcie' : 
                                zadanie.status === StatusZadania.ROZWIAZANE ? 'Rozwiązane' : 'Zamknięte'} 
                          color={zadanie.status === StatusZadania.NOWE ? 'info' : 
                                zadanie.status === StatusZadania.W_TRAKCIE ? 'warning' : 
                                zadanie.status === StatusZadania.ROZWIAZANE ? 'success' : 'default'} 
                          size="small" 
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" sx={{ p: 2 }}>
                  Brak zadań do wyświetlenia
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
