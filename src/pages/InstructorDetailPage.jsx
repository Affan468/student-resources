import React, { useState } from 'react';
import { useResource } from '../context/ResourceContext';
import ResourceCard from '../components/resources/ResourceCard';
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
  Presentation,
  Layers,
  Search
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
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all'); // Default selected: 'all'

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

  // Filter resources based on active tab
  const displayedResources = selectedCategoryTab === 'all'
    ? allInstructorResources
    : allInstructorResources.filter(r => r.category === selectedCategoryTab);

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
      id: 'all',
      title: 'All Resources',
      count: allInstructorResources.length,
      icon: Layers
    },
    {
      id: 'past-paper',
      title: 'Past Papers',
      count: pastPapers.length,
      icon: FolderArchive
    },
    {
      id: 'quiz',
      title: 'Quizzes',
      count: quizzes.length,
      icon: HelpCircle
    },
    {
      id: 'assignment',
      title: 'Assignments',
      count: assignments.length,
      icon: FileCheck2
    },
    {
      id: 'lab-assignment',
      title: 'Lab Assignments',
      count: labAssignments.length,
      icon: FlaskConical
    },
    {
      id: 'lab-manual',
      title: 'Lab Manuals',
      count: labManuals.length,
      icon: BookOpenCheck
    },
    {
      id: 'lecture',
      title: 'Lectures',
      count: lectures.length,
      icon: Presentation
    },
    {
      id: 'other',
      title: 'Other Notes',
      count: otherNotes.length,
      icon: FileText
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
              src={activeInstructor.avatar || activeInstructor.avatarUrl}
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

      {/* Category Tabs & All Resources Display Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#59a5fb] dark:text-[#7bb9fc]" />
              <span>Study Resources Repository</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Browse all study materials or select a specific category tab.
            </p>
          </div>

          {/* Category Tabs (All Resources default selected) */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategoryTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryTab(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#9D00FF] to-[#7c00cc] text-white shadow-md shadow-[#9D00FF]/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.title}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resources Grid */}
        {displayedResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayedResources.map((res) => (
              <ResourceCard key={res.id} resource={res} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-10 text-center shadow-md space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#9D00FF]/10 dark:bg-[#9D00FF]/20 border border-[#9D00FF]/30 flex items-center justify-center text-[#9D00FF] dark:text-[#c06eff] mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                No Resources Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {selectedCategoryTab === 'all' 
                  ? 'No study materials uploaded for this instructor yet.'
                  : `No files uploaded in the "${categories.find(c => c.id === selectedCategoryTab)?.title}" category yet.`
                }
              </p>
            </div>
            {selectedCategoryTab !== 'all' && (
              <button
                onClick={() => setSelectedCategoryTab('all')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Show All Resources
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
