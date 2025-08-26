require('dotenv').config();
const sql = require('mssql');

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function connectToDatabase() {
    try {
        await sql.connect(config);
        console.log('Connected to database.');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

module.exports = { sql, connectToDatabase };
