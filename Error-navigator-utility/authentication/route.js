require('dotenv').config();
const express = require('express');
const router = express.Router();
const { login , authenticateToken } = require('./auth');
const jwt = require('jsonwebtoken');
const mysqlConnection = require('../utils/database');

//Create login route
router.post('/login', login);

//Create protected user route
router.get('/user', authenticateToken, (req, res) => { 
    const { staffid } = req.body;
    
    mysqlConnection.query('SELECT * FROM users WHERE staffid = ?', [staffid], (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});
    
module.exports = router;