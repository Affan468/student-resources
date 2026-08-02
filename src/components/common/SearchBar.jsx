import React, { useState, useRef, useEffect } from 'react';
import { useResource } from '../../context/ResourceContext';
import { Search, BookOpen, User, ArrowRight, X, Sparkles } from 'lucide-react';

export default function SearchBar({ placeholder = "Search courses, instructors, codes (e.g. CSC211, OOP, Dr. Asif)...", isHero = false }) {
  const { 
    courses, 
    instructors, 
    searchQuery, 
    setSearchQuery, 
    navigateTo 
  } = useResource();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const query = searchQuery.toLowerCase().trim();

  // Filter matching courses (by title, code, dept, abbreviation, or aliases)
  const matchedCourses = query
    ? courses.filter(course => {
        const matchTitle = course.title.toLowerCase().includes(query);
        const matchCode = course.code.toLowerCase().includes(query);
        const matchDept = course.department.toLowerCase().includes(query);
        const matchAbbrev = course.abbreviation ? course.abbreviation.toLowerCase().includes(query) : false;
        const matchAlias = course.aliases ? course.aliases.some(alias => alias.toLowerCase().includes(query)) : false;
        return matchTitle || matchCode || matchDept || matchAbbrev || matchAlias;
      })
    : [];

  // Filter matching instructors (by name, department, title)
  const matchedInstructors = query
    ? instructors.filter(inst => {
        const matchName = inst.name.toLowerCase().includes(query);
        const matchDept = inst.department.toLowerCase().includes(query);
        const matchTitle = inst.title.toLowerCase().includes(query);
        return matchName || matchDept || matchTitle;
      })
    : [];

  const hasResults = matchedCourses.length > 0 || matchedInstructors.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCourse = (courseId) => {
    setIsOpen(false);
    navigateTo('course-detail', { courseId });
  };

  const handleSelectInstructor = (instructorId) => {
    setIsOpen(false);
    // Find first course of this instructor or navigate to home
    const instructor = instructors.find(i => i.id === instructorId);
    const firstCourse = courses.find(c => c.instructorIds.includes(instructorId));
    if (firstCourse && instructor) {
      navigateTo('instructor-detail', { courseId: firstCourse.id, instructorId: instructor.id });
    } else {
      navigateTo('home');
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative flex items-center">
        <Search className={`absolute left-4 ${isHero ? 'w-5 h-5 text-slate-400 dark:text-slate-400' : 'w-4 h-4 text-slate-400 dark:text-slate-400'}`} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          className={`w-full ${
            isHero 
              ? 'pl-12 pr-12 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#9D00FF] text-sm shadow-xl'
              : 'pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#59a5fb]'
          } transition-all`}
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Instant Search Results Dropdown */}
      {isOpen && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 animate-fade-in">
          
          {hasResults ? (
            <>
              {/* Courses Results Group */}
              {matchedCourses.length > 0 && (
                <div className="p-3">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-3 mb-2 block">
                    Matching Courses ({matchedCourses.length})
                  </span>
                  <div className="space-y-1">
                    {matchedCourses.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => handleSelectCourse(course.id)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#59a5fb]/15 dark:bg-[#59a5fb]/25 border border-[#59a5fb]/30 flex items-center justify-center text-[#59a5fb] dark:text-[#7bb9fc] font-bold text-xs">
                            {course.code}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#9D00FF] dark:group-hover:text-[#c06eff] transition-colors">
                                {course.title}
                              </h4>
                              {course.abbreviation && (
                                <span className="px-2 py-0.5 rounded-md bg-[#9D00FF]/10 dark:bg-[#9D00FF]/25 text-[#9D00FF] dark:text-[#c06eff] font-mono text-[10px] font-bold">
                                  {course.abbreviation}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{course.department} • Semester {course.semester}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-semibold text-[#59a5fb] dark:text-[#7bb9fc] group-hover:text-[#9D00FF] dark:group-hover:text-[#c06eff]">
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructors Results Group */}
              {matchedInstructors.length > 0 && (
                <div className="p-3">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-3 mb-2 block">
                    Matching Teachers ({matchedInstructors.length})
                  </span>
                  <div className="space-y-1">
                    {matchedInstructors.map((inst) => (
                      <div
                        key={inst.id}
                        onClick={() => handleSelectInstructor(inst.id)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={inst.avatar}
                            alt={inst.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#9D00FF] dark:group-hover:text-[#c06eff] transition-colors">
                              {inst.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{inst.title} • {inst.department}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-semibold text-[#9D00FF] dark:text-[#c06eff]">
                          <span>View Profile</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
              No matching courses or instructors found for "<span className="font-semibold text-slate-800 dark:text-slate-200">{searchQuery}</span>".
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Try searching by abbreviations like OOP, DSA, DBS, OS, SE, CN, AI or course code.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

}
