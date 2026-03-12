import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🎯 QuizFlow</Link>
      <div className="navbar-links">
        {user ? (
          <>
            <span className="user-info">
              👤 {user.name} <span className={`badge badge-${user.role}`}>{user.role}</span>
            </span>
            {user.role === 'admin' ? (
              <>
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/results">All Results</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">Quizzes</Link>
                <Link to="/results">My Results</Link>
              </>
            )}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
