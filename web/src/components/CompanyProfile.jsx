import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Globe, MapPin, Upload, Save, Loader2, AlertCircle, Briefcase, Type } from 'lucide-react';
import { useCompany, useUpdateCompany } from '../hooks/useCompany';
import CustomSelect from './ui/CustomSelect';

const companySchema = z.object({
  name: z.string().min(2, 'Tên công ty phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  website: z.string().url('Vui lòng nhập URL hợp lệ').or(z.literal('')),
  location: z.string().optional(),
  industry: z.string().optional(),
});

const CompanyProfile = () => {
  const [file, setFile] = useState(null);
  const { data: profile, isLoading: fetching } = useCompany();
  const updateMutation = useUpdateCompany();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      description: '',
      website: '',
      location: '',
      industry: '',
    }
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        description: profile.description || '',
        website: profile.website || '',
        location: profile.location || '',
        industry: profile.industry || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key]) formData.append(key, data[key]);
      });
      if (file) formData.append('logo', file);

      await updateMutation.mutateAsync(formData);
      alert('Đã cập nhật hồ sơ công ty!');
    } catch (err) {
      alert('Không thể cập nhật hồ sơ');
    }
  };

  if (fetching) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin w-12 h-12 text-primary" />
    </div>
  );

  return (
    <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
        <h3 className="text-4xl font-black text-primary-dark mb-10 tracking-tighter">Hồ sơ Công ty</h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="relative group shrink-0">
              <div className="w-48 h-48 rounded-[2.5rem] bg-slate-50 border-4 border-dashed border-slate-200 overflow-hidden flex items-center justify-center transition-all group-hover:border-primary/40 shadow-inner">
                {file ? (
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                ) : profile?.logo ? (
                  <img src={`http://localhost:5000${profile.logo}`} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <input type="file" id="logo-upload" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
              <label htmlFor="logo-upload" className="absolute -bottom-4 -right-4 bg-primary text-white p-4 rounded-2xl cursor-pointer shadow-2xl hover:scale-110 active:scale-95 transition-all">
                <Upload className="w-6 h-6" />
              </label>
            </div>

            <div className="flex-1 w-full space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Tên Công ty</label>
                <input 
                  {...register('name')}
                  type="text" 
                  className={`w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 transition-all outline-none font-bold text-lg ${errors.name ? 'border-red-200 focus:ring-red-100' : 'border-transparent focus:ring-primary/10 focus:bg-white'}`}
                  placeholder="VD: Tập đoàn Công nghệ ABC"
                />
                {errors.name && <p className="text-red-500 text-sm font-bold mt-2 ml-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.name.message}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      {...register('website')}
                      type="text" 
                      className={`w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 transition-all outline-none font-bold text-lg ${errors.website ? 'border-red-200 focus:ring-red-100' : 'border-transparent focus:ring-primary/10 focus:bg-white'}`}
                      placeholder="https://company.com"
                    />
                  </div>
                  {errors.website && <p className="text-red-500 text-sm font-bold mt-2 ml-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.website.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Địa điểm Trụ sở</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      {...register('location')}
                      type="text" 
                      className={`w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 transition-all outline-none font-bold text-lg border-transparent focus:ring-primary/10 focus:bg-white`}
                      placeholder="Hà Nội, Việt Nam"
                    />
                  </div>
                </div>
              </div>

              <Controller
                name="industry"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Lĩnh vực kinh doanh"
                    icon={Briefcase}
                    options={[
                      { value: 'Technology', label: 'Công nghệ thông tin' },
                      { value: 'Finance', label: 'Tài chính / Ngân hàng' },
                      { value: 'Education', label: 'Giáo dục / Đào tạo' },
                      { value: 'Healthcare', label: 'Y tế / Sức khỏe' },
                      { value: 'Retail', label: 'Bán lẻ / Thương mại' },
                      { value: 'Other', label: 'Khác' },
                    ]}
                    error={errors.industry?.message}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Giới thiệu Công ty</label>
            <textarea 
              {...register('description')}
              className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-2 border-transparent transition-all outline-none h-56 resize-none text-lg leading-relaxed focus:ring-primary/10 focus:bg-white"
              placeholder="Chia sẻ về tầm nhìn, sứ mệnh, văn hóa làm việc và những điều tuyệt vời về công ty của bạn..."
            />
          </div>

          <button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {updateMutation.isPending ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
            Lưu và Cập nhật Hồ sơ Ngay
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
