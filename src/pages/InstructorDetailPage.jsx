import React, { useState } from 'react';
import { useResource } from '../context/ResourceContext';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  FolderArchive, 
  UserCheck, 
  HelpCircle, 
  BookOpenCheck, 
  FileCheck2,
  FlaskConical,
  Presentation
} from 'lucide-react';
import { downloadInstructorResourcesZip } from '../services/zipGenerator';
import useSEO from '../hooks/useSEO';

export default function InstructorDetailPage() {
  const { 
    activeCourse, 
    activeInstructor, 
    navigateTo, 
    getInstructorResources,
    showToast 
  } = useResource();

  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  useSEO({
    title: activeInstructor ? `${activeInstructor.name} (${activeInstructor.title || 'Faculty'})` : 'Instructor Profile',
    description: activeInstructor ? `Study materials, past exam papers, sessional quizzes, and lab manuals provided by ${activeInstructor.name} at COMSATS University.` : 'Faculty instructor profile page'
  });

  if (!activeInstructor) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Instructor Not Found</h2>
        <button onClick={() => navigateTo('home')} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white font-semibold text-sm">
          Return to Home
        </button>
      </div>
    );
  }

  const allInstructorResources = getInstructorResources(
    activeInstructor.id, 
    activeCourse ? activeCourse.id : null
  );

  const pastPapers = allInstructorResources.filter(r => r.category === 'past-paper');
  const quizzes = allInstructorResources.filter(r => r.category === 'quiz');
  const assignments = allInstructorResources.filter(r => r.category === 'assignment');
  const labAssignments = allInstructorResources.filter(r => r.category === 'lab-assignment');
  const labManuals = allInstructorResources.filter(r => r.category === 'lab-manual');
  const lectures = allInstructorResources.filter(r => r.category === 'lecture');
  const otherNotes = allInstructorResources.filter(r => r.category === 'other');

  // Bulk ZIP Download Handler
  const handleBulkZipDownload = async () => {
    if (allInstructorResources.length === 0) {
      showToast('No resources available for this instructor yet.', 'info');
      return;
    }

    try {
      setIsZipping(true);
      setZipProgress(10);

      const zipName = await downloadInstructorResourcesZip(
        activeInstructor,
        activeCourse,
        allInstructorResources,
        (progress) => setZipProgress(progress)
      );

      showToast(`Successfully created & downloaded ZIP archive: "${zipName}"!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to generate ZIP file.', 'error');
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  const categories = [
    {
      id: 'past-paper',
      title: 'Past Papers',
      subtitle: 'Midterm & Final Examination Question Papers',
      count: pastPapers.length,
      icon: FolderArchive,
      color: 'from-[#59a5fb] to-[#3b82f6]',
      badgeColor: 'bg-[#59a5fb]/15 border-[#59a5fb]/30 text-[#59a5fb]'
    },
    {
      id: 'quiz',
      title: 'Quizzes',
      subtitle: 'Sessional Quizzes & Solved Questions',
      count: quizzes.length,
      icon: HelpCircle,
      color: 'from-[#9D00FF] to-[#7c00cc]',
      badgeColor: 'bg-[#9D00FF]/15 border-[#9D00FF]/30 text-[#9D00FF]'
    },
    {
      id: 'assignment',
      title: 'Assignments',
      subtitle: 'Assignment Tasks & Detailed Solutions',
      count: assignments.length,
      icon: FileCheck2,
      color: 'from-[#59a5fb] to-[#9D00FF]',
      badgeColor: 'bg-[#59a5fb]/15 border-[#59a5fb]/30 text-[#59a5fb]'
    },
    {
      id: 'lab-assignment',
      title: 'Lab Assignments',
      subtitle: 'Practical Lab Tasks & Solution Submissions',
      count: labAssignments.length,
      icon: FlaskConical,
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600'
    },
    {
      id: 'lab-manual',
      title: 'Lab Manuals',
      subtitle: 'Official Lab Guides & Manual Documents',
      count: labManuals.length,
      icon: BookOpenCheck,
      color: 'from-[#9D00FF] to-[#59a5fb]',
      badgeColor: 'bg-[#9D00FF]/15 border-[#9D00FF]/30 text-[#9D00FF]'
    },
    {
      id: 'lecture',
      title: 'Lectures',
      subtitle: 'Lecture Slides & Classroom Presentations',
      count: lectures.length,
      icon: Presentation,
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-500/15 border-amber-500/30 text-amber-600'
    },
    {
      id: 'other',
      title: 'Other Notes & Materials',
      subtitle: 'Handwritten Notes & Supplementary Guides',
      count: otherNotes.length,
      icon: FileText,
      color: 'from-slate-500 to-slate-700',
      badgeColor: 'bg-slate-500/15 border-slate-500/30 text-slate-600'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => activeCourse ? navigateTo('course-detail', { courseId: activeCourse.id }) : navigateTo('home')}
          className="flex items-center space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{activeCourse ? 'Back to Course Instructors' : 'Back to Faculty Directory'}</span>
        </button>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {activeCourse ? `${activeCourse.code} / ` : ''}<span className="text-[#9D00FF] dark:text-[#c06eff] font-semibold">{activeInstructor.name}</span>
        </div>
      </div>

      {/* Instructor Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f0f7ff] via-[#f8efff] to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#9D00FF]/10 dark:bg-[#9D00FF]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center space-x-5">
            <img
              src={activeInstructor.avatar}
              alt={activeInstructor.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-[#59a5fb] shadow-lg"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{activeInstructor.name}</h1>
                <UserCheck className="w-5 h-5 text-[#9D00FF] dark:text-[#c06eff]" />
              </div>
              <p className="text-sm font-semibold text-[#9D00FF] dark:text-[#c06eff]">{activeInstructor.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{activeInstructor.department} • COMSATS University</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 max-w-xl">{activeInstructor.bio}</p>
            </div>
          </div>

          {/* BULK ZIP DOWNLOAD BUTTON */}
          <div className="shrink-0 flex flex-col items-stretch md:items-end gap-2">
            <button
              onClick={handleBulkZipDownload}
              disabled={isZipping || allInstructorResources.length === 0}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#59a5fb] via-[#7c3aed] to-[#9D00FF] hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-[#9D00FF]/20 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Download className={`w-5 h-5 ${isZipping ? 'animate-bounce' : ''}`} />
              <span>
                {isZipping 
                  ? `Compressing ZIP (${zipProgress}%)...` 
                  : `Download All Resources (.ZIP)`}
              </span>
            </button>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center md:text-right font-medium">
              Bundles {allInstructorResources.length} files into 1 compressed ZIP archive
            </span>
          </div>
        </div>
      </div>

      {/* Category Selection Cards Section */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#59a5fb] dark:text-[#7bb9fc]" />
            <span>Select Resource Category</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click on a category below to browse and download specific past papers, quizzes, or assignments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => navigateTo('category-files', { 
                  courseId: activeCourse?.id, 
                  instructorId: activeInstructor.id, 
                  category: cat.id 
                })}
                className="group relative flex items-center justify-between rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:border-[#9D00FF] dark:hover:border-[#9D00FF] p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} p-0.5 shadow-md group-hover:scale-110 transition-transform`}>
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                      <IconComponent className="w-7 h-7 text-[#9D00FF] dark:text-[#c06eff]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-[#9D00FF] dark:group-hover:text-[#c06eff] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{cat.subtitle}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${cat.badgeColor}`}>
                    {cat.count} File{cat.count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
