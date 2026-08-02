import React, { lazy, Suspense } from 'react';
import { ResourceProvider, useResource } from './context/ResourceContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import HomePage from './pages/HomePage';

// Lazy load secondary pages for optimal initial load speed
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const InstructorDetailPage = lazy(() => import('./pages/InstructorDetailPage'));
const CategoryFilesPage = lazy(() => import('./pages/CategoryFilesPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-fade-in">
      <div className="w-10 h-10 border-4 border-[#59a5fb]/30 border-t-[#59a5fb] rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading study resources...</p>
    </div>
  );
}

function MainAppContent() {
  const { currentView } = useResource();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#9D00FF] selection:text-white transition-colors duration-200">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Suspense fallback={<PageLoader />}>
          {currentView === 'home' && <HomePage />}
          {currentView === 'course-detail' && <CourseDetailPage />}
          {currentView === 'instructor-detail' && <InstructorDetailPage />}
          {currentView === 'category-files' && <CategoryFilesPage />}
          {currentView === 'upload' && <UploadPage />}
          {currentView === 'admin' && <AdminPage />}
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Feedback */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ResourceProvider>
        <MainAppContent />
      </ResourceProvider>
    </ThemeProvider>
  );
}

