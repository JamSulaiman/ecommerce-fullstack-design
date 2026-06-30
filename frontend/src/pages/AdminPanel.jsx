import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products');
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
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
        <h2 className="text-3xl font-bold mb-6">🛠️ Admin Panel</h2>
        
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
          {products.map(p => (
            <div key={p._id} className="border p-4 rounded-lg shadow">
              <img src={p.image} className="w-full h-48 object-fill" />
              <h4 className="font-bold mt-2">{p.name}</h4>
              <p>${p.price}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => {
                  setEditingId(p._id);
                  setName(p.name);
                  setPrice(p.price);
                  setImage(p.image);
                  setDescription(p.description);
                  setCategory(p.category);
                  setStock(p.stock);
                }} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                <button onClick={() => deleteHandler(p._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default AdminPanel;