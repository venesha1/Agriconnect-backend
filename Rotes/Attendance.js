const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/verifyToken");

/**
 * @route   POST /api/events/:id/attendance
 * @desc    Mark attendance for volunteers at a Lend-Hand event
 * @access  Protected (Event Host Only)
 */
router.post("/:id/attendance", verifyToken, async (req, res) => {
    const { id: eventId } = req.params;
    const hostId = req.user.user_id;
    const { volunteers } = req.body; // Expects an array of objects: [{ volunteer_id: 1, attended: true }, ...]

    if (!volunteers || !Array.isArray(volunteers)) {
        return res.status(400).json({ message: "Invalid request body. 'volunteers' array is required." });
    }

    try {
        // 1. Verify that the logged-in user is the host of the event
        const [eventRows] = await db.query(
            "SELECT host_farmer_id FROM Lend_Hand_Events WHERE event_id = ?",
            [eventId]
        );

        if (eventRows.length === 0) {
            return res.status(404).json({ message: "Event not found." });
        }

        const event = eventRows[0];
        if (event.host_farmer_id !== hostId) {
            return res.status(403).json({ message: "Forbidden: You are not the host of this event." });
        }

        // 2. Update attendance for each volunteer in a transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const updatePromises = volunteers.map(volunteer => {
                return connection.query(
                    "UPDATE Event_Volunteers SET attended = ? WHERE event_id = ? AND volunteer_id = ?",
                    [volunteer.attended, eventId, volunteer.volunteer_id]
                );
            });

            await Promise.all(updatePromises);

            await connection.commit();
            connection.release();

            res.status(200).json({ message: "Attendance has been successfully updated." });

        } catch (error) {
            await connection.rollback();
            connection.release();
            console.error("Error updating attendance:", error);
            res.status(500).json({ message: "Failed to update attendance." });
        }

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error while verifying event host." });
    }
});

module.exports = router;
