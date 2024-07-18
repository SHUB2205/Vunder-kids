import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Vunder Kids</Link>
      </div>
      <div className="navbar-menu">
        <a href="#articles">Articles</a>
        <a href="#features">Features</a>
        <a href="#sports">Sports</a>
        <a href="#mentors">Mentors</a>
      </div>
      <div className="navbar-auth">
        <Link to="/register">Create an Account</Link>
      </div>
    </nav>
  );
};

export default Navbar;
