import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();

// Regiser a new user
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    
    try {
        // Check if user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, useremail]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(`
            INSERT INTO users (username, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, username, email, role`,
            [username, email, hashedPassword, role || 'staff']);
        
        const user = result.rows[0];
        res.status(201).json({ message: 'User registered successfully', user });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
});
    
// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

// Generate JWT token
        const token = jwt.sign({
            user_id: user.user_id,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token, user: { user_id: user.user_id, username: user.username, email: user.email, role: user.role }});
    }catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all users (admin only)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT user_id, username, email, role, created_at FROM users ORDER BY user_id');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;