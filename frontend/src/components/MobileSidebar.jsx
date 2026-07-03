import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MobileSidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-50' : 'opacity-0'}`} onClick={onClose} />
      
      {/* Sidebar Content */}
      <div className={`absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* User Header */}
        <div className="bg-gray-100 p-4 border-b flex flex-col gap-3 relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 text-lg">✕</button>
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl text-white">👤</div>
          {user ? (
            <>
              <p className="text-sm text-gray-700">Hi, {user.name}</p>
              <Link to="/profile" onClick={onClose} className="text-blue-600 font-semibold text-sm hover:underline">
                View profile
              </Link>
            </>
          ) : (
            <div className="flex flex-wrap gap-2 text-sm font-semibold text-gray-800">
              <Link to="/login" onClick={onClose} className="hover:text-blue-600">
                Sign in
              </Link>
              <span className="text-gray-500">|</span>
              <Link to="/register" onClick={onClose} className="hover:text-blue-600">
                Register
              </Link>
            </div>
          )}
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
            <Link to="/contact" onClick={onClose} className="flex items-center gap-3 hover:text-blue-600">
              <span>💬</span> Message
            </Link>
            <Link to="/contact" onClick={onClose} className="flex items-center gap-3 hover:text-blue-600">
              <span>🎧</span> Contact us
            </Link>
            <Link to="/contact" onClick={onClose} className="flex items-center gap-3 hover:text-blue-600">
              <span>🏢</span> About
            </Link>
          </div>
          <div className="flex flex-col gap-3 text-xs text-gray-400">
            <Link to="/contact" onClick={onClose} className="cursor-pointer hover:text-blue-600">User agreement</Link>
            <Link to="/contact" onClick={onClose} className="cursor-pointer hover:text-blue-600">Partnership</Link>
            <Link to="/contact" onClick={onClose} className="cursor-pointer hover:text-blue-600">Privacy policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;