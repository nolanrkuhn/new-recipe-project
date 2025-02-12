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
const JWT_SECRET = 'your_jwt_secret'; // Replace with your own secret key for JWT

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

// Define Comment model
const Comment = sequelize.define('Comment', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Define Rating model
const Rating = sequelize.define('Rating', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
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

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong. Please try again later.' });
};

app.use('/api', express.Router()
  .get('/recipes', async (req, res, next) => {
    const { query, offset, number, diet, cuisine } = req.query;
    try {
      const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
        params: {
          query: query,
          offset: offset,
          number: number,
          diet: diet,
          cuisine: cuisine,
          apiKey: SPOONACULAR_API_KEY
        }
      });
      res.json({ results: response.data.results, totalResults: response.data.totalResults });
    } catch (error) {
      console.error('Spoonacular API Error:', error.response?.data || error.message);
      next(new Error('Error fetching recipes from Spoonacular API'));
    }
  })
);

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

app.get('/recipes', async (req, res, next) => {
  const { query, offset, number, diet, cuisine } = req.query;
  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        query: query,
        offset: offset,
        number: number,
        diet: diet,
        cuisine: cuisine,
        apiKey: SPOONACULAR_API_KEY
      }
    });
    res.json({ results: response.data.results, totalResults: response.data.totalResults });
  } catch (error) {
    next(new Error('Error fetching recipes from Spoonacular API'));
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.post('/favorites', authenticateToken, async (req, res, next) => {
  const { recipe } = req.body;
  try {
    const user = await User.findOne({ where: { username: req.user.username } });
    await Favorite.create({ userId: user.id, recipeId: recipe.id, title: recipe.title, image: recipe.image });
    res.json({ message: 'Recipe added to favorites' });
  } catch (error) {
    next(new Error('Error adding recipe to favorites'));
  }
});

app.get('/favorites', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { username: req.user.username } });
    const favorites = await Favorite.findAll({ where: { userId: user.id } });
    res.json({ favorites });
  } catch (error) {
    next(new Error('Error fetching favorites'));
  }
});

app.post('/comments', authenticateToken, async (req, res, next) => {
  const { recipeId, text } = req.body;
  try {
    const user = await User.findOne({ where: { username: req.user.username } });
    await Comment.create({ userId: user.id, recipeId, text });
    res.json({ message: 'Comment added' });
  } catch (error) {
    next(new Error('Error adding comment'));
  }
});

app.get('/comments/:recipeId', async (req, res, next) => {
  const { recipeId } = req.params;
  try {
    const comments = await Comment.findAll({ where: { recipeId } });
    res.json({ comments });
  } catch (error) {
    next(new Error('Error fetching comments'));
  }
});

app.post('/ratings', authenticateToken, async (req, res, next) => {
  const { recipeId, rating } = req.body;
  try {
    const user = await User.findOne({ where: { username: req.user.username } });
    await Rating.create({ userId: user.id, recipeId, rating });
    res.json({ message: 'Rating added' });
  } catch (error) {
    next(new Error('Error adding rating'));
  }
});

app.get('/ratings/:recipeId', async (req, res, next) => {
  const { recipeId } = req.params;
  try {
    const ratings = await Rating.findAll({ where: { recipeId } });
    const averageRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
    res.json({ ratings, averageRating });
  } catch (error) {
    next(new Error('Error fetching ratings'));
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: [
      '/api/recipes',
      '/api/health'
    ]
  });
});

// Use error handling middleware
app.use(errorHandler);

// Sync database and start the server
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});