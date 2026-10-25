import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { getFooterLink } from '../utils/footerLinks';
import { getCategoryLabel } from '../utils/productCategories';
import { getProductSearchScore, normalizeSearchText } from '../utils/productSearch';

const Star = ({ filled }) => <span className={filled ? 'text-amber-400' : 'text-gray-300'}>★</span>;

const Rating = ({ rating, ratingCount }) => (
  <div className="flex items-center gap-1 text-xs">
    <span className="text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => <Star key={i} filled={i < Math.round(rating)} />)}
    </span>
    <span className="text-gray-500">{ratingCount ? `${rating.toFixed(1)} (${ratingCount})` : 'No ratings'}</span>
  </div>
);

const FilterChip = ({ label, onRemove }) => (
  <span className="flex items-center gap-1.5 border border-gray-300 rounded-full px-3 py-1 text-xs text-gray-700">
    {label}
    <button type="button" aria-label={`Remove ${label} filter`} onClick={onRemove} className="text-gray-400 hover:text-gray-700">✕</button>
  </span>
);

const FilterSection = ({ title, items, checked, onToggle, counts, defaultOpen = true }) => {
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
              <span className="flex-1">{item}</span>
              {counts && <span className="text-xs text-gray-400">{counts[item] || 0}</span>}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductListing = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  // Products, inventory, and customer ratings are sourced from MongoDB.
  const [PRODUCTS, setPRODUCTS] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKeyword = searchParams.get('q') || '';
  const searchCategory = searchParams.get('cat') || '';

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const { data } = await API.get('/products');
        if (!isMounted) return;
        const mapped = data.map((p) => ({
          id: p._id,
          name: p.name,
          price: p.price,
          oldPrice: p.oldPrice || null,
          image: p.image,
          desc: p.description,
          category: p.category,
          brand: p.brand || '',
          createdAt: p.createdAt,
          rating: p.ratingCount ? p.rating : 0,
          ratingCount: p.ratingCount ?? 0,
          orders: p.orders ?? 0,
          stock: p.stock ?? 0,
        }));
        setPRODUCTS(mapped);
        setLoadError('');
      } catch {
        if (isMounted) setLoadError('Could not load products. Is the backend running?');
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };
    loadProducts();
    return () => { isMounted = false; };
  }, []);
  const [sort, setSort] = useState('Featured');
  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [toast, setToast] = useState('');

  const [ratingFilter, setRatingFilter] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [mobileSearchVal, setMobileSearchVal] = useState('');

  useEffect(() => {
    setMobileSearchVal(searchKeyword);
  }, [searchKeyword]);

  const categoryCounts = PRODUCTS.reduce((counts, product) => {
    const category = getCategoryLabel(product.category);
    if (category) counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {});
  const categories = Object.keys(categoryCounts).sort((first, second) => first.localeCompare(second));
  const brandData = PRODUCTS.reduce((brandsByKey, product) => {
    const brand = product.brand.trim();
    if (!brand) return brandsByKey;
    const key = normalizeSearchText(brand);
    if (!brandsByKey[key]) brandsByKey[key] = { label: brand, count: 0 };
    brandsByKey[key].count += 1;
    return brandsByKey;
  }, {});
  const brands = Object.values(brandData).sort((first, second) => first.label.localeCompare(second.label));
  const brandCounts = Object.fromEntries(brands.map(({ label, count }) => [label, count]));
  const toggleCategory = (category) => {
    const nextParams = new URLSearchParams(searchParams);
    if (normalizeSearchText(getCategoryLabel(searchCategory)) === normalizeSearchText(getCategoryLabel(category))) nextParams.delete('cat');
    else nextParams.set('cat', category);
    setSearchParams(nextParams);
  };
  const toggleBrand = (brand) => {
    const key = normalizeSearchText(brand);
    setSelectedBrands((current) => (
      current.some((selected) => normalizeSearchText(selected) === key)
        ? current.filter((selected) => normalizeSearchText(selected) !== key)
        : [...current, brand]
    ));
  };
  const toggleRating = (rating) => setRatingFilter((current) => (current === rating ? '' : rating));
  const toggleStock = () => setInStockOnly((value) => !value);
  const toggleSale = () => setSaleOnly((value) => !value);
  const submitMobileSearch = (event) => {
    event.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (mobileSearchVal.trim()) nextParams.set('q', mobileSearchVal.trim());
    else nextParams.delete('q');
    setSearchParams(nextParams);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const searchScores = new Map(PRODUCTS.map((product) => [
    product.id,
    getProductSearchScore([product.name, product.desc, product.category, product.brand], searchKeyword),
  ]));
  const filteredProducts = PRODUCTS.filter((product) => {
    if (searchCategory && normalizeSearchText(getCategoryLabel(product.category)) !== normalizeSearchText(getCategoryLabel(searchCategory))) return false;
    if (searchScores.get(product.id) === null) return false;
    if (selectedBrands.length && !selectedBrands.some((brand) => normalizeSearchText(product.brand) === normalizeSearchText(brand))) return false;
    if (Number(minPrice) > 0 && product.price < Number(minPrice)) return false;
    if (maxPrice !== '' && product.price > Number(maxPrice)) return false;
    if (inStockOnly && product.stock < 1) return false;
    if (saleOnly && !(product.oldPrice > product.price)) return false;
    if (ratingFilter && (!product.ratingCount || product.rating < Number(ratingFilter))) return false;
    return true;
  });
  const sortedProducts = [...filteredProducts].sort((first, second) => {
    if (sort === 'Featured' && searchKeyword) return searchScores.get(first.id) - searchScores.get(second.id);
    if (sort === 'Price: low to high') return first.price - second.price;
    if (sort === 'Price: high to low') return second.price - first.price;
    if (sort === 'Newest') return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
    return 0;
  });

  const handleAdd = (p) => {
    if (user?.isAdmin || p.stock < 1) return;
    if (addToCart({ _id: p.id, name: p.name, price: p.price, image: p.image }, 1)) {
      showToast('Added to cart!');
    }
  };

  const activeFilters = [
    ...(searchCategory ? [{ key: 'category', label: getCategoryLabel(searchCategory), onRemove: () => toggleCategory(searchCategory) }] : []),
    ...selectedBrands.map((brand) => ({
      key: `brand-${normalizeSearchText(brand)}`,
      label: `Brand: ${brand}`,
      onRemove: () => toggleBrand(brand),
    })),
    ...(Number(minPrice) > 0 || maxPrice !== '' ? [{
      key: 'price',
      label: `Price: $${Number(minPrice) || 0}–$${maxPrice === '' ? 'Any' : Number(maxPrice)}`,
      onRemove: () => { setMinPrice(0); setMaxPrice(''); },
    }] : []),
    ...(inStockOnly ? [{ key: 'stock', label: 'In stock', onRemove: toggleStock }] : []),
    ...(saleOnly ? [{ key: 'sale', label: 'On sale', onRemove: toggleSale }] : []),
    ...(ratingFilter ? [{
      key: 'rating',
      label: `${ratingFilter}.0 & up`,
      onRemove: () => setRatingFilter(''),
    }] : []),
  ];
  const activeFiltersCountForMobile = activeFilters.length;
  const clearAllFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('cat');
    setSearchParams(nextParams);
    setMinPrice(0);
    setMaxPrice('');
    setInStockOnly(false);
    setSaleOnly(false);
    setRatingFilter('');
    setSelectedBrands([]);
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
            <h1 className="text-base font-bold text-gray-900">{searchCategory || 'Products'}</h1>
          </div>
          <div className="flex items-center gap-4">
            {!user?.isAdmin && <Link to="/cart" className="text-xl text-gray-700">🛒</Link>}
            <button className="text-xl text-gray-700">👤</button>
          </div>
        </div>
        <form onSubmit={submitMobileSearch} className="px-4 pb-3">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden h-10 bg-gray-50">
            <span className="flex items-center pl-3 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={mobileSearchVal}
              onChange={(e) => setMobileSearchVal(e.target.value)}
              placeholder="Search"
              className="w-full px-2 text-sm text-gray-700 outline-none h-full bg-transparent placeholder-gray-400 min-w-0"
            />
            <button type="submit" className="h-full bg-blue-600 px-3 text-xs font-medium text-white">Search</button>
          </div>
        </form>
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => toggleCategory(c)}
              className={`flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-md whitespace-nowrap transition ${searchCategory === c ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 px-4 pb-3">
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="min-w-0 border border-gray-200 rounded-md px-2 py-1.5 text-xs text-gray-700">
            <option value="Featured">Featured</option>
            <option>Price: low to high</option>
            <option>Price: high to low</option>
            <option>Newest</option>
          </select>
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
          <Link to="/" className="hover:text-blue-600">Home</Link><span>›</span>
          <span>{searchCategory || 'Products'}</span>
          {searchKeyword && <><span>›</span><span>Search: {searchKeyword}</span></>}
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
              {brands.length > 0 ? (
                <FilterSection
                  title="Brand"
                  items={brands.map(({ label }) => label)}
                  checked={selectedBrands}
                  onToggle={toggleBrand}
                  counts={brandCounts}
                />
              ) : (
                <div className="border-b border-gray-200 py-4">
                  <p className="text-sm font-bold text-gray-900">Brand</p>
                  <p className="mt-2 text-xs text-gray-500">Brands appear here after the admin adds them to products.</p>
                </div>
              )}

              <div className="border-b border-gray-200 py-4">
                <p className="text-sm font-bold text-gray-900 mb-3">Availability & deals</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={inStockOnly} onChange={toggleStock} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    In stock only
                  </label>
                  <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={saleOnly} onChange={toggleSale} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    On sale
                  </label>
                </div>
              </div>

            <div className="border-b border-gray-200 py-4">
              <p className="text-sm font-bold text-gray-900 mb-3">Price range</p>
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <p className="text-[11px] text-gray-400 mb-1">Min</p>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-gray-400 mb-1">Max</p>
                  <input
                    type="number"
                    min={minPrice || 0}
                    placeholder="Any"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>
              </div>
              <button onClick={() => { showToast('Filters applied!'); setFilterOpen(false); }} className="w-full bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-medium py-2 rounded-md">
                Apply
              </button>
            </div>

            <div className="py-4">
              <p className="text-sm font-bold text-gray-900 mb-2.5">Customer rating</p>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((filled) => {
                  return (
                    <label
                      key={filled}
                      className={`flex w-full cursor-pointer items-center gap-2.5 rounded px-1 py-0.5 ${ratingFilter === String(filled) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <input
                        type="checkbox"
                        checked={ratingFilter === String(filled)}
                        onChange={() => toggleRating(String(filled))}
                        aria-label={`${filled} stars and up`}
                        className="h-4 w-4 rounded border-gray-300 accent-blue-600"
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
                <span className="font-semibold">{filteredProducts.length}</span> products
                {searchKeyword && <> matching <span className="font-semibold">“{searchKeyword}”</span></>}
                {searchCategory && <> in <span className="font-semibold">{searchCategory}</span></>}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
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

            {/* Applied filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {activeFilters.map((filter) => (
                  <FilterChip key={filter.key} label={filter.label} onRemove={filter.onRemove} />
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
            {!loadingProducts && !loadError && filteredProducts.length === 0 && (
              <div className="mb-4 rounded-lg bg-white p-8 text-center">
                <p className="font-semibold text-gray-800">No products match these filters</p>
                <p className="mt-1 text-sm text-gray-500">Try removing a filter or widening your price range.</p>
                {activeFilters.length > 0 && (
                  <button type="button" onClick={clearAllFilters} className="mt-3 text-sm font-medium text-blue-600 hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* ═══ GRID VIEW ═══ */}
            {view === 'grid' && (
              <>
                {/* Mobile: compact row cards (image left, info right) */}
                <div className="sm:hidden space-y-3 mb-4">
                  {sortedProducts.map((p) => (
                    <Link to={`/product/${p.id}`} key={p.id} className="bg-white rounded-lg p-3 flex gap-3">
                      <div className="w-20 h-20 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 leading-snug mb-1 line-clamp-2">{p.name}</p>
                        <p className="text-base font-bold text-gray-900 mb-1">${p.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Rating rating={p.rating} ratingCount={p.ratingCount} />
                          <span>•</span>
                          <span className={p.stock > 0 ? 'text-emerald-600' : 'text-red-600'}>{p.stock > 0 ? (user?.isAdmin ? `${p.stock} in stock` : 'In stock') : 'Out of stock'}</span>
                        </div>
                        {p.brand && <p className="mt-1 text-xs font-medium text-gray-500">{p.brand}</p>}
                        {p.oldPrice > p.price && (
                          <p className="text-xs text-gray-500">
                            <span className="line-through">${p.oldPrice.toFixed(2)}</span>
                            <span className="ml-2 font-semibold text-red-600">
                              {Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}% off
                            </span>
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Desktop/tablet: card grid */}
                <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-4">
                  {sortedProducts.map((p) => (
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
                        <Rating rating={p.rating} ratingCount={p.ratingCount} />
                        {p.oldPrice > p.price && (
                          <p className="mt-1 text-xs font-semibold text-red-600">
                            Sale · {Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}% off
                          </p>
                        )}
                        <p className={`mt-1 text-xs ${p.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {p.stock > 0 ? (user?.isAdmin ? `${p.stock} in stock` : 'In stock') : 'Out of stock'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1.5 leading-snug line-clamp-2">{p.name}</p>
                        {!user?.isAdmin && (
                          <button
                            onClick={() => handleAdd(p)}
                            disabled={p.stock < 1}
                            className="w-full mt-2.5 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            + Add to cart
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ═══ LIST VIEW ═══ */}
            {view === 'list' && (
              <div className="space-y-3 mb-4">
                {sortedProducts.map((p) => (
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
                        <Rating rating={p.rating} ratingCount={p.ratingCount} />
                        <span>•</span>
                        <span className={p.stock > 0 ? 'text-emerald-600' : 'text-red-600'}>{p.stock > 0 ? (user?.isAdmin ? `${p.stock} in stock` : 'In stock') : 'Out of stock'}</span>
                        <span>•</span>
                      </div>
                      {p.brand && <p className="mb-2 text-xs font-medium text-gray-500">{p.brand}</p>}
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
                  <span key={i} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                    {icon}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-5">
              <div>
                <h4 className="text-sm font-bold mb-3">About</h4>
                {['About Us', 'Find store', 'Categories', 'Blogs'].map((l) => (
                  <Link key={l} to={getFooterLink(l)} className="block text-xs text-gray-500 hover:text-blue-600 mb-2">{l}</Link>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-bold mb-3">Information</h4>
                {['Help Center', 'Money Refund', 'Shipping', 'Contact us'].map((l) => (
                  <Link key={l} to={getFooterLink(l)} className="block text-xs text-gray-500 hover:text-blue-600 mb-2">{l}</Link>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-bold mb-3">For users</h4>
                {['Login', 'Register', 'Settings', 'My Orders'].map((l) => (
                  <Link key={l} to={getFooterLink(l)} className="block text-xs text-gray-500 hover:text-blue-600 mb-2">{l}</Link>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-bold mb-3">Get app</h4>
                <div className="flex flex-col gap-2">
                  <button disabled title="Mobile app is not available yet" className="bg-gray-900 text-white text-[11px] rounded-md px-3 py-1.5 opacity-60 cursor-not-allowed">📱 App Store · Coming soon</button>
                  <button disabled title="Mobile app is not available yet" className="bg-gray-900 text-white text-[11px] rounded-md px-3 py-1.5 opacity-60 cursor-not-allowed">▶ Google Play · Coming soon</button>
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
