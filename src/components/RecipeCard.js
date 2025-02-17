import React from 'react';
import './RecipeCard.css';

const RecipeCard = ({ recipe }) => {
  return (
    <div className="recipe-card">
      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} />
      )}
      <div className="recipe-card-content">
        <h3>{recipe.title}</h3>
        {recipe.description && (
          <p>{recipe.description}</p>
        )}
      </div>
      <div className="recipe-card-footer">
        <span>{recipe.cookTime || 'Cook time not specified'}</span>
        <span>{recipe.difficulty || 'Difficulty not specified'}</span>
      </div>
    </div>
  );
};

export default RecipeCard;