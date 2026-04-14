import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      return setError('Vui lòng nhập email');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-primary-dark">Quên mật khẩu</h2>
        <p className="text-slate-400 mt-2 text-sm">Nhập email đã đăng ký để nhận link khôi phục mật khẩu</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm font-semibold text-center border border-red-100">
          {error}
        </div>
      )}

      {success ? (
        <div className="text-center space-y-4">
          <div className="bg-green-50 text-green-600 p-6 rounded-xl border border-green-100">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="font-bold text-lg">Đã gửi email!</p>
            <p className="text-sm mt-2">{success}</p>
          </div>
          <p className="text-slate-400 text-sm">Vui lòng kiểm tra hộp thư (bao gồm thư mục Spam)</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-600">Địa chỉ Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-light transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi Email Khôi Phục'}
          </button>
        </form>
      )}

      <p className="mt-8 text-center">
        <Link to="/login" className="text-primary font-bold text-sm flex items-center justify-center gap-2 hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
