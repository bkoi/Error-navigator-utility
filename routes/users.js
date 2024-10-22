const express = require('express');
//const cors = require('cors');
const connectDB = require('../utils/database');

const router = express.Router();

//View users
router.get('/users', async (req, res) => {
    const sql = 'SELECT * FROM users';  
    
    try {
        const pool = await connectDB();
        const results = await pool.query(sql);
        return res.status(200).json(results); 
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//View single user
router.get('/users/:staffid', async(req, res) => {
    const staffid  = req.headers['staffid'];
    const sql = 'SELECT * FROM users WHERE staffid = ?';

    try {
        const pool = await connectDB();
        const results = await pool.query(sql, [staffid]);

        if (results.length > 0) {
            res.status(200).json(results);
        } else {    
            res.status(404).json({ error:'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;