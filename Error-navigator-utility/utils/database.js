const mysql = require('mysql');

//Create a connection pool
/*const pool = mysql.createPool( {
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    database: 'error_navigator',
    password: '15Greece!Aeg',
    multipleStatements: true,
});
*/
//Create connection to database
/*
const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'error_navigator',
    password: '15Greece!Aeg',
    multipleStatements: true
});

//Connect to database
mysqlConnection.connect((err) => {  
    if(!err) {
        console.log('Connection to database established');
    } else {    
        console.log('Connection to database failed:', err);
    }
});

module.exports = mysqlConnection;
*/

const connectDB = async () => {
    const pool = mysql.createPool( {
        connectionLimit: 10,
        host: 'localhost',
        user: 'root',
        database: 'error_navigator',
        password: '15Greece!Aeg',
        multipleStatements: true,
    });

    pool.getConnection((error, connection) => {
        if (error) {
            console.log({ error: error.message });
        }
            
        console.log('Connected to MySQL database');
        console.release();
    });
};

module.exports = connectDB;