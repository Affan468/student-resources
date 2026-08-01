import React from 'react';
import { ResourceProvider, useResource } from './context/ResourceContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import HomePage from './pages/HomePage';
import CourseDetailPage from './pages/CourseDetailPage';
import InstructorDetailPage from './pages/InstructorDetailPage';
import CategoryFilesPage from './pages/CategoryFilesPage';
import UploadPage from './pages/UploadPage';
import AdminPage from './pages/AdminPage';

function MainAppContent() {
  const { currentView } = useResource();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#9D00FF] selection:text-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentView === 'home' && <HomePage />}
        {currentView === 'course-detail' && <CourseDetailPage />}
        {currentView === 'instructor-detail' && <InstructorDetailPage />}
        {currentView === 'category-files' && <CategoryFilesPage />}
        {currentView === 'upload' && <UploadPage />}
        {currentView === 'admin' && <AdminPage />}
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
    <ResourceProvider>
      <MainAppContent />
    </ResourceProvider>
  );
}
