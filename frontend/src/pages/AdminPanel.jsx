import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'customers' && user?.isAdmin) {
      fetchCustomersAndOrders();
    }
  }, [activeTab, user]);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products');
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersAndOrders = async () => {
    setCustomerLoading(true);
    try {
      const [usersRes, ordersRes] = await Promise.all([
        API.get('/users/admin/customers'),
        API.get('/users/admin/orders'),
      ]);
      setCustomers(usersRes.data);
      setCustomerOrders(ordersRes.data);
      setCustomerError('');
    } catch (error) {
      console.error(error);
      setCustomerError('Could not load customer data');
    } finally {
      setCustomerLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setImage('');
    setDescription('');
    setCategory('');
    setStock('');
  };

  const getOrderCountForUser = (userId) => {
    return customerOrders.filter((order) => order.user?._id === userId).length;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const productData = { name, price: Number(price), image, description, category, stock: Number(stock) };
    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, productData);
      } else {
        await API.post('/products', productData);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      alert('Error saving product');
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Delete this product?')) {
      await API.delete(`/products/${id}`);
      fetchProducts();
    }
  };

  if (loading) return <div className="text-center py-20 text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold">🛠️ Admin Panel</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'customers' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Customers
            </button>
          </div>
        </div>

        {activeTab === 'products' ? (
          <>
            <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <input placeholder="Name" className="p-2 border rounded" value={name} onChange={(e) => setName(e.target.value)} required />
              <input placeholder="Price" type="number" className="p-2 border rounded" value={price} onChange={(e) => setPrice(e.target.value)} required />
              <input placeholder="Image URL" className="p-2 border rounded" value={image} onChange={(e) => setImage(e.target.value)} required />
              <input placeholder="Category" className="p-2 border rounded" value={category} onChange={(e) => setCategory(e.target.value)} required />
              <input placeholder="Stock" type="number" className="p-2 border rounded" value={stock} onChange={(e) => setStock(e.target.value)} required />
              <textarea placeholder="Description" className="p-2 border rounded col-span-2" value={description} onChange={(e) => setDescription(e.target.value)} required />
              <div className="col-span-2 flex gap-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
                {editingId && <button onClick={resetForm} className="bg-gray-400 text-white px-6 py-2 rounded-lg">Cancel</button>}
              </div>
            </form>

            <h3 className="text-xl font-bold mb-4">All Products ({products.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p._id} className="border p-4 rounded-lg shadow">
                  <img src={p.image} className="w-full h-48 object-fill" alt={p.name} />
                  <h4 className="font-bold mt-2">{p.name}</h4>
                  <p>${p.price}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingId(p._id);
                        setName(p.name);
                        setPrice(p.price);
                        setImage(p.image);
                        setDescription(p.description);
                        setCategory(p.category);
                        setStock(p.stock);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteHandler(p._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-6 mb-8 md:grid-cols-2">
              <div className="rounded-3xl border border-gray-200 bg-blue-50 p-6">
                <h3 className="text-xl font-semibold text-gray-900">Customer dashboard</h3>
                <p className="text-sm text-gray-600 mt-2">View all customers and all orders placed by users.</p>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">Customers</p>
                <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
                <p className="text-sm text-gray-500 mt-2">Total registered users</p>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">Orders</p>
                <p className="text-3xl font-bold text-gray-900">{customerOrders.length}</p>
                <p className="text-sm text-gray-500 mt-2">Total customer orders</p>
              </div>
            </div>

            {customerLoading && <p className="text-sm text-gray-500">Loading customer data...</p>}
            {customerError && <p className="text-sm text-red-500">{customerError}</p>}

            {!customerLoading && !customerError && (
              <div className="space-y-8">
                <section className="rounded-3xl border border-gray-200 bg-white p-6">
                  <h3 className="text-xl font-semibold mb-4">Customers</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {customers.map((cust) => (
                      <div key={cust._id} className="rounded-3xl border border-gray-200 p-4 bg-gray-50">
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-semibold text-gray-900">{cust.name}</p>
                        <p className="text-sm text-gray-500 mt-2">Email</p>
                        <p className="text-sm text-gray-700">{cust.email}</p>
                        <p className="text-sm text-gray-500 mt-2">User ID</p>
                        <p className="text-xs text-gray-500 break-all">{cust._id}</p>
                        <p className="text-sm text-gray-500 mt-2">Registered</p>
                        <p className="text-sm text-gray-700">{new Date(cust.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500 mt-2">Role</p>
                        <p className="text-sm text-gray-700">{cust.isAdmin ? 'Admin' : 'Customer'}</p>
                        <p className="text-sm text-gray-500 mt-2">Orders</p>
                        <p className="text-sm text-gray-700">{getOrderCountForUser(cust._id)}</p>
                        <p className="text-xs text-gray-400 mt-3">Password is not shown for security.</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-gray-200 bg-white p-6">
                  <h3 className="text-xl font-semibold mb-4">Customer orders</h3>
                  {customerOrders.length === 0 ? (
                    <p className="text-sm text-gray-500">No customer orders yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {customerOrders.map((order) => (
                        <div key={order._id} className="rounded-3xl border border-gray-200 p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-3">
                            <div>
                              <p className="text-sm text-gray-500">Order ID</p>
                              <p className="font-semibold text-gray-900">{order._id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Customer</p>
                              <p className="font-semibold text-gray-900">{order.user?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{order.user?.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="font-semibold text-gray-900">${order.totalPrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Placed</p>
                              <p className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            {order.orderItems.map((item) => (
                              <div key={`${order._id}-${item.product?._id || item.name}`} className="flex items-center gap-3">
                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-3xl object-cover border border-gray-200" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                                  <p className="text-xs text-gray-500">${item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
