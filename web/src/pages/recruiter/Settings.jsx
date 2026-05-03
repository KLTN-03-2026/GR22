// Module: recruiter/Settings.jsx - Quản lý logic hệ thống
import React from 'react';
import { useSmtpSettings, useUpdateSmtpSettings } from '../../hooks/useSettings';
import { Mail, Server, Shield, Send, Save, Loader2, Sparkles, AlertCircle, Lock, CheckCircle, Eye, EyeOff, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const TABS = [
  { id: 'smtp', label: 'Cấu hình SMTP', icon: Server },
  { id: 'template', label: 'Mẫu Email', icon: Send },
  { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
];

const RecruiterSettings = () => {
  const [activeTab, setActiveTab] = React.useState('smtp');
  const { data: settings, isLoading } = useSmtpSettings();
  const updateSettingsMutation = useUpdateSmtpSettings();

  const [formData, setFormData] = React.useState({
    host: '', port: 587, secure: false, user: '', pass: '',
    fromName: '', fromEmail: '', templateTitle: '', templateContent: ''
  });

  React.useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettingsMutation.mutateAsync(formData);
      toast.success('Đã lưu cấu hình email thành công');
    } catch (error) {
      toast.error('Không thể lưu cấu hình: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'port' ? parseInt(value) : value)
    }));
  };

  // Change password state
  const [pwData, setPwData] = React.useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = React.useState('');
  const [pwSuccess, setPwSuccess] = React.useState('');
  const [pwLoading, setPwLoading] = React.useState(false);
  const [showOld, setShowOld] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (!pwData.oldPassword || !pwData.newPassword) return setPwError('Vui lòng điền đầy đủ');
    if (pwData.newPassword.length < 6) return setPwError('Mật khẩu mới phải có ít nhất 6 ký tự');
    if (pwData.newPassword !== pwData.confirmPassword) return setPwError('Mật khẩu xác nhận không khớp');
    setPwLoading(true);
    try {
      const { data } = await api.post('/auth/change-password', { oldPassword: pwData.oldPassword, newPassword: pwData.newPassword });
      setPwSuccess(data.message);
      setPwData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setPwLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-4xl font-black text-primary-dark tracking-tighter flex items-center gap-3">
          <Settings className="w-10 h-10 text-primary" /> Cài đặt
        </h2>
        <p className="text-slate-400 font-bold mt-1 text-sm">Quản lý cấu hình hệ thống và bảo mật tài khoản</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-10 bg-slate-100/60 p-2 rounded-2xl w-fit">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300
                ${isActive
                  ? 'bg-white text-primary shadow-lg shadow-primary/10 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===== TAB: SMTP ===== */}
      {activeTab === 'smtp' && (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
            <h3 className="text-xl font-black text-primary-dark flex items-center gap-3">
              <Server className="w-6 h-6 text-primary" /> SMTP Server
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Host</label>
                <input type="text" name="host" value={formData.host} onChange={handleChange} placeholder="smtp.gmail.com"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Port</label>
                  <input type="number" name="port" value={formData.port} onChange={handleChange} placeholder="587"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all" required />
                </div>
                <div className="flex items-end pb-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" name="secure" checked={formData.secure} onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-primary focus:ring-primary/20 transition-all cursor-pointer" />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-primary transition-colors">SSL/TLS</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username (Email)</label>
                <input type="email" name="user" value={formData.user} onChange={handleChange} placeholder="your-email@gmail.com"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input type="password" name="pass" value={formData.pass} onChange={handleChange} placeholder="••••••••••••"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên Hiển Thị</label>
                  <input type="text" name="fromName" value={formData.fromName} onChange={handleChange} placeholder="HR Department"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Gửi</label>
                  <input type="email" name="fromEmail" value={formData.fromEmail} onChange={handleChange} placeholder="hr@company.com"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 flex items-start gap-4">
            <Shield className="w-6 h-6 text-primary shrink-0 mt-1" />
            <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
              Nếu sử dụng Gmail, hãy chắc chắn bạn đã bật "Mật khẩu ứng dụng" (App Password) trong phần cài đặt bảo mật của Google.
            </p>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={updateSettingsMutation.isPending}
              className="flex items-center gap-4 bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary transition-all shadow-2xl shadow-slate-900/20 active:scale-95 disabled:opacity-50">
              {updateSettingsMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
              Lưu cấu hình SMTP
            </button>
          </div>
        </form>
      )}

      {/* ===== TAB: EMAIL TEMPLATE ===== */}
      {activeTab === 'template' && (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 pointer-events-none opacity-50"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h3 className="text-2xl font-black text-primary-dark flex items-center gap-4">
                <Send className="w-8 h-8 text-primary" /> Mẫu Email Trúng Tuyển
              </h3>
              <div className="px-5 py-2 bg-primary/10 rounded-full flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Hỗ trợ Dynamic Placeholders</span>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu Đề Email (Subject)</label>
                <input type="text" name="templateTitle" value={formData.templateTitle} onChange={handleChange} placeholder="Thông báo kết quả phỏng vấn"
                  className="w-full px-6 py-8 bg-slate-50 border-none rounded-[2rem] font-black text-2xl text-primary-dark placeholder:text-slate-200 focus:ring-4 focus:ring-primary/10 transition-all" required />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội Dung Email (HTML/Text)</label>
                  <div className="flex gap-2">
                    {['candidate_name', 'job_title', 'company_name'].map(tag => (
                      <code key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold">
                        {`{{${tag}}}`}
                      </code>
                    ))}
                  </div>
                </div>
                <textarea name="templateContent" value={formData.templateContent} onChange={handleChange} rows="12" placeholder="Viết nội dung email tại đây..."
                  className="w-full px-8 py-8 bg-slate-50 border-none rounded-[2.5rem] font-bold text-slate-600 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 transition-all leading-relaxed resize-none" required></textarea>
              </div>
            </div>

            <div className="pt-6 flex justify-end relative z-10">
              <button type="submit" disabled={updateSettingsMutation.isPending}
                className="flex items-center gap-4 bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-primary transition-all shadow-2xl shadow-slate-900/20 active:scale-95 disabled:opacity-50">
                {updateSettingsMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                Lưu Mẫu Email
              </button>
            </div>
          </div>

          <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 flex items-start gap-5">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest">Lưu ý cực kỳ quan trọng</h4>
              <p className="text-xs font-bold text-amber-700/70 leading-relaxed italic">
                Hệ thống sẽ tự động gửi email trúng tuyển theo mẫu trên ngay khi bạn cập nhật trạng thái ứng viên thành <span className="text-green-600">"Chấp nhận"</span>. Hãy kiểm tra kỹ nội dung mẫu trước khi lưu.
              </p>
            </div>
          </div>
        </form>
      )}

      {/* ===== TAB: CHANGE PASSWORD ===== */}
      {activeTab === 'password' && (
        <div className="max-w-xl animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary-dark">Đổi mật khẩu</h3>
                <p className="text-xs text-slate-400 font-semibold">Cập nhật mật khẩu đăng nhập của bạn</p>
              </div>
            </div>

            {pwError && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">{pwError}</div>}
            {pwSuccess && <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm font-semibold border border-green-100 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> {pwSuccess}</div>}

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input type={showOld ? 'text' : 'password'} value={pwData.oldPassword} onChange={e => setPwData(p => ({...p, oldPassword: e.target.value}))} placeholder="Nhập mật khẩu hiện tại"
                    className="w-full px-6 py-4 pr-12 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all" />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} value={pwData.newPassword} onChange={e => setPwData(p => ({...p, newPassword: e.target.value}))} placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-6 py-4 pr-12 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all" />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu mới</label>
                <input type="password" value={pwData.confirmPassword} onChange={e => setPwData(p => ({...p, confirmPassword: e.target.value}))} placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <button type="submit" disabled={pwLoading}
                className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-light transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                {pwLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Lock className="w-5 h-5" />} Cập nhật mật khẩu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterSettings;

// Git update: Triggering change for push
