import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useResource } from '../../context/ResourceContext';
import { X, UserPlus, Plus, BookOpen } from 'lucide-react';

export default function AddInstructorModal({ onClose }) {
  const { courses, addInstructor } = useResource();

  const [formData, setFormData] = useState({
    name: '',
    courseIds: []
  });

  const handleCourseToggle = (courseId) => {
    setFormData(prev => {
      const exists = prev.courseIds.includes(courseId);
      if (exists) {
        return { ...prev, courseIds: prev.courseIds.filter(id => id !== courseId) };
      } else {
        return { ...prev, courseIds: [...prev.courseIds, courseId] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter Instructor Name.');
      return;
    }

    addInstructor(formData);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9D00FF]/15 dark:bg-[#9D00FF]/25 border border-[#9D00FF]/30 flex items-center justify-center text-[#9D00FF] dark:text-[#c06eff]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">Add New Faculty Instructor</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Register new teacher and assign courses</p>
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
          
          {/* Instructor Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Instructor Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Dr. Kamran Ali"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#9D00FF]"
            />
          </div>

          {/* Assign Courses Multi-select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Assign Teaching Courses</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">Select courses this teacher instructs</span>
            </label>
            <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-2xl p-3 bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
              {courses.map(course => {
                const isSelected = formData.courseIds.includes(course.id);
                return (
                  <div
                    key={course.id}
                    onClick={() => handleCourseToggle(course.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-[#9D00FF]/15 dark:bg-[#9D00FF]/25 border border-[#9D00FF]/30 text-[#9D00FF] dark:text-[#c06eff]'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-[#59a5fb] dark:text-[#7bb9fc]" />
                      <span>{course.code} - {course.title}</span>
                    </div>
                    {isSelected && <span className="font-extrabold text-[10px]">✓ Assigned</span>}
                  </div>
                );
              })}
            </div>
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
              <span>Create Instructor</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
