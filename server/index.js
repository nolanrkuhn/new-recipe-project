const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Dummy data for recipes
const recipes = [
  { id: 1, title: 'Spaghetti Carbonara', image: 'https://placekitten.com/150/150' },
  { id: 2, title: 'Chicken Alfredo', image: 'https://placekitten.com/150/150' },
  { id: 3, title: 'Beef Stroganoff', image: 'https://placekitten.com/150/150' },
  { id: 4, title: 'Lasagna', image: 'https://placekitten.com/150/150' } // Added a Lasagna recipe for testing
];

// Routes
app.get('/recipes', (req, res) => {
  const query = req.query.query;
  const filteredRecipes = recipes.filter(recipe => recipe.title.toLowerCase().includes(query.toLowerCase()));
  res.json({ results: filteredRecipes });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});