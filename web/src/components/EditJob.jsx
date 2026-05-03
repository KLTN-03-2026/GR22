// Module: components/EditJob.jsx - Quản lý logic hệ thống
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Sparkles, Loader2, AlertCircle, MapPin, DollarSign, Clock, Type, Save } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { useJobById, useUpdateJob } from '../hooks/useJobs';
import { useSkills } from '../hooks/useSkills';
import CustomSelect from './ui/CustomSelect';

import { formatSalaryInput, stripSalary } from '../utils/salaryUtils';

const jobSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự'),
  requirements: z.string().min(20, 'Yêu cầu phải có ít nhất 20 ký tự'),
  location: z.string().min(2, 'Địa điểm không được để trống'),
  salary: z.string().min(1, 'Mức lương không được để trống'),
  type: z.string().min(1, 'Vui lòng chọn loại hình công việc'),
  skillIds: z.array(z.number()).min(1, 'Vui lòng chọn ít nhất 1 kỹ năng'),
});

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading: jobLoading } = useJobById(id);
  const { data: availableSkills, isLoading: skillsLoading } = useSkills();
  const updateJobMutation = useUpdateJob(id);

  const { register, handleSubmit, setValue, watch, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      location: '',
      salary: '',
      type: 'Full-time',
      skillIds: [],
    }
  });

  useEffect(() => {
    if (job) {
      reset({
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements || '',
        location: job.location || '',
        salary: formatSalaryInput(job.salary || ''),
        type: job.type || 'Full-time',
        skillIds: job.Skills?.map(s => s.id) || [],
      });
    }
  }, [job, reset]);

  const selectedSkillIds = watch('skillIds');

  const handleSalaryChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatSalaryInput(rawValue);
    setValue('salary', formatted, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      const numericSalary = stripSalary(data.salary);
      await updateJobMutation.mutateAsync({
        ...data,
        salary: numericSalary
      });
      toast.success('Cập nhật tin tuyển dụng thành công!');
      navigate('/recruiter/jobs');
    } catch (err) {
      toast.error('Không thể cập nhật tin tuyển dụng');
    }
  };

  const toggleSkill = (id) => {
    const current = selectedSkillIds;
    const next = current.includes(id)
      ? current.filter(s => s !== id)
      : [...current, id];
    setValue('skillIds', next, { shouldValidate: true });
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  if (jobLoading || skillsLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/recruiter/jobs')}
          className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-primary"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-4xl font-black text-primary-dark tracking-tighter">Chỉnh sửa Tin tuyển dụng</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Cập nhật thông tin chi tiết</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-10">
        <div className="space-y-10">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Tiêu đề Công việc</label>
            <input
              {...register('title')}
              type="text"
              className={`w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 transition-all outline-none font-bold text-lg ${errors.title ? 'border-red-200 focus:ring-red-100' : 'border-transparent focus:ring-primary/10 focus:bg-white'}`}
              placeholder="VD: Senior React Developer"
            />
            {errors.title && <p className="text-red-500 text-sm font-bold mt-2 ml-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.title.message}</p>}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Địa điểm</label>
              <div className="relative">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('location')}
                  type="text"
                  className={`w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 transition-all outline-none font-bold text-lg ${errors.location ? 'border-red-200 focus:ring-red-100' : 'border-transparent focus:ring-primary/10 focus:bg-white'}`}
                  placeholder="Hà Nội / Từ xa"
                />
              </div>
              {errors.location && <p className="text-red-500 text-sm font-bold mt-2 ml-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.location.message}</p>}
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Mức lương (VNĐ)</label>
              <div className="relative">
                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('salary')}
                  type="text"
                  onChange={handleSalaryChange}
                  className={`w-full pl-16 pr-16 py-5 rounded-[1.5rem] bg-slate-50 border-2 transition-all outline-none font-bold text-lg ${errors.salary ? 'border-red-200 focus:ring-red-100' : 'border-transparent focus:ring-primary/10 focus:bg-white'}`}
                  placeholder="VD: 20.000.000"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs">VNĐ</span>
              </div>
              {errors.salary && <p className="text-red-500 text-sm font-bold mt-2 ml-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.salary.message}</p>}
            </div>

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  label="Loại hình"
                  icon={Type}
                  options={[
                    { value: 'Full-time', label: 'Toàn thời gian' },
                    { value: 'Part-time', label: 'Bán thời gian' },
                    { value: 'Freelance', label: 'Freelance' },
                    { value: 'Internship', label: 'Thực tập' },
                  ]}
                  error={errors.type?.message}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Mô tả Công việc</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    {...field}
                    modules={quillModules}
                    className={`bg-slate-50 rounded-[1.5rem] overflow-hidden border-2 transition-all ${errors.description ? 'border-red-200' : 'border-transparent'}`}
                  />
                )}
              />
              {errors.description && <p className="text-red-500 text-sm font-bold mt-2 ml-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.description.message}</p>}
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Yêu cầu Ứng viên</label>
              <Controller
                name="requirements"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    {...field}
                    modules={quillModules}
                    className={`bg-slate-50 rounded-[1.5rem] overflow-hidden border-2 transition-all ${errors.requirements ? 'border-red-200' : 'border-transparent'}`}
                  />
                )}
              />
              {errors.requirements && <p className="text-red-500 text-sm font-bold mt-2 ml-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.requirements.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-5 block">Kỹ năng Yêu cầu</label>
            <div className="flex flex-wrap gap-3">
              {availableSkills?.map(skill => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  className={`px-6 py-3 rounded-2xl text-sm font-black transition-all border-2 ${selectedSkillIds.includes(skill.id)
                    ? 'bg-primary text-white border-primary shadow-xl scale-105'
                    : 'bg-white text-slate-400 border-slate-100 hover:border-primary/20 hover:text-primary'
                    }`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
            {errors.skillIds && <p className="text-red-500 text-sm font-bold mt-4 ml-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.skillIds.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={updateJobMutation.isPending}
          className="w-full bg-accent text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {updateJobMutation.isPending ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
          Cập nhật Tin tuyển dụng
        </button>
      </form>

      <style>{`
        .quill { display: flex; flex-direction: column; }
        .ql-container { height: 250px; font-family: inherit; font-size: 1.125rem; border: none !important; }
        .ql-toolbar { border: none !important; border-bottom: 2px solid #f1f5f9 !important; background: #fff; }
        .ql-editor { min-height: 250px; }
      `}</style>
    </div>
  );
};

export default EditJob;

// Git update: Triggering change for push
