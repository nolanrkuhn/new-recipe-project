const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const app = express();

// Parse ALLOWED_ORIGINS from environment variable or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'https://recipe-project-frontend.onrender.com',
        'http://localhost:3000'
      ];

// CORS configuration with detailed logging
const corsOptions = {
    origin: function (origin, callback) {
        console.log('Request Origin:', origin);
        
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) {
            console.log('Request has no origin - allowing');
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            console.log('Origin allowed:', origin);
            callback(null, true);
        } else {
            console.log('Origin blocked:', origin);
            console.log('Allowed origins:', allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_URL = 'https://api.spoonacular.com/recipes';

// Print initial configuration
console.log('Server Configuration:');
console.log('Environment:', process.env.NODE_ENV);
console.log('Allowed CORS Origins:', allowedOrigins);
console.log('Port:', process.env.PORT);

const users = []; // Temporary storage, replace with DB later

const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        corsOrigins: allowedOrigins
    });
});

// User Registration
app.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (users.find(user => user.email === email)) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: users.length + 1, email, password: hashedPassword, name };
        users.push(newUser);
        const token = generateToken(newUser);
        res.json({ 
            message: 'User registered successfully',
            token,
            user: { id: newUser.id, email: newUser.email, name: newUser.name }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error during registration' });
    }
});

// User Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = users.find(user => user.email === email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = generateToken(user);
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error during login' });
    }
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

// Search Recipes
app.get('/api/recipes', async (req, res) => {
    try {
        const { query, offset, number, diet, cuisine } = req.query;
        const response = await axios.get(`${SPOONACULAR_URL}/complexSearch`, {
            params: {
                query,
                offset,
                number,
                diet,
                cuisine,
                apiKey: SPOONACULAR_API_KEY
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

// Get Recipe Details
app.get('/api/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching recipe ID: ${id}`);

        if (!SPOONACULAR_API_KEY) {
            console.error('Missing Spoonacular API key');
            return res.status(500).json({ message: 'Missing Spoonacular API key' });
        }

        const response = await axios.get(
            `${SPOONACULAR_URL}/${id}/information`,
            {
                params: {
                    apiKey: SPOONACULAR_API_KEY
                }
            }
        );

        console.log(`Recipe ${id} found: ${response.data.title}`);
        res.json(response.data);
    } catch (error) {
        console.error(`Spoonacular API Error for recipe ${req.params.id}:`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Error fetching recipe details',
            error: error.response?.data || error.message
        });
    }
});

// Recipe Details with Formatted Response
app.get('/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching recipe ${id}`);
        console.log('API Key exists:', !!SPOONACULAR_API_KEY);
        
        const response = await axios.get(
            `${SPOONACULAR_URL}/${id}/information`,
            {
                params: {
                    apiKey: SPOONACULAR_API_KEY
                }
            }
        );
        
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

        const status = error.response?.status || 500;
        res.status(status).json({ 
            error: 'Error fetching recipe details',
            message: error.response?.data?.message || error.message,
            status: status
        });
    }
});

// API Test Endpoint
app.get('/api/test', async (req, res) => {
    try {
        console.log('Testing Spoonacular API connection');
        console.log('API Key exists:', !!SPOONACULAR_API_KEY);
        
        const testResponse = await axios.get(`${SPOONACULAR_URL}/complexSearch`, {
            params: {
                query: 'pasta',
                number: 1,
                apiKey: SPOONACULAR_API_KEY
            }
        });

        res.json({
            success: true,
            apiKeyExists: !!SPOONACULAR_API_KEY,
            testResponse: testResponse.data,
            environment: process.env.NODE_ENV
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'API Test Failed',
            message: error.response?.data?.message || error.message,
            apiKeyExists: !!SPOONACULAR_API_KEY,
            environment: process.env.NODE_ENV
        });
    }
});

// Spoonacular Test Endpoint
app.get('/test-spoonacular', async (req, res) => {
    try {
        console.log('Testing Spoonacular API connection');
        console.log('API Key exists:', !!SPOONACULAR_API_KEY);
        console.log('API Key length:', SPOONACULAR_API_KEY?.length);

        const testResponse = await axios.get(`${SPOONACULAR_URL}/complexSearch`, {
            params: {
                query: 'pasta',
                number: 1,
                apiKey: SPOONACULAR_API_KEY
            }
        });

        res.json({
            success: true,
            apiKeyExists: !!SPOONACULAR_API_KEY,
            apiKeyLength: SPOONACULAR_API_KEY?.length,
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
            apiKeyExists: !!SPOONACULAR_API_KEY,
            apiKeyLength: SPOONACULAR_API_KEY?.length,
            environment: process.env.NODE_ENV
        });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        error: `Cannot ${req.method} ${req.path}`,
        availableEndpoints: [
            '/health',
            '/register',
            '/login',
            '/me',
            '/api/recipes',
            '/api/recipes/:id',
            '/recipes/:id',
            '/api/test',
            '/test-spoonacular'
        ]
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Server Startup
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log('\nServer Configuration:');
    console.log('====================');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Port:', PORT);
    console.log('Allowed Origins:', allowedOrigins);
    console.log('Spoonacular API Key exists:', !!SPOONACULAR_API_KEY);
    console.log('JWT Secret exists:', !!process.env.JWT_SECRET);
    console.log('====================\n');
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health\n`);
});