import React from 'react';

export const ResBadge = ({label,value}) => (
  <div className="bg-slate-800 p-3 rounded-xl border border-emerald-500/30 flex justify-between items-center">
    <span className="text-xs text-slate-400">{label}</span>
    <span className="font-bold text-emerald-400">{value}</span>
  </div>
);
