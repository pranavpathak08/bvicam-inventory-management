const express = require('express');
const router = express.Router();
const { sql } = require('../db');


const verifyToken = require('../middleware/authMiddleware');
router.post('/requests', verifyToken, (req, res) => {
    const { userid, itemId, feedback, quantity } = req.body;
    const request = new sql.Request();
    request.input('userid', sql.Int, userid)
           .input('itemId', sql.Int, itemId)
           .input('feedback', sql.NVarChar, feedback)
           .input('quantity', sql.Int, quantity);

    request.execute('RequestItem', (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.status(200).json({ message: 'Item requested successfully' });
    });
});

router.get('/getRequests', verifyToken, (req, res) => {
    const request = new sql.Request();
    request.execute('GetRequestDetails', (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.status(200).json(result.recordset);
    });
});

router.get('/userRequests/:userid', verifyToken, (req, res) => {
    const request = new sql.Request();
    request.input('userid', sql.Int, req.params.userid);
    request.execute('GetUserRequests', (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.status(200).json(result.recordset);
    });
});

router.post('/updateRequestStatus', verifyToken, (req, res) => {
    const { reqId, status, comment } = req.body;
    const request = new sql.Request();
    request.input('reqId', sql.Int, reqId)
           .input('status', sql.NVarChar, status)
           .input('comment', sql.NVarChar, comment || null);

    request.execute('UpdateRequestStatus', (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.status(200).json({ message: 'Request status updated successfully' });
    });
});

module.exports = router;
