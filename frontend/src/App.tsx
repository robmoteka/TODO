import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { plPL } from '@mui/material/locale';
import { AuthProvider } from './context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { pl } from 'date-fns/locale';

// Importy stron
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskDetails from './pages/TaskDetails';
import CreateTask from './pages/CreateTask';
import EditTask from './pages/EditTask';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Importy komponentów
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Motyw aplikacji
const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: '#f5f5f5',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  },
  plPL // Ustawienia lokalizacji dla Polski
);

/**
 * Główny komponent aplikacji
 * Konfiguruje routing i dostawców kontekstu
 */
const App: React.FC = () => {
  // Stan do przechowywania preferencji trybu ciemnego
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Dynamiczne tworzenie motywu na podstawie preferencji użytkownika
  const appTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: darkMode ? '#90caf9' : '#1976d2',
          },
          secondary: {
            main: darkMode ? '#f48fb1' : '#dc004e',
          },
          background: {
            default: darkMode ? '#303030' : '#f5f5f5',
            paper: darkMode ? '#424242' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
      }, plPL),
    [darkMode]
  );

  // Funkcja przełączająca tryb ciemny
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
        <AuthProvider>
          <Routes>
            {/* Ścieżki publiczne */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Ścieżki chronione */}
            <Route path="/" element={<ProtectedRoute><Layout toggleDarkMode={toggleDarkMode} isDarkMode={darkMode} /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Ścieżki zadań */}
              <Route path="tasks" element={<TaskList />} />
              <Route path="tasks/create" element={<CreateTask />} />
              <Route path="tasks/:id" element={<TaskDetails />} />
              <Route path="tasks/:id/edit" element={<EditTask />} />
              
              {/* Profil użytkownika */}
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* Obsługa nieznalezionej strony */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
