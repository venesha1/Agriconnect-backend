const express = require('express');

const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const myProductRoutes = require('./routes/my-products');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/my-products', myProductRoutes);

app.get('/', (req, res) => {
  res.send('Agri-Connect Jamaica API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


const orderRoutes = require('./routes/orders');
const myOrderRoutes = require('./routes/my-orders');

app.use('/api/orders', orderRoutes);
app.use('/api/my-orders', myOrderRoutes);


const eventRoutes = require('./routes/events');

app.use('/api/events', eventRoutes);


const dashboardRoutes = require("./routes/dashboard");

app.use("/api/dashboard", dashboardRoutes);


// Attendance Routes
const attendanceRoutes = require("./routes/attendance");
app.use("/api/events", attendanceRoutes);



// Request for Produce Routes
const requestRoutes = require("./routes/requests");
app.use("/api/requests", requestRoutes);



// ID Request Routes
const idRequestRoutes = require("./routes/id-requests");
app.use("/api/id-requests", idRequestRoutes);

