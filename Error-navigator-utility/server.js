const express = require('express');
const cors = require('cors');
const authRoutes = require('./authentication/route');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./utils/database');
const port = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); 
app.use('/auth', authRoutes);

connectDB();

const server = app.listen(port, () => console.log(`Server connected to port ${port}`));

//Error handler for unhandledRejection errors
process.on('unhandledRejection', err => {
    console.log(`An error occurred: ${err.message}`);
    server.close(() => process.exit(1));
});
