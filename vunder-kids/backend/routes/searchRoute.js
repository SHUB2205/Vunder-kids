const express = require('express');
const {userName,search} = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/is-Auth');
const router = express.Router();


//  Route Link
// http://localhost:5000/api/search/searchByUserName?name=vinki
router.get("/searchByUserName",userName);
router.get("/search",optionalAuth,search);




module.exports = router;
