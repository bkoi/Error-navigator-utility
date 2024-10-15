const express = require('express');
const { login, authenticateAccessToken } = require('./auth');
const router = express.Router();

//Login route
router.post('/login', login);

//Admin authentication
router.get('/user', authenticateAccessToken, (req, res) => {
    if (req.user.role !== 'admin' ||req.user.role !== 'business_user') {
        return res.status(403).json({ message: 'Access denied' });  
    }
    res.status(200).json({ message: 'Access granted' });
});

module.exports = router;


