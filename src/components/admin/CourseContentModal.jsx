import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useResource } from '../../context/ResourceContext';
import { downloadSingleResource } from '../../utils/downloadHelper';
import { 
  X, 
  BookOpen, 
  FileText, 
  Trash2, 
  Download, 
  Search, 
  Calendar, 
  User, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export default function CourseContentModal({ course, onClose }) {
  const { resources, deleteResource } = useResource();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // resource object to delete

  if (!course) return null;

  // Filter resources that belong to this specific course
  const courseResources = resources.filter(r => r.courseId === course.id);

  // Search filter inside modal
  const filteredResources = courseResources.filter(r => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q)) ||
      (r.examType && r.examType.toLowerCase().includes(q)) ||
      (r.uploaderName && r.uploaderName.toLowerCase().includes(q))
    );
  });

  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'past-paper':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'quiz':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'assignment':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const confirmDeleteResource = async () => {
    if (!deleteTarget) return;
    await deleteResource(deleteTarget.id);
    setDeleteTarget(null);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-[#f0f7ff] to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#59a5fb]/10 border border-[#59a5fb]/30 flex items-center justify-center text-[#59a5fb]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-[#59a5fb] text-sm">{course.code}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500">{course.department}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">{course.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Toolbar & Search */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Course Content Library</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#59a5fb]/15 text-[#59a5fb] font-bold">
              {courseResources.length} Documents
            </span>
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by title, category, uploader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#59a5fb]"
            />
          </div>
        </div>

        {/* Modal Document List Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredResources.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-700 text-sm">No documents found</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {searchTerm ? `No files matching "${searchTerm}"` : 'No study materials uploaded for this course yet.'}
                </p>
              </div>
            </div>
          ) : (
            filteredResources.map((res) => (
              <div
                key={res.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-all"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(res.category)}`}>
                        {res.category ? res.category.replace('-', ' ') : 'Document'}
                      </span>
                      {res.examType && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {res.examType}
                        </span>
                      )}
                      {res.semesterSession && (
                        <span className="text-[10px] font-medium text-slate-400">
                          {res.semesterSession}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm truncate">{res.title}</h4>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {res.uploaderName || 'Student'}
                      </span>
                      <span>•</span>
                      <span>{res.fileSize || '1.5 MB'}</span>
                      {res.createdAt && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {res.createdAt}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => downloadSingleResource(res)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-all"
                    title="Download/Preview Document"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  {res.url && res.url.startsWith('http') && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                      title="Open Direct File Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => setDeleteTarget(res)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-xs transition-all"
                    title="Permanently Delete Document from R2 & DB"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Document Confirmation Dialog Overlay */}
        {deleteTarget && (
          <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Delete Document Permanently?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete <span className="font-bold text-slate-800">"{deleteTarget.title}"</span>? This will remove the file from Cloudflare R2 storage and database.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteResource}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all shadow-md shadow-rose-600/20"
                >
                  Yes, Delete Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
