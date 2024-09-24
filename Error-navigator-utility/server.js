const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');
const authRoutes = require('./authentication/route');
const PORT = 3000;

const app = express();

app.use(bodyParser.json()); 
app.use(transactionRoutes);
app.use(userRoutes);
app.use('/auth', authRoutes);

app.listen(PORT, () => console.log(`Server connected to port ${PORT}`));

//Error handler for unhandledRejection errors
process.on('unhandledRejection', err => {
    console.log(`An error occurred: ${err.message}`);
    server.close(() => process.exit(1));
});
