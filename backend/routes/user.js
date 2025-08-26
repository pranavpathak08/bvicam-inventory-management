const express = require('express');
const router = express.Router();
const { sql } = require('../db');
const verifyToken = require('../middleware/authMiddleware');

router.get('/getUsers', verifyToken, (req, res) => {
    const request = new sql.Request();
    request.execute('GetUsers', (err, result) => {
        if (err) {
            console.error('Error executing stored procedure:', err);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).json(result.recordset);
    });
});

module.exports = router;