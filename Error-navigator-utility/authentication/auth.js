const pool = require('../utils/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Login function
const login = (req, res, next) => {
    const { staffid, password } = req.body;

    if (!staffid || !password) {
        return res.status(400).json({
            message: 'Please provide staffid and password',
        });
    }
    try {
        pool.query('SELECT * FROM users WHERE staffid = ?', [staffid], (error, rows, fields) => {
        if(error) {
            return res.status(500).json({error:error})
        }   
        const user = rows[0];

        if (!user) {
            return res.status(401).json({
                message: 'Invalid staffid or password',
                error: 'User not found',
            });
        }
        
        const isMatch = bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid staffid or password',
                error: 'Incorrect password',
            });
        } else {
            return res.status(200).json({
                message: 'Login successful',
            });     
        }  
    }); 
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
}; 

module.exports = { login };