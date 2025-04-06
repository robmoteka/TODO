/**
 * Kontroler zadań
 * Obsługuje operacje CRUD dla zadań oraz dodatkowe funkcjonalności
 */
const { validationResult } = require('express-validator');
const Task = require('../models/task.model');
const User = require('../models/user.model');

/**
 * Pobieranie wszystkich zadań z możliwością filtrowania
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const get_all_tasks = async (req, res) => {
  try {
    // Parametry filtrowania i sortowania
    const { 
      status, 
      priorytet, 
      branza, 
      maszyna, 
      terminOd, 
      terminDo,
      sortBy = 'dataUtworzenia',
      sortDir = 'desc',
      limit = 10,
      page = 1
    } = req.query;

    // Budowanie zapytania
    const query = {};

    // Filtrowanie po statusie
    if (status) {
      query.status = status;
    }

    // Filtrowanie po priorytecie
    if (priorytet) {
      query.priorytet = priorytet;
    }

    // Filtrowanie po branży
    if (branza) {
      query.branze = branza;
    }

    // Filtrowanie po maszynie
    if (maszyna) {
      query.maszyna = { $regex: maszyna, $options: 'i' };
    }

    // Filtrowanie po terminie realizacji
    if (terminOd || terminDo) {
      query['procesRealizacji.terminRealizacji'] = {};
      
      if (terminOd) {
        query['procesRealizacji.terminRealizacji'].$gte = new Date(terminOd);
      }
      
      if (terminDo) {
        query['procesRealizacji.terminRealizacji'].$lte = new Date(terminDo);
      }
    }

    // Opcje sortowania
    const sortOptions = {};
    sortOptions[sortBy] = sortDir === 'asc' ? 1 : -1;

    // Opcje paginacji
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Wykonanie zapytania z paginacją
    const tasks = await Task.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('utworzonyPrzez', 'nazwa email');

    // Liczba wszystkich pasujących zadań (dla paginacji)
    const totalTasks = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        total: totalTasks,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(totalTasks / limitNum)
      }
    });
  } catch (err) {
    console.error('Błąd pobierania zadań:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania zadań' });
  }
};

/**
 * Pobieranie pojedynczego zadania po ID
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const get_task_by_id = async (req, res) => {
  try {
    const task = await Task.findOne({ idZadania: req.params.id })
      .populate('utworzonyPrzez', 'nazwa email');

    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }

    res.json(task);
  } catch (err) {
    console.error('Błąd pobierania zadania:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania zadania' });
  }
};

/**
 * Tworzenie nowego zadania
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const create_task = async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { 
      priorytet, 
      branze, 
      maszyna, 
      problem, 
      opis,
      terminRealizacji
    } = req.body;

    // Generowanie kolejnego ID zadania
    const idZadania = await Task.getNextTaskId();

    // Tworzenie nowego zadania
    const newTask = new Task({
      idZadania,
      priorytet,
      branze,
      maszyna,
      problem,
      opis,
      utworzonyPrzez: req.user.id
    });

    // Dodanie terminu realizacji, jeśli podany
    if (terminRealizacji) {
      newTask.procesRealizacji.terminRealizacji = new Date(terminRealizacji);
      
      // Dodanie wpisu do historii procesu
      newTask.procesRealizacji.historiaProcesow.push({
        autor: req.user.id,
        zmiana: 'Utworzenie zadania z terminem realizacji'
      });
    }

    // Zapisanie zadania w bazie danych
    await newTask.save();

    res.status(201).json({ 
      task: newTask,
      message: 'Zadanie zostało utworzone pomyślnie'
    });
  } catch (err) {
    console.error('Błąd tworzenia zadania:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas tworzenia zadania' });
  }
};

/**
 * Aktualizacja zadania
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const update_task = async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Sprawdzenie czy zadanie istnieje
    let task = await Task.findOne({ idZadania: req.params.id });
    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }

    // Aktualizacja podstawowych pól zadania
    const { 
      priorytet, 
      branze, 
      maszyna, 
      problem, 
      opis,
      status
    } = req.body;

    if (priorytet !== undefined) task.priorytet = priorytet;
    if (branze !== undefined) task.branze = branze;
    if (maszyna !== undefined) task.maszyna = maszyna;
    if (problem !== undefined) task.problem = problem;
    if (opis !== undefined) task.opis = opis;
    if (status !== undefined) task.status = status;

    // Zapisanie zmian
    await task.save();

    res.json({ 
      task,
      message: 'Zadanie zostało zaktualizowane pomyślnie'
    });
  } catch (err) {
    console.error('Błąd aktualizacji zadania:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas aktualizacji zadania' });
  }
};

/**
 * Usuwanie zadania
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const delete_task = async (req, res) => {
  try {
    // Sprawdzenie czy zadanie istnieje
    const task = await Task.findOne({ idZadania: req.params.id });
    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }

    // Sprawdzenie uprawnień (tylko admin lub twórca może usunąć)
    if (req.user.rola !== 'admin' && task.utworzonyPrzez.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Brak uprawnień do usunięcia tego zadania' });
    }

    // Usunięcie zadania
    await task.remove();

    res.json({ message: 'Zadanie zostało usunięte pomyślnie' });
  } catch (err) {
    console.error('Błąd usuwania zadania:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas usuwania zadania' });
  }
};

/**
 * Dodawanie komentarza do zadania
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const add_comment = async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { tresc } = req.body;

    // Sprawdzenie czy zadanie istnieje
    const task = await Task.findOne({ idZadania: req.params.id });
    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }

    // Pobranie danych użytkownika
    const user = await User.findById(req.user.id);

    // Dodanie komentarza
    task.uwagi.push({
      autor: user.nazwa,
      tresc
    });

    // Zapisanie zmian
    await task.save();

    res.status(201).json({ 
      comment: task.uwagi[task.uwagi.length - 1],
      message: 'Komentarz został dodany pomyślnie'
    });
  } catch (err) {
    console.error('Błąd dodawania komentarza:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas dodawania komentarza' });
  }
};

/**
 * Dodawanie proponowanego rozwiązania do zadania
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const add_solution = async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { tresc } = req.body;

    // Sprawdzenie czy zadanie istnieje
    const task = await Task.findOne({ idZadania: req.params.id });
    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }

    // Pobranie danych użytkownika
    const user = await User.findById(req.user.id);

    // Dodanie rozwiązania
    task.proponowaneRozwiazania.push({
      autor: user.nazwa,
      tresc,
      reakcje: []
    });

    // Zapisanie zmian
    await task.save();

    res.status(201).json({ 
      solution: task.proponowaneRozwiazania[task.proponowaneRozwiazania.length - 1],
      message: 'Rozwiązanie zostało zaproponowane pomyślnie'
    });
  } catch (err) {
    console.error('Błąd dodawania rozwiązania:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas dodawania rozwiązania' });
  }
};

/**
 * Aktualizacja procesu realizacji zadania
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const update_execution_process = async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { 
      statusRealizacji, 
      postepRealizacji, 
      terminRealizacji,
      wykonawcy
    } = req.body;

    // Sprawdzenie czy zadanie istnieje
    const task = await Task.findOne({ idZadania: req.params.id });
    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }

    // Pobranie danych użytkownika
    const user = await User.findById(req.user.id);
    const zmiany = [];

    // Aktualizacja statusu realizacji
    if (statusRealizacji !== undefined) {
      const poprzedniStatus = task.procesRealizacji.statusRealizacji;
      task.procesRealizacji.statusRealizacji = statusRealizacji;
      zmiany.push(`Zmiana statusu realizacji z "${poprzedniStatus}" na "${statusRealizacji}"`);
    }

    // Aktualizacja postępu realizacji
    if (postepRealizacji !== undefined) {
      const poprzedniPostep = task.procesRealizacji.postepRealizacji;
      task.procesRealizacji.postepRealizacji = postepRealizacji;
      zmiany.push(`Zmiana postępu realizacji z ${poprzedniPostep}% na ${postepRealizacji}%`);
    }

    // Aktualizacja terminu realizacji
    if (terminRealizacji !== undefined) {
      const poprzedniTermin = task.procesRealizacji.terminRealizacji
        ? task.procesRealizacji.terminRealizacji.toISOString().split('T')[0]
        : 'brak';
      const nowyTermin = new Date(terminRealizacji).toISOString().split('T')[0];
      
      task.procesRealizacji.terminRealizacji = new Date(terminRealizacji);
      zmiany.push(`Zmiana terminu realizacji z ${poprzedniTermin} na ${nowyTermin}`);
    }

    // Aktualizacja wykonawców
    if (wykonawcy !== undefined) {
      task.procesRealizacji.wykonawcy = wykonawcy;
      zmiany.push('Aktualizacja listy wykonawców');
    }

    // Dodanie wpisów do historii procesu
    if (zmiany.length > 0) {
      zmiany.forEach(zmiana => {
        task.procesRealizacji.historiaProcesow.push({
          autor: user.nazwa,
          zmiana
        });
      });
    }

    // Zapisanie zmian
    await task.save();

    res.json({ 
      procesRealizacji: task.procesRealizacji,
      message: 'Proces realizacji został zaktualizowany pomyślnie'
    });
  } catch (err) {
    console.error('Błąd aktualizacji procesu realizacji:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas aktualizacji procesu realizacji' });
  }
};

/**
 * Dodawanie reakcji do rozwiązania
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const add_reaction_to_solution = async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rodzaj } = req.body;
    const { id, solutionId } = req.params;

    // Sprawdzenie czy zadanie istnieje
    const task = await Task.findOne({ idZadania: id });
    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }

    // Znalezienie rozwiązania
    const solution = task.proponowaneRozwiazania.id(solutionId);
    if (!solution) {
      return res.status(404).json({ message: 'Rozwiązanie nie zostało znalezione' });
    }

    // Sprawdzenie czy reakcja już istnieje
    let reaction = solution.reakcje.find(r => r.rodzaj === rodzaj);
    
    if (reaction) {
      // Zwiększenie licznika istniejącej reakcji
      reaction.liczba += 1;
    } else {
      // Dodanie nowej reakcji
      solution.reakcje.push({
        rodzaj,
        liczba: 1
      });
    }

    // Zapisanie zmian
    await task.save();

    res.json({ 
      reakcje: solution.reakcje,
      message: 'Reakcja została dodana pomyślnie'
    });
  } catch (err) {
    console.error('Błąd dodawania reakcji:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas dodawania reakcji' });
  }
};

/**
 * Dodawanie wykonawcy do zadania
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
const add_executor = async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { imieNazwisko, rola = 'odpowiedzialny' } = req.body;

    // Sprawdzenie czy zadanie istnieje
    const task = await Task.findOne({ idZadania: req.params.id });
    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie zostało znalezione' });
    }

    // Pobranie danych użytkownika
    const user = await User.findById(req.user.id);

    // Tworzenie nowego wykonawcy
    const newExecutor = {
      imieNazwisko,
      rola,
      dataWpisu: new Date()
    };

    // Dodanie wykonawcy do procesu realizacji
    task.procesRealizacji.wykonawcy.push(newExecutor);

    // Dodanie wpisu do historii procesu
    task.procesRealizacji.historiaProcesow.push({
      autor: user.nazwa,
      zmiana: `Dodano wykonawcę: ${imieNazwisko} (${rola})`
    });

    // Zapisanie zmian
    await task.save();

    res.status(201).json({ 
      wykonawca: newExecutor,
      procesRealizacji: task.procesRealizacji,
      message: 'Wykonawca został dodany pomyślnie'
    });
  } catch (err) {
    console.error('Błąd dodawania wykonawcy:', err.message);
    res.status(500).json({ message: 'Błąd serwera podczas dodawania wykonawcy' });
  }
};

module.exports = {
  get_all_tasks,
  get_task_by_id,
  create_task,
  update_task,
  delete_task,
  add_comment,
  add_solution,
  update_execution_process,
  add_reaction_to_solution,
  add_executor
};
