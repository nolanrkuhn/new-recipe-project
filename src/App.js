import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './index.css';
import Login from './Login';
import Register from './Register';
import RecipeSearch from './RecipeSearch';
import Favorites from './Favorites';

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
                <nav className="w-full max-w-lg flex justify-between mb-6">
                    <Link to="/" className="text-lg text-blue-600 hover:underline">Home</Link>
                    {user ? (
                        <>
                            <Link to="/favorites" className="text-lg text-blue-600 hover:underline">Favorites</Link>
                            <span className="text-lg">Welcome, {user.username}</span>
                            <button onClick={handleLogout} className="text-lg text-red-600 hover:underline">Logout</button>
                        </>
                    ) : (
                        <div className="flex space-x-4">
                            <Link to="/login" className="text-lg text-blue-600 hover:underline">Login</Link>
                            <Link to="/register" className="text-lg text-blue-600 hover:underline">Register</Link>
                        </div>
                    )}
                </nav>
                <Routes>
                    <Route path="/" element={<RecipeSearch user={user} />} />
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="/register" element={<Register setUser={setUser} />} />
                    <Route path="/favorites" element={<Favorites />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;