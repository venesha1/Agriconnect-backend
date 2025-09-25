const express = require("express");
const pool = require("../db");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

/**
 * @route   GET /api/dashboard
 * @desc    Get aggregated data for the farmer's dashboard
 * @access  Protected (Farmers only)
 */
router.get("/", verifyToken, async (req, res) => {
  const { user_id, role } = req.user;

  // 1. Authorization Check: Ensure the user has the 'Farmer' role
  if (role !== "Farmer") {
    return res.status(403).json({ message: "Forbidden: Access is restricted to Farmers only." });
  }

  try {
    // --- AGGREGATE SALES DATA ---

    // 2. Calculate Total Revenue and Number of Orders
    const salesQuery = `
      SELECT
        SUM(oi.quantity_purchased * p.price) AS total_revenue,
        COUNT(DISTINCT o.order_id) AS number_of_orders
      FROM Orders o
      JOIN Order_Items oi ON o.order_id = oi.order_id
      JOIN Products p ON oi.product_id = p.product_id
      WHERE p.farmer_id = ? AND o.status = 'Completed';
    `;

    // 3. Get the 5 most recent orders for the farmer's products
    const recentOrdersQuery = `
      SELECT
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
