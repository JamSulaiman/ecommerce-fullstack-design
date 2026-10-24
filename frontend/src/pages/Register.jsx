import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, verifyEmail, resendVerification, login } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await register(name, email, password);
    
    if (result.success) {
      if (result.verificationRequired) {
        setVerificationRequired(true);
        setNotice(result.emailSent
          ? 'A 6-digit verification code has been sent. It expires in 10 minutes.'
          : result.message);
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  const verifyHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const result = await verifyEmail(email, verificationCode);
    if (result.success) {
      const loginResult = await login(email, password);
      if (loginResult.success) navigate('/');
      else setError(loginResult.error || 'Email verified. Please sign in.');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const resendHandler = async () => {
    setLoading(true);
    setError('');
    setNotice('');
    const result = await resendVerification(email);
    if (result.success) setNotice(result.message);
    else setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={verificationRequired ? verifyHandler : submitHandler} className="bg-white p-8 rounded-xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">{verificationRequired ? 'Verify your email' : '📝 Register'}</h2>
        {notice && <p role="status" className="text-emerald-700 text-center text-sm mb-4">{notice}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {!verificationRequired ? <>
        <input
          type="text" 
          placeholder="Full Name" 
          className="w-full p-3 border mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          maxLength="100"
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-3 border mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          maxLength="254"
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-3 border mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          minLength="8"
          autoComplete="new-password"
          required 
        />
        </> : <>
          <p className="mb-4 text-center text-sm text-gray-600">Enter the code we emailed to <strong>{email}</strong>.</p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength="6"
            placeholder="6-digit code"
            className="w-full p-3 border mb-4 rounded-lg text-center tracking-[0.4em] focus:ring-2 focus:ring-blue-500 outline-none"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            required
          />
          <button type="button" onClick={resendHandler} disabled={loading} className="w-full mb-4 text-sm text-blue-600 hover:underline disabled:opacity-50">
            Resend verification code
          </button>
        </>}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Please wait…' : verificationRequired ? 'Verify email' : 'Register'}
        </button>
        {!verificationRequired && <p className="mt-4 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>}
      </form>
    </div>
  );
}

export default Register;