import React from 'react';
import './Sports.css';

const sports = [
  "Football", "Cricket", "Tennis", "Pickleball", 
  "Padel", "Basketball", "Hockey", 
  "Field and Track Races", "Swimming"
];

const Sports = () => {
  return (
    <section id="sports" className="sports">
      <h2>Sports</h2>
      <div className="sports-list">
        {sports.map((sport, index) => (
          <div key={index} className="sport-item">{sport}</div>
        ))}
      </div>
    </section>
  );
};

export default Sports;
