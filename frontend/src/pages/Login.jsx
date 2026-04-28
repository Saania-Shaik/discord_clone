import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex w-full h-screen items-center justify-center bg-[#5865F2] p-4">
      <div className="bg-[#313338] p-8 rounded-lg shadow-xl w-full max-w-md text-center text-[#DBDEE1]">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
        <p className="text-sm text-[#B5BAC1] mb-6">We're so excited to see you again!</p>
        
        {error && <div className="bg-red-500 text-white p-2 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-[#B5BAC1] uppercase mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} required className="w-full p-2 bg-[#1E1F22] text-[#DBDEE1] rounded outline-none focus:ring-2 focus:ring-[#5865F2]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#B5BAC1] uppercase mb-1">Password <span className="text-red-500">*</span></label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 bg-[#1E1F22] text-[#DBDEE1] rounded outline-none focus:ring-2 focus:ring-[#5865F2]" />
          </div>
          
          <button type="submit" className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-2 rounded transition-colors mt-4">
            Log In
          </button>
        </form>

        <p className="mt-4 text-sm text-[#B5BAC1] text-left">
          Need an account? <Link to="/register" className="text-[#00A8FC] hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
