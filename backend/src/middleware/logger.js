/**
 * Middleware do logowania aktywności użytkowników
 * Zapisuje informacje o żądaniach HTTP do pliku logów
 */
const fs = require('fs');
const path = require('path');

/**
 * Funkcja logująca aktywność użytkowników
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 * @param {Function} next - Funkcja next Express
 */
const activity_logger = (req, res, next) => {
  // Pobranie danych żądania
  const { method, originalUrl, ip } = req;
  const userId = req.user ? req.user.id : 'niezalogowany';
  const timestamp = new Date().toISOString();
  
  // Utworzenie wpisu logu
  const logEntry = `[${timestamp}] ${method} ${originalUrl} - Użytkownik: ${userId}, IP: ${ip}\n`;
  
  // Ścieżka do pliku logów
  const logDir = path.join(__dirname, '../../logs');
  const logFile = path.join(logDir, 'activity.log');
  
  // Sprawdzenie czy katalog logów istnieje, jeśli nie - utwórz go
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Zapisanie logu do pliku
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Błąd zapisywania logu:', err);
    }
  });
  
  // Kontynuuj przetwarzanie żądania
  next();
};

/**
 * Funkcja logująca błędy
 * @param {Error} err - Obiekt błędu
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 * @param {Function} next - Funkcja next Express
 */
const error_logger = (err, req, res, next) => {
  // Pobranie danych żądania
  const { method, originalUrl, ip } = req;
  const userId = req.user ? req.user.id : 'niezalogowany';
  const timestamp = new Date().toISOString();
  
  // Utworzenie wpisu logu błędu
  const logEntry = `[${timestamp}] BŁĄD ${method} ${originalUrl} - Użytkownik: ${userId}, IP: ${ip}\n` +
                  `Wiadomość: ${err.message}\n` +
                  `Stack: ${err.stack}\n` +
                  `-----------------------------------\n`;
  
  // Ścieżka do pliku logów błędów
  const logDir = path.join(__dirname, '../../logs');
  const logFile = path.join(logDir, 'error.log');
  
  // Sprawdzenie czy katalog logów istnieje, jeśli nie - utwórz go
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Zapisanie logu do pliku
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Błąd zapisywania logu błędu:', err);
    }
  });
  
  // Przekazanie błędu do następnego middleware'a obsługi błędów
  next(err);
};

module.exports = {
  activity_logger,
  error_logger
};
