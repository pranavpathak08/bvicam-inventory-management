const express = require('express');
const router = express.Router();    
const jwt = require('jsonwebtoken');
const { sql } = require('../db');

// Signup route (faculty only by default)
router.post('/signup', async (req, res) => {
    const { userName, phone, email, deptname, empId, password } = req.body;
    const roleid = 2; // Faculty role by default

    try {
        const request = new sql.Request();
        await request
            .input('userName', sql.NVarChar, userName)
            .input('phone', sql.BigInt, phone)
            .input('email', sql.NVarChar, email)
            .input('deptname', sql.NVarChar, deptname)
            .input('empId', sql.Int, empId)
            .input('password', sql.NVarChar, password)
            .input('roleid', sql.Int, roleid)
            .execute('SignupUser');

        res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Database error during signup' });
    }
});

// Login route (based on email)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const request = new sql.Request();
        const result = await request
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password)
            .query(`
                SELECT U.UserID, U.Username, U.Email, U.Role, R.Rolename
                FROM Users U
                JOIN Roles R ON U.Role = R.RoleID
                WHERE U.Email = @email AND U.Password = @password
            `);

        const user = result.recordset[0];
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userid: user.UserID, role: user.Rolename },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            userid: user.UserID,
            role: user.Rolename
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error during login' });
    }
});

module.exports = router;
