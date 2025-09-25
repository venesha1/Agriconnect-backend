const express = require("express");
const pool = require("../db");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

/**
 * @route   GET /api/my-orders
 * @desc    Get all orders for the logged-in user
 * @access  Protected
 */
router.get("/", verifyToken, async (req, res) => {
  const { user_id } = req.user;

  try {
    const [orders] = await pool.query("SELECT * FROM Orders WHERE buyer_id = ? ORDER BY order_date DESC", [user_id]);
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
