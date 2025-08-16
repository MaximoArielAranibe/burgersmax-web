import React, { useState, useEffect } from 'react';
import '../styles/landing.scss';

import img1Mobile from '../assets/landing-image-1-test.jpg';
import img2Mobile from '../assets/landing-image-4.jpg';
import img3Mobile from '../assets/landing-image-5-grande.jpg';

import img1Desktop from '../assets/landing-image-7-large.jpg';
import img2Desktop from '../assets/landing-image-6-grande.jpg';
import img3Desktop from '../assets/landing-image-3.jpg';
import Products from './Products';

const slides = [
  { mobile: img1Mobile, desktop: img1Desktop, position: "55%", size: "cover", positionDesktop: "calc(220px - 20%) calc(60%)", sizeDesktop: "cover" },
  { mobile: img2Mobile, desktop: img2Desktop, position: "center", size: "cover", positionDesktop: "", sizeDesktop: "cover" },
  { mobile: img3Mobile, desktop: img3Desktop, position: "center", size: "cover", positionDesktop: "", sizeDesktop: "" },
];

const Landing = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.innerWidth > 768);
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const changeSlide = (direction) => {
    setCurrentImage((currentImage + direction + slides.length) % slides.length);
  };

  return (
    <main className='landing__container'>
      <section className="landing fade"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 1.1) 30px, rgba(0, 0, 0, 0) 150px), url(${isDesktop ? slides[currentImage].desktop : slides[currentImage].mobile})`,
          backgroundPosition: `${isDesktop ? slides[currentImage].positionDesktop : slides[currentImage].position}`,
          backgroundSize: `${isDesktop ? slides[currentImage].sizeDesktop : slides[currentImage].size}`,
        }}>

        <p className='landing__description tracking-in-contract'>ENTONCES... VAS A COMERME?</p>
        <h1 className='landing__title'>
          <span className='landing__title--span text-focus-in'>#TU</span>
          <span className='landing__title--span text-focus-in'>MALDITA</span>
          <span className='landing__title--span tracking-in-expand-3'>BURGER</span>
        </h1>

        <div className='landing__button-container'>
          <div className='button__container'>
            <button className='first' onClick={() => changeSlide(-1)} aria-label="Imagen anterior">{'<'}</button>
            &nbsp;
            <span className='first__text'>{currentImage + 1}</span>
            /
            <span>{slides.length}</span>
            &nbsp;
            <button className='second' onClick={() => changeSlide(1)} aria-label="Imagen siguiente">{'>'}</button>
          </div>
        </div>
      </section>
      <section>
        <Products />
      </section>
    </main>
  );
};

export default Landing;
