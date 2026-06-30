import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../api';
import bannerImg from '../assets/banner.jpeg';

const CATEGORIES = [
  'Automobiles',
  'Clothes and wear',
  'Home interiors',
  'Computer and tech',
  'Tools, equipments',
  'Sports and outdoor',
  'Animal and pets',
  'Machinery tools',
  'More category',
];

const DEALS = [
  { name: 'Smart watches', discount: '-25%', price: 'From USD 19', img: '/products/tech/8.jpg' },
  { name: 'Laptops', discount: '-15%', price: 'From USD 340', img: '/products/tech/7.jpg' },
  { name: 'GoPro cameras', discount: '-40%', price: 'From USD 89', img: '/products/tech/6.jpg' },
  { name: 'Headphones', discount: '-25%', price: 'From USD 10', img: '/products/tech/9.jpg' },
  { name: 'Canon cameras', discount: '-25%', price: 'From USD 99', img: '/products/tech/6.jpg' },
];

const HOME_OUTDOOR = [
  { name: 'Soft chairs', price: 'From USD 19', img: '/products/interior/1.jpg' },
  { name: 'Sofa & chair', price: 'From USD 19', img: '/products/interior/2.jpg' },
  { name: 'Kitchen dishes', price: 'From USD 19', img: '/products/interior/7.jpg' },
  { name: 'Decor pots', price: 'From USD 19', img: '/products/interior/3.jpg' },
  { name: 'Plant pots', price: 'From USD 100', img: '/products/interior/4.jpg' },
  { name: 'Mattress', price: 'From USD 39', img: '/products/interior/5.jpg' },
  { name: 'Table lamp', price: 'From USD 19', img: '/products/interior/6.jpg' },
  { name: 'Coffee maker', price: 'From USD 10', img: '/products/interior/8.jpg' },
];

const CONSUMER_ELECTRONICS = [
  { name: 'Smart watches', price: 'From USD 19', img: '/products/tech/8.jpg' },
  { name: 'Cameras', price: 'From USD 89', img: '/products/tech/6.jpg' },
  { name: 'Headphones', price: 'From USD 10', img: '/products/tech/9.jpg' },
  { name: 'Smartphones', price: 'From USD 90', img: '/products/tech/1.jpg' },
  { name: 'Gaming set', price: 'From USD 35', img: '/products/tech/5.jpg' },
  { name: 'Laptops & PC', price: 'From USD 340', img: '/products/tech/7.jpg' },
  { name: 'Smartphones', price: 'From USD 19', img: '/products/tech/4.jpg' },
  { name: 'Electric kettle', price: 'From USD 240', img: '/products/tech/10.jpg' },
];

const RECOMMENDED_FALLBACK = [
  { _id: 'r1', name: 'T-shirts with multiple colors, for men', price: 10.30, image: '/products/cloth/1.jpg' },
  { _id: 'r2', name: 'Jeans shorts for men blue color', price: 10.30, image: '/products/cloth/4.jpg' },
  { _id: 'r3', name: 'Brown winter coat medium size', price: 12.50, image: '/products/cloth/3.jpg' },
  { _id: 'r4', name: 'Jeans bag for travel for men', price: 34.00, image: '/products/cloth/5.jpg' },
  { _id: 'r5', name: 'Leather wallet', price: 99.00, image: '/products/cloth/6.jpg' },
  { _id: 'r6', name: 'Canon camera black, 100x zoom', price: 9.99, image: '/products/tech/6.jpg' },
  { _id: 'r7', name: 'Headset for gaming with mic', price: 8.99, image: '/products/tech/5.jpg' },
  { _id: 'r8', name: 'Smartwatch silver color modern', price: 10.30, image: '/products/tech/8.jpg' },
  { _id: 'r9', name: 'Blue suit for men formal wear', price: 10.30, image: '/products/cloth/7.jpg' },
  { _id: 'r10', name: 'Electric kettle for travel', price: 80.95, image: '/products/tech/10.jpg' },
];

