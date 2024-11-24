import React from "react";
import "./Passion.css";

const SportCard = ({ name, followers, imageUrl, isActive = false, onClick }) => {
  return (
    <article
      className={`card ${isActive ? "card-active" : ""}`} // Add 'card-active' class if selected
      onClick={onClick} // Ensure the onClick handler is invoked here
    >
      <img
        style={{ cursor: "pointer" }}
        loading="lazy"
        src={imageUrl}
        alt={`${name} sport icon`}
        className="sport-image"
      />
      <div className="content">
        <h2 className="sport-name">{name}</h2>
        <p className="followers">{followers}</p>
      </div>
    </article>
  );
};

export default SportCard;
