import React, { useState } from 'react';
import { useResource } from '../context/ResourceContext';
import InstructorCard from '../components/instructors/InstructorCard';
import ResourceCard from '../components/resources/ResourceCard';
import useSEO from '../hooks/useSEO';
import {
  ArrowLeft,
  Users,
  FileText,
  FolderArchive,
  HelpCircle,
  FileCheck2,
  Layers,
  Sparkles,
  BookOpen,
  FlaskConical,
  BookOpenCheck,
  Presentation
} from 'lucide-react';

export default function CourseDetailPage() {
  const { activeCourse, navigateTo, getInstructorsForCourse, resources } = useResource();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'past-paper' | 'quiz' | 'assignment' | 'lab-assignment' | 'lab-manual' | 'lecture' | 'teachers'

  useSEO({
    title: activeCourse ? `${activeCourse.code} - ${activeCourse.title}` : 'Course Details',
    description: activeCourse ? `Download past papers, quizzes, assignments, lab manuals, and lecture slides for ${activeCourse.code} (${activeCourse.title}) at COMSATS University.` : 'Course details page'
  });

  if (!activeCourse) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Course Not Found</h2>
        <button
          onClick={() => navigateTo('home')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white text-sm font-semibold shadow-md"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const instructors = getInstructorsForCourse(activeCourse.id);

  // All approved resources for this course
  const courseResources = resources.filter(
    r => r.courseId === activeCourse.id && r.status === 'approved'
  );

  const pastPapers = courseResources.filter(r => r.category === 'past-paper');
  const quizzes = courseResources.filter(r => r.category === 'quiz');
  const assignments = courseResources.filter(r => r.category === 'assignment');
  const labAssignments = courseResources.filter(r => r.category === 'lab-assignment');
  const labManuals = courseResources.filter(r => r.category === 'lab-manual');
  const lectures = courseResources.filter(r => r.category === 'lecture');

  // Determine displayed items based on selected tab
  const getDisplayedFiles = () => {
    if (activeTab === 'past-paper') return pastPapers;
    if (activeTab === 'quiz') return quizzes;
    if (activeTab === 'assignment') return assignments;
    if (activeTab === 'lab-assignment') return labAssignments;
    if (activeTab === 'lab-manual') return labManuals;
    if (activeTab === 'lecture') return lectures;
    return courseResources;
  };

  const displayedFiles = getDisplayedFiles();

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </button>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Courses / <span className="text-[#9D00FF] dark:text-[#c06eff] font-semibold">{activeCourse.code}</span>
        </div>
      </div>

      {/* Course Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f0f7ff] via-[#f8efff] to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#59a5fb]/10 dark:bg-[#59a5fb]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#59a5fb]/15 dark:bg-[#59a5fb]/25 border border-[#59a5fb]/30 text-[#59a5fb] dark:text-[#7bb9fc] font-mono">
              {activeCourse.code}
            </span>
            <span className="text-xs font-semibold text-[#9D00FF] dark:text-[#c06eff] bg-[#9D00FF]/10 dark:bg-[#9D00FF]/20 border border-[#9D00FF]/20 dark:border-[#9D00FF]/40 px-3 py-1 rounded-full">
              {activeCourse.department}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {activeCourse.title}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {activeCourse.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/60">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Users className="w-4 h-4 text-[#9D00FF] dark:text-[#c06eff]" />
              {instructors.length} Teaching Instructors
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <FileText className="w-4 h-4 text-[#59a5fb] dark:text-[#7bb9fc]" />
              {courseResources.length} Total Course Files
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation Bar */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          <div className="flex items-center space-x-2">

            {/* All Section */}
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'all'
                  ? 'bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white shadow-md shadow-[#9D00FF]/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Resources</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-extrabold">
                {courseResources.length}
              </span>
            </button>

            {/* Past Papers Section */}
            <button
              onClick={() => setActiveTab('past-paper')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'past-paper'
                  ? 'bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white shadow-md shadow-[#9D00FF]/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
            >
              <FolderArchive className="w-4 h-4 text-[#59a5fb] dark:text-[#7bb9fc]" />
              <span>Past Papers</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold">
                {pastPapers.length}
              </span>
            </button>

            {/* Quizzes Section */}
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'quiz'
                  ? 'bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white shadow-md shadow-[#9D00FF]/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
            >
              <HelpCircle className="w-4 h-4 text-[#9D00FF] dark:text-[#c06eff]" />
              <span>Quizzes</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold">
                {quizzes.length}
              </span>
            </button>

            {/* Assignments Section */}
            <button
              onClick={() => setActiveTab('assignment')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'assignment'
                  ? 'bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white shadow-md shadow-[#9D00FF]/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
            >
              <FileCheck2 className="w-4 h-4 text-[#59a5fb] dark:text-[#7bb9fc]" />
              <span>Assignments</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold">
                {assignments.length}
              </span>
            </button>

            {/* Lab Assignments Section */}
            <button
              onClick={() => setActiveTab('lab-assignment')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'lab-assignment'
                  ? 'bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white shadow-md shadow-[#9D00FF]/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
            >
              <FlaskConical className="w-4 h-4 text-emerald-500" />
              <span>Lab Assignments</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold">
                {labAssignments.length}
              </span>
            </button>

            {/* Lab Manuals Section */}
            <button
              onClick={() => setActiveTab('lab-manual')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'lab-manual'
                  ? 'bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white shadow-md shadow-[#9D00FF]/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
            >
              <BookOpenCheck className="w-4 h-4 text-[#9D00FF] dark:text-[#c06eff]" />
              <span>Lab Manuals</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold">
                {labManuals.length}
              </span>
            </button>

            {/* Lectures Section */}
            <button
              onClick={() => setActiveTab('lecture')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'lecture'
                  ? 'bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white shadow-md shadow-[#9D00FF]/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
            >
              <Presentation className="w-4 h-4 text-amber-500" />
              <span>Lectures</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold">
                {lectures.length}
              </span>
            </button>

            {/* Categorized By Teachers Section */}
            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'teachers'
                  ? 'bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white shadow-md shadow-[#9D00FF]/20'
                  : 'bg-[#9D00FF]/10 dark:bg-[#9D00FF]/20 text-[#9D00FF] dark:text-[#c06eff] hover:bg-[#9D00FF] hover:text-white border border-[#9D00FF]/30'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>Categorized by Teachers</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-[#9D00FF]/20 text-[#9D00FF] dark:text-[#c06eff] group-hover:text-white font-extrabold">
                {instructors.length}
              </span>
            </button>
          </div>
        </div>

        {/* Section Content Display */}
        {activeTab === 'teachers' ? (
          /* Teachers Section */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#9D00FF] dark:text-[#c06eff]" />
                <span>Teachers for {activeCourse.title}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click a teacher to view their files and download all their resources in one click (.ZIP).
              </p>
            </div>

            {instructors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instructors.map((instructor) => (
                  <InstructorCard
                    key={instructor.id}
                    instructor={instructor}
                    courseId={activeCourse.id}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 text-sm shadow-md">
                No instructors listed for this course yet.
              </div>
            )}
          </div>
        ) : (
          /* Files Display Section (All, Past Papers, Quizzes, Assignments) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#59a5fb] dark:text-[#7bb9fc]" />
                <span>
                  {activeTab === 'all' ? 'All Course Files' : `${activeTab.replace('-', ' ')}s`} ({displayedFiles.length})
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct single download and document preview options.
              </p>
            </div>

            {displayedFiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedFiles.map((file) => (
                  <ResourceCard key={file.id} resource={file} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-12 text-center shadow-md">
                <div className="w-16 h-16 rounded-2xl bg-[#59a5fb]/10 dark:bg-[#59a5fb]/20 border border-[#59a5fb]/30 flex items-center justify-center text-[#59a5fb] dark:text-[#7bb9fc] mx-auto mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Files Found in this Section</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto mb-6">
                  There are currently no uploaded items for this category in {activeCourse.title}. Be the first student to upload!
                </p>
                <button
                  onClick={() => navigateTo('upload')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white text-xs font-semibold shadow-md"
                >
                  Upload Document Now
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
