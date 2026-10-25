import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, viewType = 'grid' }) => {
  const { user } = useAuth();
  const rating = product.ratingCount ? product.rating : 0;
  const ratingCount = product.ratingCount || 0;
  const stock = product.stock || 0;
  const stockLabel = stock > 0 ? (user?.isAdmin ? `${stock} in stock` : 'In stock') : 'Out of stock';

  if (viewType === 'list') {
    return (
      <div className="bg-white border rounded-lg p-4 flex gap-4 hover:shadow-sm transition-shadow">
        <img src={product.image} alt={product.name} className="w-32 h-32 object-contain flex-shrink-0" />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h4 className="font-semibold text-gray-800 text-base">{product.name}</h4>
            <p className="text-xl font-bold text-gray-900 mt-1">${product.price}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-amber-500">
              <span>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
              <span className="text-gray-400 text-xs">{ratingCount ? `${rating.toFixed(1)} (${ratingCount} reviews)` : 'No ratings yet'}</span>
            </div>
            <p className={`mt-1 text-xs ${stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{stockLabel}</p>
            <p className="text-gray-500 text-xs mt-2 hidden md:block line-clamp-2">{product.description}</p>
          </div>
          <button className="text-blue-600 font-medium text-xs self-start mt-2">View details</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-3 flex flex-col justify-between hover:shadow-sm transition-shadow relative">
      <span className="absolute top-3 right-3 text-gray-400 cursor-pointer border p-1 rounded-md bg-white hover:text-red-500">🧡</span>
      <div className="w-full h-40 flex items-center justify-center p-2">
        <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="mt-2 border-t pt-2">
        <p className="text-base font-bold text-gray-900">${product.price}</p>
        <div className="text-xs text-amber-500 my-1">
          {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
          <span className="text-gray-400 ml-1">{ratingCount ? `${rating.toFixed(1)} (${ratingCount})` : 'No ratings yet'}</span>
        </div>
        <p className={`mb-1 text-xs ${stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{stockLabel}</p>
        <h4 className="text-xs text-gray-600 line-clamp-2 min-h-[2rem]">{product.name}</h4>
      </div>
    </div>
  );
};

export default ProductCard;