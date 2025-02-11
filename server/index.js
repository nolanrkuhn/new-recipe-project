const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5050;

const SPOONACULAR_API_KEY = '28670279fa9c40e18481bf0311202bd2';
const JWT_SECRET = '(Diamonds774!)'; // Replace with your own secret key for JWT
const users = []; // Temporary in-memory user store
const favorites = {}; // Temporary in-memory favorites store

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token.split(' ')[1], JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { username, password: hashedPassword };
  users.push(user);

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { username } });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { username } });
});

app.get('/recipes', async (req, res) => {
  const query = req.query.query;
  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        query: query,
        apiKey: SPOONACULAR_API_KEY
      }
    });
    res.json({ results: response.data.results });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching recipes from Spoonacular API' });
  }
});

app.post('/favorites', authenticateToken, (req, res) => {
  const { recipe } = req.body;
  if (!favorites[req.user.username]) {
    favorites[req.user.username] = [];
  }
  favorites[req.user.username].push(recipe);
  res.json({ message: 'Recipe added to favorites' });
});

app.get('/favorites', authenticateToken, (req, res) => {
  const userFavorites = favorites[req.user.username] || [];
  res.json({ favorites: userFavorites });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});