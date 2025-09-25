const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const farmerId = req.user.user_id;

    if (req.user.role !== 'Farmer') {
        return res.status(403).json({ message: 'Forbidden: Access is restricted to Farmers only.' });
    }

    const sql = 'SELECT * FROM Products WHERE farmer_id = ? ORDER BY created_at DESC';
    const [myProducts] = await pool.query(sql, [farmerId]);

    res.json(myProducts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

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
