import React from 'react';
import { UserCheck, Star, FileText, ArrowRight } from 'lucide-react';
import { useResource } from '../../context/ResourceContext';

export default function InstructorCard({ instructor, courseId }) {
  const { navigateTo, getInstructorResources } = useResource();

  const instructorResources = getInstructorResources(instructor.id, courseId);
  
  const pastPapersCount = instructorResources.filter(r => r.category === 'past-paper').length;
  const quizzesCount = instructorResources.filter(r => r.category === 'quiz').length;
  const assignmentsCount = instructorResources.filter(r => r.category === 'assignment').length;
  const labsCount = instructorResources.filter(r => r.category === 'lab-assignment' || r.category === 'lab-manual').length;
  const lecturesCount = instructorResources.filter(r => r.category === 'lecture').length;

  return (
    <div 
      onClick={() => navigateTo('instructor-detail', { courseId, instructorId: instructor.id })}
      className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200 hover:border-[#9D00FF] p-6 shadow-md hover:shadow-xl hover:shadow-[#9D00FF]/10 transition-all duration-300 cursor-pointer"
    >
      <div>
        {/* Top Header: Avatar & Info */}
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={instructor.avatar}
            alt={instructor.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#59a5fb]/40 group-hover:border-[#9D00FF] shadow-md group-hover:scale-105 transition-all"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#9D00FF] transition-colors">
                {instructor.name}
              </h3>
              <UserCheck className="w-4 h-4 text-[#9D00FF]" />
            </div>
            <p className="text-xs text-slate-500 font-medium">{instructor.title}</p>
            <p className="text-[11px] text-slate-400">{instructor.department}</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-6">
          {instructor.bio}
        </p>

        {/* Categories breakdown pills */}
        <div className="grid grid-cols-5 gap-1.5 mb-6 text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5">
            <span className="block text-[9px] text-slate-500 font-medium uppercase tracking-tighter">Papers</span>
            <span className="font-extrabold text-xs text-[#59a5fb]">{pastPapersCount}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5">
            <span className="block text-[9px] text-slate-500 font-medium uppercase tracking-tighter">Quizzes</span>
            <span className="font-extrabold text-xs text-[#9D00FF]">{quizzesCount}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5">
            <span className="block text-[9px] text-slate-500 font-medium uppercase tracking-tighter">Assign</span>
            <span className="font-extrabold text-xs text-[#59a5fb]">{assignmentsCount}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5">
            <span className="block text-[9px] text-slate-500 font-medium uppercase tracking-tighter">Labs</span>
            <span className="font-extrabold text-xs text-emerald-600">{labsCount}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5">
            <span className="block text-[9px] text-slate-500 font-medium uppercase tracking-tighter">Lectures</span>
            <span className="font-extrabold text-xs text-amber-600">{lecturesCount}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#9D00FF] group-hover:text-[#9D00FF] flex items-center gap-1.5">
          View Resources & Bulk ZIP
        </span>
        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#9D00FF] group-hover:text-white flex items-center justify-center text-[#9D00FF] transition-all duration-300">
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
