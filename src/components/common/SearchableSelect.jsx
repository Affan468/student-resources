import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export default function SearchableSelect({
  label,
  icon: Icon,
  options = [],
  value,
  onChange,
  placeholder = 'Type to search...',
  focusColor = 'ring-[#59a5fb]',
  iconColor = 'text-[#59a5fb]'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on user input
  const filteredOptions = options.filter(opt => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const labelMatch = opt.label?.toLowerCase().includes(term);
    const sublabelMatch = opt.sublabel?.toLowerCase().includes(term);
    const aliasMatch = opt.aliases?.some(a => a?.toLowerCase().includes(term));
    return labelMatch || sublabelMatch || aliasMatch;
  });

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
          <span>{label}</span>
        </label>
      )}

      {/* Selected Box / Toggle Button */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white cursor-pointer flex items-center justify-between transition-all hover:border-[#59a5fb] ${
          isOpen ? `ring-2 ${focusColor} border-transparent bg-white dark:bg-slate-800 shadow-sm` : ''
        }`}
      >
        <span className={selectedOption ? 'font-medium text-slate-900 dark:text-white truncate' : 'text-slate-400 dark:text-slate-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-[#59a5fb]' : ''}`} />
      </div>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          {/* Realtime Search Input Field */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#59a5fb] placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 px-1 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Options Scroll List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`px-4 py-3 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#59a5fb]/10 dark:bg-[#59a5fb]/20 text-[#59a5fb] dark:text-[#7bb9fc] font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{opt.label}</p>
                      {opt.sublabel && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 truncate">{opt.sublabel}</p>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#59a5fb] dark:text-[#7bb9fc] shrink-0" />}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                No matching results for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
