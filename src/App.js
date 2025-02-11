import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './index.css';
import Login from './Login';
import Register from './Register';
import RecipeSearch from './RecipeSearch';
import Favorites from './Favorites';
import RecipeDetails from './RecipeDetails';

const App = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('http://localhost:5050/me', { headers: { Authorization: `Bearer ${token}` } })
                .then((response) => setUser(response.data))
                .catch(() => localStorage.removeItem('token'));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <Router>
            <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
                <nav className="w-full max-w-4xl bg-white shadow-md rounded-lg p-4 mb-6 flex justify-between items-center">
                    <Link to="/" className="text-xl font-semibold text-blue-600 hover:text-blue-800">New Recipe Project</Link>
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <Link to="/favorites" className="text-lg text-gray-700 hover:text-blue-600">Favorites</Link>
                            <span className="text-lg text-gray-700">Welcome, {user.username}</span>
                            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700">Logout</button>
                        </div>
                    ) : (
                        <div className="flex space-x-4">
                            <Link to="/login" className="text-lg text-gray-700 hover:text-blue-600">Login</Link>
                            <Link to="/register" className="text-lg text-gray-700 hover:text-blue-600">Register</Link>
                        </div>
                    )}
                </nav>
                <Routes>
                    <Route path="/" element={<RecipeSearch user={user} />} />
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="/register" element={<Register setUser={setUser} />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;