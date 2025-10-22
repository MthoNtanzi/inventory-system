import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all stock with product information
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                s.stock_id, s.product_id, p.name as product_name,
                COALESCE(s.quantity, 0) AS quantity, s.last_updated
            FROM
                stock s
            JOIN
                products p ON s.product_id = p.product_id
            ORDER BY
                s.stock_id;
        `);
        res.json(result.rows);
    }
    catch (err) { 
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update stock quantity
router.put('/:id', async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;
    const { quantity } = req.body;

    try {
        await client.query('BEGIN');

        await client.query(`
            UPDATE stock
            SET quantity = $1, last_updated = NOW()
            WHERE product_id = $2;
        `, [quantity, id]
        );
        await client.query('COMMIT');
        res.json({ message: 'Stock updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
});

// Delete a stock record
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try { 
        await pool.query('DELETE FROM stock WHERE stock_id = $1', [id]);
        res.json({ message: 'Stock record deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;