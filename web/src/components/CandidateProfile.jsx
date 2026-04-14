import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Phone, MapPin, Save, Loader2, AlertCircle, Calendar, Users, Upload } from 'lucide-react';
import { useUser, useUpdateUser, useUploadAvatar } from '../hooks/useProfile';
import CustomSelect from './ui/CustomSelect';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
});

const CandidateProfile = () => {
  const { data: user, isLoading } = useUser();
  const updateMutation = useUpdateUser();
  const uploadAvatarMutation = useUploadAvatar();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '', phone: '', address: '', dateOfBirth: '', gender: '',
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
      });
    }
  }, [user, reset]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAvatarMutation.mutateAsync(file);
      toast.success('Cập nhật ảnh đại diện thành công');
    } catch (err) {
      toast.error('Không thể cập nhật ảnh đại diện');
    }
  };

  const onSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync(data);
      toast.success('Cập nhật thông tin thành công!', {
        icon: '✅',
        style: { borderRadius: '1.5rem', background: '#0F172A', color: '#fff', padding: '1.5rem', fontWeight: 'bold' },
      });
    } catch (err) {
      toast.error('Không thể cập nhật thông tin');
    }
  };

  if (isLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin w-12 h-12 text-primary" />
    </div>
  );

  const avatarUrl = user?.avatar ? `${API_URL}${user.avatar}` : null;

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h2 className="text-5xl font-black text-primary-dark tracking-tighter">Thông tin Cá nhân</h2>
        <p className="text-slate-500 font-bold mt-2 text-lg">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-10">
        {/* Avatar & Name */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="relative group shrink-0">
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <label
              htmlFor="avatar-upload"
              className="w-36 h-36 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary text-5xl font-black shadow-inner cursor-pointer hover:bg-primary/20 transition-all overflow-hidden relative group"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.fullName} className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.[0] || <User className="w-16 h-16 text-slate-300" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-8 h-8 text-white" />
              </div>
            </label>
            {uploadAvatarMutation.isPending && (
              <div className="absolute inset-0 bg-white/60 rounded-[2.5rem] flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
              </div>
            )}
          </div>

          <div className="flex-1 w-full space-y-6">
            {/* Email - readonly */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Email (Tài khoản)</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-slate-100 border-2 border-transparent outline-none font-bold text-lg text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-slate-400 text-xs font-bold mt-2 ml-2">Email tài khoản không thể thay đổi</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Họ và Tên</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('fullName')}
                  type="text"
                  className={`w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 transition-all outline-none font-bold text-lg ${errors.fullName ? 'border-red-200' : 'border-transparent focus:ring-primary/10 focus:bg-white'}`}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-sm font-bold mt-2 ml-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.fullName.message}</p>}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Phone */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register('phone')}
                type="text"
                className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent transition-all outline-none font-bold text-lg focus:ring-primary/10 focus:bg-white"
                placeholder="0901 234 567"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Địa chỉ</label>
            <div className="relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register('address')}
                type="text"
                className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent transition-all outline-none font-bold text-lg focus:ring-primary/10 focus:bg-white"
                placeholder="Hà Nội, Việt Nam"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Ngày sinh</label>
            <div className="relative">
              <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register('dateOfBirth')}
                type="date"
                className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent transition-all outline-none font-bold text-lg focus:ring-primary/10 focus:bg-white"
              />
            </div>
          </div>

          {/* Gender */}
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <CustomSelect
                label="Giới tính"
                icon={Users}
                options={[
                  { value: 'male', label: 'Nam' },
                  { value: 'female', label: 'Nữ' },
                  { value: 'other', label: 'Khác' },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {updateMutation.isPending ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
          Lưu Thông tin
        </button>
      </form>
    </div>
  );
};

export default CandidateProfile;
