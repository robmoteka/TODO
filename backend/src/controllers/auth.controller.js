/**
 * Kontroler autentykacji
 * Obsługuje rejestrację, logowanie i pobieranie danych użytkownika
 */
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');

/**
 * Rejestracja nowego użytkownika
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const register_user = async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nazwa, email, haslo, imie, nazwisko } = req.body;

  try {
    // Sprawdzenie czy użytkownik już istnieje
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Użytkownik z tym adresem email już istnieje' });
    }

    // Sprawdzenie czy nazwa użytkownika jest już zajęta
    user = await User.findOne({ nazwa });
    if (user) {
      return res.status(400).json({ message: 'Ta nazwa użytkownika jest już zajęta' });
    }

    // Tworzenie nowego użytkownika
    user = new User({
      nazwa,
      email,
      haslo,
      imie: imie || '',
      nazwisko: nazwisko || ''
    });

    // Zapisanie użytkownika w bazie danych
    await user.save();

    // Generowanie tokenu JWT
    const payload = {
      user: {
        id: user.id,
        rola: user.rola
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'sekretny_klucz',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          token,
          user: user.toJSON(),
          message: 'Rejestracja zakończona sukcesem'
        });
      }
    );
  } catch (err) {
    console.error('Błąd rejestracji:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas rejestracji' });
  }
};

/**
 * Logowanie użytkownika
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const login_user = async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, haslo } = req.body;

  try {
    // Sprawdzenie czy użytkownik istnieje
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Nieprawidłowe dane logowania' });
    }

    // Sprawdzenie czy konto jest aktywne
    if (!user.aktywny) {
      return res.status(401).json({ message: 'Konto zostało dezaktywowane. Skontaktuj się z administratorem.' });
    }

    // Sprawdzenie hasła
    const isMatch = await user.porownajHaslo(haslo);
    if (!isMatch) {
      return res.status(400).json({ message: 'Nieprawidłowe dane logowania' });
    }

    // Aktualizacja ostatniego logowania
    user.ostatnieLogowanie = Date.now();
    await user.save();

    // Generowanie tokenu JWT
    const payload = {
      user: {
        id: user.id,
        rola: user.rola
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'sekretny_klucz',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: user.toJSON(),
          message: 'Logowanie zakończone sukcesem'
        });
      }
    );
  } catch (err) {
    console.error('Błąd logowania:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas logowania' });
  }
};

/**
 * Pobieranie danych zalogowanego użytkownika
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const get_current_user = async (req, res) => {
  try {
    // Middleware auth powinien dodać req.user.id
    const user = await User.findById(req.user.id).select('-haslo');
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    res.json(user);
  } catch (err) {
    console.error('Błąd pobierania użytkownika:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania danych użytkownika' });
  }
};

/**
 * Wylogowanie użytkownika (po stronie klienta)
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const logout_user = (req, res) => {
  // JWT jest bezstanowy, więc wylogowanie odbywa się po stronie klienta
  // Serwer może jedynie potwierdzić wylogowanie
  res.json({ message: 'Wylogowano pomyślnie' });
};

module.exports = {
  register_user,
  login_user,
  get_current_user,
  logout_user
};
