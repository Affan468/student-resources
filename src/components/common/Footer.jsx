import React from 'react';
import { Globe, Heart, Shield, BookOpen, Download } from 'lucide-react';
import { useResource } from '../../context/ResourceContext';

export default function Footer() {
  const { navigateTo } = useResource();

  return (
    <footer className="bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 mt-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#59a5fb] to-[#9D00FF] p-0.5 shadow-sm">
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center text-[#9D00FF] dark:text-[#c06eff]">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">Comscad Resource Portal</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              Official open-access hub for Comscad students to find past exam papers, sessional quizzes, assignment solutions, and lab manuals organized by course and instructor.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2.5">Quick Navigation</h4>
            <ul className="space-y-1.5 text-xs">
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
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2.5">Features</h4>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-[#59a5fb] dark:text-[#7bb9fc]" />
                <span>Bulk ZIP Download Per Instructor</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#9D00FF] dark:text-[#c06eff]" />
                <span>Verified Admin Review System</span>
              </li>
              <li className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#59a5fb] dark:text-[#7bb9fc]" />
                <span>Instant Document Preview</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} Comscad Resource Hub.</span>
            <button
              onClick={() => navigateTo('admin')}
              className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
              aria-label="Admin Portal"
            >
              🔒
            </button>
          </p>
          <p className="flex items-center gap-1 mt-1 sm:mt-0">
            Designed for <span className="text-[#9D00FF] dark:text-[#c06eff] font-semibold">Comscad Students</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

