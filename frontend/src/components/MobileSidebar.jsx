import React from 'react';
import { Link } from 'react-router-dom';

const MobileSidebar = ({ isOpen, onClose }) => {
  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-50' : 'opacity-0'}`} onClick={onClose} />
      
      {/* Sidebar Content */}
      <div className={`absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* User Header */}
        <div className="bg-gray-100 p-4 border-b flex flex-col gap-2 relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 text-lg">✕</button>
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl text-white">👤</div>
          <Link to="/profile" onClick={onClose} className="text-gray-800 font-semibold text-sm">
            Sign in | Register
          </Link>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 text-gray-700 text-sm font-medium">
          <div className="flex flex-col gap-4 border-b pb-4">
            <Link to="/" onClick={onClose} className="flex items-center gap-3">
              <span>🏠</span> Home
            </Link>
            <Link to="/products" onClick={onClose} className="flex items-center gap-3">
              <span>📋</span> Categories
            </Link>
            <Link to="/profile#orders" onClick={onClose} className="flex items-center gap-3">
              <span>📦</span> My orders
            </Link>
            <Link to="/profile" onClick={onClose} className="flex items-center gap-3">
              <span>🧡</span> Profile
            </Link>
          </div>
          <div className="flex flex-col gap-4 border-b pb-4 text-gray-600">
            <div className="flex items-center gap-3 cursor-pointer"><span>🌐</span> English | USD</div>
            <div className="flex items-center gap-3 cursor-pointer"><span>🎧</span> Contact us</div>
            <div className="flex items-center gap-3 cursor-pointer"><span>🏢</span> About</div>
          </div>
          <div className="flex flex-col gap-3 text-xs text-gray-400">
            <span className="cursor-pointer">User agreement</span>
            <span className="cursor-pointer">Partnership</span>
            <span className="cursor-pointer">Privacy policy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;