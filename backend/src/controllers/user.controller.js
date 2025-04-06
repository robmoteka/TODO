/**
 * Kontroler użytkowników
 * Obsługuje operacje związane z zarządzaniem użytkownikami
 */
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

/**
 * Pobieranie wszystkich użytkowników (tylko dla admina)
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const get_all_users = async (req, res) => {
  try {
    // Sprawdzenie uprawnień - tylko admin może pobierać listę wszystkich użytkowników
    if (req.user.rola !== 'admin') {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }

    // Parametry filtrowania i sortowania
    const { 
      aktywny, 
      rola, 
      sortBy = 'nazwa',
      sortDir = 'asc',
      limit = 10,
      page = 1
    } = req.query;

    // Budowanie zapytania
    const query = {};

    // Filtrowanie po statusie aktywności
    if (aktywny !== undefined) {
      query.aktywny = aktywny === 'true';
    }

    // Filtrowanie po roli
    if (rola) {
      query.rola = rola;
    }

    // Opcje sortowania
    const sortOptions = {};
    sortOptions[sortBy] = sortDir === 'asc' ? 1 : -1;

    // Opcje paginacji
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Wykonanie zapytania z paginacją
    const users = await User.find(query)
      .select('-haslo') // Nie zwracamy hasła
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Liczba wszystkich pasujących użytkowników (dla paginacji)
    const totalUsers = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        total: totalUsers,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(totalUsers / limitNum)
      }
    });
  } catch (err) {
    console.error('Błąd pobierania użytkowników:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania użytkowników' });
  }
};

/**
 * Pobieranie pojedynczego użytkownika po ID
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const get_user_by_id = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-haslo');

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    // Sprawdzenie uprawnień - tylko admin lub właściciel konta może zobaczyć dane
    if (req.user.rola !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }

    res.json(user);
  } catch (err) {
    console.error('Błąd pobierania użytkownika:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania użytkownika' });
  }
};

/**
 * Aktualizacja danych użytkownika
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const update_user = async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Sprawdzenie czy użytkownik istnieje
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    // Sprawdzenie uprawnień - tylko admin lub właściciel konta może aktualizować dane
    if (req.user.rola !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }

    const { 
      nazwa, 
      email, 
      imie, 
      nazwisko,
      preferencje
    } = req.body;

    // Aktualizacja podstawowych danych
    if (nazwa !== undefined) {
      // Sprawdzenie czy nazwa jest już zajęta
      const existingUser = await User.findOne({ nazwa });
      if (existingUser && existingUser.id !== req.params.id) {
        return res.status(400).json({ message: 'Ta nazwa użytkownika jest już zajęta' });
      }
      user.nazwa = nazwa;
    }

    if (email !== undefined) {
      // Sprawdzenie czy email jest już zajęty
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser.id !== req.params.id) {
        return res.status(400).json({ message: 'Ten adres email jest już zajęty' });
      }
      user.email = email;
    }

    if (imie !== undefined) user.imie = imie;
    if (nazwisko !== undefined) user.nazwisko = nazwisko;
    
    // Aktualizacja preferencji
    if (preferencje !== undefined) {
      if (preferencje.powiadomieniaEmail !== undefined) {
        user.preferencje.powiadomieniaEmail = preferencje.powiadomieniaEmail;
      }
      
      if (preferencje.powiadomieniaAplikacja !== undefined) {
        user.preferencje.powiadomieniaAplikacja = preferencje.powiadomieniaAplikacja;
      }
      
      if (preferencje.motyw !== undefined) {
        user.preferencje.motyw = preferencje.motyw;
      }
    }

    // Zapisanie zmian
    await user.save();

    res.json({ 
      user: user.toJSON(),
      message: 'Dane użytkownika zostały zaktualizowane pomyślnie'
    });
  } catch (err) {
    console.error('Błąd aktualizacji użytkownika:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas aktualizacji użytkownika' });
  }
};

/**
 * Usuwanie użytkownika (tylko dla administratora)
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const delete_user = async (req, res) => {
  try {
    // Sprawdzenie uprawnień - tylko admin może usuwać użytkowników
    if (req.user.rola !== 'admin') {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }

    // Sprawdzenie czy użytkownik istnieje
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    // Usunięcie użytkownika
    await user.remove();
    
    res.json({ 
      message: 'Użytkownik został usunięty pomyślnie',
      userId: req.params.id
    });
  } catch (err) {
    console.error('Błąd usuwania użytkownika:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas usuwania użytkownika' });
  }
};

/**
 * Zmiana hasła użytkownika
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const change_password = async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { obecneHaslo, noweHaslo } = req.body;

    // Sprawdzenie czy użytkownik istnieje
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    // Sprawdzenie uprawnień - tylko właściciel konta może zmienić hasło
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }

    // Sprawdzenie obecnego hasła
    const isMatch = await user.porownajHaslo(obecneHaslo);
    if (!isMatch) {
      return res.status(400).json({ message: 'Nieprawidłowe obecne hasło' });
    }

    // Aktualizacja hasła
    user.haslo = noweHaslo;
    await user.save();

    res.json({ message: 'Hasło zostało zmienione pomyślnie' });
  } catch (err) {
    console.error('Błąd zmiany hasła:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas zmiany hasła' });
  }
};

/**
 * Zmiana roli użytkownika (tylko dla administratora)
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const change_role = async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rola } = req.body;

    // Sprawdzenie uprawnień - tylko admin może zmieniać role
    if (req.user.rola !== 'admin') {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }

    // Sprawdzenie czy użytkownik istnieje
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    // Aktualizacja roli
    user.rola = rola;
    await user.save();

    res.json({ 
      user: user.toJSON(),
      message: 'Rola użytkownika została zmieniona pomyślnie'
    });
  } catch (err) {
    console.error('Błąd zmiany roli:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas zmiany roli' });
  }
};

/**
 * Aktywacja/dezaktywacja konta użytkownika (tylko dla administratora)
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const toggle_account_status = async (req, res) => {
  try {
    const { aktywny } = req.body;

    // Sprawdzenie uprawnień - tylko admin może aktywować/dezaktywować konta
    if (req.user.rola !== 'admin') {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }

    // Sprawdzenie czy użytkownik istnieje
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    // Zapobieganie dezaktywacji własnego konta admina
    if (req.user.id === req.params.id && aktywny === false) {
      return res.status(400).json({ message: 'Nie można dezaktywować własnego konta' });
    }

    // Aktualizacja statusu konta
    user.aktywny = aktywny;
    await user.save();

    const statusText = aktywny ? 'aktywowane' : 'dezaktywowane';
    
    res.json({ 
      user: user.toJSON(),
      message: `Konto użytkownika zostało ${statusText} pomyślnie`
    });
  } catch (err) {
    console.error('Błąd zmiany statusu konta:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas zmiany statusu konta' });
  }
};

module.exports = {
  get_all_users,
  get_user_by_id,
  update_user,
  delete_user,
  change_password,
  change_role,
  toggle_account_status
};
