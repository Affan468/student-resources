import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Download, Calendar, User, Tag, HardDrive, CheckCircle2 } from 'lucide-react';
import { downloadSingleResource } from '../../utils/downloadHelper';
import { useResource } from '../../context/ResourceContext';
import { getCachedFileAsync } from '../../services/fileCache';

export default function FilePreviewModal({ file, onClose }) {
  const { incrementDownloads, showToast } = useResource();
  const [objectUrl, setObjectUrl] = useState(null);

  if (!file) return null;

  // Retrieve cached binary File/Blob or IndexedDB disk object across reloads
  useEffect(() => {
    let activeUrl = null;
    let isMounted = true;

    async function loadFileContent() {
      const cachedFile = (await getCachedFileAsync(file.id)) || file.rawFile;
      if (cachedFile && (cachedFile instanceof Blob || cachedFile instanceof File)) {
        activeUrl = URL.createObjectURL(cachedFile);
        if (isMounted) setObjectUrl(activeUrl);
      } else if (file.url && (file.url.startsWith('blob:') || file.url.startsWith('http'))) {
        if (isMounted) setObjectUrl(file.url);
      }
    }

    loadFileContent();

    return () => {
      isMounted = false;
      if (activeUrl && activeUrl.startsWith('blob:')) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [file]);

  const handleDownload = () => {
    downloadSingleResource(file);
    incrementDownloads(file.id);
    showToast(`Downloaded "${file.title}"`, 'success');
  };

  const isImage = file.fileType === 'png' || file.fileType === 'jpg' || file.fileName?.match(/\.(png|jpg|jpeg)$/i);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#59a5fb] to-[#9D00FF] p-0.5 shadow-sm">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center text-[#9D00FF] dark:text-[#c06eff]">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                <span>{file.title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Full Document Preview
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{file.fileName}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-100/50 dark:bg-slate-950/40">
          
          {/* Metadata badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#59a5fb] dark:text-[#7bb9fc]" /> Category
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                {file.category === 'lab-assignment' ? 'Lab Assignment' :
                 file.category === 'lab-manual' ? 'Lab Manual' :
                 file.category === 'lecture' ? 'Lecture' :
                 file.category === 'past-paper' ? 'Past Paper' :
                 file.category.replace('-', ' ')}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#9D00FF] dark:text-[#c06eff]" /> Session
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{file.semesterSession || 'Spring 2024'}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-[#59a5fb] dark:text-[#7bb9fc]" /> Size
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{file.fileSize || '2.5 MB'}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#9D00FF] dark:text-[#c06eff]" /> Uploader
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{file.uploaderName || 'Student'}</p>
            </div>
          </div>

          {/* Full Interactive Document Viewer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-md overflow-hidden min-h-[500px] flex flex-col">
            {objectUrl ? (
              isImage ? (
                <div className="p-4 flex items-center justify-center min-h-[500px] bg-slate-900/5 dark:bg-slate-950/40">
                  <img src={objectUrl} alt={file.title} className="max-h-[600px] max-w-full rounded-xl object-contain shadow-lg" />
                </div>
              ) : (
                <iframe
                  src={objectUrl}
                  title={file.title}
                  className="w-full h-[550px] border-0"
                />
              )
            ) : (
              /* Styled Fallback Document Viewer */
              <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 min-h-[500px]">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#59a5fb] dark:text-[#7bb9fc] uppercase tracking-wider">COMSATS UNIVERSITY ISLAMABAD</span>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{file.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Official Resource Document • {file.semesterSession || 'Spring 2024'}</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </div>
                </div>

                <div className="prose max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 font-mono">
                  {file.downloadContent || 
                    `====================================================\n` +
                    `COMSATS UNIVERSITY ISLAMABAD - STUDY RESOURCE PORTAL\n` +
                    `====================================================\n` +
                    `Title: ${file.title}\n` +
                    `Category: ${file.category.toUpperCase()}\n` +
                    `Exam Type: ${file.examType || 'N/A'}\n` +
                    `Semester: ${file.semesterSession || 'N/A'}\n` +
                    `Uploader: ${file.uploaderName || 'Anonymous'}\n` +
                    `Date: ${file.createdAt}\n` +
                    `====================================================\n\n` +
                    `QUESTIONS & SOLUTIONS SUMMARY:\n` +
                    `----------------------------------------------------\n` +
                    `Q1. Detail theoretical definitions and core principles.\n` +
                    `Q2. Solve analytical problems step-by-step.\n` +
                    `Q3. Provide system implementation diagrams.\n` +
                    `----------------------------------------------------`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close Preview
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white font-extrabold text-sm shadow-lg shadow-[#9D00FF]/25 hover:opacity-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Full File ({file.fileSize || '2.5 MB'})</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
