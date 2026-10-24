import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ShopCollection = ({ type }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const isOffers = type === 'offers';
  const title = isOffers ? 'Hot offers' : 'Gift boxes & gift ideas';

  useEffect(() => {
    let active = true;
    API.get('/products')
      .then(({ data }) => {
        if (active) setProducts(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load products.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const visibleProducts = useMemo(() => (
    isOffers
      ? products.filter((product) => Number(product.oldPrice) > Number(product.price))
      : products
  ), [isOffers, products]);

  const addProduct = (product) => {
    if (user?.isAdmin) return;
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setNotice(`${product.name} added to cart.`);
    window.setTimeout(() => setNotice(''), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6">
          <p className="text-sm text-blue-600 font-semibold mb-2">
            <Link to="/" className="hover:underline">Home</Link> / {title}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">
            {isOffers
              ? 'Browse products with an active original-price discount.'
              : user?.isAdmin ? 'Browse gift ideas and product details.' : 'Browse the store and add gift ideas to your cart.'}
          </p>
          {!isOffers && !user?.isAdmin && (
            <Link to="/projects" className="inline-block mt-4 text-sm text-blue-600 hover:underline">
              Need a bulk or custom gift order? Request a project quote
            </Link>
          )}
        </div>

        {notice && <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-800">{notice}</p>}
        {loading && <p className="py-10 text-center text-gray-500">Loading products…</p>}
        {error && <p role="alert" className="py-10 text-center text-red-600">{error}</p>}
        {!loading && !error && visibleProducts.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center">
            <p className="text-gray-700">There are no discounted products right now.</p>
            <Link to="/products" className="inline-block mt-4 text-blue-600 hover:underline">Browse all products</Link>
          </div>
        )}
        {!loading && !error && visibleProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleProducts.map((product) => {
              const discounted = Number(product.oldPrice) > Number(product.price);
              return (
                <article key={product._id} className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col">
                  <Link to={`/product/${product._id}`} className="block">
                    <div className="h-44 bg-gray-50 rounded-lg flex items-center justify-center">
                      <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <h2 className="font-medium text-gray-900 mt-3 line-clamp-2 min-h-12">{product.name}</h2>
                  </Link>
                  <p className="mt-2 font-bold text-gray-900">
                    ${Number(product.price).toFixed(2)}
                    {discounted && <span className="ml-2 text-sm font-normal text-gray-400 line-through">${Number(product.oldPrice).toFixed(2)}</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                  {!user?.isAdmin && (
                    <button
                      type="button"
                      disabled={product.stock < 1}
                      onClick={() => addProduct(product)}
                      className="mt-auto pt-3"
                    >
                      <span className="block rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                        {product.stock > 0 ? 'Add to cart' : 'Out of stock'}
                      </span>
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopCollection;
