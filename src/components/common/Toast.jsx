import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useResource } from '../../context/ResourceContext';

export default function Toast() {
  const { toast } = useResource();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
        isSuccess 
          ? 'bg-slate-900/95 text-emerald-300 border-emerald-500/40 shadow-emerald-950/50' 
          : isInfo 
          ? 'bg-slate-900/95 text-blue-300 border-blue-500/40 shadow-blue-950/50'
          : 'bg-slate-900/95 text-rose-300 border-rose-500/40 shadow-rose-950/50'
      }`}>
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {isInfo && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
        {!isSuccess && !isInfo && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}

        <p className="text-sm font-semibold text-slate-100 pr-2">{toast.message}</p>
      </div>
    </div>
  );
}
