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
    const { staffid } = req.user;
    
    mysqlConnection.execute('SELECT * FROM users WHERE staffid = ?', [staffid], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});
    
module.exports = router;