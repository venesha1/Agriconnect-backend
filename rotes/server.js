const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes (corrected to match your 'rotes' folder - lowercase r)
const userRoutes = require('./rotes/users');
const productRoutes = require('./rotes/products');
const myProductRoutes = require('./rotes/my-products');
const orderRoutes = require('./rotes/orders');
const myOrderRoutes = require('./rotes/my-orders');
const eventRoutes = require('./rotes/events');
const dashboardRoutes = require('./rotes/dashboard');
const attendanceRoutes = require('./rotes/attendance');
const requestRoutes = require('./rotes/requests');
const idRequestRoutes = require('./rotes/id-requests');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/my-products', myProductRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/my-orders', myOrderRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/events', attendanceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/id-requests', idRequestRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Agri-Connect Jamaica API is running!',
        status: 'success'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
