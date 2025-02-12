import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import config from '../config';

const RecipeSearch = ({ user }) => {
    const [query, setQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const [diet, setDiet] = useState('');
    const [cuisine, setCuisine] = useState('');
    const pageSize = 10;

    const searchRecipes = async () => {
        if (!query) {
            setError('Please enter a search term.');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${config.API_URL}${config.ENDPOINTS.RECIPES}`, {
                params: { query, offset: page * pageSize, number: pageSize, diet, cuisine }
            });
            setRecipes(response.data.results || []);
            setTotalResults(response.data.totalResults);
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
            await axios.post(`${config.API_URL}/favorites`, { recipe }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Recipe added to favorites');
        } catch (error) {
            setError('Error adding recipe to favorites');
        }
    };

    return (
        <div className="container">
            <h1 className="text-center mb-4">🍽️ Recipe Finder</h1>
            
            <div className="card mb-4">
                <div className="form-group">
                    <input 
                        type="text" 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)} 
                        placeholder="Search for a recipe..." 
                        className="form-control mb-2"
                    />
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <select 
                            value={diet} 
                            onChange={(e) => setDiet(e.target.value)} 
                            className="form-control"
                        >
                            <option value="">Any Diet</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="gluten free">Gluten Free</option>
                        </select>
                        <select 
                            value={cuisine} 
                            onChange={(e) => setCuisine(e.target.value)} 
                            className="form-control"
                        >
                            <option value="">Any Cuisine</option>
                            <option value="italian">Italian</option>
                            <option value="mexican">Mexican</option>
                            <option value="indian">Indian</option>
                        </select>
                    </div>
                    <button 
                        onClick={searchRecipes} 
                        className="btn btn-primary mt-2"
                        style={{ width: '100%' }}
                    >
                        🔍 Search
                    </button>
                </div>
            </div>

            {loading && <p className="text-center">Loading recipes...</p>}
            {error && <p className="text-center text-danger">{error}</p>}
            
            <div className="recipe-grid">
                {recipes.map((recipe) => (
                    <div key={recipe.id} className="recipe-card">
                        <Link to={`/recipes/${recipe.id}`} className="recipe-link">
                            <img 
                                src={`https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg`} 
                                alt={recipe.title} 
                                className="recipe-image" 
                            />
                            <div className="recipe-content">
                                <h3 className="recipe-title">{recipe.title}</h3>
                                {user && (
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            addToFavorites(recipe);
                                        }} 
                                        className="btn btn-secondary mt-2"
                                    >
                                        Add to Favorites
                                    </button>
                                )}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {recipes.length > 0 && (
                <div className="pagination mt-4 mb-4">
                    <button 
                        onClick={() => setPage(page - 1)} 
                        disabled={page === 0} 
                        className="btn btn-primary"
                    >
                        Previous
                    </button>
                    <button 
                        onClick={() => setPage(page + 1)} 
                        disabled={(page + 1) * pageSize >= totalResults} 
                        className="btn btn-primary"
                        style={{ marginLeft: '1rem' }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecipeSearch;