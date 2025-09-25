const express = require("express");
const pool = require("../db");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

/**
 * @route   POST /api/events
 * @desc    Create a new Lend-Hand event
 * @access  Protected (Farmers only)
 */
router.post("/", verifyToken, async (req, res) => {
  const { user_id, role } = req.user;

  if (role !== "Farmer") {
    return res.status(403).json({ message: "Forbidden: Only farmers can create events." });
  }

  const { event_date, task_description, required_volunteers } = req.body;

  if (!event_date || !task_description || !required_volunteers) {
    return res.status(400).json({ message: "Please provide event_date, task_description, and required_volunteers." });
  }

  try {
    const newEvent = {
      host_farmer_id: user_id,
      event_date,
      task_description,
      required_volunteers,
    };

    const [result] = await pool.query("INSERT INTO Lend_Hand_Events SET ?", newEvent);
    const event_id = result.insertId;

    res.status(201).json({ message: "Event created successfully!", event_id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route   GET /api/events
 * @desc    Get all upcoming events
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT 
        e.event_id,
        e.event_date,
        e.task_description,
        e.required_volunteers,
        u.name AS host_farmer_name
      FROM Lend_Hand_Events e
      JOIN Users u ON e.host_farmer_id = u.user_id
      WHERE e.event_date >= CURDATE()
      ORDER BY e.event_date ASC`;

    const [events] = await pool.query(sql);
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;


/**
 * @route   POST /api/events/:id/rsvp
 * @desc    RSVP for an event
 * @access  Protected
 */
router.post("/:id/rsvp", verifyToken, async (req, res) => {
  const { user_id } = req.user;
  const { id: event_id } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [event] = await connection.query("SELECT * FROM Lend_Hand_Events WHERE event_id = ?", [event_id]);
    if (event.length === 0) {
      throw new Error("Event not found.");
    }

    const [rsvps] = await connection.query("SELECT * FROM Event_Volunteers WHERE event_id = ?", [event_id]);
    if (rsvps.some(rsvp => rsvp.volunteer_id === user_id)) {
      throw new Error("You have already RSVP'd for this event.");
    }

    if (rsvps.length >= event[0].required_volunteers) {
      throw new Error("This event is already full.");
    }

    const newRsvp = {
      event_id,
      volunteer_id: user_id,
    };

    await connection.query("INSERT INTO Event_Volunteers SET ?", newRsvp);

    await connection.commit();

    res.status(201).json({ message: "Successfully RSVP'd for the event!" });

  } catch (err) {
    await connection.rollback();
    console.error(err.message);
    res.status(400).json({ message: err.message || "Server Error" });
  } finally {
    connection.release();
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get details for a single event
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  const { id: event_id } = req.params;

  try {
    const eventSql = `
      SELECT 
        e.event_id,
        e.event_date,
        e.task_description,
        e.required_volunteers,
        u.name AS host_farmer_name
      FROM Lend_Hand_Events e
      JOIN Users u ON e.host_farmer_id = u.user_id
      WHERE e.event_id = ?`;

    const [event] = await pool.query(eventSql, [event_id]);

    if (event.length === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    const volunteersSql = `
      SELECT
        u.name
      FROM Event_Volunteers ev
      JOIN Users u ON ev.volunteer_id = u.user_id
      WHERE ev.event_id = ?`;

    const [volunteers] = await pool.query(volunteersSql, [event_id]);

    const eventDetails = {
      ...event[0],
      volunteers: volunteers.map(v => v.name),
    };

    res.json(eventDetails);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

