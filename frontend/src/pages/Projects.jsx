import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    item: '',
    quantity: '1',
    quantityUnit: 'Pcs',
    details: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      const { data } = await API.post('/users/inquiries', {
        ...form,
        type: 'project',
        quantity: Number(form.quantity),
      });
      setMessage(`${data.message} Our team can contact you at ${form.email}.`);
      setForm((current) => ({ ...current, item: '', quantity: '1', quantityUnit: 'Pcs', details: '' }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 p-8 sm:p-12 text-white">
          <p className="text-blue-100 font-medium">Custom and bulk orders</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2">Tell us about your project</h1>
          <p className="mt-4 max-w-2xl text-blue-50">Request pricing for bulk quantities, custom product sourcing, or a special order. Your request will be saved for our team to review.</p>
          <Link to="/products" className="inline-block mt-6 rounded-lg bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50">Browse products</Link>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Project request</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">Required fields are marked with an asterisk.</p>
          {message && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-emerald-800">{message}</p>}
          {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
          <form onSubmit={submitRequest} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Your name *
              <input name="name" required maxLength="100" value={form.name} onChange={updateField} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Email *
              <input name="email" type="email" required maxLength="254" value={form.email} onChange={updateField} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Product or item *
              <input name="item" required maxLength="150" value={form.item} onChange={updateField} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Quantity *
                <div className="mt-1 flex gap-2">
                  <input name="quantity" type="number" min="1" step="1" required value={form.quantity} onChange={updateField} className="w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
                  <select name="quantityUnit" value={form.quantityUnit} onChange={updateField} className="rounded-lg border border-gray-300 px-3 py-2 font-normal">
                    <option>Pcs</option>
                    <option>Kg</option>
                    <option>Box</option>
                  </select>
                </div>
            </label>
            <label className="text-sm font-medium text-gray-700 sm:col-span-2">
              Project details *
              <textarea name="details" required maxLength="2000" rows="5" value={form.details} onChange={updateField} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" placeholder="Tell us about sizes, customization, destination, or deadline." />
            </label>
            <div className="sm:col-span-2">
              <button disabled={submitting} className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {submitting ? 'Submitting…' : 'Submit project request'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Projects;
