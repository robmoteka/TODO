const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validate_input } = require('../middleware/validator');
const userController = require('../controllers/user.controller');
const {
  updateProfileValidation,
  changePasswordValidation,
  changeRoleValidation,
  changeStatusValidation
} = require('../validators/user.validator');

/**
 * @route   GET api/users
 * @desc    Pobieranie listy użytkowników
 * @access  Private/Admin
 */
router.get('/', auth, admin, userController.get_all_users);

/**
 * @route   GET api/users/:id
 * @desc    Pobieranie danych użytkownika po ID
 * @access  Private
 */
router.get('/:id', auth, userController.get_user_by_id);

/**
 * @route   PUT api/users/:id
 * @desc    Aktualizacja danych użytkownika
 * @access  Private
 */
router.put('/:id', 
  auth, 
  updateProfileValidation,
  validate_input,
  userController.update_user
);

/**
 * @route   DELETE api/users/:id
 * @desc    Usunięcie użytkownika
 * @access  Private/Admin
 */
router.delete('/:id', auth, admin, userController.delete_user);

/**
 * @route   PUT api/users/:id/zmiana-hasla
 * @desc    Zmiana hasła użytkownika
 * @access  Private
 */
router.put('/:id/zmiana-hasla', 
  auth, 
  changePasswordValidation,
  validate_input,
  userController.change_password
);

/**
 * @route   PUT api/users/:id/rola
 * @desc    Zmiana roli użytkownika (tylko dla admina)
 * @access  Private/Admin
 */
router.put('/:id/rola', 
  auth, 
  admin,
  changeRoleValidation,
  validate_input,
  userController.change_role
);

/**
 * @route   PUT api/users/:id/status
 * @desc    Aktywacja/dezaktywacja konta użytkownika (tylko dla admina)
 * @access  Private/Admin
 */
router.put('/:id/status', 
  auth, 
  admin,
  changeStatusValidation,
  validate_input,
  userController.toggle_account_status
);

module.exports = router;
