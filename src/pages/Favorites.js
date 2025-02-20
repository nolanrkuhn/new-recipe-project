import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';

const Favorites = ({ user }) => {
  const [favorites, setFavorites] = useState([]);
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${baseUrl}/favorites`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Fetch full recipe details for each favorite recipe ID
      const recipeDetails = await Promise.all(
        response.data.favorites.map(async (id) => {
          const recipeResponse = await axios.get(`${baseUrl}/api/recipes/${id}`);
          return recipeResponse.data;
        })
      );

      setFavorites(recipeDetails);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  return (
    <div>
      <h2>Your Favorite Recipes</h2>
      <div className="recipe-list">
        {favorites.length === 0 ? (
          <p>No favorite recipes yet.</p>
        ) : (
          favorites.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} user={user} refreshFavorites={fetchFavorites} isFavorite={true} />

          ))
        )}
      </div>
    </div>
  );
};

export default Favorites;
