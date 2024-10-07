const express = require('express');
const { login, authenticateToken } = require('./auth');
const router = express.Router();

//Login route
router.post('/login', login);

//Admin authentication
router.get('/admin', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });  
    }
    res.status(200).json({ message: 'Access granted' });
});

router.get('/business_user', authenticateToken, (req, res) => {
    if (req.user.role !== 'business_user') {
        return res.status(403).json({ message: 'Access denied' });  
    }
    res.status(200).json({ message: 'Access granted' });
});

module.exports = router;


