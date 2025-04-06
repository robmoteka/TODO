/**
 * Walidatory dla endpointów związanych z zadaniami
 * Wykorzystują express-validator do sprawdzania poprawności danych
 */
const { body } = require('express-validator');

/**
 * Walidacja danych przy tworzeniu zadania
 */
const createTaskValidation = [
  body('priorytet')
    .isInt({ min: 1, max: 5 })
    .withMessage('Priorytet musi być liczbą całkowitą od 1 do 5'),
  
  body('branze')
    .isArray()
    .withMessage('Branże muszą być tablicą')
    .notEmpty()
    .withMessage('Musisz podać co najmniej jedną branżę'),
  
  body('maszyna')
    .isString()
    .withMessage('Maszyna musi być tekstem')
    .notEmpty()
    .withMessage('Musisz podać nazwę maszyny')
    .trim(),
  
  body('problem')
    .isString()
    .withMessage('Problem musi być tekstem')
    .isLength({ min: 5, max: 100 })
    .withMessage('Problem musi mieć od 5 do 100 znaków')
    .trim(),
  
  body('opis')
    .isString()
    .withMessage('Opis musi być tekstem')
    .isLength({ min: 10 })
    .withMessage('Opis musi mieć co najmniej 10 znaków')
    .trim(),
  
  body('terminRealizacji')
    .optional()
    .isISO8601()
    .withMessage('Termin realizacji musi być prawidłową datą w formacie ISO8601')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date < now) {
        throw new Error('Termin realizacji nie może być w przeszłości');
      }
      return true;
    })
];

/**
 * Walidacja danych przy aktualizacji zadania
 */
const updateTaskValidation = [
  body('priorytet')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Priorytet musi być liczbą całkowitą od 1 do 5'),
  
  body('branze')
    .optional()
    .isArray()
    .withMessage('Branże muszą być tablicą')
    .notEmpty()
    .withMessage('Musisz podać co najmniej jedną branżę'),
  
  body('maszyna')
    .optional()
    .isString()
    .withMessage('Maszyna musi być tekstem')
    .notEmpty()
    .withMessage('Musisz podać nazwę maszyny')
    .trim(),
  
  body('problem')
    .optional()
    .isString()
    .withMessage('Problem musi być tekstem')
    .isLength({ min: 5, max: 100 })
    .withMessage('Problem musi mieć od 5 do 100 znaków')
    .trim(),
  
  body('opis')
    .optional()
    .isString()
    .withMessage('Opis musi być tekstem')
    .isLength({ min: 10 })
    .withMessage('Opis musi mieć co najmniej 10 znaków')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['nowe', 'w_trakcie', 'rozwiazane', 'zamkniete'])
    .withMessage('Status musi być jednym z: nowe, w_trakcie, rozwiazane, zamkniete')
];

/**
 * Walidacja danych przy dodawaniu komentarza
 */
const addCommentValidation = [
  body('tresc')
    .isString()
    .withMessage('Treść komentarza musi być tekstem')
    .isLength({ min: 2, max: 500 })
    .withMessage('Treść komentarza musi mieć od 2 do 500 znaków')
    .trim()
];

/**
 * Walidacja danych przy dodawaniu rozwiązania
 */
const addSolutionValidation = [
  body('tresc')
    .isString()
    .withMessage('Treść rozwiązania musi być tekstem')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Treść rozwiązania musi mieć od 10 do 1000 znaków')
    .trim()
];

/**
 * Walidacja danych przy aktualizacji procesu realizacji
 */
const updateExecutionProcessValidation = [
  body('statusRealizacji')
    .optional()
    .isIn(['nierozpoczete', 'w_trakcie', 'wstrzymane', 'zakonczone'])
    .withMessage('Status realizacji musi być jednym z: nierozpoczete, w_trakcie, wstrzymane, zakonczone'),
  
  body('postepRealizacji')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Postęp realizacji musi być liczbą całkowitą od 0 do 100'),
  
  body('terminRealizacji')
    .optional()
    .isISO8601()
    .withMessage('Termin realizacji musi być prawidłową datą w formacie ISO8601'),
  
  body('wykonawcy')
    .optional()
    .isArray()
    .withMessage('Wykonawcy muszą być tablicą')
];

/**
 * Walidacja danych przy dodawaniu reakcji do rozwiązania
 */
const addReactionValidation = [
  body('rodzaj')
    .isString()
    .withMessage('Rodzaj reakcji musi być tekstem')
    .isIn(['like', 'dislike', 'heart', 'smile', 'thinking'])
    .withMessage('Rodzaj reakcji musi być jednym z: like, dislike, heart, smile, thinking')
];

/**
 * Walidacja danych przy dodawaniu wykonawcy
 */
const addExecutorValidation = [
  body('imieNazwisko')
    .isString()
    .withMessage('Imię i nazwisko musi być tekstem')
    .isLength({ min: 3, max: 100 })
    .withMessage('Imię i nazwisko musi mieć od 3 do 100 znaków')
    .trim(),
  
  body('rola')
    .optional()
    .isString()
    .withMessage('Rola musi być tekstem')
    .isIn(['odpowiedzialny', 'wsparcie', 'konsultant'])
    .withMessage('Rola musi być jedną z: odpowiedzialny, wsparcie, konsultant')
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  addCommentValidation,
  addSolutionValidation,
  updateExecutionProcessValidation,
  addReactionValidation,
  addExecutorValidation
};
