const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/placeController');
const authMiddleware = require('../middleware/auth');  // Assuming you have authentication middleware

router.get('/', facilityController.getAllFacility);
router.get('/:id', facilityController.getFacility);
router.post('/', authMiddleware, facilityController.createFacility);
router.put('/:id', authMiddleware, facilityController.updateFacility);
router.delete('/:id', authMiddleware, facilityController.deleteFacility);
router.get('/user', authMiddleware, facilityController.getUserFacilities);

module.exports = router;