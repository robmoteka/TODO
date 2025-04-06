const jwt = require('jsonwebtoken');

// Middleware do weryfikacji tokenu JWT i autoryzacji użytkownika
module.exports = function(req, res, next) {
  // Pobranie tokenu z nagłówka
  const token = req.header('x-auth-token');

  // Sprawdzenie czy token istnieje
  if (!token) {
    return res.status(401).json({ message: 'Brak tokenu, autoryzacja odrzucona' });
  }

  try {
    // Weryfikacja tokenu
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sekretny_klucz');

    // Dodanie danych użytkownika do obiektu żądania
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token nieprawidłowy' });
  }
};
