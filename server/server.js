const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

dotenv.config();
const app = express();

// Ensure all required environment variables are set
if (!process.env.SPOONACULAR_API_KEY || !process.env.JWT_SECRET) {
    console.error("❌ ERROR: Missing required environment variables! Please check your .env file.");
    process.exit(1); // Stop the server if env variables are missing
}

const db = new sqlite3.Database('./server/database.sqlite', (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
});

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
    'https://recipe-project-frontend.onrender.com',
    'http://localhost:3000'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Middleware to verify authentication
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// User Registration (SQLite)
app.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        db.get("SELECT * FROM Users WHERE email = ?", [email], async (err, user) => {
            if (user) return res.status(400).json({ error: 'User already exists' });

            const hashedPassword = await bcrypt.hash(password, 10);
            db.run("INSERT INTO Users (email, password, name) VALUES (?, ?, ?)", [email, hashedPassword, name], function (err) {
                if (err) return res.status(500).json({ error: 'Database error' });

                const newUser = { id: this.lastID, email, name };
                const token = generateToken(newUser);
                res.json({ message: 'User registered successfully', token, user: newUser });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration error' });
    }
});

// User Login (SQLite)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        db.get("SELECT * FROM Users WHERE email = ?", [email], async (err, user) => {
            if (!user) return res.status(401).json({ error: 'Invalid credentials' });

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

            const token = generateToken(user);
            res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
        });
    } catch (error) {
        res.status(500).json({ error: 'Login error' });
    }
});

// Get Logged-in User
app.get('/me', verifyToken, (req, res) => {
    db.get("SELECT id, email, name FROM Users WHERE id = ?", [req.user.id], (err, user) => {
        if (!user) return res.status(401).json({ error: 'User not found' });
        res.json(user);
    });
});

// Get Recipes from Spoonacular API
app.get('/api/recipes', async (req, res) => {
    try {
        const { query } = req.query;
        const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, {
            params: { query, number: 10, apiKey: SPOONACULAR_API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching recipes', details: error.message });
    }
});

// Get Recipe Details
app.get('/api/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
            params: { apiKey: SPOONACULAR_API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching recipe details', details: error.message });
    }
});

// Manage Favorites
app.post('/favorites', verifyToken, (req, res) => {
    const { recipeId, title, image } = req.body;
    db.run("INSERT INTO Favorites (user_id, recipe_id, title, image) VALUES (?, ?, ?, ?)", 
        [req.user.id, recipeId, title, image], 
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Recipe added to favorites' });
        });
});

app.get('/favorites', verifyToken, (req, res) => {
    db.all("SELECT * FROM Favorites WHERE user_id = ?", [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.delete('/favorites/:recipeId', verifyToken, (req, res) => {
    db.run("DELETE FROM Favorites WHERE user_id = ? AND recipe_id = ?", 
        [req.user.id, req.params.recipeId], 
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Recipe removed from favorites' });
        });
});

// Start Server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});