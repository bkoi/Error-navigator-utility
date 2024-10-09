const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { checkRecordExists, updateRecord, generateAccessToken } = require('../utils/sqlFunctions');

// Login function
const login = async (req, res) => {
    const staffid = req.headers['staffid'];
    const password = req.headers['password'];
    const salt = 10;

    if (!staffid || !password) {
        return res.status(400).json({ error: 'Staff ID or password field cannot be empty' });
    }

    try {
        const existingUser = await checkRecordExists('users', 'staffid', staffid);
        //console.log(existingUser);
        if (!existingUser) {
            return res.status(401).json({ error: 'Incorrect credentials' });
        }
        console.log(await bcrypt.hash(password, salt));
        //Check the password
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Incorrect credentials' });
        }

        //Generate a JWT token with 15-minute expiration
        const accessToken = jwt.sign(
            { staffid: existingUser.staffid, role:existingUser.role }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: '15m' }
        );

        res.status(200).json({
            message: 'Login successful',
            staffid: existingUser.staffid,
            access_token: accessToken,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401); // Unauthorized
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            return res.status(403); // Forbidden
        }
        req.user = user; // Attach user data to request
        next();
    });
};

module.exports = { login, authenticateToken };
