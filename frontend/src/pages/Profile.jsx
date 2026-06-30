import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    setLoading(true);
    API.get('/users/orders')
      .then(({ data }) => {
        if (mounted) {
          setOrders(data);
          setError('');
        }
      })
      .catch((err) => {
        if (mounted) setError(err.response?.data?.message || 'Could not load orders');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please sign in to view your profile</h2>
          <p className="text-sm text-gray-500 mb-6">You need an account to see your personal details and order history.</p>
          <div className="flex justify-center gap-3">
            <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">Login</Link>
            <Link to="/register" className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <section className="flex-1 bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">My account</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your profile, orders, and settings.</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="rounded-3xl border border-gray-200 p-5 bg-gray-50">
                <h2 className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4">Personal details</h2>
                <p className="text-sm text-gray-700"><span className="font-semibold">Name:</span> {user.name}</p>
                <p className="text-sm text-gray-700 mt-2"><span className="font-semibold">Email:</span> {user.email}</p>
                <p className="text-sm text-gray-700 mt-2"><span className="font-semibold">Status:</span> {user.isAdmin ? 'Admin' : 'Customer'}</p>
              </div>
              <div className="rounded-3xl border border-gray-200 p-5 bg-gray-50">
                <h2 className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4">Account actions</h2>
                <Link to="/cart" className="block text-sm text-blue-600 hover:underline mb-3">View cart</Link>
                <Link to="/products" className="block text-sm text-blue-600 hover:underline mb-3">Browse products</Link>
                <Link to="/profile#orders" className="block text-sm text-blue-600 hover:underline">Go to order history</Link>
              </div>
            </div>

            <div id="orders" className="rounded-3xl bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Order history</h2>
                  <p className="text-sm text-gray-500">All your past orders are listed here.</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500">{orders.length} orders</span>
              </div>

              {loading && <p className="text-sm text-gray-500">Loading orders…</p>}
              {!loading && error && <p className="text-sm text-red-500">{error}</p>}
              {!loading && !error && orders.length === 0 && (
                <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                  No completed orders yet. Start shopping and your order history will appear here.
                </div>
              )}

              {!loading && !error && orders.length > 0 && (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="rounded-3xl border border-gray-200 p-5 hover:shadow-sm transition">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Order ID</p>
                          <p className="text-sm font-semibold text-gray-900">{order._id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Placed</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-sm font-semibold text-gray-900">${order.totalPrice.toFixed(2)}</p>
                        </div>
                        <div className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">Completed</div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {order.orderItems.map((item) => (
                          <div key={`${order._id}-${item.product?._id || item.name}`} className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-3xl object-cover border border-gray-200" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
