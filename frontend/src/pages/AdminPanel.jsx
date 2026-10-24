import React, { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const NEXT_ACTIONS = {
  pending: [
    { to: 'confirmed', label: 'Confirm order', className: 'bg-blue-600 hover:bg-blue-700' },
    { to: 'cancelled', label: 'Cancel', className: 'bg-red-500 hover:bg-red-600' },
  ],
  confirmed: [
    { to: 'shipped', label: 'Mark as shipped', className: 'bg-indigo-600 hover:bg-indigo-700' },
    { to: 'cancelled', label: 'Cancel', className: 'bg-red-500 hover:bg-red-600' },
  ],
  shipped: [{ to: 'delivered', label: 'Mark as delivered', className: 'bg-emerald-600 hover:bg-emerald-700' }],
  delivered: [],
  cancelled: [],
};
const STATUS_BADGE = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const requestedTab = searchParams.get('tab');
    return ['customers', 'projects', 'messages'].includes(requestedTab) ? requestedTab : 'products';
  });
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [saleDurationHours, setSaleDurationHours] = useState('48');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all');

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    if (activeTab === 'customers') fetchCustomers();
    if (activeTab === 'projects' || activeTab === 'messages') fetchInquiries(activeTab);
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

  const fetchCustomers = async () => {
    setCustomerLoading(true);
    try {
      const [usersResponse, ordersResponse] = await Promise.all([
        API.get('/users/admin/customers'),
        API.get('/users/admin/orders'),
      ]);
      setCustomers(usersResponse.data);
      setCustomerOrders(ordersResponse.data);
      setCustomerError('');
    } catch (error) {
      console.error(error);
      setCustomerError('Could not load customer data');
    } finally {
      setCustomerLoading(false);
    }
  };

  const updateOrderStatus = async (order, status) => {
    const confirmation = status === 'cancelled'
      ? 'Cancel this customer order? Stock will be restored and the customer will be emailed.'
      : `Mark this customer order as "${status}"? The customer will be emailed.`;
    if (!window.confirm(confirmation)) return;

    setUpdatingId(order._id);
    try {
      const { data } = await API.put(`/users/admin/orders/${order._id}/status`, { status });
      setCustomerOrders((current) => current.map((item) => (
        item._id === order._id ? { ...item, ...data.order } : item
      )));
      if (!data.emailSent) {
        alert(`Order updated, but the email could not be sent: ${data.emailMessage || 'check the backend configuration and logs.'}`);
      } else if (data.emailTestMode) {
        alert('Order updated and test email accepted by Resend for delivery to RESEND_TEST_TO.');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Could not update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchInquiries = async (type) => {
    setCustomerLoading(true);
    try {
      const inquiryType = type === 'messages' ? 'support' : 'project';
      const { data } = await API.get(`/users/admin/inquiries?type=${inquiryType}`);
      setInquiries(data);
      setCustomerError('');
    } catch (error) {
      console.error(error);
      setCustomerError(`Could not load ${type === 'messages' ? 'customer messages' : 'project requests'}`);
    } finally {
      setCustomerLoading(false);
    }
  };

  const deleteInquiry = async (inquiry) => {
    setUpdatingId(inquiry._id);
    try {
      await API.delete(`/users/admin/inquiries/${inquiry._id}`);
      setInquiries((current) => current.filter((item) => item._id !== inquiry._id));
    } catch (error) {
      alert(error.response?.data?.message || 'Could not delete message or project request');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteCustomer = async (customer) => {
    if (!window.confirm(`Delete customer account for ${customer.name} (${customer.email})? Order records will be retained.`)) return;
    setUpdatingId(customer._id);
    try {
      await API.delete(`/users/admin/customers/${customer._id}`);
      setCustomers((current) => current.filter((item) => item._id !== customer._id));
    } catch (error) {
      alert(error.response?.data?.message || 'Could not delete customer account');
    } finally {
      setUpdatingId(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setSalePrice('');
    setSaleDurationHours('48');
    setImage('');
    setDescription('');
    setCategory('');
    setBrand('');
    setStock('');
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    const regularPrice = Number(price);
    const discountedPrice = salePrice === '' ? null : Number(salePrice);
    if (discountedPrice !== null && discountedPrice >= regularPrice) {
      alert('Sale price must be lower than the regular price.');
      return;
    }
    if (
      discountedPrice !== null
      && (!Number.isInteger(Number(saleDurationHours)) || Number(saleDurationHours) < 1 || Number(saleDurationHours) > 720)
    ) {
      alert('Sale duration must be between 1 and 720 hours.');
      return;
    }
    const productData = {
      name,
      price: discountedPrice ?? regularPrice,
      oldPrice: discountedPrice === null ? null : regularPrice,
      saleDurationHours: discountedPrice === null ? null : Number(saleDurationHours),
      image,
      description,
      category,
      brand: brand.trim(),
      stock: Number(stock),
    };
    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, productData);
      } else {
        await API.post('/products', productData);
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Could not save product');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Could not delete product');
    }
  };

  if (loading) return <div className="text-center py-20 text-xl">Loading...</div>;

  const selectTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const isMessages = activeTab === 'messages';
  const filteredCustomerOrders = customerOrders.filter((order) => (
    orderFilter === 'all' || (order.status || 'pending') === orderFilter
  ));

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold">🛠️ Admin Panel</h2>
          <div className="flex flex-wrap gap-2">
            {[
              ['products', 'Products'],
              ['customers', 'Customers'],
              ['projects', 'Project requests'],
              ['messages', 'Customer messages'],
            ].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => selectTab(tab)}
                className={`px-4 py-2 rounded-lg ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'products' ? (
          <>
            <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <input placeholder="Name" className="p-2 border rounded" value={name} onChange={(event) => setName(event.target.value)} required />
              <input placeholder="Regular price" type="number" min="0.01" step="0.01" className="p-2 border rounded" value={price} onChange={(event) => setPrice(event.target.value)} required />
              <input placeholder="Sale price (optional)" type="number" min="0.01" step="0.01" className="p-2 border rounded" value={salePrice} onChange={(event) => setSalePrice(event.target.value)} />
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                Sale duration (hours)
                <input
                  type="number"
                  min="1"
                  max="720"
                  step="1"
                  className="p-2 border rounded text-gray-900"
                  value={saleDurationHours}
                  onChange={(event) => setSaleDurationHours(event.target.value)}
                  disabled={!salePrice}
                  required={Boolean(salePrice)}
                />
              </label>
              <p className="self-center text-xs text-gray-500">
                Starts when you save. Default is 48 hours (2 days); maximum is 30 days.
              </p>
              <input placeholder="Image URL" className="p-2 border rounded" value={image} onChange={(event) => setImage(event.target.value)} required />
              <input placeholder="Category" className="p-2 border rounded" value={category} onChange={(event) => setCategory(event.target.value)} required />
              <input placeholder="Brand (optional)" className="p-2 border rounded" value={brand} onChange={(event) => setBrand(event.target.value)} />
              <input placeholder="Stock quantity" type="number" min="0" step="1" className="p-2 border rounded" value={stock} onChange={(event) => setStock(event.target.value)} required />
              <textarea placeholder="Description" className="p-2 border rounded col-span-2" value={description} onChange={(event) => setDescription(event.target.value)} required />
              <div className="col-span-2 flex gap-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
                {editingId && <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-6 py-2 rounded-lg">Cancel</button>}
              </div>
            </form>
            <h3 className="text-xl font-bold mb-4">All Products ({products.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product._id} className="border p-4 rounded-lg shadow">
                  <img src={product.image} className="w-full h-48 object-fill" alt={product.name} />
                  <h4 className="font-bold mt-2">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.brand || 'Brand not set'}</p>
                  <p className="font-semibold text-gray-900">
                    ${Number(product.price).toFixed(2)}
                    {product.oldPrice > product.price && (
                      <span className="ml-2 text-sm font-normal text-gray-400 line-through">${Number(product.oldPrice).toFixed(2)}</span>
                    )}
                  </p>
                  {product.oldPrice > product.price && (
                    <p className="text-sm font-medium text-emerald-700">
                      Sale: {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% off
                      {product.saleEndsAt && ` · ends ${new Date(product.saleEndsAt).toLocaleString()}`}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-600">Inventory: {product.stock} in stock</p>
                  <p className="text-sm text-gray-600">
                    Customer rating: {product.ratingCount ? `${product.rating.toFixed(1)} / 5 (${product.ratingCount})` : 'No ratings yet'}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingId(product._id);
                        setName(product.name);
                        setPrice(product.oldPrice > product.price ? product.oldPrice : product.price);
                        setSalePrice(product.oldPrice > product.price ? product.price : '');
                        setSaleDurationHours(
                          product.saleActive && product.saleEndsAt
                            ? String(Math.max(1, Math.ceil((new Date(product.saleEndsAt).getTime() - Date.now()) / 3600000)))
                            : '48'
                        );
                        setImage(product.image);
                        setDescription(product.description);
                        setCategory(product.category);
                        setBrand(product.brand || '');
                        setStock(product.stock);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteProduct(product._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : activeTab === 'customers' ? (
          <section className="rounded-3xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-semibold">Registered customers ({customers.length})</h3>
            <p className="text-sm text-gray-500 mt-1 mb-5">Manage customer accounts and customer orders. Admin accounts and their orders are excluded.</p>
            {customerLoading && <p className="text-sm text-gray-500">Loading customers...</p>}
            {customerError && <p role="alert" className="text-sm text-red-600">{customerError}</p>}
            {!customerLoading && !customerError && customers.length === 0 && (
              <p className="text-sm text-gray-500">No registered customers.</p>
            )}
            {!customerLoading && !customerError && customers.length > 0 && (
              <div className="space-y-3">
                {customers.map((customer) => (
                  <div key={customer._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Registered {new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      type="button"
                      disabled={updatingId === customer._id}
                      onClick={() => deleteCustomer(customer)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {updatingId === customer._id ? 'Deleting…' : 'Delete customer'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {!customerLoading && !customerError && (
              <section className="mt-8 border-t border-gray-200 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Customer orders ({customerOrders.length})</h3>
                    <p className="text-sm text-gray-500 mt-1">Registered customers only. Delivered/cancelled orders are removed after 24 hours.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setOrderFilter(status)}
                        className={`rounded-full px-3 py-1 text-xs capitalize ${orderFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                {filteredCustomerOrders.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                    No {orderFilter === 'all' ? 'customer orders' : `${orderFilter} orders`}.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {customers.map((customer) => {
                      const ordersForCustomer = filteredCustomerOrders.filter((order) => order.user?._id === customer._id);
                      if (ordersForCustomer.length === 0) return null;
                      return (
                        <section key={customer._id} className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600">
                              {ordersForCustomer.length} {ordersForCustomer.length === 1 ? 'order' : 'orders'}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {ordersForCustomer.map((order) => (
                        <article key={order._id} className="rounded-2xl border border-gray-200 p-4">
                          <div className="flex flex-wrap justify-between gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Order ID</p>
                              <p className="text-sm font-semibold text-gray-900 break-all">{order._id}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Placed</p>
                              <p className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Total</p>
                              <p className="text-sm font-semibold text-gray-900">${Number(order.totalPrice).toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {(order.orderItems || []).map((item, index) => (
                              <div key={`${order._id}-${item.product?._id || item.name}-${index}`} className="flex items-center gap-3">
                                <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg border border-gray-200 object-cover" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.qty} · ${item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {order.shippingAddress?.address && (
                            <p className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                              <span className="font-semibold">Ship to:</span> {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode} · {order.shippingAddress.phone}
                            </p>
                          )}
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_BADGE[order.status || 'pending'] || STATUS_BADGE.pending}`}>
                              {order.status || 'pending'}
                            </span>
                            {['delivered', 'cancelled'].includes(order.status) && order.terminalAt && (
                              <span className="text-xs text-gray-500">
                                Removed {new Date(new Date(order.terminalAt).getTime() + 86400000).toLocaleString()}
                              </span>
                            )}
                            {(NEXT_ACTIONS[order.status || 'pending'] || []).map((action) => (
                              <button
                                key={action.to}
                                type="button"
                                disabled={updatingId === order._id}
                                onClick={() => updateOrderStatus(order, action.to)}
                                className={`${action.className} rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-60`}
                              >
                                {updatingId === order._id ? 'Updating…' : action.label}
                              </button>
                            ))}
                          </div>
                        </article>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </section>
        ) : (
          <section>
            <h3 className="text-xl font-semibold text-gray-900">{isMessages ? 'Customer messages' : 'Project requests'}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-5">
              {isMessages
                ? 'Support messages submitted through the Contact page. Marking a message as read deletes it.'
                : 'Custom and bulk-order requests submitted through the Projects page. Marking a request as read deletes it.'}
            </p>
            {customerLoading && <p className="text-sm text-gray-500">Loading {isMessages ? 'customer messages' : 'project requests'}…</p>}
            {customerError && <p role="alert" className="text-sm text-red-600">{customerError}</p>}
            {!customerLoading && !customerError && inquiries.length === 0 && (
              <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                No {isMessages ? 'customer messages' : 'project requests'} have been submitted.
              </p>
            )}
            {!customerLoading && !customerError && inquiries.length > 0 && (
              <div className="space-y-4 mt-5">
                {inquiries.map((inquiry) => (
                  <article key={inquiry._id} className="rounded-2xl border border-gray-200 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{isMessages ? 'Support message' : inquiry.item}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {inquiry.name} · <a className="text-blue-600 hover:underline" href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                        </p>
                        {!isMessages && <p className="text-sm text-gray-600 mt-1">Quantity: {inquiry.quantity} {inquiry.quantityUnit || 'Pcs'}</p>}
                        <p className="text-sm text-gray-600 mt-1">Submitted {new Date(inquiry.createdAt).toLocaleString()}</p>
                      </div>
                      <button
                        type="button"
                        disabled={updatingId === inquiry._id}
                        onClick={() => deleteInquiry(inquiry)}
                        className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 disabled:opacity-60"
                      >
                        {updatingId === inquiry._id ? 'Deleting…' : 'Mark as read'}
                      </button>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{inquiry.details}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
