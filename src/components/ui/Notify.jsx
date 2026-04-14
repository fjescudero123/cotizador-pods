import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export const Notify = ({n,onClose}) => {
  if(!n) return null;
  const e = n.type==='error';
  return (
    <div className={`fixed bottom-5 right-5 p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] border backdrop-blur-md max-w-sm ${e?'bg-red-50/95 text-red-800 border-red-200':'bg-emerald-50/95 text-emerald-800 border-emerald-200'}`} style={{animation:'slideUp .3s ease'}}>
      {e?<AlertTriangle size={20}/>:<CheckCircle2 size={20}/>}
      <p className="font-medium text-sm flex-1">{n.message}</p>
      <button onClick={onClose} className="opacity-60 hover:opacity-100"><X size={16}/></button>
    </div>
  );
};
