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

  console.log('Recipe ID from URL:', id);

  useEffect(() => {
    const fetchRecipe = async () => {
      const token = localStorage.getItem('token');
      setLoading(true);
      setError(null);
  
      try {
        console.log('Fetching recipe:', id);
        console.log('API URL:', `${baseUrl}/api/recipes/${id}`);
  
        const response = await axios.get(`${baseUrl}/api/recipes/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
  
        console.log('Full API Response:', response);
  
        if (response.data) {
          console.log('Recipe data received:', response.data);
          setRecipe(response.data);
        } else {
          console.log('No data received from API.');
          setRecipe(null);
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError('Failed to fetch recipe details.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchRecipe();
  }, [id, baseUrl]);
  

  if (loading) return <p>Loading recipe...</p>;
  if (error) return <p>Error loading recipe: {error}</p>;
  if (!recipe) return <p>No recipe found.</p>;

  const ingredientsList = recipe?.ingredients || [];
  const instructionsList = recipe?.instructions || [];

  return (
    <div className="recipe-details">
      <h1>{recipe.title}</h1>
      <div className="recipe-meta">
        <p>Category: {recipe.category}</p>
        <p>Cook Time: {recipe.cookTime}</p>
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
