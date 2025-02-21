import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import RecipeSearch from './pages/RecipeSearch';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import NavBar from './components/NavBar';
import RecipeDetails from './pages/RecipeDetails';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${process.env.REACT_APP_API_URL}/me`, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
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
            <Route path="/favorites" element={user ? <Favorites user={user} /> : <Login setUser={setUser} />} />
            <Route path="/recipes/:id" element={<RecipeDetails user={user} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;