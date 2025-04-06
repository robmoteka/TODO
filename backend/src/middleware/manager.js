/**
 * Middleware do weryfikacji uprawnień menedżera
 * Używany po middleware auth.js do sprawdzenia, czy zalogowany użytkownik ma rolę menedżera lub administratora
 */
module.exports = function(req, res, next) {
  // Sprawdzenie czy użytkownik jest zalogowany (middleware auth powinien być użyty wcześniej)
  if (!req.user) {
    return res.status(401).json({ message: 'Brak autoryzacji' });
  }

  // Sprawdzenie roli użytkownika (menedżer lub admin)
  if (req.user.rola !== 'manager' && req.user.rola !== 'admin') {
    return res.status(403).json({ message: 'Dostęp zabroniony. Wymagane uprawnienia menedżera lub administratora.' });
  }

  // Jeśli użytkownik ma odpowiednie uprawnienia, kontynuuj
  next();
};
