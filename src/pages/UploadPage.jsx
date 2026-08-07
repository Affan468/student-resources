import React, { useState, useEffect } from 'react';
import { useResource } from '../context/ResourceContext';
import { 
  Upload, 
  FileText, 
  User, 
  BookOpen, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  Loader2,
  AlertTriangle 
} from 'lucide-react';
import { uploadDocumentFile } from '../services/cloudStorage';
import { validateFileSize } from '../services/fileCompressor';
import SearchableSelect from '../components/common/SearchableSelect';
import useSEO from '../hooks/useSEO';

export default function UploadPage() {
  useSEO({
    title: 'Upload Study Resource & Past Paper',
    description: 'Share past papers, sessional quizzes, lab manuals, and lecture notes with fellow COMSATS engineering students.'
  });

  const { 
    courses, 
    instructors, 
    getInstructorsForCourse, 
    checkMatchingTitleWarning,
    submitUpload, 
    navigateTo 
  } = useResource();

  const [formData, setFormData] = useState({
    courseId: courses[0]?.id || '',
    instructorId: instructors[0]?.id || '',
    category: 'past-paper',
    title: '',
    examType: 'Midterm',
    semesterSession: 'Spring 2024',
    notes: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileError, setFileError] = useState('');

  // Real-time title match warning for specific selected directory (course + instructor + category)
  const titleWarning = checkMatchingTitleWarning(
    formData.courseId, 
    formData.instructorId, 
    formData.category, 
    formData.title
  );

  // Dynamically update instructor options based on selected course
  const courseInstructors = getInstructorsForCourse(formData.courseId);
  const availableInstructors = courseInstructors.length > 0 ? courseInstructors : instructors;

  // Format course and instructor options for searchable select
  const courseOptions = courses.map(c => ({
    value: c.id,
    label: `${c.code} - ${c.title}`,
    sublabel: c.department,
    aliases: c.aliases
  }));

  const instructorOptions = availableInstructors.map(i => ({
    value: i.id,
    label: `${i.name}`,
    sublabel: `${i.title} (${i.department})`
  }));

  // Sync default instructor selection when course changes
  useEffect(() => {
    if (availableInstructors.length > 0) {
      const match = availableInstructors.find(i => i.id === formData.instructorId);
      if (!match) {
        setFormData(prev => ({ ...prev, instructorId: availableInstructors[0].id }));
      }
    }
  }, [formData.courseId, availableInstructors]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateFileSize(file);
      if (!validation.valid) {
        setFileError(validation.error);
        setSelectedFile(null);
        e.target.value = '';
      } else {
        setFileError('');
        setSelectedFile(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a document title');
      return;
    }

    setIsSubmitting(true);

    try {
      // Process file through cloud storage or safe local storage handler
      const uploadedFileInfo = selectedFile 
        ? await uploadDocumentFile(selectedFile)
        : {
            fileName: `${formData.title.replace(/\s+/g, '_')}.pdf`,
            fileSize: '2.1 MB',
            fileType: 'pdf',
            downloadContent: `Uploaded Document: ${formData.title}\nNotes: ${formData.notes}`
          };

      await submitUpload({
        ...formData,
        uploaderName: 'Student',
        uploaderEmail: '',
        fileName: uploadedFileInfo.fileName,
        fileSize: uploadedFileInfo.fileSize,
        fileType: uploadedFileInfo.fileType,
        url: uploadedFileInfo.url,
        downloadContent: uploadedFileInfo.downloadContent,
        rawFile: selectedFile // Attach original binary File object
      });

      setUploadSuccess(true);

      // Redirect to home page after showing success state
      setTimeout(() => {
        navigateTo('home');
      }, 1500);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload encountered an issue: ' + (err.message || 'Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f0f7ff] via-[#f8efff] to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#59a5fb]/10 dark:bg-[#59a5fb]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#59a5fb]/15 dark:bg-[#59a5fb]/25 border border-[#59a5fb]/30 text-[#59a5fb] dark:text-[#7bb9fc] text-xs font-semibold">
            <Upload className="w-3.5 h-3.5" />
            <span>Open Student Document Contribution</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Upload Past Papers, Quizzes, Assignments, Labs & Lectures</h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Help your fellow COMSATS students by sharing exam past papers, sessional quizzes, assignment solutions, lab assignments, lab manuals, or lecture slides. Uploaded documents are reviewed by admins before publishing.
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {uploadSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-3xl p-6 flex items-center gap-4 text-emerald-800 dark:text-emerald-300 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Document Submitted for Review!</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
              Your document has been sent to the Admin Review Queue. Redirecting to home...
            </p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Typable / Searchable Course Selection */}
          <SearchableSelect
            label="Select Course"
            icon={BookOpen}
            options={courseOptions}
            value={formData.courseId}
            onChange={(val) => setFormData({ ...formData, courseId: val })}
            placeholder="Type course name or code (e.g. CSC211, OOP, DSA)..."
            focusColor="ring-[#59a5fb]"
            iconColor="text-[#59a5fb]"
          />

          {/* Typable / Searchable Instructor Selection */}
          <SearchableSelect
            label="Select Instructor"
            icon={User}
            options={instructorOptions}
            value={formData.instructorId}
            onChange={(val) => setFormData({ ...formData, instructorId: val })}
            placeholder="Type instructor name..."
            focusColor="ring-[#9D00FF]"
            iconColor="text-[#9D00FF]"
          />

          {/* Resource Category */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#59a5fb] dark:text-[#7bb9fc]" /> Resource Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59a5fb]"
            >
              <option value="past-paper">📜 Past Paper (Exam Paper)</option>
              <option value="quiz">📝 Quiz</option>
              <option value="assignment">📑 Assignment Solution</option>
              <option value="lab-assignment">🧪 Lab Assignment</option>
              <option value="lab-manual">📘 Lab Manual</option>
              <option value="lecture">🎙️ Lecture Slides / Notes</option>
              <option value="other">📚 Other Notes & Materials</option>
            </select>
          </div>
        </div>

        {/* Document Title */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Document Title</label>
          <input
            type="text"
            placeholder="e.g. Data Structures Midterm Spring 2024 Solved Paper"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
              titleWarning
                ? 'border-amber-400 dark:border-amber-500 focus:ring-amber-400'
                : 'border-slate-200 dark:border-slate-700 focus:ring-[#59a5fb]'
            }`}
          />
          {titleWarning && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-300 text-xs leading-relaxed animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Title Warning: </span>
                <span>{titleWarning.reason}</span>
                <span className="block mt-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  ℹ️ If your document is a different version or updated solution, you are still allowed to upload it below.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* File Dropzone */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Attach Document (PDF, DOCX, ZIP)</label>
          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#9D00FF] dark:hover:border-[#9D00FF] rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-800/50 transition-colors">
            <input
              type="file"
              accept=".pdf,.docx,.zip,.png,.jpg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-[#9D00FF]/10 dark:bg-[#9D00FF]/20 border border-[#9D00FF]/30 flex items-center justify-center text-[#9D00FF] dark:text-[#c06eff] mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              {fileError ? (
                <div className="text-rose-600 dark:text-rose-400 font-semibold text-xs bg-rose-50 dark:bg-rose-950/60 p-2 rounded-xl border border-rose-200 dark:border-rose-800">
                  ⚠️ {fileError}
                </div>
              ) : selectedFile ? (
                <div className="text-[#9D00FF] dark:text-[#c06eff] font-semibold text-sm">
                  ✓ Selected File: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Click to select or drag & drop document file here
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Supports PDF, DOCX, ZIP files up to 20 MB (Auto-compressed for fast storage)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || uploadSuccess}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-[#9D00FF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Upload...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Submit Document for Admin Approval</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
