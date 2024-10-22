const dotenv = require('dotenv');
dotenv.config();

const jwt = require('jsonwebtoken');

const secretKey = process.env.ACCESS_TOKEN_SECRET;
const refreshSecretKey = process.env.REFRESH_TOKEN_SECRET;

if (!secretKey) {
    console.error('Error: ACCESS_TOKEN_SECRET is not defined');
    process.exit(1);  // Exit if the secret key is missing
}

// Function to generate JWT
const generateAccessToken = (payload) => {
    const options = { expiresIn: '1h'};
    return jwt.sign(payload, secretKey, options);
};

const generateRefreshToken = (payload) => {
    const options = { expiresIn: '7d'};
    return jwt.sign(payload, refreshSecretKey, options);
};

const payload = { staffid: '9858236', role: 'admin'};

const accessToken = generateAccessToken(payload);
const refreshToken = generateRefreshToken(payload);

console.log('Generated Access Token:', accessToken);
console.log('Generated Refresh Token:', refreshToken); 
