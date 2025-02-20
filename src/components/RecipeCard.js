import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';

const RecipeCard = ({ recipe, user, refreshFavorites }) => {
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';
  const [successMessage, setSuccessMessage] = useState('');

  const handleClick = () => {
    if (recipe?.id) {
      navigate(`/recipes/${recipe.id}`);
    }
  };

  const addFavorite = async (e) => {
    e.stopPropagation(); // Prevents navigating to the recipe when clicking the button
    if (!user) {
      setSuccessMessage('You must be logged in to add favorites.');
      return;
    }

    try {
      await axios.post(`${baseUrl}/favorites`, { recipeId: recipe.id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccessMessage('Added to Favorites! ❤️'); // ✅ Show success message
      if (refreshFavorites) refreshFavorites(); // ✅ Only call if defined
    } catch (error) {
      console.error('Error adding favorite:', error);
      setSuccessMessage('Error adding favorite.');
    }
  };

  return (
    <div 
      className="recipe-card" 
      onClick={handleClick} 
      role="button" 
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
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

      {/* ✅ Show success message below the button */}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default RecipeCard;
