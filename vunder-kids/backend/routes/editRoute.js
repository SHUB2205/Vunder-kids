const express = require('express');
const router = express.Router();
const {userName} = require('../controllers/editController');
const isAuth=require("../middleware/is-Auth");



router.get("/editUserName",isAuth,userName);



module.exports = router;
