const express = require('express');
const router = express.Router();
const { sql } = require('../db');
const verifyToken = require('../middleware/authMiddleware');


router.get('/categories', verifyToken, (req, res) => {
    const request = new sql.Request();
    request.query('SELECT CategoryID, CategoryName FROM Category', (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.status(200).json(result.recordset);
    });
});

router.post('/addCategory', verifyToken, (req, res) => {
    const { categoryName, description, parentCategoryID } = req.body;
    if (!categoryName) return res.status(400).json({ error: 'Category name is required' });

    const request = new sql.Request();
    request.input('CategoryName', sql.VarChar(255), categoryName)
           .input('Description', sql.VarChar(255), description || '')
           .input('ParentCategoryID', sql.Int, parentCategoryID || null);

    request.query(`
        INSERT INTO Category (CategoryName, Description, ParentCategoryID)
        VALUES (@CategoryName, @Description, @ParentCategoryID);
        SELECT SCOPE_IDENTITY() AS CategoryID;
    `, (err, result) => {
        if (err) return res.status(500).json({ error: 'Database insertion failed' });
        res.status(201).json({
            message: 'Category added successfully',
            CategoryID: result.recordset[0].CategoryID,
        });
    });
});

module.exports = router;
