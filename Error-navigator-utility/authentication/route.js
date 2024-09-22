const express = require('express');
const router = express.Router();
const { login } = require('./auth');

//Create login route
router.route('/login').post(login);

module.exports = router;