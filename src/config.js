// Base API URL
const isProd = process.env.NODE_ENV === 'production';
export const API_URL = isProd 
  ? 'https://recipe-project-backend-enn6.onrender.com'  // Your production backend URL
  : 'http://localhost:5050';  // Your local backend URL

// API endpoints
export const ENDPOINTS = {
  RECIPES: '/api/recipes',
  SEARCH: '/api/recipes/search',
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register'
  },
  USER: {
    FAVORITES: '/api/user/favorites'
  }
};

const config = {
  API_URL,
  ENDPOINTS,
};

export default config;