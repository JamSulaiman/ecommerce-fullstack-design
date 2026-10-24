import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const Contact = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError('');
    try {
      const { data } = await API.post('/users/inquiries', {
        ...form,
        type: 'support',
        item: 'Customer support',
        details: form.message,
        quantity: 1,
        quantityUnit: 'Pcs',
      });
      setSuccess(data.message);
      setForm((current) => ({ ...current, message: '' }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-5xl mx-auto rounded-3xl bg-white p-6 sm:p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Contact support</h1>
        <p className="text-gray-600 mt-3 mb-8">Send us a message and our store team will review it.</p>
        <div className="grid gap-8 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <label className="block text-sm font-medium text-gray-700">
              Name
              <input required maxLength="100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Email
              <input type="email" required maxLength="254" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Message
              <textarea required maxLength="2000" rows="5" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <button disabled={submitting} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
          <section className="rounded-2xl bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">What happens next?</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">Messages are saved for the store team to review in the admin panel under Customer messages. Include your order number if you need help with an order.</p>
            <div className="mt-6 space-y-3 text-sm">
              <Link to="/help" className="block text-blue-600 hover:underline">Visit the help center</Link>
              <Link to="/profile#orders" className="block text-blue-600 hover:underline">Check recent orders</Link>
              <Link to="/products" className="block text-blue-600 hover:underline">Browse products</Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Contact;
