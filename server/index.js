const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5050;

const SPOONACULAR_API_KEY = '28670279fa9c40e18481bf0311202bd2';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});