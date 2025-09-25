const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agri_connect',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Create promise-based connection
const db = pool.promise();

module.exports = db;
