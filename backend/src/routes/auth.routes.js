const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware do walidacji
const validacjaRejestracji = [
  check('nazwa', 'Nazwa jest wymagana').not().isEmpty(),
  check('email', 'Proszę podać poprawny adres email').isEmail(),
  check('haslo', 'Hasło musi mieć co najmniej 6 znaków').isLength({ min: 6 })
];

const validacjaLogowania = [
  check('email', 'Proszę podać poprawny adres email').isEmail(),
  check('haslo', 'Hasło jest wymagane').exists()
];

/**
 * @route   POST api/auth/rejestracja
 * @desc    Rejestracja nowego użytkownika
 * @access  Public
 */
router.post('/rejestracja', validacjaRejestracji, async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nazwa, email, haslo } = req.body;

  try {
    // Sprawdzenie czy użytkownik już istnieje
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Użytkownik z tym adresem email już istnieje' });
    }

    // Tworzenie nowego użytkownika
    user = new User({
      nazwa,
      email,
      haslo
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
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

/**
 * @route   POST api/auth/logowanie
 * @desc    Logowanie użytkownika i zwracanie tokenu JWT
 * @access  Public
 */
router.post('/logowanie', validacjaLogowania, async (req, res) => {
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
        res.json({ token, user: user.toJSON() });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

/**
 * @route   GET api/auth/ja
 * @desc    Pobieranie danych zalogowanego użytkownika
 * @access  Private
 */
router.get('/ja', async (req, res) => {
  try {
    // Middleware auth powinien dodać req.user.id
    const user = await User.findById(req.user.id).select('-haslo');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

module.exports = router;
