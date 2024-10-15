const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { checkRecordExists, updateRecord, generateAccessToken } = require('../utils/sqlFunctions');

// Login function
const login = async (req, res) => {
    const staffid = req.headers['staffid'];
    const password = req.headers['password'];
    //const salt = 10;

    if (!staffid || !password) {
        return res.status(400).json({ error: 'Staff ID or password field cannot be empty' });
    }

    try {
        const existingUser = await checkRecordExists('users', 'staffid', staffid);
        //console.log(existingUser);
        if (!existingUser) {
            return res.status(401).json({ error: 'Staff Id and password do not match. Please try again' });
        }

        //console.log(await bcrypt.hash(password, salt));
        //Check the password
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Incorrect credentials' });
        }

        //Generate a JWT token with 15-minute expiration
        const accessToken = jwt.sign(
            { staffid: existingUser.staffid, role:existingUser.role }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: '1h' }
        );

        //Store JWT in session
        req.session.user ={
            staffid: existingUser.staffid, 
            role: existingUser.role,
            accessToken: accessToken
        };
        //Redirect based on user role
        if (existingUser.role === 'admin' || existingUser.role) {
            return res.redirect('/search');
        } else {
            console.log('Unauthorized role: ' , staffid);
            return res.status(403).send('Your accounr does not have access to this application. Please contact your administrator.');
        }
    } catch (error) {
        console.log(' Error during login: ', error);
        return res.status(500).json({ error: error.message });
    }
};

// Middleware to authenticate the token
const authenticateAccessToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token is missing or invalid' }); // Unauthorized
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({ error: 'Token is invalid or expired' }); // Forbidden
        }
        req.user = user; // Attach user data to request
        next();
    });
};

module.exports = { login, authenticateAccessToken };
