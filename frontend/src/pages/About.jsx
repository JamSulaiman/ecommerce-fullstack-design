import React from 'react';
import { Link } from 'react-router-dom';

const About = () => (
  <main className="min-h-screen bg-gray-100 px-4 py-10">
    <section className="max-w-4xl mx-auto rounded-3xl bg-white p-6 sm:p-10">
      <p className="text-sm font-semibold text-blue-600">About the store</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900">A simpler way to shop</h1>
      <p className="mt-4 leading-7 text-gray-600">
        Browse products across electronics, home, clothing, tools, and more. Create an account to place cash-on-delivery orders and follow recent order updates from your profile.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link to="/products" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Browse products</Link>
        <Link to="/help" className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50">Visit help center</Link>
      </div>
    </section>
  </main>
);

export default About;
