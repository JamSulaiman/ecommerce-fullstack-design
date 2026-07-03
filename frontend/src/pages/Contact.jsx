import React from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="bg-white shadow-xl rounded-3xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-600 mt-3">
            Need help? Send us a message or use the links below to reach our support team.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 p-6 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer support</h2>
            <p className="text-gray-600">Email us at <a href="mailto:support@example.com" className="text-blue-600 hover:underline">support@example.com</a></p>
            <p className="text-gray-600 mt-2">Or call us at <span className="font-semibold">+1 (800) 123-4567</span>.</p>
          </div>
          <div className="rounded-3xl border border-gray-200 p-6 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick links</h2>
            <ul className="space-y-3 text-gray-600">
              <li><Link to="/" className="text-blue-600 hover:underline">Home</Link></li>
              <li><Link to="/products" className="text-blue-600 hover:underline">Browse products</Link></li>
              <li><Link to="/profile" className="text-blue-600 hover:underline">My account</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
