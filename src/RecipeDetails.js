import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const RecipeDetails = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRecipeDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
                    params: { apiKey: '28670279fa9c40e18481bf0311202bd2' }
                });
                setRecipe(response.data);
            } catch (error) {
                setError('Error fetching recipe details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipeDetails();
    }, [id]);

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
            {loading && <p className="text-blue-500 text-lg">Loading recipe details...</p>}
            {error && <p className="text-red-500 text-lg">{error}</p>}
            {recipe && (
                <div className="max-w-2xl w-full bg-white p-5 rounded-xl shadow-md">
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-4">{recipe.title}</h1>
                    <img src={recipe.image} alt={recipe.title} className="rounded-xl mb-4 w-full h-80 object-cover" />
                    <h2 className="text-2xl font-bold text-gray-700 mb-3">Ingredients</h2>
                    <ul className="list-disc list-inside mb-6">
                        {recipe.extendedIngredients.map((ingredient) => (
                            <li key={ingredient.id}>{ingredient.original}</li>
                        ))}
                    </ul>
                    <h2 className="text-2xl font-bold text-gray-700 mb-3">Instructions</h2>
                    <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} className="prose"></div>
                </div>
            )}
        </div>
    );
};

export default RecipeDetails;