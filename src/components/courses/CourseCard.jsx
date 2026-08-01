import React from 'react';
import { 
  Code, 
  Box, 
  Database, 
  Cpu, 
  Layers, 
  Sigma, 
  Globe, 
  Brain, 
  BookOpen, 
  Users, 
  FileText, 
  ArrowRight 
} from 'lucide-react';
import { useResource } from '../../context/ResourceContext';

const ICON_MAP = {
  Code,
  Box,
  Database,
  Cpu,
  Layers,
  Sigma,
  Globe,
  Brain
};

export default function CourseCard({ course }) {
  const { navigateTo, getInstructorsForCourse, resources } = useResource();

  const courseInstructors = getInstructorsForCourse(course.id);
  const courseResourceCount = resources.filter(
    r => r.courseId === course.id && r.status === 'approved'
  ).length;

  const IconComponent = ICON_MAP[course.iconName] || BookOpen;

  return (
    <div 
      onClick={() => navigateTo('course-detail', { courseId: course.id })}
      className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200 hover:border-[#9D00FF] p-6 shadow-md hover:shadow-xl hover:shadow-[#9D00FF]/10 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Accent hover glow */}
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#59a5fb]/10 rounded-full blur-2xl group-hover:bg-[#9D00FF]/15 transition-all" />

      <div>
        {/* Top Bar: Code & Abbreviation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#59a5fb]/15 border border-[#59a5fb]/30 text-[#59a5fb] font-mono">
              {course.code}
            </span>
            {course.abbreviation && (
              <span className="px-2 py-0.5 rounded-md bg-[#9D00FF]/10 border border-[#9D00FF]/20 text-[#9D00FF] font-mono text-[10px] font-bold">
                {course.abbreviation}
              </span>
            )}
          </div>
        </div>

        {/* Icon & Title */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f0f7ff] to-[#f8efff] border border-[#59a5fb]/30 flex items-center justify-center text-[#9D00FF] group-hover:scale-110 transition-all duration-300 shrink-0 shadow-sm">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#9D00FF] transition-colors leading-snug">
              {course.title}
            </h3>
            <span className="text-xs font-medium text-slate-500 mt-1 block">
              {course.department}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#9D00FF]" />
            {courseInstructors.length} Instructors
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#59a5fb]" />
            {courseResourceCount} Files
          </span>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#9D00FF] group-hover:text-white flex items-center justify-center text-slate-600 transition-all duration-300">
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
