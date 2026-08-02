import React, { useState } from 'react';
import { useResource } from '../../context/ResourceContext';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from './SearchBar';
import comsatsLogo from '../../assets/logo-removebg-preview.png';
import { 
  Upload, 
  ShieldCheck, 
  Home, 
  Sparkles,
  Menu,
  X,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

export default function Navbar() {
  const { 
    currentView, 
    navigateTo, 
    pendingUploads 
  } = useResource();

  const { isDark, toggleTheme, themeMode } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pendingCount = pendingUploads.length;

  const handleNavClick = (view) => {
    setMobileMenuOpen(false);
    navigateTo(view);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & COMSATS Branding with Official logo-removebg-preview.png */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-md shadow-[#59a5fb]/20 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center overflow-hidden shrink-0">
              <img src={comsatsLogo} alt="COMSATS University Logo" loading="eager" decoding="async" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] bg-clip-text text-transparent">
                  COMSATS Hub
                </span>
                <span className="bg-[#9D00FF]/10 dark:bg-[#9D00FF]/20 text-[#9D00FF] dark:text-[#c06eff] border border-[#9D00FF]/20 dark:border-[#9D00FF]/40 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-[#9D00FF] dark:text-[#c06eff]" /> Portal
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">University Past Papers & Resources</p>
            </div>
          </div>

          {/* Quick Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <SearchBar placeholder="Search OOP, DSA, DBS, Dr. Asif..." />
          </div>

          {/* Nav Actions (Desktop) */}
          <nav className="hidden md:flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => handleNavClick('home')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'home'
                  ? 'bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white shadow-md shadow-[#59a5fb]/20'
                  : 'text-slate-700 dark:text-slate-200 hover:text-[#9D00FF] dark:hover:text-[#c06eff] hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Courses</span>
            </button>

            <button
              onClick={() => handleNavClick('upload')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'upload'
                  ? 'bg-[#9D00FF] text-white shadow-lg shadow-[#9D00FF]/30'
                  : 'bg-[#59a5fb]/10 dark:bg-[#59a5fb]/20 text-[#59a5fb] dark:text-[#7bb9fc] border border-[#59a5fb]/30 dark:border-[#59a5fb]/40 hover:bg-[#59a5fb] hover:text-white dark:hover:bg-[#59a5fb]'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>

            {/* Mode Switcher Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to White / Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme Mode"
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#59a5fb] dark:hover:border-[#9D00FF] transition-all"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="text-xs font-semibold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <span className="text-xs font-semibold">Dark</span>
                </>
              )}
            </button>
          </nav>

          {/* Mobile Actions Header (Hamburger + Theme Toggle) */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme Mode Mobile"
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700 dark:text-slate-200" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-fade-in">
          {/* Mobile Search Bar */}
          <div className="w-full">
            <SearchBar placeholder="Search OOP, DSA, DBS, Dr. Asif..." />
          </div>

          <div className="grid grid-cols-1 gap-2 pt-2">
            <button
              onClick={() => handleNavClick('home')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold ${
                currentView === 'home'
                  ? 'bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] text-white'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Explore Courses Directory</span>
            </button>

            <button
              onClick={() => handleNavClick('upload')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold ${
                currentView === 'upload'
                  ? 'bg-[#9D00FF] text-white'
                  : 'bg-[#59a5fb]/10 dark:bg-[#59a5fb]/20 text-[#59a5fb] dark:text-[#7bb9fc] border border-[#59a5fb]/30 dark:border-[#59a5fb]/40'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Past Paper / Quiz</span>
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              <span className="flex items-center gap-2">
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
                Theme Mode
              </span>
              <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300">
                {isDark ? 'Dark Mode' : 'Light Default'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

