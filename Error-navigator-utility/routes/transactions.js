const express = require('express');
//const cors = require('cors');
const connectDB = require('../utils/database');
const router = express.Router();

//View transactions
/*router.get('/transactions', async (req, res) => {
    const sql = 'SELECT * FROM transactions';
    const pool = await connectDB();

    pool.query(sql, (err, results, fields) => {
        if (!err) {
            res.send(results);
        } else {
            console.log(err);
        }
    });
});
*/

//View single transaction
router.get('/transactions/:messageid', async (req, res) => {
    const { messageid } = req.params;
    const sql = 'SELECT * FROM transactions WHERE messageid = ?';
    const pool = await connectDB();

    pool.query(sql, messageid, (err, results, fields) => {
        if (!err) {
            if (results.length > 0) {
                res.send(results);
            } else {
                res.status(404).send('Transaction not found');
            }
        } else {
            console.log(err);
            res.status(500).send('Error retrieving transaction');
        }
    });
 });

//Update transaction
router.put('/transactions/:messageid', async(req, res) => {
    const { messageid } = req.params;
    const { UETR, F20, createddate, event_desc, root_cause, staffid } = req.body;
    const sql = 'UPDATE transactions SET UETR = ?, F20 = ?, createddate = ?, event_desc = ?, root_cause = ?, staffid = ? WHERE messageid = ?';
    const pool = await connectDB();

    pool.query(sql, [UETR, F20, createddate, event_desc, root_cause, staffid, messageid], (err, results, fields) => {
        if (!err) {
            if (results.affectedRows > 0) {
                res.send("The data for the selected transaction has been successfully updated");
            } else {
                res.status(404).send('Messageid not found');
            }
        } else {
            console.log(err);
            res.status(500).send('Failed to update the transaction');
        }
    });
});

//Delete transaction
router.delete('/transactions/:messageid', async(req, res) => {
    const { messageid } = req.params;
    const sql = 'DELETE FROM transactions WHERE messageid = ?';
    const pool = await connectDB();

    pool.query(sql, messageid, (err, results, fields) => {
        if (!err) {
            res.send("The selected transaction has been deleted");
        } else {
            console.log(err);
        }
    });
});

module.exports = router;