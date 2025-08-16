import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import '../styles/Cart.scss';

const Cart = () => {
  const { cart, removeFromCart, clearCart, costoEnvio, total } = useCart();

  return (
    <div className='cart'>
      <h2>Carrito de Compras</h2>
      {cart.length === 0 ? (
        <p>El carrito está vacío</p>
      ) : (
        <>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                <img className='cart__item--img' src={item.thumbnail} alt={item.name} />
                <strong>{item.name}</strong> - {item.tipo} - ${item.precio} x {item.quantity} = ${item.precio * item.quantity}
                <button onClick={() => removeFromCart(item.id, item.tipo)}>Eliminar</button>

              </li>
            ))}
          </ul>
          <p>Envío: ${costoEnvio}</p>
          <p>Total: ${total + costoEnvio}</p>
          <button onClick={() => clearCart()}>Vaciar carrito</button>
        </>
      )}
    </div>
  );
};

export default Cart;
