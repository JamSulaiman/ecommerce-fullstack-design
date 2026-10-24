import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];
const STATUS_LABEL = { pending: 'Placed', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
const STATUS_BADGE = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};
const OrderTimeline = ({ order }) => {
  const status = order.status || 'pending';
  if (status === 'cancelled') {
    const c = (order.statusHistory || []).find((h) => h.status === 'cancelled');
    return (
      <p className="text-xs text-red-600 mb-4">
        Order cancelled{c ? ` on ${new Date(c.date).toLocaleDateString()}` : ''}.
      </p>
    );
  }
  const idx = STEPS.indexOf(status);
  return (
    <div className="flex items-start mb-4">
      {STEPS.map((st, i) => {
        const done = i <= idx;
        const h = (order.statusHistory || []).find((x) => x.status === st);
        return (
          <div key={st} className="flex-1 flex flex-col items-center relative">
            {i > 0 && <div className={`absolute top-3 right-1/2 w-full h-0.5 ${i <= idx ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
            <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${done ? 'bg-emerald-500' : 'bg-gray-300'}`}>
              {done ? '✓' : i + 1}
            </div>
            <p className={`text-xs mt-1 ${done ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{STATUS_LABEL[st]}</p>
            {h && <p className="text-[10px] text-gray-400">{new Date(h.date).toLocaleDateString()}</p>}
          </div>
        );
      })}
    </div>
  );
};

const Profile = () => {
  const { user, logout, updateProfile, requestEmailChange, verifyEmailChange, resendEmailChangeCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailCode: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [emailChangePending, setEmailChangePending] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateProfileField = (event) => {
    setProfileForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileMessage('');
    setProfileError('');
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      setProfileError('New password and confirmation do not match.');
      return;
    }

    setProfileSaving(true);
    if (profileForm.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const emailResult = await requestEmailChange(profileForm.email, profileForm.currentPassword);
      if (!emailResult.success) {
        setProfileError(emailResult.error);
        setProfileSaving(false);
        return;
      }
      setEmailChangePending(true);
      setProfileMessage('A verification code was sent to your new email address.');
      setProfileSaving(false);
      return;
    }
    const result = await updateProfile({
      name: profileForm.name,
      email: profileForm.email,
      currentPassword: profileForm.currentPassword,
      ...(profileForm.newPassword ? { newPassword: profileForm.newPassword } : {}),
    });
    if (result.success) {
      setProfileMessage('Your profile has been updated.');
      setProfileForm((current) => ({ ...current, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } else {
      setProfileError(result.error);
    }
    setProfileSaving(false);
  };

  const confirmEmailChange = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileMessage('');
    const result = await verifyEmailChange(profileForm.emailCode);
    if (result.success) {
      setEmailChangePending(false);
      setProfileForm((current) => ({ ...current, email: result.user.email, emailCode: '' }));
      setProfileMessage('Your new email address has been verified. Save again to apply any other profile changes.');
    } else {
      setProfileError(result.error);
    }
    setProfileSaving(false);
  };

  const resendEmailChange = async () => {
    setProfileSaving(true);
    setProfileError('');
    setProfileMessage('');
    const result = await resendEmailChangeCode();
    if (result.success) setProfileMessage(result.message);
    else setProfileError(result.error);
    setProfileSaving(false);
  };

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    setLoading(true);
    API.get('/users/orders')
      .then(({ data }) => {
        if (mounted) {
          setOrders(data);
          setError('');
        }
      })
      .catch((err) => {
        if (mounted) setError(err.response?.data?.message || 'Could not load orders');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please sign in to view your profile</h2>
          <p className="text-sm text-gray-500 mb-6">You need an account to see your personal details and order history.</p>
          <div className="flex justify-center gap-3">
            <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">Login</Link>
            <Link to="/register" className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <section className="min-w-0 flex-1 bg-white rounded-3xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">My account</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your profile, orders, and settings.</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <details className="rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                <summary className="cursor-pointer text-sm font-semibold text-gray-800">My profile and personal details</summary>
                <form onSubmit={saveProfile} className="pt-4 space-y-3">
                  {profileMessage && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{profileMessage}</p>}
                  {profileError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{profileError}</p>}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-medium text-gray-700">
                      Name
                      <input name="name" value={profileForm.name} onChange={updateProfileField} required maxLength="100" autoComplete="name" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal" />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                      Email
                      <input name="email" type="email" value={profileForm.email} onChange={updateProfileField} required maxLength="254" autoComplete="email" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal" />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                      Current password <span className="font-normal text-gray-500">(required to save)</span>
                      <input name="currentPassword" type="password" value={profileForm.currentPassword} onChange={updateProfileField} required autoComplete="current-password" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal" />
                    </label>
                    <div className="text-sm text-gray-600 sm:self-end sm:pb-2">
                      Account type: <span className="font-semibold">{user.isAdmin ? 'Admin' : 'Customer'}</span>
                    </div>
                    <label className="text-sm font-medium text-gray-700">
                      New password <span className="font-normal text-gray-500">(optional, at least 8 characters)</span>
                      <input name="newPassword" type="password" value={profileForm.newPassword} onChange={updateProfileField} minLength="8" autoComplete="new-password" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal" />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                      Confirm new password
                      <input name="confirmPassword" type="password" value={profileForm.confirmPassword} onChange={updateProfileField} minLength="8" autoComplete="new-password" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal" />
                    </label>
                  </div>
                  <button type="submit" disabled={profileSaving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">
                    {profileSaving ? 'Saving…' : 'Save changes'}
                  </button>
                </form>
                {emailChangePending && (
                  <form onSubmit={confirmEmailChange} className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-end">
                    <label className="flex-1 text-sm font-medium text-gray-700">
                      Verification code sent to {profileForm.email}
                      <input
                        name="emailCode"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]{6}"
                        maxLength="6"
                        value={profileForm.emailCode}
                        onChange={(event) => setProfileForm((current) => ({ ...current, emailCode: event.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal sm:max-w-xs"
                      />
                    </label>
                    <button type="submit" disabled={profileSaving} className="rounded-lg border border-blue-600 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60">
                      Verify new email
                    </button>
                    <button type="button" onClick={resendEmailChange} disabled={profileSaving} className="text-sm text-blue-600 hover:underline disabled:opacity-50">
                      Resend code
                    </button>
                  </form>
                )}
              </details>
              <details className="rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                <summary className="cursor-pointer text-sm font-semibold text-gray-800">Account links</summary>
                <div className="pt-4">
                  {!user.isAdmin && <Link to="/cart" className="block text-sm text-blue-600 hover:underline mb-3">View cart</Link>}
                  <Link to="/products" className="block text-sm text-blue-600 hover:underline mb-3">Browse products</Link>
                  {user.isAdmin
                    ? <Link to="/admin" className="block text-sm text-blue-600 hover:underline">Open admin panel</Link>
                    : <Link to="/profile#orders" className="block text-sm text-blue-600 hover:underline">Go to recent orders</Link>}
                </div>
              </details>
            </div>

            {!user.isAdmin && <details id="orders" open={location.hash === '#orders'} className="rounded-3xl bg-white border border-gray-200 p-4 sm:p-6">
              <summary className="cursor-pointer text-base sm:text-lg font-semibold text-gray-900">
                My order details ({orders.length})
              </summary>
              <p className="text-sm text-gray-500 mt-3 mb-5">Orders stay visible until 24 hours after delivery or cancellation. Older orders are removed automatically.</p>

              {loading && <p className="text-sm text-gray-500">Loading orders…</p>}
              {!loading && error && <p className="text-sm text-red-500">{error}</p>}
              {!loading && !error && orders.length === 0 && (
                <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                  No recent orders to show.
                </div>
              )}

              {!loading && !error && orders.length > 0 && (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="min-w-0 rounded-3xl border border-gray-200 p-4 sm:p-5 hover:shadow-sm transition">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Order ID</p>
                          <p className="break-all text-sm font-semibold text-gray-900">{order._id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Placed</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-sm font-semibold text-gray-900">${order.totalPrice.toFixed(2)}</p>
                        </div>
                        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[order.status || 'pending']}`}>
                          {STATUS_LABEL[order.status || 'pending']}
                        </div>
                      </div>
                      <OrderTimeline order={order} />
                      {order.shippingAddress?.address && (
                        <p className="text-xs text-gray-500 mb-4">
                          Ship to: {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city} · {order.shippingAddress.phone}
                        </p>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {order.orderItems.map((item) => (
                          <div key={`${order._id}-${item.product?._id || item.name}`} className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-3xl object-cover border border-gray-200" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </details>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
