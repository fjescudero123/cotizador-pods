import React from 'react';
import { Calculator, Layers, Search, Download } from 'lucide-react';
import { fmtC } from '../utils/format.js';

export default function BomView({ ctx }) {
  const { calc } = ctx.data;
  const { setSelCat } = ctx.nav;
  const { exportXls } = ctx.business;
  const { busy } = ctx.io;

  return (
    <div className="max-w-6xl mx-auto" style={{animation:'slideUp .3s ease'}}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 border-b pb-3 gap-3">
        <h2 className="text-2xl font-bold">BOM Consolidado</h2>
        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-500">Líneas: <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">{calc.bom.length}</span></p>
          <button onClick={exportXls} disabled={busy||!calc.bom.length} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 disabled:opacity-50 shadow-sm"><Download size={16}/> Excel</button>
        </div>
      </div>
      {!calc.bom.length?<div className="bg-white rounded-2xl border p-12 text-center shadow-sm"><Calculator size={48} className="mx-auto text-slate-300 mb-4"/><h3 className="text-lg font-bold text-slate-700 mb-2">Sin datos</h3><p className="text-slate-500">Carga materiales y configura etapas.</p></div>
      :<div className="bg-white rounded-2xl border shadow-sm overflow-hidden"><table className="w-full text-left border-collapse"><thead><tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider"><th className="p-3 border-b w-1/3">Partida</th><th className="p-3 border-b text-center">Items</th><th className="p-3 border-b text-right">Costo Mat.</th><th className="p-3 border-b text-right font-bold">Total</th><th className="p-3 border-b w-14"></th></tr></thead><tbody className="text-sm">
            {Object.entries(calc.bomByCategory).map(([cat,items])=>{const t=calc.costsByCategory[cat];return(<tr key={cat} onClick={()=>setSelCat(cat)} className="border-b cursor-pointer hover:bg-slate-50 group"><td className="p-4 font-semibold flex items-center gap-2"><Layers size={16} className="text-blue-500"/>{cat}</td><td className="p-4 text-center font-bold text-slate-500">{items.length}</td><td className="p-4 text-right text-slate-600">{fmtC(t.materialCost)}</td><td className="p-4 text-right font-bold border-l">{fmtC(t.totalCost)}</td><td className="p-4 text-center"><button className="text-blue-600 bg-blue-100 p-2 rounded-full group-hover:bg-blue-600 group-hover:text-white"><Search size={16}/></button></td></tr>);})}
          </tbody></table></div>}
    </div>
  );
}
