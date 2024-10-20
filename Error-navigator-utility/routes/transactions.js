const express = require('express');
const cors = require('cors');
const connectDB = require('../utils/database');

const router = express.Router();

//View transactions
router.get('/transactions', async (req, res) => {
    const sql = 'SELECT * FROM transactions';

    try {
        const pool = await connectDB();
        const results = await pool.query(sql);
        return res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'FInternal Server Error' });
    }
});

//View single transaction
router.get('/transactions/:messageid', async (req, res) => {
    const { messageid } = req.params;
    const sql = 'SELECT * FROM transactions WHERE messageid = ?';
    
    try {
        const pool = await connectDB();
        const results = await pool.query(sql, messageid);

        if (results.length > 0) {
            return res.status(200).json(results);
        } else {
            return res.status(404).send('Transaction not found');
        }
        
    } catch (error) {
        console.error('Error retrieving transaction:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
 });

//Update transaction
router.put('/transactions/:messageid', async(req, res) => {
    const { messageid } = req.params;
    const { UETR, F20, createddate, event_desc, root_cause, staffid } = req.body;
    const sql = 'UPDATE transactions SET UETR = ?, F20 = ?, createddate = ?, event_desc = ?, root_cause = ?, staffid = ? WHERE messageid = ?';
    
    
    try {
        const pool = await connectDB();
        const results = await pool.query(sql, [UETR, F20, createddate, event_desc, root_cause, staffid, messageid]);

        if (results.affectedRows > 0) {
            res.status(200).send("The data for the selected transaction has been successfully updated");
        } else {
            res.status(404).send('Messageid not found');
        }
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Failed to update the transaction' });
    }
});

//Delete transaction
router.delete('/transactions/:messageid', async(req, res) => {
    const { messageid } = req.params;
    const sql = 'DELETE FROM transactions WHERE messageid = ?';

    try {
        const pool = await connectDB();
        const results = await pool.query(sql, [messageid]);

        if (results.affectedRows > 0) {
            res.status(200).send("The selected transaction has been deleted");
        } else {
            res.status(404).send('Messageid not found');
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Failed to delete the transaction' });
    }
});

module.exports = router;