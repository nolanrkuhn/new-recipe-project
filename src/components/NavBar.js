import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavBar = ({ user, handleLogout }) => {
  const navigate = useNavigate(); // ✅ Enables redirect after logout

  const handleLogoutClick = () => {
    handleLogout(); // Call the logout function
    navigate('/login'); // ✅ Redirect to login page after logout
  };

  return (
    <nav className="nav">
      <div className="nav-content">
        <Link to="/" className="nav-brand">Recipe Finder</Link>
        {user ? (
          <div className="nav-links">
            <Link to="/favorites" className="nav-link">Favorites</Link>
            <span className="nav-link user-welcome">
              Welcome, {user.name || user.email} {/* ✅ Use correct field */}
            </span>
            <button onClick={handleLogoutClick} className="btn btn-danger">Logout</button>
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
