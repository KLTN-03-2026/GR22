import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomSelect = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  error, 
  icon: Icon, 
  placeholder = "Chọn...",
  className = "",
  multiple = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const getSelectedOptions = () => {
    if (multiple) {
      return options.filter(opt => (value || []).includes(opt.value));
    }
    return options.find(opt => opt.value === value);
  };

  const selectedOptions = getSelectedOptions();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    if (multiple) {
      const newValue = (value || []).includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...(value || []), optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const removeItem = (e, itemValue) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== itemValue));
  };

  return (
    <div className={`space-y-3 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 block">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between py-4 rounded-[1.5rem] bg-slate-50 border-2 transition-all outline-none font-bold text-left min-h-[72px]
            ${isOpen ? 'border-primary ring-4 ring-primary/5 bg-white shadow-xl shadow-primary/5' : 'border-transparent hover:border-slate-200'}
            ${error ? 'border-red-200 bg-red-50/30' : ''}
            ${Icon ? 'pl-16 pr-8' : 'px-8'}
          `}
        >
          <div className="flex items-center gap-2 flex-wrap max-w-[90%] py-1">
            {Icon && (
              <Icon className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${isOpen || (multiple ? value?.length > 0 : value) ? 'text-primary' : 'text-slate-400'}`} />
            )}
            
            {multiple ? (
              value?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedOptions.map(opt => (
                    <span key={opt.value} className="bg-primary text-white text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in zoom-in duration-200">
                      {opt.label}
                      <X onClick={(e) => removeItem(e, opt.value)} className="w-3 h-3 cursor-pointer hover:bg-white/20 rounded-full" />
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 text-lg">{placeholder}</span>
              )
            ) : (
              <span className={`text-lg truncate ${selectedOptions ? 'text-primary-dark' : 'text-slate-400'}`}>
                {selectedOptions ? selectedOptions.label : placeholder}
              </span>
            )}
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute z-[100] w-full mt-2 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden py-3"
            >
              <div className="max-h-64 overflow-y-auto custom-scrollbar px-2 space-y-1">
                {options.map((option) => {
                  const isSelected = multiple 
                    ? (value || []).includes(option.value)
                    : value === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`
                        w-full flex items-center justify-between px-6 py-4 rounded-2xl text-left transition-all group
                        ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'}
                      `}
                    >
                      <span className={`font-bold transition-all ${isSelected ? '' : 'group-hover:translate-x-1'}`}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <div className="w-6 h-6 bg-white/20 text-white rounded-lg flex items-center justify-center animate-in zoom-in duration-300">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="text-red-500 text-sm font-bold mt-2 ml-2 flex items-center gap-1 animate-in slide-in-from-top-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> {error}
        </p>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default CustomSelect;
