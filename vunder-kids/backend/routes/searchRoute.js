const express = require('express');
const {userName} = require('../controllers/searchController');
const router = express.Router();


//  Route Link
// http://localhost:5000/api/search/searchByUserName?name=vinki
router.get("/searchByUserName",userName);



module.exports = router;
