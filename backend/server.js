require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./db');

const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const categoryRoutes = require('./routes/category');
const requestRoutes = require('./routes/request');
const returnRoutes = require('./routes/return');
const userRoutes=require('./routes/user')

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToDatabase();

app.get('/', (req, res) => {
    res.send('Welcome to the Express backend!');
});

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/return', returnRoutes);
app.use('/api/user', userRoutes);
// Start server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});





