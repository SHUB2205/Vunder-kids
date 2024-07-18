import React from 'react';
import './Features.css';

const features = [
  "Set a match with peers",
  "Share your progress",
  "Make memories",
  "Find a mentor",
  "Get promoted as a sportsman"
];

const Features = () => {
  return (
    <section id="features" className="features">
      <h2>Features</h2>
      <div className="features-list">
        {features.map((feature, index) => (
          <div key={index} className="feature-item">{feature}</div>
        ))}
      </div>
    </section>
  );
};

export default Features;
