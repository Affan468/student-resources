import React from 'react';
import { Globe, Heart, Shield, BookOpen, Download } from 'lucide-react';
import { useResource } from '../../context/ResourceContext';

export default function Footer() {
  const { navigateTo } = useResource();

  return (
    <footer className="bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#59a5fb] to-[#9D00FF] p-0.5 shadow-md">
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-[#9D00FF] dark:text-[#c06eff]">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white">COMSATS Resource Portal</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              Official open-access hub for COMSATS University students to find past midterm & final exam papers, sessional quizzes, assignment solutions, and lab manuals organized by course and instructor.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-[#9D00FF] dark:hover:text-[#c06eff] transition-colors">
                  All Courses Directory
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('upload')} className="hover:text-[#59a5fb] dark:hover:text-[#7bb9fc] transition-colors">
                  Upload Past Papers & Notes
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#59a5fb] dark:text-[#7bb9fc]" />
                <span>Bulk ZIP Download Per Instructor</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#9D00FF] dark:text-[#c06eff]" />
                <span>Verified Admin Review System</span>
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#59a5fb] dark:text-[#7bb9fc]" />
                <span>Instant Document Preview</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} COMSATS University Islamabad Resource Hub.</span>
            <button
              onClick={() => navigateTo('admin')}
              className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
              aria-label="Admin Portal"
            >
              🔒
            </button>
          </p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Designed for <span className="text-[#9D00FF] dark:text-[#c06eff] font-semibold">COMSATS Students</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

