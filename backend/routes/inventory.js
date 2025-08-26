const express = require('express');
const router = express.Router();
const { sql } = require('../db');
const verifyToken = require('../middleware/authMiddleware');

router.get('/inventory', verifyToken, (req, res) => {
    const query = 'SELECT ItemID,Itemname,CategoryID FROM inventory';
    const request = new sql.Request();

    request.query(query, (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.status(200).json(result.recordset);
    });
});

router.get('/inventory/:categoryId', verifyToken, (req, res) => {
    const categoryId = req.params.categoryId;
    const query = `SELECT ItemID, Itemname FROM inventory WHERE CategoryID = @categoryId`;
    const request = new sql.Request();

    request.input('categoryId', sql.Int, categoryId);
    request.query(query, (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.status(200).json(result.recordset);
    });
});

router.get('/viewInventory', verifyToken, (req, res) => {
    const request = new sql.Request();
    request.execute('ViewInventory', (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch inventory data' });
        res.status(200).json(result.recordset);
    });
});

router.post('/addItem', verifyToken, (req, res) => {
    const { itemName, itemCount, categoryId } = req.body;
    const parsedItemCount = parseInt(itemCount, 10);

    if (isNaN(parsedItemCount) || parsedItemCount <= 0 || !itemName || !categoryId) {
        return res.status(400).json({ message: 'Invalid item data.' });
    }

    const request = new sql.Request();
    request.input('itemName', sql.NVarChar, itemName)
           .input('itemCount', sql.Int, parsedItemCount)
           .input('categoryId', sql.Int, categoryId);

    request.execute('AddOrUpdateInventoryItem', (err) => {
        if (err) return res.status(500).json({ message: 'Database error occurred' });
        res.status(200).json({ message: 'Item added or updated successfully.' });
    });
});

router.post('/decrementItemCount', verifyToken, (req, res) => {
    const { itemName, quantity } = req.body;
    const request = new sql.Request();
    request.input('itemName', sql.NVarChar, itemName);
    request.input('quantity', sql.Int, quantity);

    request.execute('DecrementItemCount', (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (result.rowsAffected[0] === 0) {
            return res.status(400).json({ message: 'Insufficient item count or item not found' });
        }
        res.status(200).json({ message: 'Item count decremented successfully' });
    });
});

router.post('/incrementItemCount', verifyToken, (req, res) => {
    const { reqId, itemName, quantity } = req.body;
    if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid returned quantity.' });
    }

    const request = new sql.Request();
    request.input('reqId', sql.Int, reqId);
    request.input('itemName', sql.NVarChar, itemName);
    request.input('quantity', sql.Int, quantity);

    request.execute('IncrementItemCount', (err) => {
        if (err) return res.status(500).json({ message: 'Failed to increment item count.', error: err.message });
        res.json({ message: 'Return acknowledged and inventory updated successfully.' });
    });
});

module.exports = router;
