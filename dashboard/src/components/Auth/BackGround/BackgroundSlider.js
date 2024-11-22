import React, { useState, useEffect } from "react";
import "./BackgroundSlider.css";
import Bg1 from "../../images/Bg1.jpeg";
import Bg2 from "../../images/Bg2.jpeg";
import Bg3 from "../../images/Bg3.jpeg";

const BackgroundSlider = () => {
  const images = [
    { id: 1, src: Bg1 },
    { id: 2, src: Bg2 },
    { id: 3, src: Bg3 },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="background-slider">
      {images.map((image, index) => (
        <img
          key={image.id}
          src={image.src}
          alt={`Background ${image.id}`}
          className={`bg-image ${index === currentIndex ? "active" : ""}`}
        />
      ))}
    </div>
  );
};

export default BackgroundSlider;
