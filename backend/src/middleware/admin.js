/**
 * Middleware do weryfikacji uprawnień administratora
 * Używany po middleware auth.js do sprawdzenia, czy zalogowany użytkownik ma rolę administratora
 */
module.exports = function(req, res, next) {
  // Sprawdzenie czy użytkownik jest zalogowany (middleware auth powinien być użyty wcześniej)
  if (!req.user) {
    return res.status(401).json({ message: 'Brak autoryzacji' });
  }

  // Sprawdzenie roli użytkownika
  if (req.user.rola !== 'admin') {
    return res.status(403).json({ message: 'Dostęp zabroniony. Wymagane uprawnienia administratora.' });
  }

  // Jeśli użytkownik ma uprawnienia administratora, kontynuuj
  next();
};
