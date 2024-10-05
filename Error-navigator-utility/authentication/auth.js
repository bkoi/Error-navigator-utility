require('dotenv').config();
const mysqlConnection = require('../utils/database');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Login function
const login = async(req, res) => {
    const { staffid, password } = req.body;

    if (!staffid || !password) {
        return res.status(400).json({
            message: 'Please provide staffid and password'
        });
    }

    try {
        const rows = await mysqlConnection.execute('SELECT * FROM users WHERE staffid = ?', [staffid]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({
                message: 'Invalid staffid or password',
                error: 'User not found',
            });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid staffid or password',
                error: 'Incorrect password',
            });
        }

        const accessToken = jwt.sign({ staffid: user.staffid }, process.env.ACCESS_TOKEN_SECRET);
        return res.json({ message: 'Login successful', accessToken });
        
    } catch (error) {
         return res.status(500).json({ error:error });
    }          
}
/*
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = { login, authenticateToken };
*/
