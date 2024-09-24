require('dotenv').config();
const mysqlConnection = require('../utils/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Login function
const login = (req, res, next) => {
    const { staffid, password } = req.body;

    if (!staffid || !password) {
        return res.status(400).json({
            message: 'Please provide staffid and password'
        });
    }

    mysqlConnection.query('SELECT * FROM users WHERE staffid = ?', [staffid], (error, rows, fields) => {
        if(error) return res.status(500).json({ error:error });
        
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
                const accessToken = jwt.sign({ staffid: user.staffid }, process.env.ACCESS_TOKEN_SECRET);
                res.json({ accessToken: accessToken });
                res.json({message: 'Login successful'});
                next();
            }
    });
}

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

module.exports = { login };
module.exports = { authenticateToken };
