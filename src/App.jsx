import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import Products from './components/Products';
import Landing from './pages/Landing'
import Cart from './pages/Cart';
import Navbar from './components/Navbar';
import { CartProvider } from './context/CartContext';
import { Promos } from './pages/Promos';
import Orders from './pages/Orders'

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <main style={{ paddingTop: '60px' }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/promos" element={<Promos />} />
            <Route path="/pedidos" element={<Orders />} />
          </Routes>
        </main>
      </Router>
    </CartProvider>
  );
};

export default App;
