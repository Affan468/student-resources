import React, { useState } from 'react';
import { useResource } from '../../context/ResourceContext';
import SearchBar from './SearchBar';
import comsatsLogo from '../../assets/logo-removebg-preview.png';
import { 
  Upload, 
  ShieldCheck, 
  Home, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const { 
    currentView, 
    navigateTo, 
    pendingUploads 
  } = useResource();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pendingCount = pendingUploads.length;

  const handleNavClick = (view) => {
    setMobileMenuOpen(false);
    navigateTo(view);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200 text-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & COMSATS Branding with Official logo-removebg-preview.png */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white p-0.5 border border-slate-200 shadow-md shadow-[#59a5fb]/20 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center overflow-hidden shrink-0">
              <img src={comsatsLogo} alt="COMSATS Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-[#59a5fb] to-[#9D00FF] bg-clip-text text-transparent">
                  COMSATS Hub
                </span>
                <span className="bg-[#9D00FF]/10 text-[#9D00FF] border border-[#9D00FF]/20 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-[#9D00FF]" /> Portal
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">University Past Papers & Resources</p>
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
                  : 'text-slate-700 hover:text-[#9D00FF] hover:bg-slate-100'
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
                  : 'bg-[#59a5fb]/10 text-[#59a5fb] border border-[#59a5fb]/30 hover:bg-[#59a5fb] hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </nav>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl animate-fade-in">
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
                  : 'bg-slate-50 text-slate-800 border border-slate-200'
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
                  : 'bg-[#59a5fb]/10 text-[#59a5fb] border border-[#59a5fb]/30'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Past Paper / Quiz</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
