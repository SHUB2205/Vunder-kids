const express = require('express');
const openaiController=require('../controllers/openaiController');
const {isAuth} = require('../middleware/is-Auth');

const router = express.Router();


router.post('/askOpenAi', isAuth, openaiController.askOpenai);


module.exports = router;
