import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './RecipeDetails.css';

const RecipeDetails = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  useEffect(() => {
    const fetchRecipe = async () => {
      const token = localStorage.getItem('token');
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching recipe:', id);
        console.log('API URL:', `${baseUrl}/api/recipes/${id}`);

        const response = await axios.get(`${baseUrl}/api/recipes/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (response.data) {
          console.log('Recipe data received:', response.data);
          setRecipe({
            ...response.data,
            cookTime: response.data.readyInMinutes ? `${response.data.readyInMinutes} minutes` : 'Not specified',
            difficulty: response.data.spoonacularScore ? `${response.data.spoonacularScore}/100` : 'Not specified',
            servings: response.data.servings || 'Not specified',
            description: response.data.summary || '',
            extendedIngredients: response.data.extendedIngredients || []
          });
        } else {
          throw new Error('No recipe data received');
        }
      } catch (error) {
        console.error('Error details:', error);

        if (error.response?.status === 404) {
          setError('Recipe not found. Please check the recipe ID.');
        } else if (error.response?.status === 401) {
          setError('Authentication required. Please log in.');
          navigate('/login');
        } else if (error.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(error.response?.data?.message || 'Error fetching recipe details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id, navigate, baseUrl]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return (
    <div className="error-container">
      <div className="error">{error}</div>
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Back to Search
      </button>
    </div>
  );
  if (!recipe) return (
    <div className="error-container">
      <div className="error">Recipe not found</div>
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Back to Search
      </button>
    </div>
  );

  const ingredientsList = recipe.extendedIngredients?.map(ing => 
    `${ing.amount} ${ing.unit} ${ing.name}`
  ) || [];

  const instructionsList = recipe.analyzedInstructions?.[0]?.steps?.map(step => step.step) || [];

  return (
    <div className="recipe-details">
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Back to Search
      </button>

      <div className="recipe-header">
        {recipe.image && (
          <img src={recipe.image} alt={recipe.title} className="recipe-image" />
        )}
        <h1>{recipe.title}</h1>
      </div>

      <div className="recipe-info">
        <div className="info-item">
          <span className="label">Cook Time:</span> {recipe.cookTime}
        </div>
        <div className="info-item">
          <span className="label">Difficulty:</span> {recipe.difficulty}
        </div>
        <div className="info-item">
          <span className="label">Servings:</span> {recipe.servings}
        </div>
      </div>

      {recipe.description && (
        <div className="recipe-description">
          <h2>Description</h2>
          <div dangerouslySetInnerHTML={{ __html: recipe.description }} className="description-content" />
        </div>
      )}

      <div className="recipe-ingredients">
        <h2>Ingredients</h2>
        <ul>
          {ingredientsList.length > 0 ? (
            ingredientsList.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))
          ) : (
            <p>No ingredients available.</p>
          )}
        </ul>
      </div>

      <div className="recipe-instructions">
        <h2>Instructions</h2>
        <ol>
          {instructionsList.length > 0 ? (
            instructionsList.map((step, index) => (
              <li key={index}>{step}</li>
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