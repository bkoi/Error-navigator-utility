const express = require('express');
const cors = require('cors');
const mysqlConnection = require('../utils/database');

const router = express.Router();

//View users
router.get('/users', (req, res) => {
    const sql = 'SELECT * FROM users';      

    mysqlConnection.query(sql, (err, results, fields) => {
        if (!err) {
            res.send(results);
        } else {
            console.log(err);
        }
    });
});

//View single user
router.get('/users/:staffid', (req, res) => {
    const { staffid } = req.params;
    const sql = 'SELECT * FROM users WHERE staffid = ?';

    mysqlConnection.query(sql, staffid, (err, results, fields) => {
        if (!err) {
            if (results.length > 0) {
                res.send(results);
            } else {
                res.status(404).send('User not found');
            }
        } else {
            console.log(err);
            res.status(500).send('Error retrieving user');
        }
    });
});

module.exports = router;