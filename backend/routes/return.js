const express = require('express');
const router = express.Router();
const { sql } = require('../db');

const verifyToken = require('../middleware/authMiddleware');

router.post('/returnItem', verifyToken, (req, res) => {
    const { reqId, returnedQuantity } = req.body;
    if (!reqId || !returnedQuantity) {
        return res.status(400).json({ message: 'Request ID and Returned Quantity are required.' });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const request = new sql.Request();
    request.input('reqId', sql.Int, reqId);
    request.input('returnedQuantity', sql.Int, returnedQuantity);
    request.input('dateOfReturn', sql.DateTime, currentDate);

    request.execute('ReturnItem', (err) => {
        if (err) return res.status(500).json({ message: 'Failed to return item.', error: err.message });
        res.json({ message: 'Item returned successfully!' });
    });
});

router.get('/getReturnRequests', verifyToken, (req, res) => {
    const request = new sql.Request();
    request.execute('GetReturnRequests', (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.status(200).json(result.recordset);
    });
});

module.exports = router;
