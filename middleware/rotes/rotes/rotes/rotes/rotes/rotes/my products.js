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
