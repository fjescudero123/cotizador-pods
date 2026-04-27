import React, { useState } from 'react';
import { Calculator, Send, Download, X, BarChart3 } from 'lucide-react';
import { fmtC, fmtN, fmtUF } from '../utils/format.js';
import { UF_VALUE } from '../constants/economics.js';
import { CostChart } from '../components/ui/CostChart.jsx';

export default function DashboardView({ ctx }) {
  const { calc, typs, proj } = ctx.data;
  const { setSelCat } = ctx.nav;
  const { exportXls } = ctx.business;
  const { nfy, busy, setBusy } = ctx.io;

  const [showQuote, setShowQuote] = useState(false);
  const [quoteHtml, setQuoteHtml] = useState('');

  const saveToCRM = async()=>{
    setBusy(true);
    try{
      const today=new Date().toLocaleDateString('es-CL',{day:'2-digit',month:'long',year:'numeric'});
      const costPod=calc.totalPods>0?calc.totals.materialTheoretical/calc.totalPods:0;
      const typPriceRows=typs.map(t=>{const m=calc.typMetrics[t.id]||{};const area=m.floorArea||0;const ppod=m.salePricePerPod||0;return `<tr><td style="padding:12px 16px;border-bottom:1px solid #e5e2db;font-weight:500">${t.name}</td><td style="padding:12px 16px;text-align:center;border-bottom:1px solid #e5e2db">${t.count}</td><td style="padding:12px 16px;text-align:right;border-bottom:1px solid #e5e2db">${fmtN(area)} m\u00b2</td><td style="padding:12px 16px;text-align:right;border-bottom:1px solid #e5e2db;font-weight:600">${fmtC(ppod)}</td><td style="padding:12px 16px;text-align:right;border-bottom:1px solid #e5e2db;font-weight:600">${fmtC(ppod*t.count)}</td></tr>`;}).join('');
      const cotNum='COT-'+Date.now().toString(36).toUpperCase().slice(-6);
      const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cotizaci\u00f3n ${cotNum} - MAYU</title><style>@page{size:A4;margin:18mm}body{font-family:'Segoe UI',system-ui,sans-serif;color:#2c2c2a;margin:0;padding:40px;max-width:820px;margin:0 auto;font-size:14px;line-height:1.5}table{width:100%;border-collapse:collapse}.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #D4A44C}.logo-area{display:flex;align-items:center;gap:14px}.brand{font-size:26px;font-weight:700;color:#D4A44C;letter-spacing:1px}.sub{font-size:11px;color:#8B8B5B;text-transform:uppercase;letter-spacing:2px;margin-top:2px}.meta{text-align:right;font-size:12px;color:#666;line-height:1.8}.meta b{color:#2c2c2a;font-size:13px}.sec{margin:28px 0}.sec-t{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#8B8B5B;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e5e2db}th{background:#f8f6f0;padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;color:#8B8B5B;border-bottom:2px solid #e5e2db;font-weight:600}.tot-row td{background:#f8f6f0;font-weight:700;font-size:15px;padding:14px 16px}.kpi{display:flex;gap:16px;margin:24px 0}.kpi-box{flex:1;background:#f8f6f0;border-radius:12px;padding:24px 16px;text-align:center}.kpi-v{font-size:22px;font-weight:700;color:#2c2c2a}.kpi-vg{font-size:26px;font-weight:700;color:#D4A44C}.kpi-l{font-size:10px;color:#8B8B5B;text-transform:uppercase;margin-top:6px;letter-spacing:1px}.kpi-s{font-size:11px;color:#999;margin-top:2px}.client-box{background:#faf9f6;border:1px solid #e5e2db;border-radius:10px;padding:16px 20px;margin:20px 0;font-size:13px;line-height:1.8}.client-box b{color:#2c2c2a}.foot{margin-top:40px;padding-top:16px;border-top:2px solid #e5e2db;font-size:11px;color:#999;text-align:center;line-height:1.8}.note{background:#faf9f6;border-left:3px solid #D4A44C;padding:12px 16px;margin:20px 0;font-size:12px;color:#666;line-height:1.7}</style></head><body>
<div class="hdr"><div class="logo-area"><div style="width:56px;height:56px;background:#f8f6f0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;color:#D4A44C;letter-spacing:2px">MAYU</div><div><div class="brand">MAYU</div><div class="sub">Cotizaci\u00f3n de PODs</div></div></div><div class="meta"><b>${cotNum}</b><br>${today}<br>Validez: 15 d\u00edas</div></div>
<div class="client-box"><b>Cliente:</b> ${proj.client||'—'}<br><b>RUT:</b> ${proj.clientRut||'—'}<br><b>Contacto:</b> ${proj.contactName||'—'}<br><b>Proyecto:</b> ${proj.name||'—'}${proj.clientAddress?'<br><b>Direcci\u00f3n:</b> '+proj.clientAddress:''}</div>
<div class="kpi"><div class="kpi-box"><div class="kpi-vg">${fmtC(calc.totals.salePriceTotal)}</div><div class="kpi-l">Valor total del proyecto</div><div class="kpi-s">${fmtUF(calc.totals.salePriceTotal)}</div></div><div class="kpi-box"><div class="kpi-v">${calc.totalPods}</div><div class="kpi-l">Total PODs</div></div></div>
<div class="sec"><div class="sec-t">Detalle por tipolog\u00eda</div><table><thead><tr><th>Tipo de ba\u00f1o</th><th style="text-align:center">Cantidad</th><th style="text-align:right">\u00c1rea</th><th style="text-align:right">Precio Unit.</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${typPriceRows}<tr class="tot-row"><td colspan="4" style="text-align:right;border-top:2px solid #D4A44C">Total Neto</td><td style="text-align:right;border-top:2px solid #D4A44C;color:#D4A44C">${fmtC(calc.totals.salePriceTotal)}</td></tr></tbody></table></div>
<div class="sec"><table style="font-size:13px"><tr><td style="padding:6px 0;color:#999">Valor UF referencial</td><td style="padding:6px 0;text-align:right">$${UF_VALUE.toLocaleString('es-CL')}</td></tr><tr><td style="padding:6px 0;color:#999">Precio por POD (UF)</td><td style="padding:6px 0;text-align:right">${fmtUF(calc.totals.salePricePerPod)}</td></tr><tr><td style="padding:6px 0;color:#999">Valor total proyecto (UF)</td><td style="padding:6px 0;text-align:right;font-weight:600">${fmtUF(calc.totals.salePriceTotal)}</td></tr></table></div>
<div class="note"><b>Alcance:</b> Suministro e instalaci\u00f3n de PODs de ba\u00f1o prefabricados, incluyendo estructura steel frame, revestimientos, instalaciones sanitarias, el\u00e9ctricas, terminaciones y artefactos seg\u00fan especificaci\u00f3n t\u00e9cnica.<br><b>No incluye:</b> Obras civiles de conexi\u00f3n, transporte a obra, grúa de montaje.</div>
<div class="foot"><p>MAYU · Cotizaci\u00f3n preliminar ${cotNum} · ${today}</p><p>Valores en CLP neto (sin IVA) · Sujeto a confirmaci\u00f3n de stock y plazos de entrega</p></div>
</body></html>`;
      setQuoteHtml(html);setShowQuote(true);
      nfy('Cotización generada.');
    }catch(e){nfy('Error al generar cotización.','error');}finally{setBusy(false);}
  };

  return (
    <>
    <div className="max-w-6xl mx-auto" style={{animation:'slideUp .3s ease'}}>
      <h2 className="text-2xl font-bold mb-6 border-b pb-3">Dashboard Ejecutivo</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Calculator size={120}/></div>
          <h3 className="text-slate-400 text-sm mb-1 relative z-10">Precio Venta Total</h3>
          <p className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-1 relative z-10">{fmtC(calc.totals.salePriceTotal)}</p>
          <p className="text-lg font-medium text-emerald-300/70 mb-6 relative z-10">{fmtUF(calc.totals.salePriceTotal)}</p>
          <div className="space-y-3 pt-4 border-t border-slate-700 relative z-10">
            <div className="flex justify-between"><span className="text-slate-300 text-sm">Material (consumo)</span><span className="font-semibold">{fmtC(calc.totals.materialTheoretical)}</span></div>
            <div className="flex justify-between"><span className="text-slate-300 text-sm">Material (compra)</span><span className="font-semibold text-slate-400">{fmtC(calc.totals.material)}</span></div>
            {calc.totals.material>calc.totals.materialTheoretical&&<div className="text-[10px] text-amber-400/70 text-right">+{fmtC(calc.totals.material-calc.totals.materialTheoretical)} redondeo ({calc.totalPods} POD{calc.totalPods>1?'s':''})</div>}
            <div className="flex justify-between"><span className="text-slate-300 text-sm">Mano de Obra</span><span className="font-semibold text-amber-400">{fmtC(calc.totals.labor)}</span></div>
            <div className="flex justify-between"><span className="text-slate-300 text-sm">Costo Directo</span><span className="font-semibold">{fmtC(calc.totals.directCost)}</span></div>
            <div className="flex justify-between"><span className="text-slate-300 text-sm">Contingencia</span><span className="font-semibold text-yellow-400">{fmtC(calc.totals.contingency)}</span></div>
            <div className="flex justify-between pt-2 border-t border-slate-700"><span className="text-white text-sm font-bold">Margen Bruto</span><span className="font-bold text-emerald-400">{fmtC(calc.totals.grossMargin)} <span className="text-emerald-300/60 font-medium text-xs">({fmtUF(calc.totals.grossMargin)})</span></span></div>
          </div>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border"><p className="text-sm text-slate-500 mb-1">Costo Material/POD</p><p className="text-2xl font-bold text-slate-700">{fmtC(calc.totalPods>0?calc.totals.materialTheoretical/calc.totalPods:0)}</p><p className="text-sm font-medium text-slate-400 mt-1">{fmtUF(calc.totalPods>0?calc.totals.materialTheoretical/calc.totalPods:0)}</p></div>
          <div className="bg-white p-6 rounded-2xl border"><p className="text-sm text-slate-500 mb-1">Precio Venta/POD</p><p className="text-2xl font-bold text-emerald-600">{fmtC(calc.totals.salePricePerPod)}</p><p className="text-sm font-medium text-slate-400 mt-1">{fmtUF(calc.totals.salePricePerPod)}</p></div>
          <div className="bg-white p-6 rounded-2xl border"><p className="text-sm text-slate-500 mb-1">Volumen</p><p className="text-2xl font-bold">{calc.totalPods} <span className="text-sm text-slate-400">PODs</span></p></div>
          <div className="bg-white p-6 rounded-2xl border"><p className="text-sm text-slate-500 mb-1">Material / m²</p><p className="text-2xl font-bold text-blue-600">{typs[0]&&calc.typMetrics[typs[0].id]?.floorArea>0?fmtC(calc.totals.materialTheoretical/(typs.reduce((s,t)=>s+(calc.typMetrics[t.id]?.floorArea||0)*t.count,0)||1)):'-'}<span className="text-sm text-slate-400"> /m²</span></p><p className="text-sm font-medium text-slate-400 mt-1">{typs[0]&&calc.typMetrics[typs[0].id]?.floorArea>0?fmtUF(calc.totals.materialTheoretical/(typs.reduce((s,t)=>s+(calc.typMetrics[t.id]?.floorArea||0)*t.count,0)||1)):'-'} /m²</p></div>
          <div className="bg-white p-6 rounded-2xl border"><p className="text-sm text-slate-500 mb-1">Margen Efectivo</p><p className="text-2xl font-bold text-blue-600">{calc.totals.salePriceTotal>0?fmtN((calc.totals.grossMargin/calc.totals.salePriceTotal)*100):'0'}%</p></div>
          <div className="bg-white p-6 rounded-2xl border"><p className="text-sm text-slate-500 mb-1">Margen/POD</p><p className="text-2xl font-bold text-emerald-600">{calc.totalPods>0?fmtC((calc.totals.salePricePerPod)-(calc.totals.materialTheoretical/calc.totalPods)-(calc.totals.labor/calc.totalPods)):'-'}</p></div>
        </div>
      </div>
      {Object.keys(calc.costsByCategory).length>0&&<div className="bg-white p-6 rounded-2xl border shadow-sm mb-6"><h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><BarChart3 size={20} className="text-blue-500"/> Costos por Partida</h3><CostChart data={Object.entries(calc.costsByCategory).map(([c,v])=>({l:c,v:v.totalCost})).sort((a,b)=>b.v-a.v)} fmt={fmtC} onBarClick={(cat)=>setSelCat(cat)}/></div>}
      <button onClick={saveToCRM} disabled={busy} className="w-full mb-4 text-white font-bold py-4 rounded-2xl hover:opacity-90 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50" style={{backgroundColor:'#D4A44C'}}>{busy?'Generando...':<><Send size={20}/> Generar Cotización</>}</button>
      <button onClick={exportXls} disabled={busy||!calc.bom.length} className="w-full mb-8 bg-white text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-100 flex items-center justify-center gap-2 border shadow-sm disabled:opacity-50"><Download size={20}/> Descargar Excel</button>
      <div className="bg-white p-6 rounded-2xl border shadow-sm"><h3 className="font-bold text-slate-700 mb-4">Tipologías</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm min-w-[400px]"><thead><tr className="bg-slate-100 text-slate-600"><th className="p-3 border-b">Tipo</th><th className="p-3 border-b text-center">Un.</th><th className="p-3 border-b text-right">Área m²</th><th className="p-3 border-b text-right">Perím. ml</th><th className="p-3 border-b text-right">M.O./POD</th></tr></thead><tbody>{typs.map(t=><tr key={t.id} className="border-b"><td className="p-3 font-semibold">{t.name}</td><td className="p-3 text-center font-bold text-blue-600">{t.count}</td><td className="p-3 text-right">{fmtN(calc.typMetrics[t.id]?.floorArea)} m²</td><td className="p-3 text-right">{fmtN(calc.typMetrics[t.id]?.perimeter)} ml</td><td className="p-3 text-right">{fmtC(t.config.laborCostPerPod||0)}</td></tr>)}</tbody></table></div></div>
    </div>
    {showQuote&&(
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col" style={{animation:'scaleIn .2s ease'}}>
          <div className="flex justify-between items-center p-4 border-b shrink-0">
            <h3 className="font-bold text-lg">Cotización Preliminar</h3>
            <div className="flex items-center gap-2">
              <button onClick={()=>{const w=document.getElementById('quoteFrame').contentWindow;w.focus();w.print();}} className="px-4 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 flex items-center gap-2"><Download size={16}/> Imprimir / PDF</button>
              <button onClick={()=>setShowQuote(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
          </div>
          <iframe id="quoteFrame" srcDoc={quoteHtml} className="flex-1 w-full border-0 rounded-b-2xl" style={{minHeight:'500px'}}/>
        </div>
      </div>
    )}
    </>
  );
}
