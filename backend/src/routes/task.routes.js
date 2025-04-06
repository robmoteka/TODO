const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Task = require('../models/task.model');
const auth = require('../middleware/auth');

/**
 * @route   GET api/tasks
 * @desc    Pobieranie wszystkich zadań
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    // Parametry filtrowania i sortowania
    const { priorytet, status, branza, maszyna, sortBy, sortDir } = req.query;
    
    // Budowanie zapytania
    const query = {};
    
    if (priorytet) query.priorytet = priorytet;
    if (status) query.status = status;
    if (branza) query.branze = branza;
    if (maszyna) query.maszyna = maszyna;
    
    // Opcje sortowania
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortDir === 'desc' ? -1 : 1;
    } else {
      sortOptions.dataUtworzenia = -1; // Domyślnie sortowanie po dacie utworzenia (najnowsze)
    }
    
    const tasks = await Task.find(query)
      .sort(sortOptions)
      .populate('utworzonyPrzez', 'nazwa email');
      
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

/**
 * @route   GET api/tasks/:id
 * @desc    Pobieranie pojedynczego zadania
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ idZadania: req.params.id })
      .populate('utworzonyPrzez', 'nazwa email');
      
    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }
    res.status(500).send('Błąd serwera');
  }
});

/**
 * @route   POST api/tasks
 * @desc    Tworzenie nowego zadania
 * @access  Private
 */
router.post('/', [
  auth,
  [
    check('priorytet', 'Priorytet jest wymagany').isInt({ min: 1, max: 5 }),
    check('branze', 'Przynajmniej jedna branża jest wymagana').isArray({ min: 1 }),
    check('maszyna', 'Maszyna jest wymagana').not().isEmpty(),
    check('problem', 'Problem jest wymagany').not().isEmpty(),
    check('opis', 'Opis jest wymagany').not().isEmpty()
  ]
], async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Generowanie nowego ID zadania
    const nextTaskId = await Task.getNextTaskId();
    
    // Tworzenie nowego zadania
    const newTask = new Task({
      idZadania: nextTaskId,
      priorytet: req.body.priorytet,
      branze: req.body.branze,
      maszyna: req.body.maszyna,
      problem: req.body.problem,
      opis: req.body.opis,
      utworzonyPrzez: req.user.id
    });
    
    // Dodatkowe opcjonalne pola
    if (req.body.procesRealizacji) {
      newTask.procesRealizacji = req.body.procesRealizacji;
    }
    
    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

/**
 * @route   PUT api/tasks/:id
 * @desc    Aktualizacja zadania
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    // Sprawdzenie czy zadanie istnieje
    let task = await Task.findOne({ idZadania: req.params.id });
    
    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }
    
    // Aktualizacja pól zadania
    const updateFields = {};
    
    // Podstawowe pola
    if (req.body.priorytet !== undefined) updateFields.priorytet = req.body.priorytet;
    if (req.body.branze !== undefined) updateFields.branze = req.body.branze;
    if (req.body.maszyna !== undefined) updateFields.maszyna = req.body.maszyna;
    if (req.body.problem !== undefined) updateFields.problem = req.body.problem;
    if (req.body.opis !== undefined) updateFields.opis = req.body.opis;
    if (req.body.status !== undefined) updateFields.status = req.body.status;
    
    // Proces realizacji
    if (req.body.procesRealizacji) {
      updateFields.procesRealizacji = req.body.procesRealizacji;
    }
    
    // Aktualizacja zadania
    task = await Task.findOneAndUpdate(
      { idZadania: req.params.id },
      { $set: updateFields },
      { new: true }
    );
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

/**
 * @route   DELETE api/tasks/:id
 * @desc    Usunięcie zadania
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Sprawdzenie czy zadanie istnieje
    const task = await Task.findOne({ idZadania: req.params.id });
    
    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }
    
    // Sprawdzenie uprawnień (tylko twórca lub admin może usunąć)
    if (task.utworzonyPrzez.toString() !== req.user.id && req.user.rola !== 'admin') {
      return res.status(401).json({ message: 'Brak uprawnień do usunięcia tego zadania' });
    }
    
    await task.remove();
    res.json({ message: 'Zadanie zostało usunięte' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

/**
 * @route   POST api/tasks/:id/rozwiazania
 * @desc    Dodanie proponowanego rozwiązania
 * @access  Private
 */
router.post('/:id/rozwiazania', [
  auth,
  [
    check('tresc', 'Treść rozwiązania jest wymagana').not().isEmpty()
  ]
], async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const task = await Task.findOne({ idZadania: req.params.id });
    
    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }
    
    // Tworzenie nowego rozwiązania
    const newSolution = {
      autor: req.body.autor || req.user.id,
      tresc: req.body.tresc,
      data: Date.now()
    };
    
    // Dodanie rozwiązania do zadania
    task.proponowaneRozwiazania.unshift(newSolution);
    
    await task.save();
    res.json(task.proponowaneRozwiazania);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

/**
 * @route   POST api/tasks/:id/uwagi
 * @desc    Dodanie uwagi do zadania
 * @access  Private
 */
router.post('/:id/uwagi', [
  auth,
  [
    check('tresc', 'Treść uwagi jest wymagana').not().isEmpty()
  ]
], async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const task = await Task.findOne({ idZadania: req.params.id });
    
    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }
    
    // Tworzenie nowej uwagi
    const newComment = {
      autor: req.body.autor || req.user.id,
      tresc: req.body.tresc,
      data: Date.now()
    };
    
    // Dodanie uwagi do zadania
    task.uwagi.unshift(newComment);
    
    await task.save();
    res.json(task.uwagi);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

/**
 * @route   POST api/tasks/:id/wykonawcy
 * @desc    Dodanie wykonawcy do procesu realizacji
 * @access  Private
 */
router.post('/:id/wykonawcy', [
  auth,
  [
    check('imieNazwisko', 'Imię i nazwisko wykonawcy jest wymagane').not().isEmpty()
  ]
], async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const task = await Task.findOne({ idZadania: req.params.id });
    
    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }
    
    // Tworzenie nowego wykonawcy
    const newExecutor = {
      imieNazwisko: req.body.imieNazwisko,
      rola: req.body.rola || 'odpowiedzialny',
      dataWpisu: Date.now()
    };
    
    // Inicjalizacja procesRealizacji jeśli nie istnieje
    if (!task.procesRealizacji) {
      task.procesRealizacji = {
        wykonawcy: [],
        historiaProcesow: []
      };
    }
    
    // Dodanie wykonawcy do procesu realizacji
    task.procesRealizacji.wykonawcy.push(newExecutor);
    
    // Dodanie wpisu do historii procesu
    task.procesRealizacji.historiaProcesow.push({
      data: Date.now(),
      autor: req.user.id,
      zmiana: `Dodano wykonawcę: ${req.body.imieNazwisko} (${req.body.rola || 'odpowiedzialny'})`
    });
    
    await task.save();
    res.json(task.procesRealizacji);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

module.exports = router;
