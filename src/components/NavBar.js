import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = ({ user, handleLogout }) => {
  return (
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
  );
};

export default NavBar;