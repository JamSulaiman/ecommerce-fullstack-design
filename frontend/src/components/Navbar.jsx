import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../assets/icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import MobileSidebar from './MobileSidebar';

const CATEGORIES = [
  'Automobiles',
  'Clothes and wear',
  'Home interiors',
  'Computer and tech',
  'Tools, equipments',
  'Sports and outdoor',
  'Animal and pets',
  'Machinery tools',
];

function Navbar() {
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [mobileSearchVal, setMobileSearchVal] = useState('');
  const [category, setCategory] = useState('All category');
  const [profileOpen, setProfileOpen] = useState(false);
  const totalItems = getTotalItems ? getTotalItems() : 0;

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const queryText = (searchVal || mobileSearchVal).trim();
    if (queryText) params.set('q', queryText);
    if (category !== 'All category') params.set('cat', category);
    const query = params.toString();
    navigate(`/products${query ? `?${query}` : ''}`);
    setProfileOpen(false);
  };

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setCategory(selected);
    const params = new URLSearchParams();
    const queryText = searchVal.trim();
    if (queryText) params.set('q', queryText);
    if (selected !== 'All category') params.set('cat', selected);
    const query = params.toString();
    navigate(`/products${query ? `?${query}` : ''}`);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">

      {/* ── TOP MAIN ROW ── */}
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-3 md:gap-6">

        {/* Hamburger - mobile only */}
        <button
          className="lg:hidden flex flex-col gap-1 p-1 flex-shrink-0"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <span className="block w-5 h-0.5 bg-gray-700"></span>
          <span className="block w-5 h-0.5 bg-gray-700"></span>
          <span className="block w-5 h-0.5 bg-gray-700"></span>
        </button>

        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/">
            <BrandLogo />
          </Link>
        </div>

        {/* Search Bar - desktop/tablet only */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl items-stretch border-2 border-blue-600 rounded-md overflow-hidden h-10">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by name or category"
            className="w-full px-4 text-sm text-gray-700 outline-none h-full placeholder-gray-400 min-w-0"
          />
          <select
            value={category}
            onChange={handleCategoryChange}
            className="hidden md:block bg-transparent border-l border-gray-200 px-3 text-sm text-gray-600 outline-none cursor-pointer h-full font-normal flex-shrink-0"
          >
            <option>All category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-medium px-6 flex-shrink-0">
            Search
          </button>
        </form>

        {/* Right Menu Icons */}
        <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
          {user ? (
            user.isAdmin ? (
              <div className="relative hidden md:flex flex-col items-center">
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition group"
                  type="button"
                >
                  <span className="text-lg mb-1 text-gray-400 group-hover:text-blue-600">🛠️</span>
                  <span className="text-xs font-normal">Admin</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-gray-200 bg-white shadow-xl py-2">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My account
                    </Link>
                    <Link
                      to="/admin?tab=customers"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Customer dashboard
                    </Link>
                    <Link
                      to="/admin?tab=products"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Product manager
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/profile#orders" className="hidden md:flex flex-col items-center text-gray-500 hover:text-blue-600 transition group">
                  <span className="text-lg mb-1 text-gray-400 group-hover:text-blue-600">🧾</span>
                  <span className="text-xs font-normal">Orders</span>
                </Link>
                <Link to="/profile" className="hidden md:flex flex-col items-center text-gray-500 hover:text-blue-600 transition group">
                  <span className="text-lg mb-1 text-gray-400 group-hover:text-blue-600">👤</span>
                  <span className="text-xs font-normal">{user.name || 'Admin'}</span>
                </Link>

                

          <Link to="/contact" className="hidden md:flex flex-col items-center text-gray-500 hover:text-blue-600 transition group">
            <span className="text-lg mb-1 text-gray-400 group-hover:text-blue-600">💬</span>
            <span className="text-xs font-normal">Message</span>
          </Link>

          <Link to="/cart" className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition group relative">
            <span className="text-xl md:text-lg md:mb-1 text-gray-700 md:text-gray-400 group-hover:text-blue-600">🛒</span>
            <span className="text-xs font-normal hidden md:inline">My cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 md:right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          <Link to={user ? '/profile' : '/login'} className="md:hidden text-xl text-gray-700">👤</Link>
        </div>
      </div>

      {/* ── MOBILE SEARCH ROW ── */}
      <form onSubmit={handleSearch} className="sm:hidden px-4 pb-3">
        <div className="flex items-stretch border border-gray-300 rounded-md overflow-hidden h-10 bg-gray-50">
          <span className="flex items-center pl-3 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search"
            className="w-full px-2 text-sm text-gray-700 outline-none h-full bg-transparent placeholder-gray-400 min-w-0"
          />
        </div>
      </form>

      {/* ── MOBILE CATEGORY PILLS ── */}
      <div className="md:hidden flex items-center gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {['All category', ...CATEGORIES].map((c) => (
          <Link
            key={c}
            to={c === 'All category' ? '/products' : `/products?cat=${encodeURIComponent(c)}`}
            className="flex-shrink-0 bg-blue-50 text-blue-600 text-xs font-medium px-3.5 py-1.5 rounded-md whitespace-nowrap hover:bg-blue-100 transition"
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="border-b border-gray-200 w-full hidden lg:block"></div>

      {/* ── LOWER NAVIGATION ROW (desktop only) ── */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-4 h-11 items-center justify-between text-sm text-gray-800">

        <nav className="flex items-center gap-6 font-medium">
          <div
            className="relative"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button className="flex items-center gap-2 hover:text-blue-600 transition">
              <span className="text-lg">☰</span>
              <span>All category</span>
            </button>
            {catOpen && (
              <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px] py-1.5 z-50">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    to={`/products?cat=${encodeURIComponent(cat)}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link to="#" className="hover:text-blue-600 transition font-normal">Hot offers</Link>
          <Link to="#" className="hover:text-blue-600 transition font-normal">Gift boxes</Link>
          <Link to="#" className="hover:text-blue-600 transition font-normal">Projects</Link>
          <Link to="#" className="hover:text-blue-600 transition font-normal">Menu item</Link>
          <button className="flex items-center gap-1 hover:text-blue-600 transition font-normal">
            <span>Help</span>
            <span className="text-xs opacity-70">⌄</span>
          </button>
        </nav>

        <div className="flex items-center gap-6">
          <button className="flex items-center gap-1 hover:text-blue-600 transition">
            <span>English, USD</span>
            <span className="text-xs opacity-70">⌄</span>
          </button>

          <button className="flex items-center gap-2 hover:text-blue-600 transition whitespace-nowrap">
            <span>Ship to Germany</span>
            <svg width="56" height="40" viewBox="0 0 56 40" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="w-12 h-8 rounded-sm overflow-hidden">
              <rect width="56" height="40" fill="url(#pattern0_1_4732)"/>
              <defs>
                <pattern id="pattern0_1_4732" patternContentUnits="objectBoundingBox" width="1" height="1">
                  <use xlinkHref="#image0_1_4732" transform="scale(0.0178571 0.025)"/>
                </pattern>
                <image id="image0_1_4732" width="56" height="40" preserveAspectRatio="none" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAoCAYAAAHcVwkTAAAABGdBTUEAALGPC/xhBQAAARtJREFUaAXtV8ENgzAQI1VWYIAKiXe7VzteR+ke5Y2AVu37HGGBRa7HE8u5s30hIfV9vzTGczLef1+nV9uazDwuJtak5Xk20VRVQ8igPE0Twk0MOmuyPgA0FhFh0IgI00JEuiJN1MfBt4p2D3JVPwC0RnpykH6E0Z2iRREmL0h/N5AKhMkVygvm8XZBDmyO0TuY7URuqbxgfGnY2TB58gz9F6SvJ2ZIBSBOi4JB6+E/mFL2ZrrezB8jN/cry6V4cQBTtiGS/20hVyi/06B898Dkju4hAq0ZApE7NWDuE8zzPNcQBN1jfnQdTa6BKL/jq01xvwdDoHqktq7nPsE8OD8m5L+EW49gaT33IxoCSyNwdDwSPHpCpf7cJ/gGcQZL7ByV1IgAAAAASUVORK5CYII="/>
              </defs>
            </svg>
            <span className="text-xs opacity-70 leading-none">⌄</span>
          </button>
        </div>
      </div>

      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

export default Navbar;
