/**
 * Walidatory dla endpointów związanych z użytkownikami
 * Wykorzystują express-validator do sprawdzania poprawności danych
 */
const { body } = require('express-validator');
const User = require('../models/user.model');

/**
 * Walidacja danych przy rejestracji użytkownika
 */
const registerValidation = [
  body('nazwa')
    .isString()
    .withMessage('Nazwa użytkownika musi być tekstem')
    .isLength({ min: 3, max: 50 })
    .withMessage('Nazwa użytkownika musi mieć od 3 do 50 znaków')
    .trim()
    .custom(async (value) => {
      const user = await User.findOne({ nazwa: value });
      if (user) {
        throw new Error('Użytkownik o takiej nazwie już istnieje');
      }
      return true;
    }),
  
  body('email')
    .isEmail()
    .withMessage('Podaj prawidłowy adres email')
    .normalizeEmail()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('Użytkownik o takim adresie email już istnieje');
      }
      return true;
    }),
  
  body('haslo')
    .isLength({ min: 6 })
    .withMessage('Hasło musi mieć co najmniej 6 znaków')
    .matches(/\d/)
    .withMessage('Hasło musi zawierać co najmniej jedną cyfrę')
    .matches(/[A-Z]/)
    .withMessage('Hasło musi zawierać co najmniej jedną wielką literę'),
  
  body('potwierdzHaslo')
    .custom((value, { req }) => {
      if (value !== req.body.haslo) {
        throw new Error('Hasła nie są identyczne');
      }
      return true;
    })
];

/**
 * Walidacja danych przy logowaniu użytkownika
 */
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Podaj prawidłowy adres email')
    .normalizeEmail(),
  
  body('haslo')
    .notEmpty()
    .withMessage('Hasło jest wymagane')
];

/**
 * Walidacja danych przy aktualizacji profilu użytkownika
 */
const updateProfileValidation = [
  body('nazwa')
    .optional()
    .isString()
    .withMessage('Nazwa użytkownika musi być tekstem')
    .isLength({ min: 3, max: 50 })
    .withMessage('Nazwa użytkownika musi mieć od 3 do 50 znaków')
    .trim()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ nazwa: value });
      if (user && user._id.toString() !== req.user.id) {
        throw new Error('Użytkownik o takiej nazwie już istnieje');
      }
      return true;
    }),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Podaj prawidłowy adres email')
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });
      if (user && user._id.toString() !== req.user.id) {
        throw new Error('Użytkownik o takim adresie email już istnieje');
      }
      return true;
    }),
  
  body('telefon')
    .optional()
    .isString()
    .withMessage('Numer telefonu musi być tekstem')
    .matches(/^\+?[0-9\s-]{9,15}$/)
    .withMessage('Podaj prawidłowy numer telefonu')
    .trim(),
  
  body('stanowisko')
    .optional()
    .isString()
    .withMessage('Stanowisko musi być tekstem')
    .isLength({ min: 2, max: 100 })
    .withMessage('Stanowisko musi mieć od 2 do 100 znaków')
    .trim()
];

/**
 * Walidacja danych przy zmianie hasła
 */
const changePasswordValidation = [
  body('obecneHaslo')
    .notEmpty()
    .withMessage('Obecne hasło jest wymagane'),
  
  body('noweHaslo')
    .isLength({ min: 6 })
    .withMessage('Nowe hasło musi mieć co najmniej 6 znaków')
    .matches(/\d/)
    .withMessage('Nowe hasło musi zawierać co najmniej jedną cyfrę')
    .matches(/[A-Z]/)
    .withMessage('Nowe hasło musi zawierać co najmniej jedną wielką literę'),
  
  body('potwierdzHaslo')
    .custom((value, { req }) => {
      if (value !== req.body.noweHaslo) {
        throw new Error('Nowe hasła nie są identyczne');
      }
      return true;
    })
];

/**
 * Walidacja danych przy zmianie roli użytkownika (tylko dla administratora)
 */
const changeRoleValidation = [
  body('rola')
    .isIn(['user', 'manager', 'admin'])
    .withMessage('Rola musi być jedną z: user, manager, admin')
];

/**
 * Walidacja danych przy zmianie statusu aktywności użytkownika (tylko dla administratora)
 */
const changeStatusValidation = [
  body('aktywny')
    .isBoolean()
    .withMessage('Status aktywności musi być wartością logiczną (true/false)')
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  changeRoleValidation,
  changeStatusValidation
};
