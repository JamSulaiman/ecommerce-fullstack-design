import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { MAIN_PRODUCT, YOU_MAY_LIKE, RELATED_PRODUCTS } from '../data/products';
import API from '../api';

const Star = ({ filled }) => (
  <span className={filled ? 'text-amber-400' : 'text-gray-300'}>★</span>
);

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState('Description');
  const [toast, setToast] = useState('');
  const [liveProduct, setLiveProduct] = useState(null);

  // Pull the actual selected product from the backend (MongoDB) and merge
  // it into the static design template. Layout/markup below is untouched —
  // only the real name/price/image/description/rating now come from the DB.
  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setActiveImg(0);
    API.get(`/products/${id}`)
      .then(({ data }) => { if (isMounted) setLiveProduct(data); })
      .catch(() => { if (isMounted) setLiveProduct(null); });
    return () => { isMounted = false; };
  }, [id]);

  const p = liveProduct
    ? {
        ...MAIN_PRODUCT,
        id: liveProduct._id,
        name: liveProduct.name,
        images: [liveProduct.image],
        description: liveProduct.description,
        rating: liveProduct.rating ?? MAIN_PRODUCT.rating,
        ratingNum: liveProduct.ratingNum ?? MAIN_PRODUCT.ratingNum,
        inStock: liveProduct.stock > 0,
        breadcrumb: ['Home', liveProduct.category || 'Products', liveProduct.name],
        pricing: [
          { price: `$${liveProduct.price.toFixed(2)}`, range: 'Per unit' },
          ...MAIN_PRODUCT.pricing.slice(1),
        ],
      }
    : MAIN_PRODUCT;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const handleAddToCart = () => {
    addToCart({ _id: p.id, name: p.name, price: liveProduct ? liveProduct.price : 98, image: p.images[0] }, 1);
    showToast('Added to cart!');
  };

  return (
    <div className="bg-gray-100 min-h-screen relative">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-[999]">
          {toast}
        </div>
      )}

      {/* Mobile-only top bar */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-30">
        <Link to="/products" className="text-2xl text-gray-900">←</Link>
        <div className="flex items-center gap-5">
          <Link to="/cart" className="text-xl text-gray-700">🛒</Link>
          <button className="text-xl text-gray-700">👤</button>
        </div>
      </div>

      {/* ═══════════ MOBILE LAYOUT ═══════════ */}
      <div className="sm:hidden">
        {/* Image carousel */}
        <div className="relative bg-gray-50 aspect-square">
          <img src={p.images[activeImg]} alt={p.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-3 right-3 flex gap-1.5 bg-black/30 rounded-full px-2 py-1.5">
            <button
              onClick={() => setActiveImg((activeImg - 1 + p.images.length) % p.images.length)}
              className="w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center text-sm"
            >
              ←
            </button>
            <button
              onClick={() => setActiveImg((activeImg + 1) % p.images.length)}
              className="w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center text-sm"
            >
              →
            </button>
          </div>
        </div>

        <div className="bg-white px-4 py-4">
          {/* Rating row */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span className="text-amber-400 text-sm">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} filled={i < p.rating} />)}
            </span>
            <span>•</span>
            <span>💬 {p.reviews} reviews</span>
            <span>•</span>
            <span>🛍 {p.sold} sold</span>
          </div>

          <h1 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{p.name}</h1>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-orange-500">{p.pricing[0].price}</span>
            <span className="text-sm text-gray-400">({p.pricing[0].range})</span>
          </div>

          <div className="flex items-center gap-2.5 mb-5">
            <button onClick={handleAddToCart} className="flex-1 bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-semibold py-3 rounded-md">
              Send inquiry
            </button>
            <button onClick={() => showToast('Saved!')} className="w-12 h-12 flex-shrink-0 border border-gray-200 rounded-md flex items-center justify-center text-blue-500 text-lg">
              ♡
            </button>
          </div>

          {/* Specs */}
          <div className="divide-y divide-gray-100 text-sm mb-4">
            {p.specs.slice(1, 5).map((s, idx) => (
              <div key={idx} className="flex py-2.5">
                <span className="w-28 flex-shrink-0 text-gray-400">{s.label === 'Material' ? 'Material' : s.label}</span>
                <span className="text-gray-800">{s.value}</span>
              </div>
            ))}
            <div className="flex py-2.5">
              <span className="w-28 flex-shrink-0 text-gray-400">Item num</span>
              <span className="text-gray-800">{p.tableSpecs[0].value.replace('#', '')}</span>
            </div>
          </div>

          {/* Description with Read more */}
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            {p.description.slice(0, 150)}...
          </p>
          <button onClick={() => setTab('Description')} className="text-sm text-blue-600 font-medium mb-5">
            Read more
          </button>

          {/* Supplier card compact */}
          <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded flex items-center justify-center font-bold text-sm flex-shrink-0">
              {p.supplier.initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400">Supplier</p>
              <p className="text-sm font-semibold text-gray-900">{p.supplier.name}</p>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </div>
          <div className="flex items-center gap-4 -mt-3 mb-6 text-xs text-gray-500">
            <span className="flex items-center gap-1">🇩🇪 Germany</span>
            <span className="flex items-center gap-1">🛡 Verified</span>
            <span className="flex items-center gap-1">🌐 Shipping</span>
          </div>

          {/* Similar products horizontal scroll */}
          <h3 className="text-base font-bold text-gray-900 mb-3">Similar products</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
            {RELATED_PRODUCTS.map((item) => (
              <Link to="/product/1" key={item.id} className="bg-white border border-gray-100 rounded-lg p-2.5 w-32 flex-shrink-0">
                <div className="w-full aspect-square bg-gray-50 rounded-md overflow-hidden mb-2">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-bold text-gray-900">$10.30</p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-2">T-shirts with multiple colors, for men</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ DESKTOP / TABLET LAYOUT ═══════════ */}
      <div className="hidden sm:block max-w-7xl mx-auto px-4 py-4">

        {/* Breadcrumb */}
        <div className="text-xs text-gray-400 mb-4 flex items-center gap-1.5 flex-wrap">
          {p.breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>›</span>}
              <span className={i === p.breadcrumb.length - 1 ? 'text-gray-400' : 'hover:text-blue-600 cursor-pointer'}>{b}</span>
            </React.Fragment>
          ))}
        </div>

        {/* ═══ TOP: gallery + info + supplier ═══ */}
        <div className="bg-white rounded-lg p-5 md:p-6 grid grid-cols-1 lg:grid-cols-[1fr_1.3fr_280px] gap-6 mb-3">

          {/* Gallery */}
          <div>
            <div className="bg-gray-50 rounded-lg overflow-hidden mb-3 aspect-square flex items-center justify-center">
              <img src={p.images[activeImg]} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-6 gap-2">
              {p.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`aspect-square rounded-md overflow-hidden border-2 ${activeImg === idx ? 'border-blue-600' : 'border-gray-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-emerald-600 text-xs font-medium flex items-center gap-1 mb-2">✓ In stock</p>
            <h1 className="text-xl font-bold text-gray-900 mb-2 leading-snug">{p.name}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <span className="text-amber-400 text-sm">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} filled={i < p.rating} />)}
              </span>
              <span className="text-amber-500 font-medium">{p.ratingNum}</span>
              <span>•</span>
              <span>💬 {p.reviews} reviews</span>
              <span>•</span>
              <span>🛍 {p.sold} sold</span>
            </div>

            <div className="bg-orange-50 rounded-lg grid grid-cols-3 divide-x divide-orange-100 p-4 mb-5">
              {p.pricing.map((pr, idx) => (
                <div key={idx} className={idx === 0 ? 'pr-3' : 'px-3'}>
                  <p className={`font-bold ${idx === 0 ? 'text-orange-500 text-lg' : 'text-gray-900 text-base'}`}>{pr.price}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{pr.range}</p>
                </div>
              ))}
            </div>

            <div className="divide-y divide-gray-100 text-sm">
              {p.specs.map((s, idx) => (
                <div key={idx} className="flex py-2.5">
                  <span className="w-32 flex-shrink-0 text-gray-400">{s.label}:</span>
                  <span className="text-gray-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier card */}
          <div>
            <div className="border border-gray-200 rounded-lg p-4 mb-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {p.supplier.initial}
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Supplier</p>
                  <p className="text-sm font-semibold text-gray-900">{p.supplier.name}</p>
                </div>
              </div>
              <div className="space-y-2.5 text-xs text-gray-600 mb-4">
                <p className="flex items-center gap-1.5">🇩🇪 {p.supplier.location}</p>
                <p className="flex items-center gap-1.5 text-gray-500">🛡 Verified Seller</p>
                <p className="flex items-center gap-1.5 text-gray-500">🌐 Worldwide shipping</p>
              </div>
              <button onClick={handleAddToCart} className="w-full bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-medium py-2.5 rounded-md mb-2">
                Send inquiry
              </button>
              <button className="w-full border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-md hover:border-blue-600 hover:text-blue-600 transition">
                Seller's profile
              </button>
            </div>
            <button onClick={() => showToast('Saved for later!')} className="flex items-center gap-1.5 text-blue-600 text-sm hover:underline">
              ♡ Save for later
            </button>
          </div>
        </div>

        {/* ═══ TABS + YOU MAY LIKE ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3 mb-3">

          {/* Tabs panel */}
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-200 px-5">
              {['Description', 'Reviews', 'Shipping', 'About seller'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3.5 text-sm font-medium border-b-2 transition ${
                    tab === t ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="p-5 md:p-6">
              {tab === 'Description' && (
                <>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-6">{p.description}</p>

                  <div className="border border-gray-200 rounded-md overflow-hidden mb-6">
                    {p.tableSpecs.map((row, idx) => (
                      <div key={idx} className={`flex text-sm ${idx !== p.tableSpecs.length - 1 ? 'border-b border-gray-200' : ''}`}>
                        <div className="w-40 flex-shrink-0 bg-gray-50 px-4 py-2.5 text-gray-500">{row.label}</div>
                        <div className="flex-1 px-4 py-2.5 text-gray-800 border-l border-gray-200">{row.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5">
                    {p.features.map((f, idx) => (
                      <p key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-gray-400">✓</span> {f}
                      </p>
                    ))}
                  </div>
                </>
              )}
              {tab === 'Reviews' && <p className="text-sm text-gray-500">No reviews loaded yet — check back soon.</p>}
              {tab === 'Shipping' && <p className="text-sm text-gray-500">Worldwide shipping available. Contact the seller for rates to your region.</p>}
              {tab === 'About seller' && <p className="text-sm text-gray-500">{p.supplier.name} is a verified seller based in {p.supplier.location}.</p>}
            </div>
          </div>

          {/* You may like */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3.5">You may like</h3>
            <div className="space-y-3.5">
              {YOU_MAY_LIKE.map((item) => (
                <Link to="/product/1" key={item.id} className="flex gap-3 items-start group">
                  <div className="w-14 h-14 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800 leading-snug group-hover:text-blue-600 transition">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.priceRange}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ RELATED PRODUCTS ═══ */}
        <div className="bg-white rounded-lg p-5 md:p-6 mb-3">
          <h3 className="text-base font-bold text-gray-900 mb-4">Related products</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {RELATED_PRODUCTS.map((item) => (
              <Link to="/product/1" key={item.id} className="group">
                <div className="aspect-square bg-gray-50 rounded-md overflow-hidden mb-2">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <p className="text-xs font-medium text-gray-800 group-hover:text-blue-600 transition">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.priceRange}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══ DISCOUNT BANNER ═══ */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg p-6 md:p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white text-center sm:text-left">
            <h3 className="text-lg md:text-xl font-bold mb-1">Super discount on more than 100 USD</h3>
            <p className="text-sm text-blue-100">Have you ever finally just write dummy info</p>
          </div>
          <Link to="/products" className="bg-orange-500 hover:bg-orange-600 transition text-white text-sm font-semibold px-6 py-2.5 rounded-md flex-shrink-0">
            Shop now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
