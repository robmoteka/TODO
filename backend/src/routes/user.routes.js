const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/user.model');
const auth = require('../middleware/auth');

/**
 * @route   GET api/users
 * @desc    Pobieranie listy użytkowników
 * @access  Private/Admin
 */
router.get('/', auth, async (req, res) => {
  try {
    // Sprawdzenie uprawnień administratora
    if (req.user.rola !== 'admin') {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }

    const users = await User.find().select('-haslo');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

/**
 * @route   GET api/users/:id
 * @desc    Pobieranie danych użytkownika po ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-haslo');
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    // Sprawdzenie uprawnień - tylko własne dane lub admin
    if (req.user.id !== req.params.id && req.user.rola !== 'admin') {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    res.status(500).send('Błąd serwera');
  }
});

/**
 * @route   PUT api/users/:id
 * @desc    Aktualizacja danych użytkownika
 * @access  Private
 */
router.put('/:id', [
  auth,
  [
    check('email', 'Proszę podać poprawny adres email').optional().isEmail(),
    check('nazwa', 'Nazwa użytkownika musi mieć co najmniej 3 znaki').optional().isLength({ min: 3 })
  ]
], async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Sprawdzenie uprawnień - tylko własne dane lub admin
    if (req.user.id !== req.params.id && req.user.rola !== 'admin') {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }
    
    // Przygotowanie danych do aktualizacji
    const updateData = {};
    if (req.body.nazwa) updateData.nazwa = req.body.nazwa;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.imie) updateData.imie = req.body.imie;
    if (req.body.nazwisko) updateData.nazwisko = req.body.nazwisko;
    if (req.body.preferencje) updateData.preferencje = req.body.preferencje;
    
    // Tylko admin może zmienić rolę
    if (req.body.rola && req.user.rola === 'admin') {
      updateData.rola = req.body.rola;
    }
    
    // Aktualizacja użytkownika
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-haslo');
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

/**
 * @route   DELETE api/users/:id
 * @desc    Usunięcie użytkownika
 * @access  Private/Admin
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Sprawdzenie uprawnień administratora
    if (req.user.rola !== 'admin') {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    await user.remove();
    res.json({ message: 'Użytkownik został usunięty' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

/**
 * @route   PUT api/users/:id/zmiana-hasla
 * @desc    Zmiana hasła użytkownika
 * @access  Private
 */
router.put('/:id/zmiana-hasla', [
  auth,
  [
    check('stareHaslo', 'Stare hasło jest wymagane').exists(),
    check('noweHaslo', 'Nowe hasło musi mieć co najmniej 6 znaków').isLength({ min: 6 })
  ]
], async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Sprawdzenie uprawnień - tylko własne hasło można zmienić
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
  }

  const { stareHaslo, noweHaslo } = req.body;

  try {
    // Pobranie użytkownika z bazy
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    // Weryfikacja starego hasła
    const isMatch = await user.porownajHaslo(stareHaslo);
    if (!isMatch) {
      return res.status(400).json({ message: 'Nieprawidłowe stare hasło' });
    }
    
    // Aktualizacja hasła
    user.haslo = noweHaslo;
    await user.save();
    
    res.json({ message: 'Hasło zostało zmienione' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

module.exports = router;
