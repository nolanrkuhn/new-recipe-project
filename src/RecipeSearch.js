import React, { useState } from 'react';
import axios from 'axios';

const RecipeSearch = ({ user }) => {
    const [query, setQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const searchRecipes = async () => {
        if (!query) {
            setError('Please enter a search term.');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:5050/recipes', {
                params: { query }
            });
            setRecipes(response.data.results || []);
            if (response.data.results.length === 0) {
                setError('No recipes found. Try a different search term.');
            }
        } catch (error) {
            setError('Error fetching recipes. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addToFavorites = async (recipe) => {
        try {
            await axios.post('http://localhost:5050/favorites', { recipe }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Recipe added to favorites');
        } catch (error) {
            setError('Error adding recipe to favorites');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
            <h1 className="text-5xl font-extrabold text-gray-800 mb-6">🍽️ Recipe Finder</h1>
            <div className="flex space-x-3 mb-6 w-full max-w-lg">
                <input 
                    type="text" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder="Search for a recipe..." 
                    className="px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
                <button 
                    onClick={searchRecipes} 
                    className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700">
                    🔍 Search
                </button>
            </div>
            {loading && <p className="text-blue-500 text-lg">Loading recipes...</p>}
            {error && <p className="text-red-500 text-lg">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                {recipes.map((recipe) => (
                    <div key={recipe.id} className="bg-white p-5 rounded-xl shadow-md flex flex-col items-center transition transform hover:scale-105 hover:shadow-xl">
                        <a 
                            href={`https://spoonacular.com/recipes/${recipe.title.replace(/ /g, '-')}-${recipe.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                        >
                            <img src={`https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg`} alt={recipe.title} className="rounded-xl mb-3 w-full h-52 object-cover" />
                            <h3 className="text-xl font-bold hover:text-blue-600 text-center">{recipe.title}</h3>
                        </a>
                        {user && (
                            <button 
                                onClick={() => addToFavorites(recipe)} 
                                className="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg shadow-md hover:bg-green-700">
                                Add to Favorites
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecipeSearch;