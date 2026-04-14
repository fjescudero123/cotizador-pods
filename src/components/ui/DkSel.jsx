import React from 'react';

export const DkSel = ({label,value,onChange,opts,ph}) => (
  <div>
    {label&&<label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{label}</label>}
    <select className="w-full p-2.5 rounded-xl border-0 bg-slate-800 text-white focus:ring-2 focus:ring-blue-400 outline-none text-sm" value={value} onChange={onChange}>
      <option value="">{ph||'Seleccionar...'}</option>
      {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);
