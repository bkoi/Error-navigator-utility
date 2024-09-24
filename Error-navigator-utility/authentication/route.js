const express = require('express');
const router = express.Router();
const { login } = require('./auth');
const mysqlConnection = require('../utils/database');
const jwt = require('jsonwebtoken');
//const jwtSecret = ?;

//Create login route
router.route('/login').post(login);

//Authenticate user
router.post('/login', (req, res) => {
    const { staffid, password } = req.params;
    const sql = 'SELECT * FROM users WHERE staffid = ? AND password = ?';
    const user = {user: staffid, password: password};

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

//Authorise user

module.exports = router;