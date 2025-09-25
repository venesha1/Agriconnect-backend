const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

router.post("/register", async (req, res) => {
  const { name, email, password, phone_number, role, rada_registration_number } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Please provide name, email, password, and role." });
  }
  if (role !== "Farmer" && role !== "Buyer") {
    return res.status(400).json({ message: "Role must be either 'Farmer' or 'Buyer'." });
  }

  try {
    const [existingUsers] = await pool.query("SELECT email FROM Users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = {
      name,
      email,
      password_hash,
      phone_number,
      role,
      rada_registration_number: role === "Farmer" ? rada_registration_number : null,
    };

    const [result] = await pool.query("INSERT INTO Users SET ?", newUser);
    const userId = result.insertId;

    res.status(201).json({
      message: "User registered successfully!",
      userId: userId,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide both email and password." });
  }

  try {
    const [users] = await pool.query("SELECT * FROM Users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const payload = {
      user_id: user.user_id,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Logged in successfully!",
      token: token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
