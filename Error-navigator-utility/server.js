const express = require('express');
const cors = require('cors');
const authRoutes = require('./authentication/route');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { connectDB, disconnectDB } = require('./utils/database');
//const userRoutes = require('./routes/users');
// const transactionsRoutes = require('./routes/transactions');
const port = process.env.PORT;

const app = express();

app.use(express.static(path.join(__dirname, 'assets')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); 
app.use('/auth', authRoutes);
//app.use(userRoutes);
//app.use(transactionsRoutes);

connectDB();

//Error handler for unhandledRejection errors
process.on('unhandledRejection', err => {
    console.log(`An error occurred: ${err.message}`);
    server.close(() => process.exit(1));
});

app.post('/close-connection', async(req, res) => {
    console.log('Request to close database connection received');
    await disconnectDB();
    res.send('Database connection closed');
});

const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Closing database connection...`);
    try {
        await disconnectDB();
        console.log('Database connection closed');   
    } catch (error) {
        console.error('An error occurred while closing database connection:', error);
    }   
};

process.on('exit', async() => {
    console.log('Received exit request. Closing database connection...');
    await disconnectDB();
    console.log('Database connection closed'); 
}); 

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'search.html'));
});

app.get('/result', (req, res) => {
    res.sendFile(path.join(__dirname, 'result.html'));
});

const server = app.listen(port, () => console.log(`Server connected to port ${port}`));