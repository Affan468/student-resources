import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  HardDrive, 
  User,
  UserCheck
} from 'lucide-react';
import { downloadSingleResource } from '../../utils/downloadHelper';
import { useResource } from '../../context/ResourceContext';
import FilePreviewModal from '../common/FilePreviewModal';

export default function ResourceCard({ resource }) {
  const { instructors, incrementDownloads, showToast } = useResource();
  const [showPreview, setShowPreview] = useState(false);

  const instructor = instructors.find(i => i.id === resource.instructorId);

  const isPastPaper = resource.category === 'past-paper';
  const isQuiz = resource.category === 'quiz';
  const isAssignment = resource.category === 'assignment';
  const isLabAssignment = resource.category === 'lab-assignment';
  const isLabManual = resource.category === 'lab-manual';
  const isLecture = resource.category === 'lecture';

  const categoryColor = isPastPaper
    ? 'bg-[#59a5fb]/15 border-[#59a5fb]/30 text-[#59a5fb]'
    : isQuiz
    ? 'bg-[#9D00FF]/15 border-[#9D00FF]/30 text-[#9D00FF]'
    : isAssignment
    ? 'bg-blue-500/15 border-blue-500/30 text-blue-600'
    : isLabAssignment
    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600'
    : isLabManual
    ? 'bg-purple-500/15 border-purple-500/30 text-purple-600'
    : isLecture
    ? 'bg-amber-500/15 border-amber-500/30 text-amber-600'
    : 'bg-slate-500/15 border-slate-500/30 text-slate-600';

  const categoryLabel = 
    isPastPaper ? 'Past Paper' :
    isQuiz ? 'Quiz' :
    isAssignment ? 'Assignment' :
    isLabAssignment ? 'Lab Assignment' :
    isLabManual ? 'Lab Manual' :
    isLecture ? 'Lecture' : resource.category.replace('-', ' ');

  const handleDownload = () => {
    downloadSingleResource(resource);
    incrementDownloads(resource.id);
    showToast(`Downloaded "${resource.title}"`, 'success');
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200 hover:border-[#59a5fb] p-5 shadow-md hover:shadow-xl transition-all duration-300">
        
        <div>
          {/* Header Tag */}
          <div className="flex items-center justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${categoryColor}`}>
              {categoryLabel}
            </span>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {resource.semesterSession || 'Spring 2024'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-slate-900 group-hover:text-[#9D00FF] transition-colors leading-snug mb-2">
            {resource.title}
          </h3>

          {/* Instructor Badge */}
          {instructor && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-3">
              <UserCheck className="w-3.5 h-3.5 text-[#9D00FF]" />
              <span>{instructor.name}</span>
            </div>
          )}

          {/* Metadata info */}
          <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-xs text-slate-500 mb-6">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              {resource.fileSize || '2.5 MB'}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {resource.uploaderName || 'Student'}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {resource.downloadsCount || 0} Downloads
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors"
          >
            <Eye className="w-4 h-4 text-[#59a5fb]" />
            <span>Preview</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] hover:opacity-90 text-white text-xs font-semibold shadow-md shadow-[#9D00FF]/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {showPreview && (
        <FilePreviewModal 
          file={resource} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </>
  );
}
