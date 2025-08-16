import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import products from '../mocks/products.json';
import '../styles/products.scss';

const Products = () => {
  const { addToCart } = useCart();

  return (
    <div className="products__container">
    {products.map(({ id, name, thumbnail, description, price }, index) => (
      <div key={index} id={id} className="products__card products__card--dark">
        <div className="products__card__tag">Nuevo</div>
        <img src={thumbnail} alt={name} className="products__card__image" />
        <div className="products__card__info">
          <div className="products__card__info-header">
            <h2 className="products__card__info-header-title">{name}</h2>
          </div>
          <p>{description}</p>
        </div>
        <div className="products__card__footer">
          {price.map((item, idx) => {
            const tipo = Object.keys(item)[0];
            const valor = item[tipo];
            return (
              <div key={idx} className="products__card__footer-row">
                <span className="products__card__footer-price">${valor} ARS</span>
                <button
                  className="products__card__footer-btn"
                  onClick={() =>
                    addToCart({
                      id,
                      name,
                      thumbnail,
                      description,
                      tipo,
                      precio: valor,
                    })
                  }
                >
                  Comprar🛒
                </button>
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>

  );
};

export default Products;
