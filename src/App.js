import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecipeSearch from './pages/RecipeSearch';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import NavBar from './components/NavBar';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <NavBar user={user} handleLogout={handleLogout} />  {/* ✅ Pass handleLogout to NavBar */}
      <Routes>
        <Route path="/" element={<RecipeSearch user={user} />} />
        <Route path="/favorites" element={user ? <Favorites user={user} /> : <Login setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
      </Routes>
    </Router>
  );
};

export default App;
