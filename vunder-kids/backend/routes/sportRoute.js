const express = require('express');
const { addSport, updateSport, getAllSports, getSportById } = require('../controllers/sportController');
const { body } = require('express-validator');
const router = express.Router();
const isAuth = require("../middleware/is-Auth");

// Add a new sport
router.post(
  '/',
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('description').not().isEmpty().withMessage('Description is required')
  ],
  isAuth,
  addSport
);

// Update an existing sport
router.put(
  '/:id',
  [
    body('name').optional().not().isEmpty().withMessage('Name cannot be empty'),
    body('description').optional().not().isEmpty().withMessage('Description cannot be empty')
  ],
  isAuth,
  updateSport
);

// Get all sports
router.get('/', getAllSports);

// Get a single sport by ID
router.get('/:id', getSportById);

module.exports = router;
