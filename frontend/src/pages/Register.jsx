import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await register(name, email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submitHandler} className="bg-white p-8 rounded-xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">📝 Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <input 
          type="text" 
          placeholder="Full Name" 
          className="w-full p-3 border mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
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
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="mt-4 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;