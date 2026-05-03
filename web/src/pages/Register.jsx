// Module: pages/Register.jsx - Quản lý logic hệ thống
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!email) errors.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Định dạng email không hợp lệ';
    if (!password) errors.password = 'Mật khẩu là bắt buộc';
    else if (password.length < 6) errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (password !== confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/auth/register', { email, password, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
      <h2 className="text-3xl font-bold mb-8 text-center text-primary-dark">Tạo tài khoản</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm font-semibold text-center border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-600">Bạn là</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => setRole('candidate')}
              className={`py-3 rounded-xl border font-bold transition-all ${role === 'candidate' ? 'bg-primary/10 border-primary text-primary' : 'border-slate-200 text-slate-400'}`}
            >
              Ứng viên
            </button>
            <button 
              type="button"
              onClick={() => setRole('recruiter')}
              className={`py-3 rounded-xl border font-bold transition-all ${role === 'recruiter' ? 'bg-primary/10 border-primary text-primary' : 'border-slate-200 text-slate-400'}`}
            >
              Nhà tuyển dụng
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-600">Địa chỉ Email</label>
          <input 
            type="email" 
            className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans`}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({...p, email: ''})); }}
            placeholder="name@company.com"
          />
          {fieldErrors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{fieldErrors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-600">Mật khẩu</label>
          <input 
            type="password" 
            className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.password ? 'border-red-400 bg-red-50/50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({...p, password: ''})); }}
            placeholder="Tối thiểu 6 ký tự"
          />
          {fieldErrors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{fieldErrors.password}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-600">Xác nhận mật khẩu</label>
          <input 
            type="password" 
            className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.confirmPassword ? 'border-red-400 bg-red-50/50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(p => ({...p, confirmPassword: ''})); }}
            placeholder="Nhập lại mật khẩu"
          />
          {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{fieldErrors.confirmPassword}</p>}
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-light transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
        </button>
      </form>
      <p className="mt-8 text-center text-slate-500">
        Đã có tài khoản? <Link to="/login" className="text-primary font-bold">Đăng nhập ngay</Link>
      </p>
    </div>
  );
};

export default Register;

// Git update: Triggering change for push
