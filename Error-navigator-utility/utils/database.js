const mysql = require('mysql2/promise');
const config = require('./config');

let pool;
const connectDB = async () => {
    if (!pool) {
        pool = mysql.createPool(config);
        console.log('Connection pool created');
    }
    return pool;
};

module.exports = connectDB;