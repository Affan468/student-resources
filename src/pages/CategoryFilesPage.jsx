import React, { useState } from 'react';
import { useResource } from '../context/ResourceContext';
import ResourceCard from '../components/resources/ResourceCard';
import { ArrowLeft, FileText, FolderArchive } from 'lucide-react';
import { downloadCategoryZip } from '../services/zipGenerator';
import useSEO from '../hooks/useSEO';

export default function CategoryFilesPage() {
  const { 
    activeCourse, 
    activeInstructor, 
    selectedCategory, 
    navigateTo, 
    getCategoryResources,
    showToast 
  } = useResource();

  const [isZipping, setIsZipping] = useState(false);

  const categoryTitle = 
    selectedCategory === 'past-paper' ? 'Past Papers' :
    selectedCategory === 'quiz' ? 'Quizzes' :
    selectedCategory === 'assignment' ? 'Assignments' :
    selectedCategory === 'lab-assignment' ? 'Lab Assignments' :
    selectedCategory === 'lab-manual' ? 'Lab Manuals' :
    selectedCategory === 'lecture' ? 'Lectures' : 'Other Notes & Materials';

  useSEO({
    title: `${categoryTitle} - ${activeInstructor?.name || 'COMSATS Resource'}`,
    description: `Download ${categoryTitle} for ${activeCourse?.title || 'Engineering Course'} taught by ${activeInstructor?.name || 'Faculty Instructor'} at COMSATS University.`
  });

  const categoryFiles = getCategoryResources(
    activeInstructor?.id,
    activeCourse?.id,
    selectedCategory
  );

  const handleCategoryZip = async () => {
    if (categoryFiles.length === 0) return;
    try {
      setIsZipping(true);
      const zipName = await downloadCategoryZip(
        activeInstructor,
        activeCourse,
        categoryTitle,
        categoryFiles
      );
      showToast(`Downloaded category ZIP: "${zipName}"`, 'success');
    } catch (err) {
      showToast('Failed to download category ZIP', 'error');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('instructor-detail', { 
            courseId: activeCourse?.id, 
            instructorId: activeInstructor?.id 
          })}
          className="flex items-center space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Categories</span>
        </button>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {activeCourse?.code} / {activeInstructor?.name} / <span className="text-[#9D00FF] dark:text-[#c06eff] font-semibold capitalize">{categoryTitle}</span>
        </div>
      </div>

      {/* Category Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f0f7ff] via-[#f8efff] to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#59a5fb]/15 dark:bg-[#59a5fb]/25 border border-[#59a5fb]/30 text-[#59a5fb] dark:text-[#7bb9fc] text-xs font-semibold">
              <FileText className="w-3.5 h-3.5" />
              <span>{activeCourse?.title} ({activeCourse?.code})</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {categoryTitle} by {activeInstructor?.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {categoryFiles.length} verified file{categoryFiles.length !== 1 ? 's' : ''} for download.
            </p>
          </div>

          {/* Download Category ZIP Button */}
          {categoryFiles.length > 0 && (
            <button
              onClick={handleCategoryZip}
              disabled={isZipping}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-[#9D00FF]/20 transition-all shrink-0"
            >
              <FolderArchive className="w-4 h-4" />
              <span>{isZipping ? 'Generating ZIP...' : `Download ${categoryTitle} ZIP`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Files Grid */}
      {categoryFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryFiles.map((file) => (
            <ResourceCard key={file.id} resource={file} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-12 text-center shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-[#59a5fb]/10 dark:bg-[#59a5fb]/20 border border-[#59a5fb]/30 flex items-center justify-center text-[#59a5fb] dark:text-[#7bb9fc] mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Files Available Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto mb-6">
            There are currently no uploaded {categoryTitle.toLowerCase()} for {activeInstructor?.name} in this course. Be the first student to upload!
          </p>
          <button
            onClick={() => navigateTo('upload')}
            className="px-5 py-2.5 rounded-xl bg-[#9D00FF] text-white text-xs font-semibold shadow-lg shadow-[#9D00FF]/20"
          >
            Upload Document Now
          </button>
        </div>
      )}
    </div>
  );
}
