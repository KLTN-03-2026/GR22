// Module: pages/Login.jsx - Quản lý logic hệ thống
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!email) errors.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Định dạng email không hợp lệ';
    if (!password) errors.password = 'Mật khẩu là bắt buộc';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(`/${data.user.role}`);
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
      <h2 className="text-3xl font-bold mb-8 text-center text-primary-dark">Chào mừng trở lại</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm font-semibold text-center border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-600">Địa chỉ Email</label>
          <input 
            type="email" 
            className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({...p, email: ''})); }}
            placeholder="name@company.com"
          />
          {fieldErrors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{fieldErrors.email}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-600">Mật khẩu</label>
            <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <input 
            type="password" 
            className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.password ? 'border-red-400 bg-red-50/50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({...p, password: ''})); }}
            placeholder="••••••••"
          />
          {fieldErrors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{fieldErrors.password}</p>}
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-light transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="mt-8 text-center text-slate-500">
        Chưa có tài khoản? <Link to="/register" className="text-primary font-bold">Đăng ký tại đây</Link>
      </p>
    </div>
  );
};

export default Login;

// Git update: Triggering change for push
