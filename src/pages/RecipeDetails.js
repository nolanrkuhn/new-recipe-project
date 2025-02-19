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

  useEffect(() => {
    const fetchRecipe = async () => {
      const token = localStorage.getItem('token');
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching recipe:', id);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/recipes/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (response.data) {
          console.log('Recipe data received:', response.data);
          setRecipe(response.data);
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
  }, [id, navigate]);

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
        <div className="info-item"><span className="label">Cook Time:</span> {recipe.cookTime || 'Not specified'}</div>
        <div className="info-item"><span className="label">Difficulty:</span> {recipe.difficulty || 'Not specified'}</div>
        <div className="info-item"><span className="label">Servings:</span> {recipe.servings || 'Not specified'}</div>
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
          {Array.isArray(recipe.ingredients) ? (
            recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{typeof ingredient === 'string' ? ingredient : JSON.stringify(ingredient)}</li>
            ))
          ) : (
            <p>No ingredients available.</p>
          )}
        </ul>
      </div>

      <div className="recipe-instructions">
        <h2>Instructions</h2>
        <ol>
          {Array.isArray(recipe.instructions) ? (
            recipe.instructions.map((step, index) => (
              <li key={index}>{typeof step === 'string' ? step : JSON.stringify(step)}</li>
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
