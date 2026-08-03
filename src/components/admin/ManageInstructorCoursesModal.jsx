import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useResource } from '../../context/ResourceContext';
import { X, BookOpen, Check, Search, Save, User } from 'lucide-react';

export default function ManageInstructorCoursesModal({ instructor, onClose }) {
  const { courses, updateInstructorCourses } = useResource();
  const [searchTerm, setSearchTerm] = useState('');

  // Initial assigned course IDs for this instructor
  const [selectedCourseIds, setSelectedCourseIds] = useState(() => {
    return courses
      .filter(c => (c.instructorIds || []).includes(instructor.id))
      .map(c => c.id);
  });

  const handleToggleCourse = (courseId) => {
    setSelectedCourseIds(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateInstructorCourses(instructor.id, selectedCourseIds);
    onClose();
  };

  const filteredCourses = courses.filter(c => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.abbreviation && c.abbreviation.toLowerCase().includes(q)) ||
      (c.department && c.department.toLowerCase().includes(q))
    );
  });

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-[#f0f7ff] to-white dark:from-slate-900 dark:to-slate-800/90 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={instructor.avatar || instructor.avatarUrl}
              alt={instructor.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#9D00FF]/30 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#9D00FF] dark:text-[#c06eff]">{instructor.title}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{instructor.department}</span>
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight mt-0.5">
                Manage Courses for {instructor.name}
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Assigned Courses:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#9D00FF]/15 dark:bg-[#9D00FF]/25 text-[#9D00FF] dark:text-[#c06eff] font-extrabold">
              {selectedCourseIds.length} Selected
            </span>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter course by code, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#9D00FF]"
            />
          </div>
        </div>

        {/* Course Checklist Body */}
        <div className="p-6 overflow-y-auto space-y-2 flex-1">
          {filteredCourses.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
              No courses matching "{searchTerm}"
            </div>
          ) : (
            filteredCourses.map(c => {
              const isSelected = selectedCourseIds.includes(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => handleToggleCourse(c.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#9D00FF]/10 dark:bg-[#9D00FF]/20 border-[#9D00FF]/40 text-[#9D00FF] dark:text-[#c06eff] shadow-sm'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-extrabold text-[11px] ${
                      isSelected
                        ? 'bg-[#9D00FF] text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {c.code ? c.code.substring(0, 4) : 'CE'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{c.code}</span>
                        {c.abbreviation && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">({c.abbreviation})</span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{c.title}</h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{c.department}</span>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#9D00FF] border-[#9D00FF] text-white'
                      : 'border-slate-300 dark:border-slate-600 bg-transparent'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9D00FF] to-[#7c00cc] text-white font-extrabold text-xs shadow-md shadow-[#9D00FF]/25 hover:opacity-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Course Assignments</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
