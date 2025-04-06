// Importy wymaganych pakietów
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Konfiguracja zmiennych środowiskowych
dotenv.config();

// Inicjalizacja aplikacji Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Połączenie z bazą danych MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/todo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Połączono z bazą danych MongoDB');
  })
  .catch((err) => {
    console.error('Błąd połączenia z bazą danych:', err.message);
    process.exit(1);
  });

// Podstawowy endpoint
app.get('/', (req, res) => {
  res.json({ message: 'API aplikacji TODO działa poprawnie' });
});

// Importowanie tras API
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/user.routes');

// Rejestracja tras
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Obsługa błędów - middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Wystąpił błąd serwera',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

module.exports = app; // Eksport dla testów
