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

// Import routes (updated to match your 'Rotes' folder)
const userRoutes = require('./Rotes/users');
const productRoutes = require('./Rotes/products');
const myProductRoutes = require('./Rotes/my-products');
const orderRoutes = require('./Rotes/orders');
const myOrderRoutes = require('./Rotes/my-orders');
const eventRoutes = require('./Rotes/events');
const dashboardRoutes = require('./Rotes/dashboard');
const attendanceRoutes = require('./Rotes/attendance');
const requestRoutes = require('./Rotes/requests');
const idRequestRoutes = require('./Rotes/id-requests');

// Use routes with proper API endpoints
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

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'Agri-Connect Jamaica API is running!',
        status: 'success',
        timestamp: new Date().toISOString()
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Agri-Connect Jamaica API is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
});

module.exports = app;
        o.order_id,
        o.order_date,
        o.total_amount,
        o.status
      FROM Orders o
      JOIN Order_Items oi ON o.order_id = oi.order_id
      JOIN Products p ON oi.product_id = p.product_id
      WHERE p.farmer_id = ?
      GROUP BY o.order_id
      ORDER BY o.order_date DESC
      LIMIT 5;
    `;

    // --- AGGREGATE LEND-HAND DATA ---

    // 4. Calculate the number of events the farmer has hosted
    const eventsHostedQuery = `
      SELECT COUNT(*) AS events_hosted
      FROM Lend_Hand_Events
      WHERE host_farmer_id = ?;
    `;

    // 5. Calculate the number of times the farmer has volunteered
    const timesVolunteeredQuery = `
      SELECT COUNT(*) AS times_volunteered
      FROM Event_Volunteers
      WHERE volunteer_id = ?;
    `;

    // --- EXECUTE QUERIES IN PARALLEL ---
    const [salesData] = await pool.query(salesQuery, [user_id]);
    const [recentOrders] = await pool.query(recentOrdersQuery, [user_id]);
    const [eventsHostedData] = await pool.query(eventsHostedQuery, [user_id]);
    const [timesVolunteeredData] = await pool.query(timesVolunteeredQuery, [user_id]);

    // --- COMBINE AND RETURN DATA ---
    const dashboardData = {
      total_revenue: salesData[0].total_revenue || 0,
      number_of_orders: salesData[0].number_of_orders || 0,
      recent_orders: recentOrders,
      events_hosted: eventsHostedData[0].events_hosted || 0,
      times_volunteered: timesVolunteeredData[0].times_volunteered || 0,
    };

    res.json(dashboardData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
        o.order_id,
        o.order_date,
        o.total_amount,
        o.status
      FROM Orders o
      JOIN Order_Items oi ON o.order_id = oi.order_id
      JOIN Products p ON oi.product_id = p.product_id
      WHERE p.farmer_id = ?
      GROUP BY o.order_id
      ORDER BY o.order_date DESC
      LIMIT 5;
    `;

    // --- AGGREGATE LEND-HAND DATA ---

    // 4. Calculate the number of events the farmer has hosted
    const eventsHostedQuery = `
      SELECT COUNT(*) AS events_hosted
      FROM Lend_Hand_Events
      WHERE host_farmer_id = ?;
    `;

    // 5. Calculate the number of times the farmer has volunteered
    const timesVolunteeredQuery = `
      SELECT COUNT(*) AS times_volunteered
      FROM Event_Volunteers
      WHERE volunteer_id = ?;
    `;

    // --- EXECUTE QUERIES IN PARALLEL ---
    const [salesData] = await pool.query(salesQuery, [user_id]);
    const [recentOrders] = await pool.query(recentOrdersQuery, [user_id]);
    const [eventsHostedData] = await pool.query(eventsHostedQuery, [user_id]);
    const [timesVolunteeredData] = await pool.query(timesVolunteeredQuery, [user_id]);

    // --- COMBINE AND RETURN DATA ---
    const dashboardData = {
      total_revenue: salesData[0].total_revenue || 0,
      number_of_orders: salesData[0].number_of_orders || 0,
      recent_orders: recentOrders,
      events_hosted: eventsHostedData[0].events_hosted || 0,
      times_volunteered: timesVolunteeredData[0].times_volunteered || 0,
    };

    res.json(dashboardData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
