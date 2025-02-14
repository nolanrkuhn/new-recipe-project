import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const RecipeDetails = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`http://localhost:5050/api/recipes/${id}`);
        setRecipe(response.data);
      } catch (error) {
        setError('Error fetching recipe details');
        console.error('Error fetching recipe details', error);
      }
    };

    fetchRecipe();
  }, [id]);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (!recipe) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>{recipe.title}</h2>
      <img src={recipe.image} alt={recipe.title} />
      <p>{recipe.instructions}</p>
    </div>
  );
};

export default RecipeDetails;