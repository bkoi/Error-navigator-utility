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
//Function to gracefully shutdown the database connection
const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Closing database connection...`);
    try {
        await disconnectDB();
        console.log('Database connection closed');
        process.exit(0); 
    } catch (error) {
        console.error('Error occurred during database shutdown:', error);
        process.exit(1); 
    }
};

// Error handler for unhandledRejection errors
process.on('unhandledRejection', err => {
    console.log(`Unhandled Rejection: ${err.message}`);
    gracefulShutdown('unhandledRejection'); 
});

// Handle requests to close the connection
app.post('/close-connection', async (req, res) => {
    console.log('Request to close database connection received');
    await disconnectDB();
    res.send('Database connection closed');
});

// Gracefully handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Exit handler
process.on('exit', (code) => {
    console.log(`Process exiting with code: ${code}`);
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'search.html'));
});

app.get('/result', (req, res) => {
    res.sendFile(path.join(__dirname, 'result.html'));
});

const server = app.listen(port, () => console.log(`Server connected to port ${port}`));