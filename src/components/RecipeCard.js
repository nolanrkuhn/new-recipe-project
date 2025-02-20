import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';

const RecipeCard = ({ recipe, user, addFavorite }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (recipe?.id) {
      navigate(`/recipes/${recipe.id}`);
    }
  };

  if (!recipe) return null;

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
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-recipe.jpg';
          }}
        />
      )}
      <div className="recipe-card-content">
        <h3>{recipe.title}</h3>
        {recipe.summary && (
          <p className="recipe-summary">
            {recipe.summary.replace(/<[^>]*>/g, '').slice(0, 150)}
            {recipe.summary.length > 150 && '...'}
          </p>
        )}
      </div>
      <div className="recipe-card-footer">
        {/* Add "Add to Favorites" button only if user is logged in */}
        {user && (
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click from triggering navigation
              addFavorite(recipe.id);
            }} 
            className="btn btn-secondary"
          >
            Add to Favorites
          </button>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
