import React, { useState, useCallback } from 'react';
import '../styles/landing.scss';

import img1 from '../assets/landing-image-1.jpg';
import img2 from '../assets/landing-image-2.jpg';
import img3 from '../assets/landing-image-3.jpg';

const Landing = () => {
  const imagesLanding = [
    { image: img1, position: "55% 25%", size: "cover" },
    { image: img2, position: "center", size: "contain" },
    { image: img3, position: "top right", size: "cover" },
  ];

  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % imagesLanding.length);
  }, []);

  const lastImage = useCallback(() => {
    setCurrentImage((prev) => (prev - 1 + imagesLanding.length) % imagesLanding.length);
  }, []);

  return (
    <main
      className='landing'
      style={{
        backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 1) 3%, rgba(0, 0, 0, 0) 25%), url(${imagesLanding[currentImage].image})`,
        backgroundPosition: imagesLanding[currentImage].position,
        backgroundSize: imagesLanding[currentImage].size || "cover",
        transition: "background-image 0.5s ease-in-out, background-position 0.5s ease-in-out",
      }}
    >
      <p className='landing__description'>ENTONCES... VAS A COMERME?</p>
      <h1 className='landing__title'>
        <span className='landing__title--span'>#TU</span>
        <span className='landing__title--span'>MALDITA</span>
        <span className="landing__title--span">BURGER</span>
      </h1>
      <div className="landing__button-container">
        <div className='button__container'>
          <button className='first' onClick={lastImage} aria-label="Imagen anterior">{`<`}</button>
          <span className='first__text'>{currentImage + 1}</span>
          /
          <span>{imagesLanding.length}</span>
          <button className='second' onClick={nextImage} aria-label="Imagen siguiente">{`>`}</button>
        </div>
      </div>
    </main>
  );
};

export default Landing;
