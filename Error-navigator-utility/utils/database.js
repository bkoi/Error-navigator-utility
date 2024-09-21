const mysql = require('mysql');

const mysqlConnection = mysql.createConnection( {
    host: 'localhost',
    user: 'root',
    database: 'error_navigator',
    password: '15Greece!Aeg',
    multipleStatements: true,
});

mysqlConnection.connect((err) => {
    if (err) {
        console.log('Database connection failed');
        console.log(err);
    } else {
        console.log('Database successfully connected');
    }
});

module.exports = mysqlConnection;