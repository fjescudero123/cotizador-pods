import React from 'react';

export const DkIn = ({label,value,onChange,step,sfx}) => (
  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
    <label className="block text-[10px] text-slate-400 uppercase font-bold">{label}</label>
    <div className="flex items-center gap-2 mt-1">
      <input type="number" step={step||"1"} className="w-full bg-transparent text-white font-bold outline-none" value={value} onChange={onChange}/>
      {sfx&&<span className="text-xs text-slate-500 shrink-0">{sfx}</span>}
    </div>
  </div>
);
