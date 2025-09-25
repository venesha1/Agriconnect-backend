const express = require("express");
const pool = require("../db");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Protected (Buyers only)
 */
router.post("/", verifyToken, async (req, res) => {
  const { user_id, role } = req.user;

  // Ensure only buyers can create orders
  if (role !== "Buyer") {
    return res.status(403).json({ message: "Forbidden: Only buyers can create orders." });
  }

  const { payment_method, items } = req.body;

  // Validate input
  if (!payment_method || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid request body. Please provide payment_method and a non-empty array of items." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const productIds = items.map(item => item.product_id);
    const [products] = await connection.query("SELECT product_id, price, quantity FROM Products WHERE product_id IN (?)", [productIds]);

    if (products.length !== productIds.length) {
        throw new Error("One or more products not found.");
    }

    const productMap = new Map(products.map(p => [p.product_id, p]));
    let total_amount = 0;

    for (const item of items) {
        const product = productMap.get(item.product_id);
        if (!product) {
            throw new Error(`Product with ID ${item.product_id} not found.`);
        }
        if (product.quantity < item.quantity) {
            throw new Error(`Not enough stock for product ID ${item.product_id}.`);
        }
        total_amount += product.price * item.quantity;
    }

    const status = payment_method === "Digital" ? "Completed" : "Pending";

    const order = {
        buyer_id: user_id,
        order_date: new Date(),
        total_amount,
        status,
        payment_method,
    };

    const [orderResult] = await connection.query("INSERT INTO Orders SET ?", order);
    const order_id = orderResult.insertId;

    const orderItems = items.map(item => [order_id, item.product_id, item.quantity]);
    await connection.query("INSERT INTO Order_Items (order_id, product_id, quantity_purchased) VALUES ?", [orderItems]);

    for (const item of items) {
        await connection.query("UPDATE Products SET quantity = quantity - ? WHERE product_id = ?", [item.quantity, item.product_id]);
    }

    await connection.commit();

    res.status(201).json({ message: "Order created successfully!", order_id });

  } catch (err) {
    await connection.rollback();
    console.error(err.message);
    res.status(500).json({ message: err.message || "Server Error" });
  } finally {
    connection.release();
  }
});

module.exports = router;
    } catch (error) {
        console.error("Error submitting ID request:", error);
        res.status(500).json({ message: "Server error while submitting ID request." });
    }
});

/**
 * @route   GET /api/id-requests
 * @desc    Get all open identification requests
 * @access  Protected (ExtensionOfficer Only)
 */
router.get("/", verifyToken, async (req, res) => {
    // 1. Verify user role
    if (req.user.role !== 'ExtensionOfficer') {
        return res.status(403).json({ message: "Forbidden: Only Extension Officers can view ID requests." });
    }

    try {
        // 2. Fetch all open requests, joining with Users table to get farmer's name
        const [requests] = await db.query(`
            SELECT 
                ir.id, 
                ir.farmer_id, 
                u.name as farmer_name, 
                ir.image_url, 
                ir.description, 
                ir.status, 
                ir.created_at
            FROM 
                ID_Requests ir
            JOIN 
                Users u ON ir.farmer_id = u.user_id
            WHERE 
                ir.status = 'Open'
            ORDER BY 
                ir.created_at ASC
        `);

        res.status(200).json(requests);

    } catch (error) {
        console.error("Error fetching ID requests:", error);
        res.status(500).json({ message: "Server error while fetching ID requests." });
    }
});

/**
 * @route   POST /api/id-requests/:id/respond
 * @desc    Respond to an identification request
 * @access  Protected (ExtensionOfficer Only)
 */
router.post("/:id/respond", verifyToken, async (req, res) => {
    // 1. Verify user role
    if (req.user.role !== 'ExtensionOfficer') {
        return res.status(403).json({ message: "Forbidden: Only Extension Officers can respond to requests." });
    }

    // 2. Destructure and validate request body and params
    const { id: requestId } = req.params;
    const { response } = req.body;
    const officer_id = req.user.user_id;

    if (!response) {
        return res.status(400).json({ message: "A response message is required." });
    }

    try {
        // 3. Update the request in the database
        const [result] = await db.query(
            "UPDATE ID_Requests SET status = 'Closed', response = ?, officer_id = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'Open'",
            [response, officer_id, requestId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Request not found or has already been closed." });
        }

        res.status(200).json({ message: "Response submitted successfully. The request is now closed." });

    } catch (error) {
        console.error("Error responding to ID request:", error);
        res.status(500).json({ message: "Server error while responding to ID request." });
    }
});

module.exports = router;
