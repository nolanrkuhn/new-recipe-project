import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './RecipeDetails.css';

const RecipeDetails = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;

  console.log('Spoonacular API Key:', apiKey);
  console.log('Recipe ID from URL:', id);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching recipe:', id);
        const apiUrl = `https://api.spoonacular.com/recipes/${encodeURIComponent(id)}/information`;
        console.log('API URL:', apiUrl);

        const response = await axios.get(apiUrl, {
          params: { apiKey },
        });

        console.log('Full API Response:', response.data);

        if (response.data) {
          setRecipe(response.data);
        } else {
          setRecipe(null);
        }
      } catch (error) {
        console.error('Error fetching recipe:', error.response ? error.response.data : error.message);
        setError(error.response?.data?.message || 'Failed to fetch recipe details.');
      } finally {
        setLoading(false);
      }
    };

    if (apiKey) {
      fetchRecipe();
    } else {
      setError('API key is missing. Make sure REACT_APP_SPOONACULAR_API_KEY is set.');
      setLoading(false);
    }
  }, [id, apiKey]);

  if (loading) return <p>Loading recipe...</p>;
  if (error) return <p>Error loading recipe: {error}</p>;
  if (!recipe) return <p>No recipe found.</p>;

  return (
    <div className="recipe-details">
      <h1>{recipe.title}</h1>
      <div className="recipe-meta">
        <p>Category: {recipe.dishTypes?.join(', ') || 'N/A'}</p>
        <p>Cook Time: {recipe.readyInMinutes} min</p>
      </div>

      {recipe.image && <img src={recipe.image} alt={recipe.title} className="recipe-image" />}

      {recipe.summary && (
        <div className="recipe-description">
          <h2>Description</h2>
          <div dangerouslySetInnerHTML={{ __html: recipe.summary }} className="description-content" />
        </div>
      )}

      <div className="recipe-ingredients">
        <h2>Ingredients</h2>
        <ul>
          {recipe.extendedIngredients?.length > 0 ? (
            recipe.extendedIngredients.map((ingredient) => (
              <li key={ingredient.id}>{ingredient.original}</li>
            ))
          ) : (
            <p>No ingredients available.</p>
          )}
        </ul>
      </div>

      <div className="recipe-instructions">
        <h2>Instructions</h2>
        <ol>
          {recipe.analyzedInstructions?.length > 0 ? (
            recipe.analyzedInstructions[0].steps.map((step) => (
              <li key={step.number}>{step.step}</li>
            ))
          ) : (
            <p>No instructions available.</p>
          )}
        </ol>
      </div>
    </div>
  );
};

export default RecipeDetails;
