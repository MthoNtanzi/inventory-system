import express from 'express';
import pool from '../db.js';
import { getAllProducts } from '../controllers/productsController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();


// Get all products with stock information
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.product_id, p.name, p.category, p.price, p.image_url, COALESCE(s.quantity, 0) AS quantity
            FROM 
                products p
            LEFT JOIN 
                stock s ON p.product_id = s.product_id
            ORDER BY 
                p.product_id
            `);
        res.json(result.rows);
    } catch (err) { 
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a new product (and stock entry)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    const client = await pool.connect();

    try {
        const { name, category, price, image_url, quantity } = req.body;

        // Basic validation
        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required.' });
        }

        await client.query('BEGIN');

        const result = await client.query(
            'INSERT INTO products (name, category, price, image_url) VALUES ($1, $2, $3, $4) RETURNING product_id',
            [name, category, price, image_url]
        );

        const productId = result.rows[0].product_id;

        await client.query(
            'INSERT INTO stock (product_id, quantity) VALUES ($1, $2)',
            [productId, quantity ?? 0]
        );

        await client.query('COMMIT');
        res.json({ message: 'Product added successfully', product_id: productId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    }finally {
        client.release();
    }
});

// Update a product and stock quantity
router.put('/:id', async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;
    const { name, category, price, image_url, quantity } = req.body;

    try {
        await client.query('BEGIN');

        await client.query(
            `UPDATE products 
                SET name = $1, category = $2, price = $3, image_url = $4
                WHERE product_id = $5`,
            [name, category, price, image_url, id]
        );

        if (quantity !== undefined) {
            await client.query(`
                UPDATE stock
                SET quantity = $1, last_updated = NOW()
                WHERE product_id = $2
                `,
                [quantity, id]
            );
        }

        await pool.query('COMMIT');
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
});

        

// Delete a product (cascade removes stock + sales)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM products WHERE product_id = $1', [id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) { 
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;