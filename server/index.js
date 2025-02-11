const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');
const validator = require('validator');

const app = express();
const port = process.env.PORT || 5050;

const SPOONACULAR_API_KEY = '28670279fa9c40e18481bf0311202bd2';
const JWT_SECRET = '(Diamonds774!)'; // Replace with your own secret key for JWT

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

// Define User model
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Define Favorite model
const Favorite = sequelize.define('Favorite', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

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

// Password validation function
const validatePassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  });
};

// Routes
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, password: hashedPassword });
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { username: user.username } });
  } catch (error) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { username: user.username } });
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

app.post('/favorites', authenticateToken, async (req, res) => {
  const { recipe } = req.body;
  const user = await User.findOne({ where: { username: req.user.username } });
  await Favorite.create({ userId: user.id, recipeId: recipe.id, title: recipe.title, image: recipe.image });
  res.json({ message: 'Recipe added to favorites' });
});

app.get('/favorites', authenticateToken, async (req, res) => {
  const user = await User.findOne({ where: { username: req.user.username } });
  const favorites = await Favorite.findAll({ where: { userId: user.id } });
  res.json({ favorites });
});

// Sync database and start the server
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});