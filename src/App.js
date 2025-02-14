import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './index.css';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import RecipeSearch from './pages/RecipeSearch';
import Favorites from './pages/Favorites';
import RecipeDetails from './pages/RecipeDetails';

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
        <NavBar user={user} handleLogout={handleLogout} />
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