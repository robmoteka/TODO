// Importy wymaganych pakietów
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import middleware
const errorMiddleware = require('./middleware/error');
const loggerMiddleware = require('./middleware/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/user.routes');

// Inicjalizacja aplikacji Express
const app = express();

// Konfiguracja middleware
app.use(helmet()); // Zabezpieczenia nagłówków HTTP
app.use(cors()); // Obsługa Cross-Origin Resource Sharing
app.use(express.json()); // Parsowanie JSON
app.use(express.urlencoded({ extended: false })); // Parsowanie formularzy

// Logowanie żądań HTTP w trybie deweloperskim
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware do logowania aktywności
app.use(loggerMiddleware.logActivity);

// Rejestracja tras API
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Obsługa plików statycznych (dla produkcji)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/build', 'index.html'));
  });
}

// Middleware do obsługi błędów (musi być na końcu)
app.use(errorMiddleware);

// Połączenie z bazą danych MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/todo_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('Połączono z bazą danych MongoDB');
  } catch (err) {
    console.error('Błąd połączenia z bazą danych:', err.message);
    process.exit(1);
  }
};

connectDB();

// Obsługa nieobsłużonych odrzuceń Promise
process.on('unhandledRejection', (err, promise) => {
  console.error(`Błąd: ${err.message}`);
  // Zamknięcie serwera i zakończenie procesu
  // server.close(() => process.exit(1));
});

// Obsługa nieobsłużonych wyjątków
process.on('uncaughtException', (err) => {
  console.error(`Błąd: ${err.message}`);
  // Zamknięcie serwera i zakończenie procesu
  // server.close(() => process.exit(1));
});

// Ustawienie portu i uruchomienie serwera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serwer uruchomiony na porcie ${PORT}`));

module.exports = app;
