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
const { authenticateAccessToken } = require('./authentication/auth');
const helmet = require('helmet');
const port = process.env.PORT;

const app = express();

app.use(helmet.xssFilter());

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],  // Default: load resources from your own domain
            scriptSrc: [
                "'self'", 
                "https://cdn.jsdelivr.net",  // Allow scripts from jsDelivr (Bootstrap, etc.)
            ],
            scriptSrcElem: [
                "'self'", 
                "https://cdn.jsdelivr.net"  // Explicitly allow external script elements from jsDelivr
            ],
            styleSrc: [
                "'self'", 
                "https://cdn.jsdelivr.net",  // Allow CSS from jsDelivr (Bootstrap CSS)
                "https://fonts.googleapis.com",  // Allow Google Fonts
                "https://fonts.gstatic.com"  // Google Fonts
            ],
            imgSrc: ["'self'", "data:"],  // Allow images from your domain and data URIs
            fontSrc: [
                "'self'", 
                "https://fonts.googleapis.com", 
                "https://fonts.gstatic.com"
            ],  // Allow fonts from Google Fonts
            objectSrc: ["'none'"],  // Disallow <object> tags
            upgradeInsecureRequests: []  // Automatically upgrade HTTP to HTTPS
        },
    })
);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,  // Set to true if using HTTPS 
        expires: new Date(Date.now() + 60000),
        sameSite: true 
    }
}));

app.use(express.static(path.join(__dirname, 'assets')));

const corsOptions = {
    origin: 'http://localhost:8000/index',  // Replace with your front-end origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true  // Allow cookies and credentials
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use('/auth', authRoutes);
//app.use(userRoutes);
//app.use(transactionsRoutes);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/search.html'));
});

app.get('/result', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/result.html'));
});

app.post('/login-form', async (req, res, next) => {
    const staffid = req.headers['staffid'];
    const password = req.headers['password'];

    console.log('Received headers:', { staffid: staffid, password: password });

    const sessionExpiresAt = Date.now() + 1 * 60 * 1000;

    req.session.user = { staffid, role: userRole, expiresAt: sessionExpiresAt };
    res.redirect('/search');

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

        loginResponse.on('end', async () => {
            console.log('Response from /auth/login:', loginResponse.statusCode, data);

            if (loginResponse.statusCode === 302) {
                const location = loginResponse.headers.location;
                console.log('Redirected to:', location);
                res.redirect(location);
            } else if(loginResponse.statusCode === 200) {

                try {
                    const pool = await connectDB();
                    const query = `SELECT role FROM users WHERE staffid = ?`;
                    const [results] = await pool.query(query, [staffid]);

                    if (results.length > 0) {
                        const userRole = results[0].role;

                        // Store user role in session
                        req.session.user = { staffid, role: userRole };

                        // Redirect to search page after login
                        res.redirect('/search');
                    } else {
                        res.status(404).send('User role not found');
                    }
                } catch (error) {
                    console.error('Error retrieving user role:', error);
                    res.status(500).send('Internal server error');
                }
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

app.get('/search', authenticateAccessToken, (req, res) => {
    if (!req.session.user || Date.now() > req.session.user.expiresAt) {
        // Invalidate session if expired
        req.session.destroy(err => {
            res.clearCookie('connect.sid');
            return res.redirect('/index');
        });
    } else {
        const userRole = req.session.user.role;
        const isAdmin = userRole === 'admin';
        res.render('search', { isAdmin, role: userRole });
    }
});


app.post('/refresh-token', (req, res) => {
    const refreshToken = req.headers['x-refresh-token'];

    if (!refreshToken) return res.sendStatus(401); // Unauthorized

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
        if (error) return res.sendStatus(403); // Forbidden

        // Generate a new access token
        const newAccessToken = generateAccessToken({ staffid: user.staffid, role: user.role });
        res.json({ accessToken: newAccessToken });
    });
});

app.get('/transactions', authenticateAccessToken, async (req, res) => {
    console.log('Received search request'); 
    console.log('User:', req.user);

    const { ref_name, ref_value, createddate } = req.query;

    if (!ref_name || !ref_value || !createddate) {
        return res.status(400).json({ error: 'Missing required parameters.'});
    }

    let column;
    if (ref_name === 'MSGID') {
        column = 'messageid';
    } else if (ref_name === 'F20') {
        column = 'F20';
    } else if (ref_name === 'UETR') {
        column = 'UETR';
    } else {
        return res.status(400).json({ error: 'Invalid reference name.' });
    }

    try {
        const pool = await connectDB();
        const sql = `SELECT * FROM transactions WHERE ${column} = ? AND DATE(createddate) = ?`;

        console.log(`Executing query: ${sql}`);
        console.log(`ref_value: ${ref_value}, createddate:${createddate}`);

        const [results] = await pool.query(sql, [ref_value, createddate]);

        if (results.length > 0) {
            res.json(results.map(result => {
                return { ...result, ref_name, ref_value: result[column]};
            }));
        } else {
            res.status(404).json({ error: 'No results found' });
        }
    } catch (error) {
        console.error('Error retrieving transaction:', error);
        res.status(500).json({ error:'Error retrieving transaction' });
    }
});

app.post('/transactions/update', authenticateAccessToken, async (req, res) => {
    const { ref_name, ref_value, createddate, event_desc, root_cause } = req.body;

    if (req.user.role !== 'admin') {
        return res.status(403).send('Unauthorized action. Only admin users can update transactions.');
    }

    if (!ref_name || !ref_value || !createddate || !event_desc || !root_cause) {
        return res.status(400).send('All fields are required for update.');
    }

    let column;
    if (ref_name === 'MSGID') {
        column = 'messageid';
    } else if (ref_name === 'F20') {
        column = 'F20';
    } else if (ref_name === 'UETR') {
        column = 'UETR';
    } else {
        return res.status(400).send('Invalid reference name.');
    }

    try {
        const pool = await connectDB();
        const updateSql = `UPDATE transactions SET event_desc = ?, root_cause = ? WHERE ${column} = ? AND DATE(createddate) = ?`;
        const [results] = await pool.query(updateSql, [event_desc, root_cause, ref_value, createddate]);

        if (results.affectedRows > 0) {
            const [updatedTransaction] = await pool.query(`SELECT * FROM transactions WHERE ${column} = ? AND DATE(createddate) = ?`, [ref_value, createddate]);
            res.render('result', { transactions: updatedTransaction, isAdmin: true, successMessage: 'Transaction updated successfully.' });
        } else {
            res.status(404).send('Transaction not found or no changes made.');
        }
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).send('Error updating transaction.');
    }
});

app.delete('/transactions/delete', authenticateAccessToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized action. Only admin users can delete transactions.' });
    }
    // Delete logic here
});

app.post('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to log out.');
        }
        res.clearCookie('connect.sid');  
        res.send('Logged out successfully');
    });
});

const server = app.listen(port, () => console.log(`Server connected to port ${port}`));