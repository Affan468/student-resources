import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useResource } from '../../context/ResourceContext';
import { X, BookOpen, Plus, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
  'All Majors (CE, EE & EEE)',
  'Computer Engineering (CE)',
  'Electrical Engineering (EE)',
  'Electrical & Electronics Engineering (EEE)'
];

export default function AddCourseModal({ onClose }) {
  const { addCourse, courses } = useResource();

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    abbreviation: '',
    department: 'All Majors (CE, EE & EEE)',
    iconName: 'Cpu'
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleCodeChange = (val) => {
    setFormData(prev => ({ ...prev, code: val }));
    
    // Live validation against existing courses
    const norm = val.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (norm) {
      const match = courses.find(c => {
        const cNorm = (c.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return cNorm && cNorm === norm;
      });

      if (match) {
        setErrorMsg(`Course Code "${match.code}" already exists ("${match.title}").`);
        return;
      }
    }
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.title.trim()) {
      alert('Please fill in Course Code and Title.');
      return;
    }

    const norm = formData.code.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const match = courses.find(c => {
      const cNorm = (c.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return cNorm && cNorm === norm;
    });

    if (match) {
      setErrorMsg(`Course Code "${match.code}" already exists ("${match.title}"). Cannot add duplicate course.`);
      return;
    }

    const created = addCourse(formData);
    if (created) {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#59a5fb]/15 dark:bg-[#59a5fb]/25 border border-[#59a5fb]/30 flex items-center justify-center text-[#59a5fb] dark:text-[#7bb9fc]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">Add New Engineering Course</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Populate course directory and student upload options</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl p-3.5 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Course Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Course Code *</label>
              <input
                type="text"
                placeholder="e.g. CE301, EE202"
                value={formData.code}
                onChange={(e) => handleCodeChange(e.target.value)}
                required
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  errorMsg ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-[#59a5fb]'
                }`}
              />
            </div>

            {/* Abbreviation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Abbreviation / Alias</label>
              <input
                type="text"
                placeholder="e.g. MSA, DLD, EDC"
                value={formData.abbreviation}
                onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#9D00FF]"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Course Title *</label>
            <input
              type="text"
              placeholder="e.g. Microprocessor Systems & Assembly Language"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59a5fb]"
            />
          </div>

          {/* Engineering Department Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Engineering Department / Major</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59a5fb]"
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Selecting "All Majors (CE, EE & EEE)" makes this course available across all three engineering majors.
            </p>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white font-extrabold text-sm shadow-md shadow-[#9D00FF]/25 hover:opacity-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
