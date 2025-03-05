import React from 'react';
import '../styles/landing.scss';
import Button from '../components/Button';

const Landing = () => {
  return (
    <main className='landing'>
      <p className='landing__description'>ENTONCESS... VAS A COMERME?</p>
      <h1 className='landing__title'>
        <span className='landing__title--span'>#TU</span>
        <span className='landing__title--span'>MALDITA</span>
        <span className="landing__title--span">BURGER</span>
      </h1>
      <div className="landing__button-container">
        <Button />
      </div>
    </main>
  );
}

export default Landing;
