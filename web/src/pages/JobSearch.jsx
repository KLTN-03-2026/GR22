import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, DollarSign, Briefcase, Loader2, Filter, X, ArrowRight, Building2, Star, Type } from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { useSkills } from '../hooks/useSkills';
import CustomSelect from '../components/ui/CustomSelect';
import { formatSalary } from '../utils/salaryUtils';

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const LOCATIONS = [
  { value: '', label: 'Tất cả địa điểm' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Remote', label: 'Từ xa (Remote)' },
];

const SALARY_RANGES = [
  { value: '', label: 'Tất cả mức lương' },
  { value: '0-10', label: 'Dưới 10 triệu' },
  { value: '10-20', label: '10 - 20 triệu' },
  { value: '20-30', label: '20 - 30 triệu' },
  { value: '30-50', label: '30 - 50 triệu' },
  { value: '50+', label: 'Trên 50 triệu' },
];

const JOB_TYPES = [
  { value: '', label: 'Tất cả loại hình' },
  { value: 'Full-time', label: 'Toàn thời gian' },
  { value: 'Part-time', label: 'Bán thời gian' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Internship', label: 'Thực tập' },
];

const JobSearch = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState(initialQuery);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSalary, setSelectedSalary] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);

  // Fetch jobs with pagination and filters
  const { data, isLoading } = useJobs({
    page: currentPage,
    limit: 10,
    q: keyword,
    location: selectedLocation,
    salaryRange: selectedSalary,
    type: selectedType,
    skills: selectedSkills.join(','),
  });

  const jobs = data?.jobs || [];
  const totalPages = data?.totalPages || 1;
  const totalJobs = data?.total || 0;

  const { data: skills } = useSkills();

  const skillOptions = useMemo(() => 
    (skills || []).map(s => ({ value: s.name, label: s.name })), 
  [skills]);

  const clearFilters = () => {
    setKeyword('');
    setSelectedLocation('');
    setSelectedSalary('');
    setSelectedType('');
    setSelectedSkills([]);
    setCurrentPage(1);
  };

  const hasFilters = keyword || selectedLocation || selectedSalary || selectedType || selectedSkills.length > 0;

  return (
    <div className="w-full mx-auto pb-20 px-8 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-96 shrink-0 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 sticky top-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-primary-dark tracking-tighter uppercase flex items-center gap-3">
                <Filter className="w-6 h-6 text-primary" /> Bộ lọc
              </h2>
              {hasFilters && (
                <button onClick={clearFilters} className="text-red-500 font-black text-xs uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-1">
                  <X className="w-4 h-4" /> Xóa lọc
                </button>
              )}
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-4 block">Từ khóa</label>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder="Vị trí, công ty..."
                    className="w-full pl-16 pr-6 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-lg transition-all"
                  />
                </div>
              </div>

              <CustomSelect
                label="Địa điểm"
                icon={MapPin}
                options={LOCATIONS}
                value={selectedLocation}
                onChange={setSelectedLocation}
              />

              <CustomSelect
                label="Mức lương"
                icon={DollarSign}
                options={SALARY_RANGES}
                value={selectedSalary}
                onChange={setSelectedSalary}
              />

              <CustomSelect
                label="Loại hình"
                icon={Type}
                options={JOB_TYPES}
                value={selectedType}
                onChange={setSelectedType}
              />

              <CustomSelect
                label="Kỹ năng yêu cầu"
                icon={Star}
                options={skillOptions}
                value={selectedSkills}
                onChange={setSelectedSkills}
                multiple={true}
                placeholder="Chọn các kỹ năng..."
              />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100">
            <div>
              <h1 className="text-4xl font-black text-primary-dark tracking-tighter uppercase leading-tight">Cơ hội Nghề nghiệp</h1>
              <p className="text-slate-500 font-bold text-lg mt-2">
                Khám phá <span className="text-primary font-black">{totalJobs}</span> vị trí tuyển dụng mới nhất
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Sắp xếp:</span>
              <select className="bg-white border-none rounded-xl px-4 py-3 font-bold text-xs outline-none shadow-sm cursor-pointer ring-1 ring-slate-100">
                <option>Mới nhất</option>
                <option>Lương ưu tiên</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-40 bg-white rounded-[4rem] border border-slate-100 shadow-sm">
              <div className="text-center space-y-4">
                <Loader2 className="animate-spin w-16 h-16 text-primary mx-auto" />
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Đang tải dữ liệu tuyển dụng...</p>
              </div>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid gap-8">
              {jobs.map(job => (
                <div key={job.id} className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-primary/20 transition-all group flex flex-col md:flex-row gap-10 md:items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000"></div>

                  <div className="w-24 h-24 bg-slate-50 rounded-[2.2rem] flex items-center justify-center font-black text-primary-dark text-4xl group-hover:bg-primary group-hover:text-white transition-all shadow-inner border border-slate-100 shrink-0 relative z-10">
                    {job.title?.[0]}
                  </div>

                  <div className="flex-1 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-3xl font-black text-primary-dark group-hover:text-primary transition-colors tracking-tighter leading-tight">{job.title}</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-5 text-slate-400 text-xs font-black uppercase tracking-widest mb-6">
                      {job.location && (
                        <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                          <MapPin className="w-4 h-4 text-primary" /> {job.location}
                        </span>
                      )}
                      {job.salary && (
                        <span className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full border border-green-100">
                          <DollarSign className="w-4 h-4" /> {formatSalary(job.salary)}
                        </span>
                      )}
                      {job.type && (
                        <span className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full border border-primary/10">
                          <Briefcase className="w-4 h-4" /> {
                            job.type === 'Full-time' ? 'Toàn thời gian' :
                            job.type === 'Part-time' ? 'Bán thời gian' :
                            job.type === 'Freelance' ? 'Freelance' :
                            job.type === 'Internship' ? 'Thực tập' : job.type
                          }
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-500 text-lg line-clamp-2 font-medium leading-relaxed max-w-3xl">{stripHtml(job.description || '')}</p>
                  </div>

                  <div className="shrink-0 relative z-10 w-full md:w-auto">
                    <Link to={`/jobs/${job.id}`} className="px-12 py-6 rounded-[2rem] bg-slate-900 text-white font-black text-center group-hover:bg-primary transition-all shadow-2xl shadow-slate-900/10 uppercase text-sm tracking-widest inline-block w-full active:scale-95">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-12">
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                      window.scrollTo(0, 0);
                    }}
                    disabled={currentPage === 1}
                    className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-all font-black text-xs uppercase tracking-widest"
                  >
                    Trước
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => {
                        setCurrentPage(i + 1);
                        window.scrollTo(0, 0);
                      }}
                      className={`w-12 h-12 rounded-2xl font-black transition-all ${
                        currentPage === i + 1
                          ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110'
                          : 'bg-white border border-slate-100 hover:bg-slate-50 text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      window.scrollTo(0, 0);
                    }}
                    disabled={currentPage === totalPages}
                    className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-all font-black text-xs uppercase tracking-widest"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-[4rem] border border-slate-100 shadow-inner animate-in fade-in slide-in-from-bottom-4">
              <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border border-slate-100 shadow-inner">
                <Search className="w-16 h-16 text-slate-200" />
              </div>
              <h3 className="text-4xl font-black text-primary-dark tracking-tighter">Hết Job rồi bạn ơi!</h3>
              <p className="text-slate-400 font-bold mt-4 text-xl">Thử đổi từ khóa hoặc bộ lọc khác để thấy điều bất ngờ.</p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-12 bg-primary text-white px-16 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40">
                  Làm mới bộ lọc
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobSearch;
