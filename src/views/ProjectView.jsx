import React from 'react';
import { Layers, Box, Factory, AlertTriangle, Plus, Trash2, Home } from 'lucide-react';

export default function ProjectView({ ctx }) {
  const { mats, typs, proj, calc, crmProjects } = ctx.data;
  const { setProj, setTyps } = ctx.setters;
  const { addTyp, updTyp, delTyp, loadCRMProject } = ctx.business;

  return (
    <>
    {crmProjects.length > 0 && (
      <div className="max-w-4xl mx-auto mb-6" style={{animation:'slideUp .3s ease'}}>
        <div className="border-2 border-dashed rounded-2xl p-5 space-y-3" style={{borderColor:'#D4A44C',backgroundColor:'#FFFBF0'}}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{backgroundColor:'#D4A44C'}}><Factory size={20} className="text-white"/></div>
            <div><h3 className="font-bold text-sm" style={{color:'#8A6D2F'}}>Proyectos listos para cotizar</h3><p className="text-xs" style={{color:'#B08A45'}}>Desde el CRM hay {crmProjects.length} proyecto{crmProjects.length>1?'s':''} de PODs con antecedentes recibidos</p></div>
          </div>
          <div className="space-y-2">
            {crmProjects.map(crm => (
              <div key={crm.id} className="bg-white rounded-xl border p-3 flex items-center justify-between" style={{borderColor:'#E8DFC8'}}>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">{crm.nombre}</p>
                  <p className="text-xs text-slate-500">{crm.cliente} · {crm.ubicacion||'Sin ubicación'} · {crm.cantidad_unidades||1} unidad{(crm.cantidad_unidades||1)>1?'es':''}</p>
                </div>
                <button onClick={()=>loadCRMProject(crm)} className="shrink-0 ml-3 px-4 py-2 rounded-xl text-white text-xs font-bold hover:opacity-90" style={{backgroundColor:'#D4A44C'}}>Cargar y cotizar</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    <div className="max-w-4xl mx-auto space-y-6" style={{animation:'slideUp .3s ease'}}>
      <h2 className="text-2xl font-bold border-b pb-3">Proyecto</h2>
      <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 shadow-sm border-l-4 border-l-amber-400">
        <h3 className="font-bold text-amber-700 mb-2 flex items-center gap-2"><AlertTriangle size={20} className="text-amber-500"/> Modo Prueba Local</h3>
        <p className="text-sm text-amber-600">BOM completo del POD Baumax cargado (153 ítems). Cantidades comerciales reales por POD desde el itemizado REV 03. Precios actualizados de IMEL, Sodimac, Steelfix, Fanaloza, CHC y otros proveedores.</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Layers size={20}/> Definición</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2"><h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Home size={18}/> Proyecto</h4></div>
          <div><label className="block text-sm font-medium mb-1">Nombre del Proyecto</label><input className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" value={proj.name} onChange={e=>setProj({...proj,name:e.target.value})}/></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium mb-1">Margen (%)</label><input type="number" className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" value={proj.marginPct} onChange={e=>setProj({...proj,marginPct:Number(e.target.value)})}/></div><div><label className="block text-sm font-medium mb-1">Contingencia (%)</label><input type="number" className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" value={proj.contingencyPct} onChange={e=>setProj({...proj,contingencyPct:Number(e.target.value)})}/></div></div>
          <div className="sm:col-span-2 border-t pt-4 mt-2"><h4 className="font-bold text-slate-700 mb-3">Datos del Cliente</h4></div>
          <div><label className="block text-sm font-medium mb-1">Razón Social / Nombre</label><input className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" placeholder="Empresa o persona" value={proj.client} onChange={e=>setProj({...proj,client:e.target.value})}/></div>
          <div><label className="block text-sm font-medium mb-1">RUT</label><input className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" placeholder="12.345.678-9" value={proj.clientRut} onChange={e=>setProj({...proj,clientRut:e.target.value})}/></div>
          <div><label className="block text-sm font-medium mb-1">Contacto</label><input className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" placeholder="Nombre del contacto" value={proj.contactName} onChange={e=>setProj({...proj,contactName:e.target.value})}/></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" placeholder="correo@empresa.cl" value={proj.clientEmail} onChange={e=>setProj({...proj,clientEmail:e.target.value})}/></div>
          <div><label className="block text-sm font-medium mb-1">Teléfono</label><input className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" placeholder="+56 9 1234 5678" value={proj.clientPhone} onChange={e=>setProj({...proj,clientPhone:e.target.value})}/></div>
          <div><label className="block text-sm font-medium mb-1">Dirección</label><input className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" placeholder="Dirección del proyecto" value={proj.clientAddress} onChange={e=>setProj({...proj,clientAddress:e.target.value})}/></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700 flex items-center gap-2"><Box size={20}/> Tipologías</h3><span className="bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-full text-sm">{calc.totalPods} PODs</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[440px]"><thead><tr className="bg-slate-100 text-sm text-slate-600"><th className="p-3 border-b">Nombre</th><th className="p-3 border-b w-28 text-center">Cantidad</th><th className="p-3 border-b w-32 text-center">M.O./POD ($)</th><th className="p-3 border-b w-16 text-center"></th></tr></thead>
            <tbody>{typs.map(t=><tr key={t.id} className="border-b hover:bg-slate-50">
              <td className="p-2"><input value={t.name} onChange={e=>updTyp(t.id,'name',e.target.value)} className="w-full p-2 border rounded-lg font-medium focus:ring-2 focus:ring-blue-500 outline-none"/></td>
              <td className="p-2"><input type="number" min="0" value={t.count} onChange={e=>updTyp(t.id,'count',Number(e.target.value))} className="w-full p-2 border rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none"/></td>
              <td className="p-2"><input type="number" min="0" value={t.config.laborCostPerPod||0} onChange={e=>setTyps(p=>p.map(x=>x.id===t.id?{...x,config:{...x.config,laborCostPerPod:Number(e.target.value)}}:x))} className="w-full p-2 border rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none"/></td>
              <td className="p-2 text-center"><button onClick={()=>delTyp(t.id)} className="text-slate-400 hover:text-red-500 p-2 bg-slate-100 rounded-lg hover:bg-red-50"><Trash2 size={16}/></button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <button onClick={addTyp} className="mt-4 flex items-center gap-2 text-blue-600 font-medium hover:bg-blue-50 px-4 py-2.5 rounded-xl border border-transparent hover:border-blue-200"><Plus size={16}/> Agregar</button>
      </div>
    </div>
    </>
  );
}
