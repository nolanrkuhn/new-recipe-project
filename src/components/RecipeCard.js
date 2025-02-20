import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';

const RecipeCard = ({ recipe, user, refreshFavorites, isFavorite }) => {
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';
  const [successMessage, setSuccessMessage] = useState('');

  const handleClick = () => {
    if (recipe?.id) {
      navigate(`/recipes/${recipe.id}`);
    }
  };

  const handleFavoriteAction = async (e) => {
    e.stopPropagation();
    if (!user) {
      setSuccessMessage('You must be logged in to manage favorites.');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`${baseUrl}/favorites/${recipe.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSuccessMessage('Removed from Favorites ❌');
      } else {
        await axios.post(`${baseUrl}/favorites`, { recipeId: recipe.id }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSuccessMessage('Added to Favorites! ❤️');
      }
      if (refreshFavorites) refreshFavorites(); 
    } catch (error) {
      console.error('Error updating favorite:', error);
      setSuccessMessage('Error updating favorite.');
    }
  };

  return (
    <div className="recipe-card" onClick={handleClick} role="button" tabIndex={0}>
      {recipe.image && <img src={recipe.image} alt={recipe.title} />}
      <div className="recipe-card-content">
        <h3>{recipe.title}</h3>
      </div>
      <div className="recipe-card-footer">
        {user && (
          <button onClick={handleFavoriteAction} className="btn btn-secondary">
            {isFavorite ? 'Remove from Favorites ❌' : 'Add to Favorites ❤️'}
          </button>
        )}
      </div>
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};


export default RecipeCard;
