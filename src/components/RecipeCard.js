import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';

const RecipeCard = ({ recipe }) => {
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
            {recipe.summary
              .replace(/<[^>]*>/g, '')
              .slice(0, 150)}
            {recipe.summary.length > 150 && '...'}
          </p>
        )}
      </div>
      <div className="recipe-card-footer">
        <span>
          <i className="far fa-clock"></i>
          {recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : 'Time N/A'}
        </span>
        <span>
          <i className="fas fa-users"></i>
          {recipe.servings ? `Serves ${recipe.servings}` : 'Servings N/A'}
        </span>
      </div>
    </div>
  );
};

export default RecipeCard;