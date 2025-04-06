const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const manager = require('../middleware/manager');
const { validate_input } = require('../middleware/validator');
const taskController = require('../controllers/task.controller');
const {
  createTaskValidation,
  updateTaskValidation,
  addCommentValidation,
  addSolutionValidation,
  updateExecutionProcessValidation,
  addReactionValidation,
  addExecutorValidation
} = require('../validators/task.validator');

/**
 * @route   GET api/tasks
 * @desc    Pobieranie wszystkich zadań
 * @access  Private
 */
router.get('/', auth, taskController.get_all_tasks);

/**
 * @route   GET api/tasks/:id
 * @desc    Pobieranie pojedynczego zadania
 * @access  Private
 */
router.get('/:id', auth, taskController.get_task_by_id);

/**
 * @route   POST api/tasks
 * @desc    Tworzenie nowego zadania
 * @access  Private
 */
router.post('/', 
  auth, 
  createTaskValidation,
  validate_input,
  taskController.create_task
);

/**
 * @route   PUT api/tasks/:id
 * @desc    Aktualizacja zadania
 * @access  Private
 */
router.put('/:id', 
  auth, 
  updateTaskValidation,
  validate_input,
  taskController.update_task
);

/**
 * @route   DELETE api/tasks/:id
 * @desc    Usunięcie zadania
 * @access  Private
 */
router.delete('/:id', auth, taskController.delete_task);

/**
 * @route   POST api/tasks/:id/komentarze
 * @desc    Dodanie komentarza do zadania
 * @access  Private
 */
router.post('/:id/komentarze', 
  auth, 
  addCommentValidation,
  validate_input,
  taskController.add_comment
);

/**
 * @route   POST api/tasks/:id/rozwiazania
 * @desc    Dodanie proponowanego rozwiązania
 * @access  Private
 */
router.post('/:id/rozwiazania', 
  auth, 
  addSolutionValidation,
  validate_input,
  taskController.add_solution
);

/**
 * @route   PUT api/tasks/:id/proces-realizacji
 * @desc    Aktualizacja procesu realizacji zadania
 * @access  Private (tylko manager lub admin)
 */
router.put('/:id/proces-realizacji', 
  auth,
  manager, 
  updateExecutionProcessValidation,
  validate_input,
  taskController.update_execution_process
);

/**
 * @route   POST api/tasks/:id/rozwiazania/:solutionId/reakcje
 * @desc    Dodanie reakcji do rozwiązania
 * @access  Private
 */
router.post('/:id/rozwiazania/:solutionId/reakcje', 
  auth, 
  addReactionValidation,
  validate_input,
  taskController.add_reaction_to_solution
);

/**
 * @route   POST api/tasks/:id/uwagi
 * @desc    Dodanie uwagi do zadania
 * @access  Private
 */
router.post('/:id/uwagi', 
  auth, 
  addCommentValidation,
  validate_input,
  taskController.add_comment
);

/**
 * @route   POST api/tasks/:id/wykonawcy
 * @desc    Dodanie wykonawcy do procesu realizacji
 * @access  Private (tylko manager lub admin)
 */
router.post('/:id/wykonawcy', 
  auth,
  manager, 
  addExecutorValidation,
  validate_input,
  taskController.add_executor
);

module.exports = router;
