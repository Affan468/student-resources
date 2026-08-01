import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useResource } from '../context/ResourceContext';
import AdminQueueTable from '../components/admin/AdminQueueTable';
import AddCourseModal from '../components/admin/AddCourseModal';
import AddInstructorModal from '../components/admin/AddInstructorModal';
import CourseContentModal from '../components/admin/CourseContentModal';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Download, 
  KeyRound, 
  AlertCircle,
  PlusCircle,
  UserPlus,
  BookOpen,
  Users,
  Trash2,
  AlertTriangle,
  Search,
  FileText
} from 'lucide-react';

export default function AdminPage() {
  const { 
    pendingUploads, 
    resources, 
    courses,
    instructors,
    deleteCourse,
    deleteInstructor,
    getInstructorsForCourse,
    showToast 
  } = useResource();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_session_auth') === 'true';
  });
  const [passkey, setPasskey] = useState('');
  const [authError, setAuthError] = useState(false);

  // Active Admin View Tab: 'queue' | 'courses' | 'instructors'
  const [activeTab, setActiveTab] = useState('queue');

  // Search query for courses and instructors catalog
  const [courseSearch, setCourseSearch] = useState('');
  const [instructorSearch, setInstructorSearch] = useState('');

  // Modal open states
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddInstructor, setShowAddInstructor] = useState(false);

  // Custom Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'course' | 'instructor', item: object }
  const [selectedCourseForContent, setSelectedCourseForContent] = useState(null);

  const totalApproved = resources.length;
  const totalPending = pendingUploads.length;
  const totalDownloads = resources.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passkey === 'notsoeasypass') {
      sessionStorage.setItem('admin_session_auth', 'true');
      setIsAuthenticated(true);
      setAuthError(false);
      showToast('Admin Portal Unlocked', 'success');
    } else {
      setAuthError(true);
    }
  };

  const confirmExecutionOfDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'course') {
      deleteCourse(deleteTarget.item.id);
    } else if (deleteTarget.type === 'instructor') {
      deleteInstructor(deleteTarget.item.id);
    }

    setDeleteTarget(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 space-y-6 animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#9D00FF]/10 border border-[#9D00FF]/30 flex items-center justify-center text-[#9D00FF] mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Admin Authentication</h2>
            <p className="text-xs text-slate-500 mt-1">Enter admin passkey to access document moderation queue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Enter admin passkey"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9D00FF]"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-500 font-semibold flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Incorrect admin passkey. Please try again.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-[#9D00FF]/20 transition-all"
            >
              Unlock Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f0f7ff] via-[#f8efff] to-white border border-slate-200 p-6 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#9D00FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9D00FF]/10 border border-[#9D00FF]/30 text-[#9D00FF] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>COMSATS Resource Moderation Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Admin Dashboard & Catalog Manager</h1>
            <p className="text-xs text-slate-500">
              Add or delete courses, manage faculty instructors, and review student uploaded study materials.
            </p>
          </div>

          {/* Quick Action Management Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddCourse(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#59a5fb] to-[#3b82f6] text-white text-xs font-extrabold shadow-md shadow-[#59a5fb]/20 hover:opacity-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Course</span>
            </button>

            <button
              onClick={() => setShowAddInstructor(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9D00FF] to-[#7c00cc] text-white text-xs font-extrabold shadow-md shadow-[#9D00FF]/20 hover:opacity-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Instructor</span>
            </button>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-200"
            >
              Lock Portal
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Review Queue</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{totalPending}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Approved Resources</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{totalApproved}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Student Downloads</p>
            <h3 className="text-3xl font-extrabold text-[#59a5fb] mt-1">{totalDownloads}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#59a5fb]/10 border border-[#59a5fb]/30 flex items-center justify-center text-[#59a5fb]">
            <Download className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'queue'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Review Queue ({totalPending})</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'courses'
              ? 'bg-[#59a5fb] text-white shadow-md shadow-[#59a5fb]/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage Courses ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('instructors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'instructors'
              ? 'bg-[#9D00FF] text-white shadow-md shadow-[#9D00FF]/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manage Instructors ({instructors.length})</span>
        </button>
      </div>

      {/* Tab 1: Review Queue */}
      {activeTab === 'queue' && (
        <section>
          <AdminQueueTable />
        </section>
      )}

      {/* Tab 2: Manage Courses List & Delete */}
      {activeTab === 'courses' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#59a5fb]" />
                <span>Course Directory Catalog</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                View or remove registered engineering courses.
              </p>
            </div>

            {/* Search Option in the middle */}
            <div className="relative flex-1 max-w-sm md:mx-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search course by title, code, alias..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#59a5fb] transition-all"
              />
            </div>

            <button
              onClick={() => setShowAddCourse(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#59a5fb]/10 text-[#59a5fb] font-semibold text-xs hover:bg-[#59a5fb] hover:text-white transition-all shrink-0 self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" /> Add Course
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Alias</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Instructors</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {(() => {
                  const filteredCourses = courses.filter(course => {
                    const q = courseSearch.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      (course.code && course.code.toLowerCase().includes(q)) ||
                      (course.title && course.title.toLowerCase().includes(q)) ||
                      (course.abbreviation && course.abbreviation.toLowerCase().includes(q)) ||
                      (course.department && course.department.toLowerCase().includes(q))
                    );
                  });

                  if (filteredCourses.length === 0) {
                    return (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-xs text-slate-400 font-semibold">
                          No courses found matching "{courseSearch}"
                        </td>
                      </tr>
                    );
                  }

                  return filteredCourses.map(course => {
                    const insts = getInstructorsForCourse(course.id);
                    return (
                      <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#59a5fb]">
                          {course.code}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {course.title}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {course.abbreviation || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {course.department}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#59a5fb] font-bold">
                          {resources.filter(r => r.courseId === course.id).length} files
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedCourseForContent(course)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#59a5fb]/10 text-[#59a5fb] hover:bg-[#59a5fb] hover:text-white font-bold text-xs transition-all shadow-sm"
                              title="View & delete documents for this course"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Manage Content</span>
                            </button>

                            <button
                              onClick={() => setDeleteTarget({ type: 'course', item: course })}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-xs transition-all shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 3: Manage Instructors List & Delete */}
      {activeTab === 'instructors' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#9D00FF]" />
                <span>Faculty Instructors Directory</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                View or remove registered faculty teachers.
              </p>
            </div>

            {/* Search Option in the middle */}
            <div className="relative flex-1 max-w-sm md:mx-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search instructor by name, title, department..."
                value={instructorSearch}
                onChange={(e) => setInstructorSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9D00FF] transition-all"
              />
            </div>

            <button
              onClick={() => setShowAddInstructor(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#9D00FF]/10 text-[#9D00FF] font-semibold text-xs hover:bg-[#9D00FF] hover:text-white transition-all shrink-0 self-start md:self-auto"
            >
              <UserPlus className="w-4 h-4" /> Add Instructor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              const filteredInstructors = instructors.filter(inst => {
                const q = instructorSearch.toLowerCase().trim();
                if (!q) return true;
                return (
                  (inst.name && inst.name.toLowerCase().includes(q)) ||
                  (inst.title && inst.title.toLowerCase().includes(q)) ||
                  (inst.department && inst.department.toLowerCase().includes(q))
                );
              });

              if (filteredInstructors.length === 0) {
                return (
                  <div className="col-span-full py-8 text-center text-xs text-slate-400 font-semibold">
                    No instructors found matching "{instructorSearch}"
                  </div>
                );
              }

              return filteredInstructors.map(inst => (
                <div 
                  key={inst.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={inst.avatar} 
                      alt={inst.name} 
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{inst.name}</h4>
                      <p className="text-xs text-[#9D00FF] font-medium">{inst.title}</p>
                      <span className="text-[11px] text-slate-400 block">{inst.department}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTarget({ type: 'instructor', item: inst })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-xs transition-all shadow-sm shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              ));
            })()}
          </div>
        </section>
      )}

      {/* Modals */}
      {showAddCourse && (
        <AddCourseModal onClose={() => setShowAddCourse(false)} />
      )}

      {showAddInstructor && (
        <AddInstructorModal onClose={() => setShowAddInstructor(false)} />
      )}

      {selectedCourseForContent && (
        <CourseContentModal
          course={selectedCourseForContent}
          onClose={() => setSelectedCourseForContent(null)}
        />
      )}

      {/* Sleek Delete Confirmation Modal */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Confirm {deleteTarget.type === 'course' ? 'Course' : 'Instructor'} Deletion
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold text-slate-900">
                  "{deleteTarget.type === 'course' ? `${deleteTarget.item.code} - ${deleteTarget.item.title}` : deleteTarget.item.name}"
                </span>?
                This item will be removed from the catalog.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmExecutionOfDelete}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