const SERVICES = [
  { title: 'Source from\nIndustry Hubs', icon: '🏭', color: 'from-amber-700 to-amber-900' },
  { title: 'Customize Your\nProducts', icon: '🎨', color: 'from-blue-600 to-blue-800' },
  { title: 'Fast, reliable shipping\nby ocean or air', icon: '✈️', color: 'from-slate-500 to-slate-700' },
  { title: 'Product monitoring\nand inspection', icon: '🔍', color: 'from-slate-400 to-slate-600' },
];

const SUPPLIERS = [
  { country: 'Arabic Emirates', url: 'shopname.ae', flag: '/flags/uae.svg' },
  { country: 'Australia', url: 'shopname.au', flag: '/flags/australia.svg' },
  { country: 'United States', url: 'shopname.us', flag: '/flags/usa.svg' },
  { country: 'Russia', url: 'shopname.rs', flag: '/flags/russia.svg' },
  { country: 'Italy', url: 'shopname.it', flag: '/flags/italy.svg' },
  { country: 'Denmark', url: 'denmark.com.dk', flag: '/flags/denmark.svg' },
  { country: 'France', url: 'shopname.com.fr', flag: '/flags/france.svg' },
  { country: 'Germany', url: 'shopname.de', flag: '/flags/germany.svg' },
  { country: 'China', url: 'shopname.cn', flag: '/flags/china.svg' },
  { country: 'Great Britain', url: 'shopname.co.uk', flag: '/flags/uk.svg' },
];

