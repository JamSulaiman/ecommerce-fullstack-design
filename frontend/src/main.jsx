import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';  // ← Import zaroori hai
import { CartProvider } from './context/CartContext.jsx';  // ← Import zaroori hai
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>          {/* ← Pehle AuthProvider */}
        <CartProvider>        {/* ← Phir CartProvider */}
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);