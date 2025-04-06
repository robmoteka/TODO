/**
 * Middleware do obsługi błędów
 * Przechwytuje wszystkie nieobsłużone błędy w aplikacji i zwraca odpowiednią odpowiedź
 */

/**
 * Funkcja obsługująca błędy
 * @param {Error} err - Obiekt błędu
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 * @param {Function} next - Funkcja next Express
 */
const error_handler = (err, req, res, next) => {
  // Logowanie błędu do konsoli
  console.error('Błąd serwera:', err.message);
  console.error(err.stack);
  
  // Sprawdzenie typu błędu i zwrócenie odpowiedniej odpowiedzi
  if (err.name === 'ValidationError') {
    // Błąd walidacji Mongoose
    return res.status(400).json({
      message: 'Błąd walidacji danych',
      errors: Object.values(err.errors).map(e => e.message)
    });
  } else if (err.name === 'MongoError' && err.code === 11000) {
    // Błąd duplikatu w bazie danych
    return res.status(400).json({
      message: 'Dane już istnieją w bazie',
      error: err.message
    });
  } else if (err.name === 'JsonWebTokenError') {
    // Błąd tokenu JWT
    return res.status(401).json({
      message: 'Nieprawidłowy token autoryzacyjny',
      error: err.message
    });
  } else if (err.name === 'TokenExpiredError') {
    // Błąd wygaśnięcia tokenu JWT
    return res.status(401).json({
      message: 'Token autoryzacyjny wygasł',
      error: err.message
    });
  }
  
  // Domyślna odpowiedź dla nieobsłużonych błędów
  res.status(500).json({
    message: 'Wystąpił błąd serwera',
    error: process.env.NODE_ENV === 'production' ? 'Szczegóły błędu dostępne w logach serwera' : err.message
  });
};

module.exports = error_handler;
