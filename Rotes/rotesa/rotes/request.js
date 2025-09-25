const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/verifyToken");

/**
 * @route   POST /api/requests
 * @desc    Create a new produce request
 * @access  Protected (Buyer Only)
 */
router.post("/", verifyToken, async (req, res) => {
    // 1. Verify user role
    if (req.user.role !== 'Buyer') {
        return res.status(403).json({ message: "Forbidden: Only buyers can create produce requests." });
    }

    // 2. Destructure and validate request body
    const { crop_name, quantity_needed, specifications, desired_start_date } = req.body;
    const buyer_id = req.user.user_id;

    if (!crop_name || !quantity_needed || !desired_start_date) {
        return res.status(400).json({ message: "Please provide crop name, quantity needed, and a desired start date." });
    }

    try {
        // 3. Insert the new request into the database
        const [result] = await db.query(
            "INSERT INTO Produce_Requests (buyer_id, crop_name, quantity_needed, specifications, desired_start_date) VALUES (?, ?, ?, ?, ?)",
            [buyer_id, crop_name, quantity_needed, specifications, desired_start_date]
        );

        res.status(201).json({
            message: "Produce request created successfully!",
            requestId: result.insertId
        });

    } catch (error) {
        console.error("Error creating produce request:", error);
        res.status(500).json({ message: "Server error while creating produce request." });
    }
});

/**
 * @route   GET /api/requests
 * @desc    Get all open produce requests
 * @access  Protected (Farmer Only)
 */
router.get("/", verifyToken, async (req, res) => {
    // 1. Verify user role
    if (req.user.role !== 'Farmer') {
        return res.status(403).json({ message: "Forbidden: Only farmers can view produce requests." });
    }

    try {
        // 2. Fetch all open requests, joining with Users table to get buyer's name
        const [requests] = await db.query(`
            SELECT 
                pr.id, 
                pr.buyer_id, 
                u.name as buyer_name, 
                pr.crop_name, 
                pr.quantity_needed, 
                pr.specifications, 
                pr.desired_start_date, 
                pr.status, 
                pr.created_at
            FROM 
                Produce_Requests pr
            JOIN 
                Users u ON pr.buyer_id = u.user_id
            WHERE 
                pr.status = 'Open'
            ORDER BY 
                pr.created_at DESC
        `);

        res.status(200).json(requests);

    } catch (error) {
        console.error("Error fetching produce requests:", error);
        res.status(500).json({ message: "Server error while fetching produce requests." });
    }
});

module.exports = router;
