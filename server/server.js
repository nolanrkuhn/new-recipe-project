const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const app = express();

// Parse ALLOWED_ORIGINS from environment variable or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'https://recipe-project-frontend.onrender.com',
        'http://localhost:3000'
      ];

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    optionsSuccessStatus: 200
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_URL = 'https://api.spoonacular.com/recipes';

const users = []; // Temporary user storage (Replace with a DB)
const favorites = {}; // Temporary favorites storage (Replace with a DB)

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Middleware to verify authentication
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: process.env.NODE_ENV });
});

// User Registration
app.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (users.find(user => user.email === email)) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: users.length + 1, email, password: hashedPassword, name };
        users.push(newUser);
        const token = generateToken(newUser);
        res.json({ message: 'User registered successfully', token, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
    } catch (error) {
        res.status(500).json({ error: 'Error during registration' });
    }
});

// User Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = users.find(user => user.email === email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = generateToken(user);
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Error during login' });
    }
});

// Get Logged-in User
app.get('/me', verifyToken, (req, res) => {
    res.json({ id: req.user.id, email: req.user.email, name: req.user.name });
});

// Search Recipes
app.get('/api/recipes', async (req, res) => {
    try {
        const { query, number, diet, cuisine } = req.query;
        const response = await axios.get(`${SPOONACULAR_URL}/complexSearch`, {
            params: { query, number, diet, cuisine, apiKey: SPOONACULAR_API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching recipes' });
    }
});

// Get Recipe Details
app.get('/api/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`${SPOONACULAR_URL}/${id}/information`, {
            params: { apiKey: SPOONACULAR_API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching recipe details' });
    }
});

// ===== FAVORITES FEATURE ===== //

// Add a favorite recipe
app.post('/favorites', verifyToken, (req, res) => {
    const userId = req.user.id;
    const { recipeId } = req.body;

    if (!favorites[userId]) {
        favorites[userId] = new Set();
    }

    favorites[userId].add(recipeId);
    res.json({ message: 'Recipe added to favorites', favorites: Array.from(favorites[userId]) });
});

// Get user's favorite recipes
app.get('/favorites', verifyToken, (req, res) => {
    const userId = req.user.id;
    res.json({ favorites: favorites[userId] ? Array.from(favorites[userId]) : [] });
});

// Remove a favorite recipe
app.delete('/favorites/:recipeId', verifyToken, (req, res) => {
    const userId = req.user.id;
    let { recipeId } = req.params;

    if (!favorites[userId]) {
        return res.status(404).json({ message: 'No favorites found for this user.' });
    }

    // Normalize ID formats (Spoonacular sometimes returns numbers)
    recipeId = recipeId.toString();

    // Debugging log to see if the recipe ID exists
    console.log(`Removing recipe ID: ${recipeId} from favorites for user: ${userId}`);
    console.log('Current favorites:', favorites[userId]);

    if (!favorites[userId].has(recipeId)) {
        return res.status(400).json({ message: `Recipe ${recipeId} not found in favorites.` });
    }

    favorites[userId].delete(recipeId);

    return res.json({ 
        message: `Recipe ${recipeId} removed from favorites.`, 
        favorites: Array.from(favorites[userId]) 
    });
});



// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// Error Handler
app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
