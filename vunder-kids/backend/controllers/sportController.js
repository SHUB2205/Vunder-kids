const Sport = require('../models/Sport');
const { validationResult } = require('express-validator');

// Add a new sport
exports.addSport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.status = 422;
      error.data = errors.array();
      throw error;
    }

    const { name, description } = req.body;

    const sportExists = await Sport.findOne({ name });
    if (sportExists) {
      const error = new Error('Sport already exists');
      error.status = 400;
      throw error;
    }

    const sport = await Sport.create({
      name,
      description
    });

    if (sport) {
      res.status(201).json({
        _id: sport._id,
        name: sport.name,
        description: sport.description,
      });
    } else {
      const error = new Error('Invalid sport data');
      error.status = 400;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Update an existing sport
exports.updateSport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.status = 422;
      error.data = errors.array();
      throw error;
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const sport = await Sport.findById(id);
    if (!sport) {
      const error = new Error('Sport not found');
      error.status = 404;
      throw error;
    }

    sport.name = name || sport.name;
    sport.description = description || sport.description;

    const updatedSport = await sport.save();

    res.json({
      _id: updatedSport._id,
      name: updatedSport.name,
      description: updatedSport.description,
    });
  } catch (error) {
    next(error);
  }
};


// Get all sports
exports.getAllSports = async (req, res, next) => {
  try {
    const sports = await Sport.find({});
    res.json(sports);
  } catch (error) {
    next(error);
  }
};

// Get a single sport by ID
exports.getSportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sport = await Sport.findById(id);
    if (!sport) {
      const error = new Error('Sport not found');
      error.status = 404;
      throw error;
    }
    res.json(sport);
  } catch (error) {
    next(error);
  }
};
