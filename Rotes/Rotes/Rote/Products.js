const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
    const { role, user_id } = req.user;

    if (role !== 'Farmer') {
        return res.status(403).json({ message: 'Forbidden: Only users with the "Farmer" role can create products.' });
    }

    const { name, description, category, price, quantity, image_url } = req.body;

    if (!name || !price || !quantity) {
        return res.status(400).json({ message: 'Please provide product name, price, and quantity.' });
    }

    try {
        const newProduct = {
            farmer_id: user_id,
            name,
            description,
            category,
            price,
            quantity,
            image_url,
        };

        const [result] = await pool.query('INSERT INTO Products SET ?', newProduct);

        res.status(201).json({
            message: 'Product created successfully!',
            productId: result.insertId,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.product_id,
        p.name,
        p.description,
        p.category,
        p.price,
        p.quantity,
        p.image_url,
        u.name AS farmer_name,
        u.rada_verified
      FROM Products p
      JOIN Users u ON p.farmer_id = u.user_id
      WHERE u.role = \'Farmer\'`;
      
    const [products] = await pool.query(sql);
    
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        p.product_id,
        p.name,
        p.description,
        p.category,
        p.price,
        p.quantity,
        p.image_url,
        u.name AS farmer_name,
        u.rada_verified
      FROM Products p
      JOIN Users u ON p.farmer_id = u.user_id
      WHERE p.product_id = ?`;

    const [products] = await pool.query(sql, [id]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(products[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id: productId } = req.params;
    const userIdFromToken = req.user.user_id;

    const getOwnerSql = 'SELECT farmer_id FROM Products WHERE product_id = ?';
    const [products] = await pool.query(getOwnerSql, [productId]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productOwnerId = products[0].farmer_id;

    if (productOwnerId !== userIdFromToken) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this product' });
    }

    const deleteSql = 'DELETE FROM Products WHERE product_id = ?';
    await pool.query(deleteSql, [productId]);

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
