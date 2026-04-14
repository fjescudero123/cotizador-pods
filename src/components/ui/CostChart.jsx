import React from 'react';

export const CostChart = ({data,fmt,onBarClick}) => {
  const max = Math.max(...data.map(d=>d.v),1);
  return(<div className="space-y-2">{data.map((d,i)=>(<div key={i} className={`flex items-center gap-3 ${onBarClick?'cursor-pointer hover:bg-slate-50 rounded-lg p-1 -m-1':''}`} onClick={()=>onBarClick&&onBarClick(d.l)}><span className="text-xs text-slate-600 w-32 truncate text-right">{d.l}</span><div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden"><div className="h-full rounded-full" style={{width:`${(d.v/max)*100}%`,backgroundColor:i%2?'#929965':'#7A8C8A'}}></div></div><span className="text-xs font-bold text-slate-700 w-24 text-right">{fmt(d.v)}</span></div>))}</div>);
};
