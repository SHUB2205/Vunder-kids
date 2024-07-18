import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero">
      <h1>Vunder Kids</h1>
      <p>Your Journey Starts Here</p>
      <Link to="/login" className="hero-button">Log In</Link>
    </section>
  );
};

export default HeroSection;

