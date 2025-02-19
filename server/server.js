const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const app = express();

const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://recipe-project-frontend.onrender.com'
      : process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
  };

app.use(cors(corsOptions));
app.use(express.json());

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_URL = 'https://api.spoonacular.com/recipes';

console.log('Server Configuration:');
console.log('Environment:', process.env.NODE_ENV);
console.log('CORS Origin:', corsOptions.origin);
console.log('Port:', process.env.PORT);

const users = []; // Temporary storage, replace with DB later

const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// User Registration
app.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, email, password: hashedPassword, name };
    users.push(newUser);
    res.json({ message: 'User registered successfully' });
});

// User Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ token, user: { name: user.name, email: user.email } });
});

// Get Logged-in User
app.get('/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ id: decoded.id, email: decoded.email, name: decoded.name });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

app.get('/api/recipes', async (req, res) => {
    try {
        const { query, offset, number, diet, cuisine } = req.query;
        const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, {
            params: {
                query,
                offset,
                number,
                diet,
                cuisine,
                apiKey: process.env.SPOONACULAR_API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Spoonacular API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Error fetching recipes',
            details: error.response?.data || error.message 
        });
    }
});

// Recipe Details Endpoint
app.get('/api/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching recipe ${id}`);
        let recipe;
        
        try {
            const response = await axios.get(
                `${SPOONACULAR_URL}/${id}/information`,
                { params: { apiKey: SPOONACULAR_API_KEY } }
            );
            recipe = response.data;
        } catch (error) {
            console.error('Spoonacular API Error:', error.response?.data || error.message);
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        res.json(recipe);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// NEW: Recipe Details Endpoint
// Update the Recipe Details Endpoint with better error handling
app.get('/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching recipe ${id}`); // Debug log
        console.log('API Key exists:', !!process.env.SPOONACULAR_API_KEY); // Debug log (safe way to check)
        
        const response = await axios.get(
            `https://api.spoonacular.com/recipes/${id}/information`,
            {
                params: {
                    apiKey: process.env.SPOONACULAR_API_KEY
                }
            }
        );
        
        // Debug log
        console.log('Spoonacular API response received');
        
        const recipe = {
            id: response.data.id,
            title: response.data.title,
            image: response.data.image,
            description: response.data.summary,
            cookTime: `${response.data.readyInMinutes} minutes`,
            difficulty: response.data.difficulty || 'Medium',
            servings: response.data.servings,
            ingredients: response.data.extendedIngredients.map(ing => 
                `${ing.amount} ${ing.unit} ${ing.name}`
            ),
            instructions: response.data.analyzedInstructions[0]?.steps.map(step => 
                step.step
            ) || (response.data.instructions || '').split('\n').filter(step => step.trim())
        };
        
        res.json(recipe);
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            stack: error.stack
        });

        // Send appropriate status code based on the error
        const status = error.response?.status || 500;
        res.status(status).json({ 
            error: 'Error fetching recipe details',
            message: error.response?.data?.message || error.message,
            status: status
        });
    }
});

// Add this endpoint
app.get('/api/test', async (req, res) => {
    try {
        console.log('Testing Spoonacular API connection');
        console.log('API Key exists:', !!process.env.SPOONACULAR_API_KEY);
        
        const testResponse = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
            params: {
                query: 'pasta',
                number: 1,
                apiKey: process.env.SPOONACULAR_API_KEY
            }
        });

        res.json({
            success: true,
            apiKeyExists: !!process.env.SPOONACULAR_API_KEY,
            testResponse: testResponse.data,
            environment: process.env.NODE_ENV
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'API Test Failed',
            message: error.response?.data?.message || error.message,
            apiKeyExists: !!process.env.SPOONACULAR_API_KEY,
            environment: process.env.NODE_ENV
        });
    }
});

// Add this endpoint before your catch-all 404 handler
app.get('/test-spoonacular', async (req, res) => {
    try {
        console.log('Testing Spoonacular API connection');
        console.log('API Key exists:', !!process.env.SPOONACULAR_API_KEY);
        console.log('API Key length:', process.env.SPOONACULAR_API_KEY?.length);

        // Try a simple search request to test the API key
        const testResponse = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
            params: {
                query: 'pasta',
                number: 1,
                apiKey: process.env.SPOONACULAR_API_KEY
            }
        });

        res.json({
            success: true,
            apiKeyExists: !!process.env.SPOONACULAR_API_KEY,
            apiKeyLength: process.env.SPOONACULAR_API_KEY?.length,
            testResponse: testResponse.data,
            environment: process.env.NODE_ENV
        });
    } catch (error) {
        console.error('Spoonacular API Test Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        res.status(500).json({
            success: false,
            error: 'API Test Failed',
            message: error.response?.data?.message || error.message,
            apiKeyExists: !!process.env.SPOONACULAR_API_KEY,
            apiKeyLength: process.env.SPOONACULAR_API_KEY?.length,
            environment: process.env.NODE_ENV
        });
    }
});

app.use((req, res, next) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));