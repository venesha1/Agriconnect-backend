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

// Import routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const myProductRoutes = require('./routes/my-products');
const orderRoutes = require('./routes/orders');
const myOrderRoutes = require('./routes/my-orders');
const eventRoutes = require('./routes/events');
const dashboardRoutes = require('./routes/dashboard');
const attendanceRoutes = require('./routes/attendance');
const requestRoutes = require('./routes/requests');
const idRequestRoutes = require('./routes/id-requests');

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
    res.json({ message: 'Agri-Connect Jamaica API is running!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
