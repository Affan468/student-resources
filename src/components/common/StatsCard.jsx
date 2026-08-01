import React from 'react';
import { BookOpen, Download } from 'lucide-react';
import { useResource } from '../../context/ResourceContext';

export default function StatsCard() {
  const { courses, resources } = useResource();

  const totalCourses = courses.length;
  const totalDownloads = resources.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0);

  const stats = [
    { label: 'Available Courses', value: totalCourses, icon: BookOpen, color: 'from-[#59a5fb] to-[#3b82f6]' },
    { label: 'Files Downloaded', value: totalDownloads, icon: Download, color: 'from-[#9D00FF] to-[#59a5fb]' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 my-6">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div 
            key={idx} 
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 backdrop-blur-sm shadow-md hover:shadow-lg hover:border-[#9D00FF]/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">{stat.label}</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                  {stat.value.toLocaleString()}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-0.5 shadow-md group-hover:scale-105 transition-transform`}>
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-[#9D00FF]" />
                </div>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
          </div>
        );
      })}
    </div>
  );
}
