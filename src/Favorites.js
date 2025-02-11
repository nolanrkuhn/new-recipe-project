import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await axios.get('http://localhost:5050/favorites', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setFavorites(response.data.favorites);
            } catch (error) {
                setError('Error fetching favorites');
            }
        };

        fetchFavorites();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
            <h1 className="text-5xl font-extrabold text-gray-800 mb-6">⭐ Favorite Recipes</h1>
            {error && <p className="text-red-500 text-lg">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                {favorites.map((recipe) => (
                    <a 
                        key={recipe.recipeId} 
                        href={`https://spoonacular.com/recipes/${recipe.title.replace(/ /g, '-')}-${recipe.recipeId}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-white p-5 rounded-xl shadow-md flex flex-col items-center transition transform hover:scale-105 hover:shadow-xl"
                    >
                        <img src={`https://spoonacular.com/recipeImages/${recipe.recipeId}-312x231.jpg`} alt={recipe.title} className="rounded-xl mb-3 w-full h-52 object-cover" />
                        <h3 className="text-xl font-bold hover:text-blue-600 text-center">{recipe.title}</h3>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default Favorites;