function useCountdown(hours = 13, days = 4) {
  const [time, setTime] = useState(() => {
    const target = new Date().getTime() + (days * 86400 + hours * 3600 + 34 * 60 + 56) * 1000;
    return target;
  });
  const [display, setDisplay] = useState({ d: '04', h: '13', m: '34', s: '56' });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, time - now);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDisplay({
        d: String(d).padStart(2, '0'),
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  return display;
}

const Home = () => {
  const { addToCart } = useCart();
  const timer = useCountdown();
  const [activeCat, setActiveCat] = useState('Automobiles');
  const [quoteForm, setQuoteForm] = useState({ item: '', details: '', qty: '' });
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [toast, setToast] = useState('');
  const [email, setEmail] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleAddToCart = (item) => {
    addToCart({ _id: item._id || item.name, name: item.name, price: item.price || 0, image: item.image || item.img }, 1);
    showToast(`${item.name} added to cart!`);
  };

  // Featured products for the homepage, fetched live from the backend
  // (MongoDB) on load. Falls back to the static set if the request hasn't
  // resolved yet or the backend is unreachable, so the section never looks
  // empty — the markup/layout below stays exactly the same either way.
  const [recommended, setRecommended] = useState(RECOMMENDED_FALLBACK);
  const [deals, setDeals] = useState(DEALS);
  const [homeOutdoorProducts, setHomeOutdoorProducts] = useState([]);
  const [consumerProducts, setConsumerProducts] = useState([]);
  const navigate = useNavigate();

  const mapProductGridItem = (product) => ({
    _id: product._id,
    name: product.name,
    img: product.image,
    price: product.price,
    oldPrice: product.oldPrice || null,
    category: product.category,
  });

  const goToProductDetail = async (searchTerm) => {
    if (!searchTerm) return;
    try {
      const { data } = await API.get('/products', { params: { q: searchTerm } });
      if (data && data.length > 0) {
        navigate(`/product/${data[0]._id}`);
        return;
      }
    } catch (error) {
      // fallback to search listing if backend search fails
    }
    navigate(`/products?q=${encodeURIComponent(searchTerm)}`);
  };

  useEffect(() => {
    let isMounted = true;
    API.get('/products')
      .then(({ data }) => {
        if (!isMounted || !data.length) return;
        const mappedRecommended = data.slice(0, 10).map((p) => ({ _id: p._id, name: p.name, price: p.price, image: p.image }));
        setRecommended(mappedRecommended);

        const discounted = data
          .filter((p) => p.oldPrice && p.oldPrice > p.price)
          .slice(0, 5)
          .map((p) => ({
            _id: p._id,
            name: p.name,
            img: p.image,
            price: p.price,
            discount: `-${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}%`,
          }));
        if (discounted.length) setDeals(discounted);
      })
      .catch(() => {
        // keep RECOMMENDED_FALLBACK if the backend isn't reachable
      });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadHomeOutdoor = async () => {
      try {
        const [homeRes, outdoorRes, consumerRes] = await Promise.all([
          API.get('/products', { params: { cat: 'Home interiors' } }),
          API.get('/products', { params: { cat: 'Sports and outdoor' } }),
          API.get('/products', { params: { cat: 'Computer and tech' } }),
        ]);
        if (!isMounted) return;
        const combinedHomeOutdoor = [...homeRes.data, ...outdoorRes.data]
          .filter(Boolean)
          .slice(0, 12)
          .map(mapProductGridItem);
        setHomeOutdoorProducts(combinedHomeOutdoor);

        const consumerList = consumerRes.data
          .filter(Boolean)
          .slice(0, 8)
          .map(mapProductGridItem);
        setConsumerProducts(consumerList);
      } catch (error) {
        setHomeOutdoorProducts([]);
        setConsumerProducts([]);
      }
    };
    loadHomeOutdoor();
    return () => { isMounted = false; };
  }, []);

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    showToast('Inquiry sent to suppliers ✓');
    setQuoteForm({ item: '', details: '', qty: '' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.includes('@')) { showToast('Please enter a valid email'); return; }
    showToast('Subscribed successfully! 🎉');
    setEmail('');
  };

  const activeHomeOutdoor = homeOutdoorProducts.length
    ? homeOutdoorProducts
    : HOME_OUTDOOR.map((p) => ({ ...p, _id: null, img: p.img }));

  const activeConsumerElectronics = consumerProducts.length
    ? consumerProducts
    : CONSUMER_ELECTRONICS.map((p) => ({ ...p, _id: null, img: p.img }));

  return (
    <div className="bg-gray-100 min-h-screen relative">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-[999] animate-pulse">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* ═══════════ HERO: SIDEBAR + BANNER + RIGHT PANEL ═══════════ */}
        <div className="flex flex-col lg:flex-row gap-3 mb-3">

          {/* Sidebar */}
          <aside className="hidden lg:block w-[180px] flex-shrink-0">
            <div className="bg-white rounded-lg py-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition border-l-[3px] ${
                    activeCat === cat
                      ? 'bg-blue-50 text-blue-600 border-blue-600'
                      : 'text-gray-700 border-transparent hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </aside>

          {/* Center Banner */}
          <div className="flex-1 rounded-lg bg-gradient-to-br from-emerald-200 via-teal-300 to-teal-400 p-8 md:p-9 relative overflow-hidden min-h-[200px] md:min-h-[230px] flex flex-col justify-center">
            <p className="text-sm text-gray-700 mb-1">Latest trending</p>
            <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 leading-tight mb-4">
              Electronic<br />items
            </h1>
            <div className="relative z-10">
              <button className="bg-white text-gray-800 border border-gray-300 px-5 py-2 rounded-md text-sm font-medium w-fit hover:bg-blue-600 hover:text-white hover:border-blue-600 transition">
                Learn more
              </button>
            </div>
            <img
              src={bannerImg}
              alt="Homepage hero banner"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-emerald-900/20" />
          </div>

          {/* Right Panel */}
          <div className="hidden md:flex flex-col gap-2.5 w-[200px] flex-shrink-0">
            <div className="bg-white rounded-lg p-3.5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">👤</div>
                <div>
                  <p className="text-xs text-gray-500">Hi, user</p>
                  <p className="text-sm font-semibold">let's get started</p>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-md mb-1.5 hover:bg-blue-700 transition">
                Join now
              </button>
              <button className="w-full border border-blue-600 text-blue-600 text-sm font-medium py-1.5 rounded-md hover:bg-blue-600 hover:text-white transition">
                Log in
              </button>
            </div>
            <div className="bg-orange-500 text-white rounded-lg p-3.5 text-xs leading-relaxed cursor-pointer hover:bg-orange-600 transition">
              <p className="font-bold text-sm mb-0.5">Get US $10 off</p>
              with a new supplier
            </div>
            <div className="bg-blue-600 text-white rounded-lg p-3.5 text-xs leading-relaxed cursor-pointer hover:bg-blue-700 transition">
              <p className="font-semibold text-sm mb-0.5">Send quotes with</p>
              supplier preferences
            </div>
          </div>
        </div>

        {/* ═══════════ DEALS AND OFFERS ═══════════ */}
        <div className="bg-white rounded-lg flex flex-col md:flex-row overflow-hidden mb-3">
          <div className="w-full md:w-[180px] flex-shrink-0 p-4 md:border-r border-b md:border-b-0 border-gray-100">
            <h3 className="text-base font-bold mb-0.5">Deals and offers</h3>
            <p className="text-xs text-gray-400 mb-3">Hygiene equipments</p>
            <div className="flex gap-1.5">
              <div className="bg-gray-800 text-white rounded-md px-2.5 py-1.5 text-center min-w-[42px]">
                <span className="block text-base font-bold leading-none">{timer.d}</span>
                <span className="block text-[9px] text-gray-400 mt-0.5">Days</span>
              </div>
              <div className="bg-gray-800 text-white rounded-md px-2.5 py-1.5 text-center min-w-[42px]">
                <span className="block text-base font-bold leading-none">{timer.h}</span>
                <span className="block text-[9px] text-gray-400 mt-0.5">Hour</span>
              </div>
              <div className="bg-gray-800 text-white rounded-md px-2.5 py-1.5 text-center min-w-[42px]">
                <span className="block text-base font-bold leading-none">{timer.m}</span>
                <span className="block text-[9px] text-gray-400 mt-0.5">Min</span>
              </div>
              <div className="bg-gray-800 text-white rounded-md px-2.5 py-1.5 text-center min-w-[42px]">
                <span className="block text-base font-bold leading-none">{timer.s}</span>
                <span className="block text-[9px] text-gray-400 mt-0.5">Sec</span>
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            {deals.map((deal, idx) => (
              <Link
                key={idx}
                to={deal._id ? `/product/${deal._id}` : `/products?q=${encodeURIComponent(deal.name)}`}
                className="w-full p-4 text-center border-r border-b md:border-b-0 border-gray-100 last:border-r-0 hover:bg-gray-50 transition"
              >
                <div className="w-20 h-20 mx-auto mb-2.5 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={deal.img} alt={deal.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-medium text-gray-800 mb-1.5">{deal.name}</p>
                {deal.price && (
                  <p className="text-[11px] text-gray-500 mb-1">{typeof deal.price === 'number' ? `$${deal.price.toFixed(2)}` : deal.price}</p>
                )}
                <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded">{deal.discount}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════════ HOME AND OUTDOOR ═══════════ */}
        <div className="bg-white rounded-lg overflow-hidden mb-3">
          {/* Mobile heading */}
          <h3 className="md:hidden text-base font-bold text-gray-900 px-4 pt-4">Home and outdoor</h3>

          <div className="flex flex-col md:flex-row">
            {/* Promo box - desktop only (shown as heading on mobile instead) */}
            <div className="hidden md:flex w-[210px] flex-shrink-0 bg-gradient-to-br from-amber-50 to-amber-100 p-5 flex-col justify-between border-r border-gray-100">
              <div>
                <img src="/products/interior/2.jpg" alt="Home and outdoor" className="w-full h-28 object-contain mb-3" />
                <h3 className="text-base font-bold text-gray-900 leading-snug">Home and<br /> outdoor</h3>
              </div>
              <Link to="/products" className="bg-white border border-gray-300 px-4 py-1.5 rounded-md text-xs w-fit hover:border-blue-600 hover:text-blue-600 transition">
                Source now
              </Link>
            </div>

            {/* Products grid/scroll */}
            <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-px bg-gray-100 md:gap-0 md:bg-transparent">
              {activeHomeOutdoor.slice(0, 8).map((p, idx) => (
              <Link
                key={idx}
                to={p._id ? `/product/${p._id}` : `/products?q=${encodeURIComponent(p.name)}`}
                className="group bg-white p-2.5 md:p-3.5 md:border-r md:border-b md:border-gray-100 md:[&:nth-child(2n)]:border-r md:[&:nth-child(4n)]:border-r-0 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-full aspect-square md:w-16 md:h-16 mb-2 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-medium text-gray-900 leading-snug group-hover:text-blue-600 transition">{p.name}</p>
                <p className="text-[11px] text-gray-400">{typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : p.price}</p>
              </Link>
            ))}
            </div>
          </div>

          {/* Mobile "Source now" link below grid */}
          <Link to="/products" className="md:hidden flex items-center gap-1.5 text-blue-600 text-sm font-medium px-4 py-3.5">
            Source now <span>→</span>
          </Link>
        </div>

        {/* ═══════════ CONSUMER ELECTRONICS ═══════════ */}
        <div className="bg-white rounded-lg overflow-hidden mb-3">
          {/* Mobile heading */}
          <h3 className="md:hidden text-base font-bold text-gray-900 px-4 pt-4">Consumer electronics</h3>

          <div className="flex flex-col md:flex-row">
            {/* Promo box - desktop only */}
            <div className="hidden md:flex w-[210px] flex-shrink-0 bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 flex-col justify-between border-r border-gray-100">
              <div>
                <img src="/products/tech/5.jpg" alt="Consumer electronics" className="w-full h-28 object-contain mb-3" />
                <h3 className="text-base font-bold text-gray-900 leading-snug">Consumer<br /> electronics<br /> and gadgets</h3>
              </div>
              <Link to="/products" className="bg-white border border-gray-300 px-4 py-1.5 rounded-md text-xs w-fit hover:border-blue-600 hover:text-blue-600 transition">
                Source now
              </Link>
            </div>

            {/* Products grid */}
            <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-px bg-gray-100 md:gap-0 md:bg-transparent">
              {activeConsumerElectronics.slice(0, 8).map((p, idx) => (
              <Link
                key={idx}
                to={p._id ? `/product/${p._id}` : `/products?q=${encodeURIComponent(p.name)}`}
                className="group bg-white p-2.5 md:p-3.5 md:border-r md:border-b md:border-gray-100 md:[&:nth-child(2n)]:border-r md:[&:nth-child(4n)]:border-r-0 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-full aspect-square md:w-16 md:h-16 mb-2 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-medium text-gray-900 leading-snug group-hover:text-blue-600 transition">{p.name}</p>
                <p className="text-[11px] text-gray-400">{typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : p.price}</p>
              </Link>
            ))}
            </div>
          </div>

          {/* Mobile "Source now" link below grid */}
          <Link to="/products" className="md:hidden flex items-center gap-1.5 text-blue-600 text-sm font-medium px-4 py-3.5">
            Source now <span>→</span>
          </Link>
        </div>

        {/* ═══════════ QUOTE BANNER ═══════════ */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 rounded-lg p-6 md:p-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10 mb-3 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-72 h-72 bg-white/5 rounded-full"></div>
          <div className="flex-1 text-white z-10 w-full">
            <h2 className="text-2xl md:text-[26px] font-bold leading-snug mb-3">
              An easy way to send<br />requests to all suppliers
            </h2>
            <p className="text-sm text-blue-100 max-w-sm leading-relaxed mb-5 lg:mb-0">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt.
            </p>
            {/* Mobile-only simple trigger button */}
            <button
              onClick={() => setShowQuoteForm(!showQuoteForm)}
              className="lg:hidden bg-white text-blue-700 text-sm font-semibold px-6 py-2.5 rounded-md"
            >
              Send inquiry
            </button>
          </div>
          <form
            onSubmit={handleInquirySubmit}
            className={`${showQuoteForm ? 'flex' : 'hidden'} lg:flex bg-white rounded-lg p-5 w-full lg:w-[320px] flex-shrink-0 z-10 flex-col`}
          >
            <h4 className="text-sm font-semibold mb-3">Send quote to suppliers</h4>
            <label className="text-xs text-gray-500 block mb-1.5">What item you need?</label>
            <textarea
              value={quoteForm.details}
              onChange={(e) => setQuoteForm({ ...quoteForm, details: e.target.value })}
              placeholder="Type more details"
              rows="3"
              className="w-full border border-gray-200 rounded-md p-2.5 text-xs outline-none focus:border-blue-600 mb-3 resize-none"
            ></textarea>
            <div className="flex gap-2 mb-3.5">
              <input
                type="text"
                value={quoteForm.qty}
                onChange={(e) => setQuoteForm({ ...quoteForm, qty: e.target.value })}
                placeholder="Quantity"
                className="flex-1 border border-gray-200 rounded-md px-2.5 py-2 text-xs outline-none focus:border-blue-600 min-w-0"
              />
              <select className="border border-gray-200 rounded-md px-2.5 py-2 text-xs outline-none flex-shrink-0">
                <option>Pcs</option>
                <option>Kg</option>
                <option>Box</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-blue-700 transition">
              Send inquiry
            </button>
          </form>
        </div>

        {/* ═══════════ RECOMMENDED ITEMS ═══════════ */}
        <div className="mb-3">
          <h2 className="text-base font-bold text-gray-900 mb-3.5">Recommended items</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {recommended.map((item) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                className="bg-white rounded-lg p-3 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-full h-32 bg-gray-50 rounded-md mb-2.5 overflow-hidden flex items-center justify-center">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-semibold text-gray-900">${item.price.toFixed(2)}</p>
                <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{item.name}</p>
                <button className="mt-2 w-full py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition">
                  View details
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════════ EXTRA SERVICES ═══════════ */}
        <div className="mb-3">
          <h2 className="text-base font-bold text-gray-900 mb-3.5">Our extra services</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {SERVICES.map((s, idx) => (
              <div key={idx} className="bg-white rounded-lg overflow-hidden cursor-pointer group">
                <div className={`h-28 bg-gradient-to-br ${s.color} flex items-center justify-center relative`}>
                  <span className="text-4xl opacity-80">{s.icon}</span>
                  <div className="absolute -bottom-4 left-3.5 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-sm">
                    🔍
                  </div>
                </div>
                <div className="pt-6 pb-3.5 px-3.5">
                  <p className="text-xs font-semibold text-gray-900 whitespace-pre-line leading-snug">{s.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════ SUPPLIERS BY REGION ═══════════ */}
        <div className="bg-white rounded-lg p-5 md:p-6 mb-3">
          <h3 className="text-base font-bold mb-4">Suppliers by region</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {SUPPLIERS.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 cursor-pointer group">
                <img src={s.flag} alt={s.country} className="w-6 h-6 rounded-sm flex-shrink-0 object-cover" />
                <div>
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition">{s.country}</p>
                  <p className="text-[11px] text-blue-600">{s.url}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════ NEWSLETTER ═══════════ */}
        <div className="bg-white rounded-lg py-8 px-5 text-center mb-3">
          <h3 className="text-lg font-bold mb-1.5">Subscribe on our newsletter</h3>
          <p className="text-sm text-gray-500 mb-4">Get daily news on upcoming offers from many suppliers all over the world</p>
          <form onSubmit={handleSubscribe} className="flex justify-center max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="✉  Email"
              className="flex-1 border border-gray-200 rounded-l-md px-4 py-2.5 text-sm outline-none focus:border-blue-600 min-w-0"
            />
            <button type="submit" className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-r-md hover:bg-blue-700 transition flex-shrink-0">
              Subscribe
            </button>
          </form>
        </div>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="bg-white rounded-lg pt-8 pb-5 px-5 md:px-8">
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
            <p>© 2026 Ecommerce.</p>
            <p>🇬🇧 English</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
