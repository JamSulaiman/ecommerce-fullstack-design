import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // <-- Import karo

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();  // <-- Context se login function lo
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      if (result.user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submitHandler} className="bg-white p-8 rounded-xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">🔐 Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-3 border mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-3 border mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="mt-4 text-center text-gray-600">
          New user? <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;