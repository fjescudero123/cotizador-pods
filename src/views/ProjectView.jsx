import React, { useState } from 'react';
import { Layers, Box, Factory, Plus, Trash2, Home, Save, Cloud, Copy } from 'lucide-react';

export default function ProjectView({ ctx }) {
  const { mats, typs, proj, calc, crmProjects, projectId } = ctx.data;
  const { setProj, setTyps } = ctx.setters;
  const { addTyp, updTyp, delTyp, loadCRMProject, saveProject } = ctx.business;
  const { busy } = ctx.io;
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');

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
      {projectId ? (
        <div className="bg-green-50 p-4 rounded-2xl border border-green-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Cloud size={20} className="text-green-600 shrink-0"/>
            <div><p className="font-bold text-sm text-green-800">Guardado automaticamente</p><p className="text-xs text-green-600">Los cambios se sincronizan con el servidor.</p></div>
          </div>
          <button onClick={()=>{setSaveAsName(proj.name+' (copia)');setSaveAsOpen(true);}} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border hover:bg-slate-50 shrink-0"><Copy size={14}/> Guardar como...</button>
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Save size={20} className="text-blue-600 shrink-0"/>
            <div><p className="font-bold text-sm text-blue-800">Proyecto sin guardar</p><p className="text-xs text-blue-600">Solo existe en este navegador. Guardalo para acceder desde cualquier dispositivo.</p></div>
          </div>
          <button onClick={()=>saveProject()} disabled={busy} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shrink-0"><Save size={14}/> Guardar</button>
        </div>
      )}
      {saveAsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" style={{animation:'scaleIn .2s ease'}}>
            <h3 className="font-bold text-lg">Guardar como nuevo proyecto</h3>
            <input className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" placeholder="Nombre del proyecto" value={saveAsName} onChange={e=>setSaveAsName(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==='Enter'&&saveAsName.trim()){saveProject(saveAsName.trim());setSaveAsOpen(false);setSaveAsName('');}}}/>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setSaveAsOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button onClick={()=>{if(saveAsName.trim()){saveProject(saveAsName.trim());setSaveAsOpen(false);setSaveAsName('');}}} disabled={busy} className="px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-50" style={{backgroundColor:'#D4A44C'}}>Guardar</button>
            </div>
          </div>
        </div>
      )}
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
