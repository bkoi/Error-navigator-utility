const mysql = require('mysql2');
const config = require('./config');

let pool;
const connectDB = async () => {
    if (!pool) {
        pool = mysql.createPool(config);
        console.log('Connection pool created');
    }
    return pool;
};

const disconnectDB = async () => {
    if (pool) {
        await pool.end((error) => {
            if(error) {
                console.error('Error closing the connection pool: ', error);
            } else {
                console.log('Connection pool closed');
            }
        });
        pool = null;                                                        
    } else {
        console.log('No connection pool to close');
    }   
};

module.exports = { connectDB, disconnectDB };