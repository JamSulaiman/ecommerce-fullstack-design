import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { SAVED_FOR_LATER } from '../data/products';

const Cart = () => {
  const { cart, addToCart, removeFromCart, setQuantity, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // `items` now mirrors the real, persisted cart (localStorage-backed via
  // CartContext) instead of the static CART_ITEMS_SEED mock data. Extra
  // cosmetic fields (size/color/material/seller) aren't part of the real
  // product data, so sensible defaults are used purely for display —
  // none of the markup below needed to change.
  const items = cart.map((i) => ({
    id: i._id,
    name: i.name,
    image: i.image,
    price: i.price,
    qty: i.quantity,
    size: i.size || 'Standard',
    color: i.color || 'Default',
    material: i.material || 'Mixed',
    seller: i.seller || 'Marketplace',
  }));

  const [savedItems, setSavedItems] = useState(SAVED_FOR_LATER);
  const [coupon, setCoupon] = useState('');
  const [toast, setToast] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 5000);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setToast('');
    setTimeout(() => setErrorMessage(''), 7000);
  };

  const updateQty = (id, qty) => {
    setQuantity(id, Math.max(1, qty));
  };

  const removeItem = (id) => {
    removeFromCart(id);
    showToast('Item removed');
  };

  const removeAll = () => {
    clearCart();
    showToast('Cart cleared');
  };

  const saveForLater = (item) => {
    removeFromCart(item.id);
    setSavedItems((prev) => [...prev, { id: item.id, name: item.name, price: item.price, image: item.image }]);
    showToast('Saved for later');
  };

  const moveToCart = (item) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== item.id));
    addToCart({ _id: item.id, name: item.name, price: item.price, image: item.image }, 1);
    showToast('Moved to cart');
  };

  const checkoutHandler = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (items.length === 0) return;
    try {
      const orderItems = cart.map((item) => {
        const productId = item._id || item.id;
        if (!productId) {
          throw new Error('Cart item is missing a valid product ID. Please add the item again from the product list.');
        }
        return {
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          product: productId,
        };
      });
      await API.post('/users/orders', { orderItems, totalPrice: getTotalPrice() });
      clearCart();
      showToast('Order placed successfully!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Checkout failed';
      showError(message);
    }
  };

  const applyCoupon = () => {
    if (!coupon.trim()) { showToast('Enter a coupon code'); return; }
    showToast(`Coupon "${coupon}" applied!`);
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = 60.0;
  const tax = 14.0;
  const total = subtotal - discount + tax;

  return (
    <div className="bg-gray-100 min-h-screen relative">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-[999]">
          {toast}
        </div>
      )}

      {/* Mobile-only top bar with back arrow */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4 sticky top-0 z-30">
        <Link to="/" className="text-2xl text-gray-900">←</Link>
        <h1 className="text-lg font-bold text-gray-900">Shopping cart</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="hidden sm:block text-xl font-bold text-gray-900 mb-4">My cart ({items.length})</h1>
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            <strong className="font-semibold">Error:</strong> {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 mb-4">

          {/* ═══ CART ITEMS ═══ */}
          <div className="bg-white sm:rounded-lg p-4 sm:p-5 -mx-4 sm:mx-0">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-sm mb-4">Your cart is empty</p>
                <Link to="/products" className="text-blue-600 text-sm hover:underline">Continue shopping</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0">
                    {/* Top row: image, info, menu */}
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">{item.name}</p>
                        <p className="text-xs text-gray-400 mb-2">
                          Size: {item.size}, Color: {item.color}
                          <span className="hidden sm:inline">,  Material: {item.material}</span>
                          <br className="sm:hidden" />
                          <span className="sm:inline block sm:mt-0">Seller: {item.seller}</span>
                        </p>

                        {/* Desktop actions */}
                        <div className="hidden sm:flex items-center gap-3">
                          <button onClick={() => removeItem(item.id)} className="text-xs text-red-500 border border-red-200 rounded-md px-3 py-1 hover:bg-red-50 transition">
                            Remove
                          </button>
                          <button onClick={() => saveForLater(item)} className="text-xs text-blue-600 hover:underline">
                            Save for later
                          </button>
                        </div>
                      </div>

                      {/* Desktop price + qty dropdown */}
                      <div className="hidden sm:flex flex-col items-end justify-start gap-2 flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">${(item.price * item.qty).toFixed(2)}</p>
                        <select
                          value={item.qty}
                          onChange={(e) => updateQty(item.id, Number(e.target.value))}
                          className="border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none cursor-pointer"
                        >
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>Qty: {n}</option>
                          ))}
                        </select>
                      </div>

                      {/* Mobile 3-dot menu */}
                      <div className="relative sm:hidden flex-shrink-0">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                          className="text-gray-400 text-lg px-1.5 py-1"
                        >
                          ⋮
                        </button>
                        {openMenuId === item.id && (
                          <div className="absolute right-0 top-7 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20 w-36">
                            <button
                              onClick={() => { saveForLater(item); setOpenMenuId(null); }}
                              className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50"
                            >
                              Save for later
                            </button>
                            <button
                              onClick={() => { removeItem(item.id); setOpenMenuId(null); }}
                              className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile bottom row: stepper + price */}
                    <div className="sm:hidden flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-base"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-base"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-base font-bold text-gray-900">${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <Link to="/products" className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
                ← Back to shop
              </Link>
              {items.length > 0 && (
                <button onClick={removeAll} className="border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-md hover:border-red-400 hover:text-red-500 transition">
                  Remove all
                </button>
              )}
            </div>
          </div>

          {/* ═══ ORDER SUMMARY ═══ */}
          <div className="space-y-3">
            {/* Coupon - desktop/tablet only, mobile keeps it simple like reference */}
            <div className="hidden sm:block bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2.5">Have a coupon?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Add coupon"
                  className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-600 min-w-0"
                />
                <button onClick={applyCoupon} className="bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-medium px-4 py-2 rounded-md flex-shrink-0">
                  Apply
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="space-y-2.5 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 sm:hidden">Items ({items.length}):</span>
                  <span className="text-gray-500 hidden sm:inline">Subtotal:</span>
                  <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between sm:hidden">
                  <span className="text-gray-500">Shipping:</span>
                  <span className="text-gray-900 font-medium">$10.00</span>
                </div>
                <div className="hidden sm:flex justify-between">
                  <span className="text-gray-500">Discount:</span>
                  <span className="text-red-500 font-medium">- ${discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax:</span>
                  <span className="text-gray-900 sm:text-emerald-600 font-medium">+ ${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3 mb-4">
                <span className="text-sm font-semibold text-gray-700">Total:</span>
                <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
              <button onClick={checkoutHandler} className="w-full bg-emerald-500 hover:bg-emerald-600 transition text-white text-sm font-semibold py-3 rounded-md mb-3">
                <span className="sm:hidden">Checkout ({items.length} items)</span>
                <span className="hidden sm:inline">Checkout</span>
              </button>
              <div className="hidden sm:flex items-center justify-center gap-2 text-xl opacity-70">
                <span>💳</span><span>◐</span><span>P</span><span>VISA</span><span></span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TRUST BADGES ═══ */}
        <div className="bg-white rounded-lg p-5 grid grid-cols-1 sm:grid-cols-3 gap-5 mb-4">
          {[
            { icon: '🔒', title: 'Secure payment', sub: 'Have you ever finally just' },
            { icon: '💬', title: 'Customer support', sub: 'Have you ever finally just' },
            { icon: '🚚', title: 'Free delivery', sub: 'Have you ever finally just' },
          ].map((b, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">{b.icon}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                <p className="text-xs text-gray-400">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ SAVED FOR LATER ═══ */}
        {savedItems.length > 0 && (
          <div className="bg-white rounded-lg p-5 mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-4">Saved for later</h3>

            {/* Mobile: row cards */}
            <div className="sm:hidden space-y-3">
              {savedItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 flex gap-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug mb-1 line-clamp-2">{item.name}</p>
                    <p className="text-base font-bold text-gray-900 mb-2">${item.price.toFixed(2)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveToCart(item)}
                        className="text-xs text-blue-600 font-medium border border-blue-200 rounded-md px-3 py-1.5 hover:bg-blue-50 transition"
                      >
                        Move to cart
                      </button>
                      <button
                        onClick={() => setSavedItems((prev) => prev.filter((i) => i.id !== item.id))}
                        className="text-xs text-red-500 font-medium border border-red-200 rounded-md px-3 py-1.5 hover:bg-red-50 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop/tablet: grid cards */}
            <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 gap-4">
              {savedItems.map((item) => (
                <div key={item.id} className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-gray-50">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-gray-900 mb-1">${item.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mb-3 leading-snug line-clamp-2">{item.name}</p>
                    <button
                      onClick={() => moveToCart(item)}
                      className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:underline"
                    >
                      🛒 Move to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ DISCOUNT BANNER ═══ */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg p-6 md:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="text-white text-center sm:text-left">
            <h3 className="text-lg md:text-xl font-bold mb-1">Super discount on more than 100 USD</h3>
            <p className="text-sm text-blue-100">Have you ever finally just write dummy info</p>
          </div>
          <Link to="/products" className="bg-orange-500 hover:bg-orange-600 transition text-white text-sm font-semibold px-6 py-2.5 rounded-md flex-shrink-0">
            Shop now
          </Link>
        </div>

        {/* ═══ FOOTER ═══ */}
        <footer className="bg-white rounded-lg pt-8 pb-5 px-5 md:px-8">
          <div className="flex flex-col md:flex-row gap-8 mb-6">
            <div className="w-full md:w-[190px] flex-shrink-0">
              <p className="text-lg font-bold text-blue-600 mb-3">📦 Brand</p>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Best information about the company goes here but now lorem ipsum is
              </p>
              <div className="flex gap-2">
                {['f', '🐦', 'in', '📷', '▶'].map((icon, i) => (
                  <span key={i} className="w-7 h-7 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-full flex items-center justify-center text-xs cursor-pointer transition">
                    {icon}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-5">
              <div>
                <h4 className="text-sm font-bold mb-3">About</h4>
                {['About Us', 'Find store', 'Categories', 'Blogs'].map((l) => (
                  <a key={l} href="#" className="block text-xs text-gray-500 hover:text-blue-600 mb-2">{l}</a>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-bold mb-3">Information</h4>
                {['Help Center', 'Money Refund', 'Shipping', 'Contact us'].map((l) => (
                  <a key={l} href="#" className="block text-xs text-gray-500 hover:text-blue-600 mb-2">{l}</a>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-bold mb-3">For users</h4>
                {['Login', 'Register', 'Settings', 'My Orders'].map((l) => (
                  <a key={l} href="#" className="block text-xs text-gray-500 hover:text-blue-600 mb-2">{l}</a>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-bold mb-3">Get app</h4>
                <div className="flex flex-col gap-2">
                  <button className="bg-gray-900 text-white text-[11px] rounded-md px-3 py-1.5 hover:bg-blue-600 transition">📱 App Store</button>
                  <button className="bg-gray-900 text-white text-[11px] rounded-md px-3 py-1.5 hover:bg-blue-600 transition">▶ Google Play</button>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
            <p>© 2023 Ecommerce.</p>
            <p>🇬🇧 English</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Cart;
