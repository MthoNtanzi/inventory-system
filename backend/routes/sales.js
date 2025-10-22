import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all sales with product + user information
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.sale_id,
        s.quantity,
        s.total_price,
        s.sale_date,
        p.name AS product_name,
        u.username AS sold_by
      FROM 
        sales s
      JOIN 
        products p ON s.product_id = p.product_id
      JOIN 
        users u ON s.user_id = u.user_id
      ORDER BY 
        s.sale_id DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Record a new sale
router.post('/', async (req, res) => {
  const client = await pool.connect();
  const { product_id, user_id, quantity } = req.body;

  try {
    await client.query('BEGIN');

    // Get product price
    const product = await client.query(
      'SELECT price FROM products WHERE product_id = $1',
      [product_id]
    );
    if (product.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    const price = product.rows[0].price;
    const total = price * quantity;

    // Update stock
    const stock = await client.query(`
      UPDATE stock
      SET quantity = quantity - $1, last_updated = NOW()
      WHERE product_id = $2 AND quantity >= $1
      RETURNING quantity;
    `, [quantity, product_id]);

    if (stock.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    // Insert into sales
    await client.query(`
      INSERT INTO sales (product_id, user_id, quantity, total_price)
      VALUES ($1, $2, $3, $4);
    `, [product_id, user_id, quantity, total]);

    await client.query('COMMIT');
    res.json({ message: 'Sale recorded successfully', total_price: total });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

export default router;
