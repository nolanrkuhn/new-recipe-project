import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
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
            <div className="app-container">
            <nav className="nav">
                <div className="nav-content">
                    <Link to="/" className="nav-brand">Recipe Finder</Link>
                    {user ? (
                        <div className="nav-links">
                            <Link to="/favorites" className="nav-link">Favorites</Link>
                            <span className="nav-link user-welcome">Welcome, {user.username}</span>
                            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
                        </div>
                    ) : (
                        <div className="nav-links">
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="nav-link">Register</Link>
                        </div>
                    )}
                </div>
            </nav>
                <div className="container">
                    <Routes>
                        <Route path="/" element={<RecipeSearch user={user} />} />
                        <Route path="/login" element={<Login setUser={setUser} />} />
                        <Route path="/register" element={<Register setUser={setUser} />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/recipes/:id" element={<RecipeDetails />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;