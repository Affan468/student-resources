import React, { useState } from 'react';
import { useResource } from '../context/ResourceContext';
import CourseCard from '../components/courses/CourseCard';
import InstructorCard from '../components/instructors/InstructorCard';
import StatsCard from '../components/common/StatsCard';
import useSEO from '../hooks/useSEO';
import { 
  Search, 
  BookOpen, 
  Upload, 
  ShieldCheck, 
  Globe,
  Users
} from 'lucide-react';

const DEPARTMENTS = [
  { label: 'All', full: 'All' }, 
  { label: 'CE', full: 'Computer Engineering (CE)' }, 
  { label: 'EE', full: 'Electrical Engineering (EE)' }, 
  { label: 'EEE', full: 'Electrical & Electronics Engineering (EEE)' }
];

export default function HomePage() {
  useSEO({
    title: 'Engineering Course Directory & Past Papers',
    description: 'COMSATS University Study Resource Hub. Access past exam papers, sessional quizzes, lab manuals, and lecture slides for CE, EE, and EEE engineering majors.'
  });

  const { 
    filteredCourses, 
    instructors,
    searchQuery, 
    setSearchQuery, 
    navigateTo 
  } = useResource();

  const [directoryMode, setDirectoryMode] = useState('courses'); // 'courses' | 'instructors'
  const [selectedDept, setSelectedDept] = useState('All');

  // Filter courses by selected department
  const displayedCourses = filteredCourses.filter(course => {
    if (selectedDept === 'All') return true;
    if (course.department === 'All Majors (CE, EE & EEE)' || course.department === 'All') return true;
    const target = DEPARTMENTS.find(d => d.label === selectedDept);
    return course.department === target?.full || course.department === selectedDept;
  });

  // Filter instructors by search query & department
  const displayedInstructors = instructors.filter(inst => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || (
      (inst.name && inst.name.toLowerCase().includes(q)) ||
      (inst.title && inst.title.toLowerCase().includes(q)) ||
      (inst.department && inst.department.toLowerCase().includes(q)) ||
      (inst.specialization && inst.specialization.toLowerCase().includes(q))
    );

    if (!matchSearch) return false;
    if (selectedDept === 'All') return true;
    const target = DEPARTMENTS.find(d => d.label === selectedDept);
    return (inst.department && (inst.department.includes(selectedDept) || inst.department === target?.full));
  });

  const getCourseCountForDept = (deptObj) => {
    return filteredCourses.filter(course => {
      if (deptObj.label === 'All') return true;
      if (course.department === 'All Majors (CE, EE & EEE)' || course.department === 'All') return true;
      return course.department === deptObj.full || course.department === deptObj.label;
    }).length;
  };

  const getInstructorCountForDept = (deptObj) => {
    return instructors.filter(inst => {
      if (deptObj.label === 'All') return true;
      return (inst.department && (inst.department.includes(deptObj.label) || inst.department === deptObj.full));
    }).length;
  };

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in pb-12">
      
      {/* Compact & Mobile Responsive Hero Section */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#f0f7ff] via-[#f8efff] to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800 border border-[#59a5fb]/20 dark:border-slate-800 p-5 sm:p-7 lg:p-8 shadow-lg">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#59a5fb]/10 dark:bg-[#59a5fb]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-[#9D00FF]/10 dark:bg-[#9D00FF]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9D00FF]/10 dark:bg-[#9D00FF]/20 border border-[#9D00FF]/20 dark:border-[#9D00FF]/40 text-[#9D00FF] dark:text-[#c06eff] text-[11px] sm:text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-[#59a5fb] dark:text-[#7bb9fc]" />
            <span>COMSATS Engineering Resource Portal (CE • EE • EEE)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            Find <span className="bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] bg-clip-text text-transparent">Past Papers, Quizzes, Labs & Lectures</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-medium hidden sm:block">
            Tailored study hub for Computer Engineering (CE), Electrical Engineering (EE), and EEE students. Exam past papers, sessional quizzes, assignment solutions, lab assignments, lab manuals, and lecture slides organized by course and instructor.
          </p>

          {/* Quick Action Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
            <button 
              onClick={() => navigateTo('upload')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#59a5fb]/10 dark:bg-[#59a5fb]/20 border border-[#59a5fb]/30 dark:border-[#59a5fb]/40 text-[#59a5fb] dark:text-[#7bb9fc] hover:bg-[#59a5fb] hover:text-white dark:hover:bg-[#59a5fb] text-[11px] sm:text-xs font-semibold transition-all shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Document
            </button>
          </div>
        </div>
      </section>

      {/* Platform Statistics Overview */}
      <StatsCard />

      {/* Main Directory Section */}
      <section className="space-y-6">
        
        {/* Main View Mode Selector (Courses vs All Instructors) */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-inner">
            <button
              onClick={() => setDirectoryMode('courses')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                directoryMode === 'courses'
                  ? 'bg-gradient-to-r from-[#59a5fb] to-[#3b82f6] text-white shadow-md shadow-[#59a5fb]/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Courses Directory ({filteredCourses.length})</span>
            </button>

            <button
              onClick={() => setDirectoryMode('instructors')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                directoryMode === 'instructors'
                  ? 'bg-gradient-to-r from-[#9D00FF] to-[#7c00cc] text-white shadow-md shadow-[#9D00FF]/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Faculty Instructors ({instructors.length})</span>
            </button>
          </div>
        </div>

        {/* Directory Header Bar with Department Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {directoryMode === 'courses' ? (
                <>
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#59a5fb] dark:text-[#7bb9fc]" />
                  <span>Explore Engineering Courses Directory</span>
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#9D00FF] dark:text-[#c06eff]" />
                  <span>Faculty Instructors Directory</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {directoryMode === 'courses'
                ? 'Select an engineering department or course to view instructors, past papers, quizzes, and solutions.'
                : 'Select an instructor to view all past papers, quizzes, lab manuals, and lecture notes provided by that teacher.'
              }
            </p>
          </div>

          {/* Engineering Department Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            {DEPARTMENTS.map((deptObj) => {
              const count = directoryMode === 'courses' ? getCourseCountForDept(deptObj) : getInstructorCountForDept(deptObj);
              const isSelected = selectedDept === deptObj.label;
              return (
                <button
                  key={deptObj.label}
                  onClick={() => setSelectedDept(deptObj.label)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? directoryMode === 'courses'
                        ? 'bg-gradient-to-r from-[#59a5fb] to-[#3b82f6] text-white font-extrabold shadow-md shadow-[#59a5fb]/20'
                        : 'bg-gradient-to-r from-[#9D00FF] to-[#7c00cc] text-white font-extrabold shadow-md shadow-[#9D00FF]/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                  title={deptObj.full}
                >
                  <span>{deptObj.label}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Directory Content Display (Courses Grid vs Instructors Grid) */}
        {directoryMode === 'courses' ? (
          displayedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {displayedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-8 text-center shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-[#59a5fb]/10 dark:bg-[#59a5fb]/20 border border-[#59a5fb]/30 flex items-center justify-center text-[#59a5fb] dark:text-[#7bb9fc] mx-auto mb-3">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Courses Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                No course matched "{searchQuery}". Try searching in the top navbar by course abbreviation like "OOP", "DSA", "DBS", "OS" or select "All".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('All');
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Clear Filters
              </button>
            </div>
          )
        ) : (
          displayedInstructors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedInstructors.map((inst) => (
                <InstructorCard key={inst.id} instructor={inst} courseId={null} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-8 text-center shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-[#9D00FF]/10 dark:bg-[#9D00FF]/20 border border-[#9D00FF]/30 flex items-center justify-center text-[#9D00FF] dark:text-[#c06eff] mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Instructors Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                No instructor matched "{searchQuery}". Try searching for faculty teacher names or select "All".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('All');
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Clear Filters
              </button>
            </div>
          )
        )}
      </section>
    </div>
  );
}
