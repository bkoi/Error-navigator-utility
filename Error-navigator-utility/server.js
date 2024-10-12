const express = require('express');
const cors = require('cors');
const authRoutes = require('./authentication/route');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { connectDB, disconnectDB } = require('./utils/database');
//const userRoutes = require('./routes/users');
// const transactionsRoutes = require('./routes/transactions');
const session = require('express-session');
const crypto = require('crypto');
//const sessionSecret = crypto.randomBytes(32).toString('hex');
const http = require('http');
const port = process.env.PORT;

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }  // Set this to true if using HTTPS
}));

app.use(express.static(path.join(__dirname, 'assets')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
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
process.on('unhandledRejection', error => {
    console.log(`Unhandled Rejection: ${error.message}`);
    gracefulShutdown('unhandledRejection'); 
});

// Handle requests to close the connection
app.post('/close-connection', async (req, res) => {
    console.log('Request to close database connection received');
    await disconnectDB();
    res.send('Database connection closed');
});

// Gracefully handle termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

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

app.post('/login-form', (req, res, next) => {
    const { staffid, password } = req.body;

    if(!staffid || !password) {
        return res.status(400).json('Staff ID or password field cannot be empty');
    }

    const options = {
        hostname: 'localhost',
        port: port,
        path: '/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'staffid': staffid,
            'password': password
        }
    };

    const loginRequest = http.request(options, (loginResponse) => {
        let data = '';

        loginResponse.on('data', (chunk) => {
            data += chunk;
        });

        loginResponse.on('end', () => {
            console.log('Response from /auth/login:', loginResponse.statusCode, data);

            if (loginResponse.statusCode === 302) {
                const location = loginResponse.headers.location;
                console.log('Redirected to:', location);
                res.redirect(location);
            } else if(loginResponse.statusCode === 200) {
                res.redirect('/search');
            } else {
                res.status(401).send('Login failed.');
            }   
        }); 
    }); 

    loginRequest.on('error', (error) => {
        console.error('Error forwarding request:', error);
        res.status(500).send('Server error during login.');
    });

    loginRequest.end(); 
});

const server = app.listen(port, () => console.log(`Server connected to port ${port}`));