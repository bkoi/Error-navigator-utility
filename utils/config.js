require('dotenv').config();

const config = {
    host: process.env.HOST || 'localhost',
    user: process.env.USER || 'root',
    password: process.env.PASSWORD || '15Greece!Aeg',
    database: process.env.DATABASE || 'error_navigator',
    multipleStatements: process.env.MULTIPLESTATEMENTS==='true',
    connectionLimit: process.env.CONNECTIONLIMIT || 10,
    maxIdle: process.env.MAXIDLE || 10,
    idleTimeout: process.env.IDLETIMEOUT || 300000,
};

module.exports = config;
