import React from 'react'
import '../styles/button.scss'

const Button = () => {
  return (
    <div className='button__container'>
      <span className='first'>{`<`}</span> &nbsp; <span className='first__text'>1</span> / <span>3</span> &nbsp; <span className='second'>{`>`}</span>
    </div>
  )
}

export default Button