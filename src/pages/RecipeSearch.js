import React, { useState } from 'react';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';
import './RecipeSearch.css';

const RecipeSearch = ({ user }) => {  
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/recipes`, {
        params: { query }
      });
      setRecipes(response.data.results);
    } catch (error) {
      setError('Error fetching recipes');
      console.error('Error fetching recipes:', error);
    }
  };

  return (
    <div className="container">
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}  
          placeholder="Search for recipes..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {error && <p className="text-danger">{error}</p>}
      
      <div className="recipe-list">
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} user={user} />
          ))
        ) : (
          <p>No recipes found. Try searching for something else.</p>
        )}
      </div>
    </div>
  );
};

export default RecipeSearch;
