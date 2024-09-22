const mysql = require('mysql');

//Create a connection pool
const pool = mysql.createPool( {
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    database: 'error_navigator',
    password: '15Greece!Aeg',
    multipleStatements: true,
});

module.exports = pool;