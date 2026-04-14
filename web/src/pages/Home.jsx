import React, { useState, useEffect } from 'react';
import { ArrowRight, Search, MapPin, Briefcase, Sparkles, Loader2, DollarSign, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import { useCompanies } from '../hooks/useCompany';
import { formatSalary } from '../utils/salaryUtils';

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Home = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useJobs({ limit: 6 });
  const latestJobs = data?.jobs || [];
  const { data: companies, isLoading: loadingCompanies } = useCompanies();
  const [searchTerm, setSearchTerm] = useState('');
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/banners`)
      .then(res => res.json())
      .then(data => setBanners(data))
      .catch(err => console.error('Error fetching banners:', err));
  }, []);

  useEffect(() => {
    if (banners.length > 1 && !isPaused) {
      const timer = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners, isPaused]);

  const nextSlide = () => setCurrentBannerIndex(prev => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentBannerIndex(prev => (prev - 1 + banners.length) % banners.length);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Banner / Carousel */}
      <section
        className="relative rounded-[3.5rem] overflow-hidden mx-2 shadow-2xl shadow-primary/10 min-h-[500px] flex items-center group/slider"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="absolute inset-0">
          {banners.length > 0 ? (
            <div className="relative w-full h-full overflow-hidden">
              <div
                className="flex w-full h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
              >
                {banners.map((banner) => (
                  <div key={banner.id} className="min-w-full h-full relative">
                    <img src={`${API_URL}${banner.imageUrl}`} alt={banner.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/95 via-primary-dark/80 to-primary-dark/40"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <img src="/images/hero_banner.png" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/95 via-primary-dark/80 to-primary-dark/40"></div>
            </>
          )}
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-6 z-20 p-4 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-primary transition-all opacity-0 group-hover/slider:opacity-100 -translate-x-4 group-hover/slider:translate-x-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 z-20 p-4 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-primary transition-all opacity-0 group-hover/slider:opacity-100 translate-x-4 group-hover/slider:translate-x-0"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="relative z-10 px-10 md:px-20 py-16 md:py-24 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6 border border-white/10">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Nền tảng tuyển dụng thông minh #1 Việt Nam</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight font-display">
              {banners.length > 0 ? (
                <span>{banners[currentBannerIndex].title}</span>
              ) : (
                <>Tìm kiếm <br /> <span className="text-accent italic">Sự nghiệp Mơ ước</span></>
              )}
            </h1>

            <p className="text-white/50 mt-4 font-medium text-lg max-w-md leading-relaxed">
              Kết nối hàng nghìn ứng viên với nhà tuyển dụng hàng đầu. AI phân tích CV giúp bạn nổi bật.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              {/* Compact Search */}
              <form onSubmit={handleSearch} className="flex gap-3 flex-1 max-w-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm vị trí, kỹ năng..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-primary/30 outline-none font-bold text-sm shadow-lg"
                  />
                </div>
                <button type="submit" className="bg-accent text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/30 shrink-0 flex items-center gap-2">
                  <Search className="w-4 h-4" /> Tìm kiếm
                </button>
              </form>

              {banners.length > 0 && banners[currentBannerIndex].link && (
                <a href={banners[currentBannerIndex].link} target="_blank" rel="noopener noreferrer"
                  className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2 shadow-xl">
                  Chi tiết <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Dots */}
            {banners.length > 1 && (
              <div className="flex gap-2 mt-8">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentBannerIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === currentBannerIndex ? 'w-8 bg-accent' : 'w-2 bg-white/20'}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="space-y-10 px-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black text-primary-dark tracking-tighter uppercase">Công ty Nổi bật</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Khám phá các nhà tuyển dụng hàng đầu</p>
          </div>
        </div>

        {loadingCompanies ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
        ) : companies?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {companies.map(company => (
              <Link
                key={company.id}
                to={`/company/${company.id}`}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-primary/20 hover:scale-[1.03] transition-all group text-center flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner group-hover:shadow-lg transition-all">
                  {company.logo ? (
                    <img src={`${API_URL}${company.logo}`} alt={company.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-10 h-10 text-slate-200 group-hover:text-primary transition-colors" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-primary-dark text-sm tracking-tight group-hover:text-primary transition-colors line-clamp-1">{company.name}</h3>
                  {company.industry && <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{company.industry}</p>}
                </div>
                <div className="flex items-center gap-1.5 text-accent text-xs font-black">
                  <Briefcase className="w-3.5 h-3.5" /> {company.jobCount || 0} vị trí
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">Chưa có công ty nào.</p>
          </div>
        )}
      </section>

      {/* Latest Jobs */}
      <section className="space-y-12 px-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black text-primary-dark tracking-tighter uppercase">Cơ hội Mới nhất</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cập nhật thời gian thực</p>
            </div>
          </div>
          <Link to="/jobs" className="text-primary font-black uppercase text-xs tracking-widest hover:underline flex items-center gap-2">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="animate-spin w-12 h-12 text-primary" />
            </div>
          ) : latestJobs.length > 0 ? (
            latestJobs.map(job => (
              <div key={job.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-primary/20 transition-all group flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center font-black text-primary-dark text-2xl group-hover:bg-primary group-hover:text-white transition-all shadow-inner border border-slate-100">
                      {job.title[0]}
                    </div>
                    <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">{job.type}</span>
                  </div>

                  <h3 className="text-2xl font-black text-primary-dark mb-4 group-hover:text-primary transition-colors tracking-tight leading-tight">{job.title}</h3>

                  <div className="flex flex-wrap gap-4 text-slate-400 text-xs font-black uppercase tracking-widest mb-8">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                    <span className="flex items-center gap-1.5 text-accent"><DollarSign className="w-3.5 h-3.5" /> {formatSalary(job.salary)}</span>
                  </div>

                  <p className="text-slate-500 text-sm line-clamp-3 mb-10 leading-relaxed font-medium">
                    {stripHtml(job.description)}
                  </p>
                </div>

                <Link to={`/jobs/${job.id}`} className="w-full py-5 rounded-[1.5rem] bg-slate-900 text-white font-black text-center group-hover:bg-primary transition-all shadow-xl shadow-slate-900/10 uppercase text-xs tracking-widest relative z-10 block">
                  Ứng tuyển ngay
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-[3.5rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">Chưa có công việc nào.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-dark rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden mx-4 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-8 border border-white/10">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Phân tích bằng Trí tuệ Nhân tạo</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight tracking-tighter font-display">Tải CV của bạn & nhận <br /> đánh giá từ AI.</h2>
          <p className="text-white/60 text-xl mb-12 leading-relaxed font-medium max-w-xl">
            AI của chúng tôi phân tích hơn 10 tiêu chí trong CV để đưa ra phản hồi chuyên nghiệp và điểm sẵn sàng thị trường.
          </p>
          <Link to="/candidate/cv" className="inline-flex items-center gap-4 bg-accent text-white px-12 py-6 rounded-[2rem] font-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent/40 uppercase text-sm tracking-widest">
            Phân tích CV ngay <ArrowRight />
          </Link>
        </div>
        <Sparkles className="absolute -right-20 -bottom-20 w-[30rem] h-[30rem] text-white/5 rotate-12" />
      </section>
    </div>
  );
};

export default Home;
