import React, { useState } from 'react';
import { useResource } from '../context/ResourceContext';
import CourseCard from '../components/courses/CourseCard';
import StatsCard from '../components/common/StatsCard';
import { 
  Search, 
  BookOpen, 
  Upload, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';

const DEPARTMENTS = [
  { label: 'All', full: 'All' }, 
  { label: 'CE', full: 'Computer Engineering (CE)' }, 
  { label: 'EE', full: 'Electrical Engineering (EE)' }, 
  { label: 'EEE', full: 'Electrical & Electronics Engineering (EEE)' }
];

export default function HomePage() {
  const { 
    filteredCourses, 
    searchQuery, 
    setSearchQuery, 
    navigateTo 
  } = useResource();

  const [selectedDept, setSelectedDept] = useState('All');

  const displayedCourses = filteredCourses.filter(course => {
    if (selectedDept === 'All') return true;
    if (course.department === 'All Majors (CE, EE & EEE)' || course.department === 'All') return true;
    const target = DEPARTMENTS.find(d => d.label === selectedDept);
    return course.department === target?.full || course.department === selectedDept;
  });

  const getCourseCountForDept = (deptObj) => {
    return filteredCourses.filter(course => {
      if (deptObj.label === 'All') return true;
      if (course.department === 'All Majors (CE, EE & EEE)' || course.department === 'All') return true;
      return course.department === deptObj.full || course.department === deptObj.label;
    }).length;
  };

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in pb-12">
      
      {/* Compact & Mobile Responsive Hero Section */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#f0f7ff] via-[#f8efff] to-white border border-[#59a5fb]/20 p-5 sm:p-7 lg:p-8 shadow-lg">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#59a5fb]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-[#9D00FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9D00FF]/10 border border-[#9D00FF]/20 text-[#9D00FF] text-[11px] sm:text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-[#59a5fb]" />
            <span>COMSATS Engineering Resource Portal (CE • EE • EEE)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Find <span className="bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] bg-clip-text text-transparent">Past Papers, Quizzes, Labs & Lectures</span>
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-medium hidden sm:block">
            Tailored study hub for Computer Engineering (CE), Electrical Engineering (EE), and EEE students. Exam past papers, sessional quizzes, assignment solutions, lab assignments, lab manuals, and lecture slides organized by course and instructor.
          </p>

          {/* Quick Action Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
            <button 
              onClick={() => navigateTo('upload')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#59a5fb]/10 border border-[#59a5fb]/30 text-[#59a5fb] hover:bg-[#59a5fb] hover:text-white text-[11px] sm:text-xs font-semibold transition-all shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Document
            </button>
          </div>
        </div>
      </section>

      {/* Platform Statistics Overview */}
      <StatsCard />

      {/* Course Directory Section */}
      <section className="space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#9D00FF]" />
              <span>Explore Engineering Course Directory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an engineering department or course to view instructors, past papers, quizzes, and solutions.
            </p>
          </div>

          {/* Engineering Department Filter Tabs with Course Counts */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            {DEPARTMENTS.map((deptObj) => {
              const count = getCourseCountForDept(deptObj);
              const isSelected = selectedDept === deptObj.label;
              return (
                <button
                  key={deptObj.label}
                  onClick={() => setSelectedDept(deptObj.label)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white font-extrabold shadow-md shadow-[#9D00FF]/20'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                  }`}
                  title={deptObj.full}
                >
                  <span>{deptObj.label}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Responsive Courses Cards Grid */}
        {displayedCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {displayedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-[#59a5fb]/10 border border-[#59a5fb]/30 flex items-center justify-center text-[#59a5fb] mx-auto mb-3">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No Courses Found</h3>
            <p className="text-slate-500 text-xs">
              No course matched "{searchQuery}". Try searching in the top navbar by course abbreviation like "OOP", "DSA", "DBS", "OS" or select "All".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('All');
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
