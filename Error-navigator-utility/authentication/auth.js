const pool = require('../utils/database');

//Create login function
const login = async (req, res, next) => {
    const { staffid, password } = req.body;

    if (!staffid || !password) {
        return res.status(400).json({
            message: 'Please provide staffid and password',
        });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE staffid = ? AND password = ?', [staffid, password]);
        console.log(rows);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({
                message: 'Invalid staffid or password',
                error: 'User not found',
            });
        } else {
            return res.status(200).json({
                message: 'Login successful',
            });     
        }  
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
};      

module.exports = { login }; 