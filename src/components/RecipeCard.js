import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';

const RecipeCard = ({ recipe, user, refreshFavorites }) => {
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  const handleClick = () => {
    if (recipe?.id) {
      navigate(`/recipes/${recipe.id}`);
    }
  };

  const addFavorite = async (e) => {
    e.stopPropagation(); // Prevents navigating to the recipe when clicking the button
    if (!user) {
      alert('You must be logged in to add favorites.');
      return;
    }

    try {
      await axios.post(`${baseUrl}/favorites`, { recipeId: recipe.id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Recipe added to favorites!');
      refreshFavorites(); // Refresh favorite list after adding
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  return (
    <div 
      className="recipe-card" 
      onClick={handleClick} 
      role="button" 
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {recipe.image && (
        <img 
          src={recipe.image} 
          alt={recipe.title}
          onError={(e) => { e.target.src = '/placeholder-recipe.jpg'; }}
        />
      )}
      <div className="recipe-card-content">
        <h3>{recipe.title}</h3>
      </div>
      <div className="recipe-card-footer">
        {user && (
          <button onClick={addFavorite} className="btn btn-secondary">
            Add to Favorites ❤️
          </button>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
