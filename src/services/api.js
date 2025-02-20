import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5050',
});

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const register = async (email, password, name) => {
  const response = await api.post('/register', { email, password, name });
  return response.data;
};

export const fetchRecipes = async (query) => {
  const response = await api.get('/api/recipes', { params: { query } });
  return response.data;
};

export const fetchFavorites = async (token) => {
  const response = await api.get('/favorites', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchRecipeDetails = async (id) => {
  const response = await api.get(`/api/recipes/${id}`);
  return response.data;
};

export const addFavorite = async (recipeId, token) => {
  const response = await api.post(
    '/favorites',
    { recipeId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const removeFavorite = async (recipeId, token) => {
  const response = await api.delete(`/favorites/${recipeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
