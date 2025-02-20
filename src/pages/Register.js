import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    // Use the environment variable for the API base URL.
    // If REACT_APP_API_URL is not set, default to localhost for local development.
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';
    
    try {
      const response = await axios.post(`${baseUrl}/register`, { username, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'Error registering');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2 className="text-center mb-4">Register</h2>
      {error && <p className="text-danger text-center mb-3">{error}</p>}
      <form onSubmit={handleRegister}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          className="form-control"
          required
          autoComplete="username"
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="form-control"
          required
          autoComplete="new-password"
        />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          className="form-control"
          required
          autoComplete="new-password"
        />
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
