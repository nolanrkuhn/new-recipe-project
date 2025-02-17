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
        console.log('API URL:', process.env.REACT_APP_API_URL); // Debug log
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/recipes/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        console.log('Recipe data received:', response.data); // Debug log
        setRecipe(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error details:', error);
        setError(
          error.response?.data?.message || 
          error.response?.data?.error || 
          'Error fetching recipe details'
        );
        setLoading(false);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id, navigate]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!recipe) return <div className="error">Recipe not found</div>;

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
          <span className="label">Cook Time:</span>
          <span>{recipe.cookTime || 'Not specified'}</span>
        </div>
        <div className="info-item">
          <span className="label">Difficulty:</span>
          <span>{recipe.difficulty || 'Not specified'}</span>
        </div>
        <div className="info-item">
          <span className="label">Servings:</span>
          <span>{recipe.servings || 'Not specified'}</span>
        </div>
      </div>

      {recipe.description && (
        <div className="recipe-description">
          <h2>Description</h2>
          <p>{recipe.description}</p>
        </div>
      )}

      <div className="recipe-ingredients">
        <h2>Ingredients</h2>
        <ul>
          {recipe.ingredients?.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>

      <div className="recipe-instructions">
        <h2>Instructions</h2>
        <ol>
          {recipe.instructions?.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RecipeDetails;