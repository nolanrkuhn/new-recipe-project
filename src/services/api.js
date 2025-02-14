import axios from 'axios';

const api = axios.create({
  baseURL: 'https://recipe-project-backend-enn6.onrender.com'
});

export const login = async (username, password) => {
  const response = await api.post('/login', { username, password });
  return response.data;
};

export const register = async (username, password) => {
  const response = await api.post('/register', { username, password });
  return response.data;
};

export const fetchRecipes = async (query) => {
  const response = await api.get('/api/recipes', { params: { query } });
  return response.data;
};

export const fetchFavorites = async (token) => {
  const response = await api.get('/favorites', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchRecipeDetails = async (id) => {
  const response = await api.get(`/api/recipes/${id}`);
  return response.data;
};