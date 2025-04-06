const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validate_input } = require('../middleware/validator');
const authController = require('../controllers/auth.controller');
const { 
  registerValidation, 
  loginValidation 
} = require('../validators/user.validator');

/**
 * @route   POST api/auth/rejestracja
 * @desc    Rejestracja nowego użytkownika
 * @access  Public
 */
router.post('/rejestracja', 
  registerValidation,
  validate_input,
  authController.register_user
);

/**
 * @route   POST api/auth/logowanie
 * @desc    Logowanie użytkownika i zwracanie tokenu JWT
 * @access  Public
 */
router.post('/logowanie', 
  loginValidation,
  validate_input,
  authController.login_user
);

/**
 * @route   GET api/auth/ja
 * @desc    Pobieranie danych zalogowanego użytkownika
 * @access  Private
 */
router.get('/ja', 
  auth, 
  authController.get_current_user
);

/**
 * @route   POST api/auth/wyloguj
 * @desc    Wylogowanie użytkownika (po stronie klienta)
 * @access  Private
 */
router.post('/wyloguj', 
  auth, 
  authController.logout_user
);

module.exports = router;
