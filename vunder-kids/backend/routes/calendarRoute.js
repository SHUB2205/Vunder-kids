const express = require('express');
const router = express.Router();
const { isAuth } = require('../middleware/is-Auth');
const calendarController = require('../controllers/calendarController')
// Routes
router.post('/create', isAuth, calendarController.createEvent); 
router.get('/user-events', isAuth, calendarController.getUserEvents); 
router.put('/:id', isAuth, calendarController.updateEvent); 
router.delete('/:id', isAuth, calendarController.deleteEvent); 
router.get('/:id', isAuth, calendarController.getEventById); 



module.exports = router;



