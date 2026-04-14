import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      return setError('Mật khẩu phải có ít nhất 6 ký tự');
    }
    if (newPassword !== confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, newPassword });
      setSuccess(data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-slate-100 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
          <p className="font-bold text-lg">Link không hợp lệ</p>
          <p className="text-sm mt-2">Vui lòng yêu cầu link khôi phục mật khẩu mới.</p>
        </div>
        <Link to="/forgot-password" className="text-primary font-bold text-sm mt-6 inline-block">
          Yêu cầu link mới
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-primary-dark">Đặt Mật Khẩu Mới</h2>
        <p className="text-slate-400 mt-2 text-sm">Nhập mật khẩu mới cho tài khoản của bạn</p>
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
            <p className="font-bold text-lg">{success}</p>
            <p className="text-sm mt-2">Đang chuyển hướng đến trang đăng nhập...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-600">Mật khẩu mới</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-600">Xác nhận mật khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Nhập lại mật khẩu"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-light transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đặt Mật Khẩu Mới'}
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

export default ResetPassword;
