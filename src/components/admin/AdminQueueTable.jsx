import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  FileText 
} from 'lucide-react';
import { useResource } from '../../context/ResourceContext';
import FilePreviewModal from '../common/FilePreviewModal';

export default function AdminQueueTable() {
  const { pendingUploads, courses, instructors, approveUpload, rejectUpload } = useResource();
  const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);

  if (pendingUploads.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center my-6 shadow-md">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Queue is All Clear!</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          There are currently no pending document submissions waiting for admin approval. All student uploads have been reviewed.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl my-6">
        
        {/* Table Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Pending Moderation Queue</h3>
              <p className="text-xs text-slate-500">
                {pendingUploads.length} student submission{pendingUploads.length > 1 ? 's' : ''} awaiting review
              </p>
            </div>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Document Title</th>
                <th className="px-6 py-4">Course & Instructor</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Submitted By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingUploads.map((item) => {
                const course = courses.find(c => c.id === item.courseId);
                const instructor = instructors.find(i => i.id === item.instructorId);

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#59a5fb]/15 border border-[#59a5fb]/30 flex items-center justify-center text-[#59a5fb] shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 truncate max-w-xs">{item.title}</p>
                          <p className="text-xs text-slate-400">{item.fileName} • {item.fileSize}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{course?.title || 'Unknown Course'} ({course?.code})</p>
                      <p className="text-xs text-slate-500">{instructor?.name || 'Unknown Instructor'}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#9D00FF]/10 border border-[#9D00FF]/30 text-[#9D00FF] capitalize">
                        {item.category === 'lab-assignment' ? 'Lab Assignment' :
                         item.category === 'lab-manual' ? 'Lab Manual' :
                         item.category === 'lecture' ? 'Lecture' :
                         item.category === 'past-paper' ? 'Past Paper' :
                         item.category.replace('-', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{item.uploaderName || 'Student'}</p>
                      <p className="text-xs text-slate-400">{item.createdAt}</p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedFileForPreview(item)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Preview Document"
                        >
                          <Eye className="w-4 h-4 text-[#59a5fb]" />
                        </button>

                        <button
                          onClick={() => approveUpload(item.id)}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => rejectUpload(item.id)}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-600 text-rose-600 hover:text-white font-semibold text-xs transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedFileForPreview && (
        <FilePreviewModal
          file={selectedFileForPreview}
          onClose={() => setSelectedFileForPreview(null)}
        />
      )}
    </>
  );
}
