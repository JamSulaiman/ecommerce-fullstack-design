import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CATEGORY_FILTERS,
  BRAND_FILTERS,
  FEATURE_FILTERS,
} from '../data/products';
import { useCart } from '../context/CartContext';
import API from '../api';

const Star = ({ filled }) => <span className={filled ? 'text-amber-400' : 'text-gray-300'}>★</span>;

const Rating = ({ rating, ratingNum }) => (
  <div className="flex items-center gap-1 text-xs">
    <span className="text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => <Star key={i} filled={i < rating} />)}
    </span>
    <span className="text-amber-500 font-medium">{ratingNum}</span>
  </div>
);

const FilterChip = ({ label, onRemove }) => (
  <span className="flex items-center gap-1.5 border border-gray-300 rounded-full px-3 py-1 text-xs text-gray-700">
    {label}
    <button onClick={onRemove} className="text-gray-400 hover:text-gray-700">✕</button>
  </span>
);

const FilterSection = ({ title, items, checked, onToggle, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 py-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-sm font-bold text-gray-900 mb-1">
        {title}
        <span className="text-gray-400 text-xs">{open ? '⌃' : '⌄'}</span>
      </button>
      {open && (
        <div className="space-y-2 mt-2.5">
          {items.map((item) => (
            <label key={item} className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={checked.includes(item)}
                onChange={() => onToggle(item)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {item}
            </label>
          ))}
          <button className="text-xs text-blue-600 hover:underline pt-0.5">See all</button>
        </div>
      )}
    </div>
  );
};

const ProductListing = () => {
  const { addToCart } = useCart();
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Live products from the backend (MongoDB), replacing the old static mock
  // catalog. Shape is kept identical to the previous PRODUCTS array
  // ({ id, name, price, oldPrice, image, desc, rating, ratingNum, orders })
  // so none of the existing JSX/markup below needs to change.
  const [PRODUCTS, setPRODUCTS] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get('q') || '';
  const searchCategory = searchParams.get('cat') || '';

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const params = {};
        if (searchKeyword) params.q = searchKeyword;
        if (searchCategory) params.cat = searchCategory;
        const { data } = await API.get('/products', { params });
        if (!isMounted) return;
        const mapped = data.map((p) => ({
          id: p._id,
          name: p.name,
          price: p.price,
          oldPrice: p.oldPrice || null,
          image: p.image,
          desc: p.description,
          category: p.category,
          rating: p.rating ?? 4,
          ratingNum: p.ratingNum ?? 7.5,
          orders: p.orders ?? 0,
        }));
        setPRODUCTS(mapped);
        setLoadError('');
      } catch (error) {
        if (isMounted) setLoadError('Could not load products. Is the backend running?');
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };
    loadProducts();
    return () => { isMounted = false; };
  }, [searchKeyword, searchCategory]);
  const [sort, setSort] = useState('Featured');
  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(999999);
  const [condition, setCondition] = useState('Any');
  const [toast, setToast] = useState('');

  const [selCategories, setSelCategories] = useState([]);
  const [selBrands, setSelBrands] = useState([]);
  const [selFeatures, setSelFeatures] = useState([]);
  const [selRatings, setSelRatings] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [mobileSearchVal, setMobileSearchVal] = useState('');

  const toggleCategory = (c) => setSelCategories((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  const toggleBrand = (b) => setSelBrands((s) => (s.includes(b) ? s.filter((x) => x !== b) : [...s, b]));
  const toggleFeature = (f) => setSelFeatures((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));
  const toggleRating = (r) => setSelRatings((s) => (s.includes(r) ? s.filter((x) => x !== r) : [...s, r]));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const filteredProducts = PRODUCTS.filter((product) => {
    if (verifiedOnly && product.rating < 4) return false;
    if (product.price < minPrice || product.price > maxPrice) return false;
    if (selCategories.length && !selCategories.includes(product.category || '')) return false;
    if (selBrands.length && !selBrands.some((brand) => product.name?.toLowerCase().includes(brand.toLowerCase()))) return false;
    if (selFeatures.length && !selFeatures.some((feature) =>
      product.name?.toLowerCase().includes(feature.toLowerCase()) ||
      product.desc?.toLowerCase().includes(feature.toLowerCase())
    )) return false;
    if (selRatings.length && !selRatings.some((ratingLabel) => {
      const ratingValue = Number(ratingLabel.split(' ')[0]);
      return product.rating >= ratingValue;
    })) return false;
    if (condition !== 'Any') {
      if (condition === 'Brand new' && product.oldPrice) return false;
      if (condition === 'Refurbished' && !product.name?.toLowerCase().includes('refurbished')) return false;
      if (condition === 'Old items' && product.name?.toLowerCase().includes('new')) return false;
    }
    return true;
  });

  const handleAdd = (p) => {
    addToCart({ _id: p.id, name: p.name, price: p.price, image: p.image }, 1);
    showToast('Added to cart!');
  };

  const activeFilters = [...selCategories, ...selBrands, ...selFeatures, ...selRatings];
  const activeFiltersCountForMobile = activeFilters.length;
  const removeFilter = (f) => {
    setSelCategories((s) => s.filter((x) => x !== f));
    setSelBrands((s) => s.filter((x) => x !== f));
    setSelFeatures((s) => s.filter((x) => x !== f));
    setSelRatings((s) => s.filter((x) => x !== f));
  };
  const clearAllFilters = () => {
    setSelCategories([]);
    setSelBrands([]);
    setSelFeatures([]);
    setSelRatings([]);
  };

  return (
    <div className="bg-gray-100 min-h-screen relative">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-[999]">
          {toast}
        </div>
      )}

      {/* Mobile-only top bar */}
      <div className="sm:hidden bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl text-gray-900">←</Link>
            <h1 className="text-base font-bold text-gray-900">Mobile accessory</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="text-xl text-gray-700">🛒</Link>
            <button className="text-xl text-gray-700">👤</button>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden h-10 bg-gray-50">
            <span className="flex items-center pl-3 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={mobileSearchVal}
              onChange={(e) => setMobileSearchVal(e.target.value)}
              placeholder="Search"
              className="w-full px-2 text-sm text-gray-700 outline-none h-full bg-transparent placeholder-gray-400 min-w-0"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {['Tablets', 'Phones', 'Ipads', 'Ipod', 'Jackets'].map((c) => (
            <button
              key={c}
              className="flex-shrink-0 bg-blue-50 text-blue-600 text-xs font-medium px-3.5 py-1.5 rounded-md whitespace-nowrap hover:bg-blue-100 transition"
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 px-4 pb-3">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-md px-3 py-1.5 text-xs text-gray-700">
            <span>☰</span> Sort: {sort === 'Featured' ? 'Newest' : sort}
          </button>
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-1.5 border border-gray-200 rounded-md px-3 py-1.5 text-xs text-gray-700"
          >
            ⚲ Filter ({activeFiltersCountForMobile})
          </button>
          <div className="flex border border-gray-200 rounded-md overflow-hidden ml-auto">
            <button
              onClick={() => setView('grid')}
              className={`px-2 py-1.5 text-xs ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}
            >
              ▦
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-2 py-1.5 text-xs border-l border-gray-200 ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* Breadcrumb - desktop/tablet only */}
        <div className="hidden sm:flex text-xs text-gray-400 mb-4 items-center gap-1.5 flex-wrap">
          <span className="hover:text-blue-600 cursor-pointer">Home</span><span>›</span>
          <span className="hover:text-blue-600 cursor-pointer">Clothings</span><span>›</span>
          <span className="hover:text-blue-600 cursor-pointer">Men's wear</span><span>›</span>
          <span>Summer clothing</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-4">

          {/* ═══ SIDEBAR FILTERS (desktop/tablet inline, mobile slide-up) ═══ */}
          <aside className={`
            ${filterOpen ? 'fixed inset-0 z-50 flex flex-col justify-end sm:static sm:z-auto sm:flex sm:flex-col bg-black/40 sm:bg-transparent' : 'hidden sm:block'}
          `}>
            {filterOpen && <div className="flex-1 sm:hidden" onClick={() => setFilterOpen(false)}></div>}
            <div className="bg-white rounded-t-xl sm:rounded-lg p-4 h-fit max-h-[85vh] sm:max-h-none overflow-y-auto">
              <div className="flex items-center justify-between mb-2 sm:hidden">
                <h3 className="text-base font-bold text-gray-900">Filters</h3>
                <button onClick={() => setFilterOpen(false)} className="text-2xl text-gray-400 leading-none">✕</button>
              </div>
              <FilterSection title="Category" items={CATEGORY_FILTERS} checked={selCategories} onToggle={toggleCategory} />
            <FilterSection
              title="Brands"
              items={BRAND_FILTERS}
              checked={selBrands}
              onToggle={toggleBrand}
            />
            <FilterSection
              title="Features"
              items={FEATURE_FILTERS}
              checked={selFeatures}
              onToggle={toggleFeature}
            />

            <div className="border-b border-gray-200 py-4">
              <p className="text-sm font-bold text-gray-900 mb-3">Price range</p>
              <input
                type="range"
                min="0"
                max="999999"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-600 mb-3"
              />
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <p className="text-[11px] text-gray-400 mb-1">Min</p>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-gray-400 mb-1">Max</p>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>
              </div>
              <button onClick={() => { showToast('Filters applied!'); setFilterOpen(false); }} className="w-full bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-medium py-2 rounded-md">
                Apply
              </button>
            </div>

            <div className="border-b border-gray-200 py-4">
              <p className="text-sm font-bold text-gray-900 mb-2.5">Condition</p>
              <div className="space-y-2">
                {['Any', 'Refurbished', 'Brand new', 'Old items'].map((c) => (
                  <label key={c} className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      checked={condition === c}
                      onChange={() => setCondition(c)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            <div className="py-4">
              <p className="text-sm font-bold text-gray-900 mb-2.5">Ratings</p>
              <div className="space-y-2">
                {['5 star', '4 star', '3 star', '2 star'].map((r, idx) => {
                  const filled = 5 - idx;
                  return (
                    <label key={r} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selRatings.includes(r)}
                        onChange={() =>
                          setSelRatings((s) => (s.includes(r) ? s.filter((x) => x !== r) : [...s, r]))
                        }
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-amber-400 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} filled={i < filled} />)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Mobile-only: confirm button at bottom of slide-up panel */}
            <button
              onClick={() => setFilterOpen(false)}
              className="sm:hidden w-full bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-semibold py-3 rounded-md mt-2"
            >
              Show results
            </button>
            </div>
          </aside>

          {/* ═══ MAIN CONTENT ═══ */}
          <div>
            {/* Toolbar - desktop/tablet only */}
            <div className="hidden sm:flex bg-white rounded-lg px-4 py-3.5 flex-wrap items-center justify-between gap-3 mb-3">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">12,911</span> items in <span className="font-semibold">Mobile accessory</span>
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={() => setVerifiedOnly(!verifiedOnly)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Verified only
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none cursor-pointer"
                >
                  <option>Featured</option>
                  <option>Price: low to high</option>
                  <option>Price: high to low</option>
                  <option>Newest</option>
                </select>
                <div className="flex border border-gray-200 rounded-md overflow-hidden">
                  <button
                    onClick={() => setView('grid')}
                    className={`px-2.5 py-1.5 text-sm ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}
                  >
                    ▦
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`px-2.5 py-1.5 text-sm border-l border-gray-200 ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter chips - desktop/tablet only (mobile shows count on Filter button) */}
            {activeFilters.length > 0 && (
              <div className="hidden sm:flex flex-wrap items-center gap-2 mb-3">
                {activeFilters.map((f) => (
                  <FilterChip key={f} label={f} onRemove={() => removeFilter(f)} />
                ))}
                <button onClick={clearAllFilters} className="text-xs text-blue-600 hover:underline">
                  Clear all filter
                </button>
              </div>
            )}

            {/* Loading / error state for the live backend fetch */}
            {loadingProducts && (
              <div className="bg-white rounded-lg p-6 text-center text-sm text-gray-500 mb-4">
                Loading products…
              </div>
            )}
            {!loadingProducts && loadError && (
              <div className="bg-white rounded-lg p-6 text-center text-sm text-red-500 mb-4">
                {loadError}
              </div>
            )}

            {/* ═══ GRID VIEW ═══ */}
            {view === 'grid' && (
              <>
                {/* Mobile: compact row cards (image left, info right) */}
                <div className="sm:hidden space-y-3 mb-4">
                  {filteredProducts.map((p) => (
                    <Link to={`/product/${p.id}`} key={p.id} className="bg-white rounded-lg p-3 flex gap-3">
                      <div className="w-20 h-20 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 leading-snug mb-1 line-clamp-2">{p.name}</p>
                        <p className="text-base font-bold text-gray-900 mb-1">${p.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Rating rating={p.rating} ratingNum={p.ratingNum} />
                          <span>•</span>
                          <span>{p.orders} orders</span>
                        </div>
                        <p className="text-xs text-emerald-600 mt-0.5">Free Shipping</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Desktop/tablet: card grid */}
                <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-4">
                  {filteredProducts.map((p) => (
                    <div key={p.id} className="bg-white rounded-lg overflow-hidden group">
                      <Link to={`/product/${p.id}`} className="block aspect-square bg-gray-50 overflow-hidden relative">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      </Link>
                      <div className="p-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold text-gray-900">${p.price.toFixed(2)}</span>
                            {p.oldPrice && <span className="text-xs text-gray-400 line-through">${p.oldPrice.toFixed(2)}</span>}
                          </div>
                          <button onClick={() => showToast('Saved to wishlist!')} className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-blue-500 hover:bg-blue-50 transition flex-shrink-0">
                            ♡
                          </button>
                        </div>
                        <Rating rating={p.rating} ratingNum={p.ratingNum} />
                        <p className="text-xs text-gray-600 mt-1.5 leading-snug line-clamp-2">{p.name}</p>
                        <button
                          onClick={() => handleAdd(p)}
                          className="w-full mt-2.5 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition"
                        >
                          + Add to cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ═══ LIST VIEW ═══ */}
            {view === 'list' && (
              <div className="space-y-3 mb-4">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="bg-white rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                    <Link to={`/product/${p.id}`} className="w-full sm:w-36 h-36 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <Link to={`/product/${p.id}`} className="text-base font-semibold text-gray-900 hover:text-blue-600 transition">
                          {p.name}
                        </Link>
                        <button onClick={() => showToast('Saved to wishlist!')} className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-blue-500 hover:bg-blue-50 transition flex-shrink-0">
                          ♡
                        </button>
                      </div>
                      <div className="flex items-baseline gap-2 mb-1.5">
                        <span className="text-lg font-bold text-gray-900">${p.price.toFixed(2)}</span>
                        {p.oldPrice && <span className="text-sm text-gray-400 line-through">${p.oldPrice.toFixed(2)}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Rating rating={p.rating} ratingNum={p.ratingNum} />
                        <span>•</span>
                        <span>{p.orders} orders</span>
                        <span>•</span>
                        <span className="text-emerald-600">Free Shipping</span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed mb-2.5 line-clamp-2">{p.desc}</p>
                      <Link to={`/product/${p.id}`} className="text-sm text-blue-600 hover:underline w-fit">
                        View details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ═══ YOU MAY ALSO LIKE (mobile only) ═══ */}
            <div className="sm:hidden mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">You may also like</h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {PRODUCTS.slice(0, 6).map((p) => (
                  <Link to={`/product/${p.id}`} key={`yml-${p.id}`} className="bg-white rounded-lg p-2.5 w-32 flex-shrink-0">
                    <div className="w-full aspect-square bg-gray-50 rounded-md overflow-hidden mb-2">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">${p.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-2">{p.name}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Pagination - desktop/tablet only */}
            <div className="hidden sm:flex bg-white rounded-lg px-4 py-3 items-center justify-center gap-3">
              <select className="border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none cursor-pointer">
                <option>Show 10</option>
                <option>Show 20</option>
                <option>Show 50</option>
              </select>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition">
                  ‹
                </button>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition ${
                      page === n ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage(page + 1)} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition">
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ NEWSLETTER ═══ */}
        <div className="bg-white rounded-lg py-8 px-5 text-center mt-4">
          <h3 className="text-lg font-bold mb-1.5">Subscribe on our newsletter</h3>
          <p className="text-sm text-gray-500 mb-4">Get daily news on upcoming offers from many suppliers all over the world</p>
          <form onSubmit={(e) => { e.preventDefault(); showToast('Subscribed!'); }} className="flex justify-center max-w-sm mx-auto">
            <input
              type="email"
              placeholder="✉  Email"
              className="flex-1 border border-gray-200 rounded-l-md px-4 py-2.5 text-sm outline-none focus:border-blue-600 min-w-0"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-medium px-6 py-2.5 rounded-r-md flex-shrink-0">
              Subscribe
            </button>
          </form>
        </div>

        {/* ═══ FOOTER ═══ */}
        <footer className="bg-white rounded-lg pt-8 pb-5 px-5 md:px-8 mt-3">
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

export default ProductListing;
