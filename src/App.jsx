import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import Products from './components/Products';
import Landing from './pages/Landing'
import Cart from './pages/Cart';
import Navbar from './components/Navbar';
import { CartProvider } from './context/CartContext';
import { Promos } from './pages/Promos';
import Orders from './pages/Orders'
import { AdminProvider } from './context/AdminContext';
import ProtectedRoute from './components/ProtectecRoute.jsx';
import AdminLogin from './pages/AdminLogin.jsx';

const App = () => {
  return (
    <CartProvider>
      <AdminProvider>
        <Router>
          <Navbar />
          <main style={{ paddingTop: '60px' }}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/promos" element={<Promos />} />
              <Route path="/pedidos" element={<Orders />} />

              <Route path="/admin" element={<AdminLogin />} />

              {/* Ruta protegida: solo admin */}
              <Route
                path="/pedidos"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </Router>
      </AdminProvider>
    </CartProvider>
  );
};

export default App;
