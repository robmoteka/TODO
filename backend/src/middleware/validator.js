/**
 * Middleware do walidacji danych wejściowych
 * Wykorzystuje express-validator do sprawdzania poprawności danych
 */
const { validationResult } = require('express-validator');

/**
 * Funkcja sprawdzająca wyniki walidacji i zwracająca błędy
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 * @param {Function} next - Funkcja next Express
 */
const validate_input = (req, res, next) => {
  // Pobranie wyników walidacji
  const errors = validationResult(req);
  
  // Jeśli są błędy, zwróć je jako odpowiedź
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Błędy walidacji danych wejściowych',
      errors: errors.array() 
    });
  }
  
  // Jeśli nie ma błędów, kontynuuj
  next();
};

module.exports = {
  validate_input
};
