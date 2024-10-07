const express = require('express');
const mysql = require('mysql2/promise');
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

const getUserByStaffId = (staffid) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE staffid = ?';

        mysqlConnection.query(sql, staffid, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

router.get('/user/:staffid', async (req, res) => {
    const { staffid } = req.params;

    try {
        const user = await getUserByStaffId(staffid);
        if (results.length > 0) {
            res.send(results);
            
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving user');
    }
});

module.exports = { router, getUserByStaffId};