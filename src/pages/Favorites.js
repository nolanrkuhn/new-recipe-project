import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5050/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error('Error fetching favorites', error);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <div>
      <h2>Your Favorite Recipes</h2>
      <div className="recipe-list">
        {favorites.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;