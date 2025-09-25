const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/verifyToken");

/**
 * @route   POST /api/id-requests
 * @desc    Submit a new identification request
 * @access  Protected (Farmer Only)
 */
router.post("/", verifyToken, async (req, res) => {
    // 1. Verify user role
    if (req.user.role !== 'Farmer') {
        return res.status(403).json({ message: "Forbidden: Only farmers can submit ID requests." });
    }

    // 2. Destructure and validate request body
    const { image_url, description } = req.body;
    const farmer_id = req.user.user_id;

    if (!image_url || !description) {
        return res.status(400).json({ message: "Please provide an image URL and a description." });
    }

    try {
        // 3. Insert the new request into the database
        const [result] = await db.query(
            "INSERT INTO ID_Requests (farmer_id, image_url, description) VALUES (?, ?, ?)",
            [farmer_id, image_url, description]
        );

        res.status(201).json({
            message: "ID request submitted successfully! An Extension Officer will review it shortly.",
            requestId: result.insertId
        });

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
