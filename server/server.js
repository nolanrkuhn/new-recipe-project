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

// Recipe Search Endpoint
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

// NEW: Recipe Details Endpoint
app.get('/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(
            `https://api.spoonacular.com/recipes/${id}/information`,
            {
                params: {
                    apiKey: process.env.SPOONACULAR_API_KEY
                }
            }
        );
        
        // Transform the response to match your frontend expectations
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
            ) || response.data.instructions.split('\n').filter(step => step.trim())
        };
        
        res.json(recipe);
    } catch (error) {
        console.error('Spoonacular API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Error fetching recipe details',
            details: error.response?.data || error.message 
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