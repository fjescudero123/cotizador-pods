import React, { useState, useMemo } from 'react';
import { Plus, Database, UploadCloud, Download, Filter, Trash2, Edit2, FileText, Paperclip, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { fmtC } from '../utils/format.js';
import { STAGES } from '../constants/stages.js';
import { SUBLINES } from '../constants/sublines.js';
import { ConfirmDlg } from '../components/ui/ConfirmDlg.jsx';

export default function DatabaseView({ ctx }) {
  const { mats } = ctx.data;
  const { uploadFile, directTS, saveMaterial, deleteMaterial, swapMaterial, activateMaterial, clearAll, dlTemplate, procTS } = ctx.business;
  const { nfy, busy } = ctx.io;

  const [showClear, setShowClear] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [editId, setEditId] = useState(null);
  const [manItem, setManItem] = useState({code:'',cat:'',name:'',unit:'UNIDAD',cost:'',qty:'',pres:'',tsN:'',tsD:'',subline:'',scope:'pod'});
  const [delId, setDelId] = useState(null);
  const [swapFrom, setSwapFrom] = useState(null);
  const [matFilt, setMatFilt] = useState({code:'',cat:'',name:'',pres:''});

  const filtMats = useMemo(() => mats.filter(m =>
    m.id.toLowerCase().includes((matFilt.code||'').toLowerCase()) &&
    m.cat.toLowerCase().includes((matFilt.cat||'').toLowerCase()) &&
    m.name.toLowerCase().includes((matFilt.name||'').toLowerCase()) &&
    (m.pres||'').toLowerCase().includes((matFilt.pres||'').toLowerCase())
  ), [mats, matFilt]);

  const editClick = (m) => {
    setEditId(m.id);
    setManItem({code:m.id,cat:m.cat,name:m.name,brand:m.brand||'',unit:m.unit||'UNIDAD',cost:m.cost,qty:m.baseQty,pres:m.pres||'',tsN:m.techSheetName||'',tsD:m.techSheetData||'',subline:m.termGroup||m.pisoGroup||m.slot||m.revRole||m.cieloGroup||'',scope:m.scope||'pod'});
    setShowManual(true);
  };

  const tsUpload = (e) => {
    procTS(e.target.files[0], (n, d) => setManItem(p => ({...p, tsN: n, tsD: d})));
    e.target.value = null;
  };

  const saveManual = async () => {
    if (!manItem.name || !manItem.cat) return;
    const fid = editId || (manItem.code?.trim() || `manual_${Date.now()}`);
    const sub = manItem.subline || '';
    const catU = manItem.cat.toUpperCase();
    const scopeFinal = (catU==='INSUMOS GENERALES' && manItem.scope==='proyecto') ? 'proyecto' : 'pod';
    const it = {
      id: fid, cat: catU, name: manItem.name, brand: manItem.brand, unit: manItem.unit||'UNIDAD',
      cost: parseFloat(manItem.cost)||0, waste:0, laborY:0, laborC:0,
      baseQty: parseFloat(manItem.qty)||0, pres: manItem.pres||'Unidad',
      techSheetName: manItem.tsN, techSheetData: manItem.tsD, draft: false, scope: scopeFinal,
      ...(catU==='TERMINACION DE MURO'&&sub?{termGroup:sub}:{}),
      ...(catU==='PISO'&&sub?{pisoGroup:sub}:{}),
      ...((catU==='SANITARIO ARTEFACTOS'||catU==='PUERTAS'||catU==='ACCESORIOS'||catU==='ELECTRICO')&&sub?{slot:sub}:{}),
      ...(catU==='REVESTIMIENTO DE MURO'&&sub?{revRole:sub}:{}),
      ...(catU==='CIELO'&&sub?{cieloGroup:sub}:{}),
    };
    saveMaterial(it, editId || null);
    setManItem({code:'',cat:'',name:'',unit:'UNIDAD',cost:'',qty:'',pres:'',tsN:'',tsD:'',subline:'',scope:'pod'});
    setEditId(null);
    setShowManual(false);
  };

  const confirmDel = async () => {
    deleteMaterial(delId);
    setDelId(null);
  };

  const doSwap = (activeId) => {
    swapMaterial(swapFrom, activeId);
    setSwapFrom(null);
  };

  const badgeColors=['bg-amber-100 text-amber-800','bg-slate-200 text-slate-700','bg-orange-100 text-orange-800','bg-yellow-100 text-yellow-800','bg-cyan-100 text-cyan-800','bg-sky-100 text-sky-800','bg-rose-100 text-rose-800','bg-indigo-100 text-indigo-800','bg-pink-100 text-pink-800','bg-violet-100 text-violet-800','bg-lime-100 text-lime-800','bg-teal-100 text-teal-800','bg-blue-100 text-blue-800','bg-gray-200 text-gray-700'];

  return (
    <>
      <div className="max-w-6xl mx-auto" style={{animation:'slideUp .3s ease'}}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-3 gap-3">
          <h2 className="text-2xl font-bold">Data Maestra</h2>
          <button onClick={()=>{setEditId(null);setManItem({code:'',cat:'',name:'',unit:'UNIDAD',cost:'',qty:'',pres:'',tsN:'',tsD:'',subline:'',scope:'pod'});setShowManual(true);}} className="text-sm flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 shadow-sm"><Plus size={16}/> Agregar</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm bg-blue-50/30 flex flex-col items-center text-center">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full mb-3"><UploadCloud size={24}/></div>
            <h3 className="text-base font-bold mb-1">Importar Materiales</h3>
            <p className="text-slate-500 text-sm mb-4">Sube Excel o descarga plantilla.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {busy?<span className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg text-sm">Procesando...</span>
              :<label className="bg-blue-600 text-white px-4 py-2.5 rounded-xl cursor-pointer hover:bg-blue-700 text-sm shadow-md flex items-center gap-2 font-medium"><UploadCloud size={16}/> Subir Excel<input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={uploadFile} disabled={busy}/></label>}
              <button onClick={dlTemplate} disabled={busy} className="bg-white border border-blue-600 text-blue-600 px-4 py-2.5 rounded-xl hover:bg-blue-50 text-sm shadow-sm flex items-center gap-2 font-medium disabled:opacity-50"><Download size={16}/> Plantilla</button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5"><Database size={150}/></div>
            <h3 className="font-semibold text-slate-700 mb-1 relative z-10">Estado</h3>
            <div className="flex items-center gap-4 relative z-10 mt-3"><div className="bg-slate-100 px-4 py-3 rounded-xl font-bold text-xl flex-1 text-center border shadow-inner">{mats.length} <span className="text-xs font-medium text-slate-500 block uppercase mt-1">Ítems</span></div><button onClick={()=>setShowClear(true)} className="bg-red-50 text-red-600 p-4 rounded-xl hover:bg-red-100 shadow-sm" title="Borrar"><Trash2 size={24}/></button></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Filter size={18} className="text-blue-500"/> Productos por Línea de Fabricación</h3>
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button onClick={()=>setMatFilt({...matFilt,cat:''})} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${!matFilt.cat?'bg-slate-800 text-white':'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Todos ({mats.length})</button>
            {STAGES.map(s=>{const cnt=mats.filter(m=>m.cat===s.cat).length;return cnt>0?<button key={s.id} onClick={()=>setMatFilt({...matFilt,cat:s.cat})} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${matFilt.cat===s.cat?'bg-blue-600 text-white':'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>{s.label.substring(3)} ({cnt})</button>:null;})}
          </div>
          <div className="max-h-[500px] overflow-auto border rounded-xl">
            {!mats.length?<div className="p-8 text-center text-slate-500"><Database size={48} className="mx-auto text-slate-300 mb-4"/><p>No hay datos.</p></div>
            :<table className="w-full text-left text-sm"><thead className="bg-slate-100 text-slate-600 sticky top-0 z-10 shadow-sm"><tr><th className="p-3 border-b w-20">Código</th><th className="p-3 border-b">Línea</th><th className="p-3 border-b">Descripción</th><th className="p-3 border-b">Presentación</th><th className="p-3 border-b text-right">Cant./POD</th><th className="p-3 border-b text-right">Costo Unit.</th><th className="p-3 border-b w-20 text-center">Acc.</th></tr>
              <tr className="bg-slate-50 border-b">{['code','cat','name','pres'].map(f=><th key={f} className="p-1.5"><input type="text" placeholder="Filtrar..." className="w-full px-2 py-1.5 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-normal bg-white" value={matFilt[f]||''} onChange={e=>setMatFilt({...matFilt,[f]:e.target.value})}/></th>)}<th className="p-1.5"></th><th className="p-1.5"></th><th className="p-1.5"></th></tr>
            </thead><tbody>
              {!filtMats.length?<tr><td colSpan="7" className="p-8 text-center text-slate-400 italic">Sin coincidencias.</td></tr>
              :filtMats.map((m,i)=>{const stg=STAGES.find(s=>s.cat===m.cat);const stgIdx=STAGES.findIndex(s=>s.cat===m.cat);const bc=stgIdx>=0?badgeColors[stgIdx]:'bg-red-100 text-red-700';return(<tr key={m.id+'-'+i} className={`border-b hover:bg-slate-50 group/r ${m.draft?'opacity-50 bg-yellow-50':''}`}>
                <td className="p-2 font-mono text-[10px] text-slate-400 truncate max-w-[70px]" title={m.id}>{m.id}</td>
                <td className="p-2"><span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase leading-tight ${bc}`} title={m.catOriginal?`Original: ${m.catOriginal}`:''}>{stg?stg.label.substring(3):m.cat}</span></td>
                <td className="p-2"><div className="flex items-center gap-2"><span className="font-medium text-slate-800 text-xs">{m.name}</span>{m.scope==='proyecto'&&<span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wider" title="Se compra una vez por proyecto, no escala por POD">× Proyecto</span>}{m.draft&&<span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">BORRADOR</span>}{m.techSheetData?<a href={m.techSheetData} download={m.techSheetName} className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] hover:bg-blue-100 shrink-0"><FileText size={10}/> Ficha</a>:<label className="cursor-pointer text-slate-300 hover:text-blue-500 opacity-0 group-hover/r:opacity-100 shrink-0"><Paperclip size={12}/><input type="file" accept=".pdf,image/*,.doc,.docx" className="hidden" onChange={e=>directTS(e,m.id)}/></label>}</div></td>
                <td className="p-2"><span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{m.pres||'-'}</span></td>
                <td className="p-2 text-right font-medium text-blue-600 text-xs">{m.baseQty} <span className="text-slate-400 text-[10px]">{m.unit}{m.scope==='proyecto'?' /proy':''}</span></td>
                <td className="p-2 text-right text-xs">{fmtC(m.cost)}</td>
                <td className="p-2 text-center"><div className="flex justify-center gap-1">{m.draft&&<button onClick={()=>activateMaterial(m.id)} className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 p-1.5 rounded-lg transition" title="Activar (incluir en cálculo)"><CheckCircle2 size={13}/></button>}{m.draft&&<button onClick={()=>setSwapFrom(m.id)} className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 p-1.5 rounded-lg transition" title="Reemplazar un ítem activo"><RefreshCw size={13}/></button>}<button onClick={()=>editClick(m)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition" title="Editar / Reclasificar"><Edit2 size={13}/></button><button onClick={()=>setDelId(m.id)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition" title="Eliminar"><Trash2 size={13}/></button></div></td>
              </tr>);})}
            </tbody></table>}
          </div>
        </div>
      </div>

      {showClear&&<ConfirmDlg title="¿Reiniciar proyecto local?" msg="Se borrará el proyecto y tipologías locales. La data maestra compartida NO se toca." onOk={()=>{clearAll();setShowClear(false);}} onNo={()=>setShowClear(false)} danger/>}
      {delId&&<ConfirmDlg title="¿Eliminar?" msg="Se eliminará permanentemente." onOk={confirmDel} onNo={()=>setDelId(null)} danger/>}

      {swapFrom&&(()=>{const draft=mats.find(m=>m.id===swapFrom);if(!draft)return null;const activos=mats.filter(m=>m.cat===draft.cat&&!m.draft&&m.id!==draft.id);return(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" style={{animation:'scaleIn .2s ease'}}>
            <div className="p-5 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Reemplazar ítem activo</h3>
                  <p className="text-sm text-slate-500 mt-1">El borrador <span className="font-bold text-amber-700">{draft.name}</span> reemplazará al ítem que elijas. El reemplazado pasará a borrador.</p>
                </div>
                <button onClick={()=>setSwapFrom(null)} className="p-2 hover:bg-slate-100 rounded-full shrink-0"><X size={20}/></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {activos.length===0?<p className="text-center text-slate-400 py-8">No hay ítems activos en esta partida.</p>
              :<div className="space-y-2">{activos.map(a=>(
                <div key={a.id} className="flex items-center justify-between p-3 border rounded-xl hover:border-amber-300 hover:bg-amber-50 group">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-medium text-sm text-slate-800 truncate">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.id} · {fmtC(a.cost)} × {a.baseQty}</p>
                  </div>
                  <button onClick={()=>doSwap(a.id)} className="shrink-0 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 flex items-center gap-1"><RefreshCw size={12}/> Reemplazar</button>
                </div>
              ))}</div>}
            </div>
          </div>
        </div>);})()}

      {showManual&&(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{animation:'scaleIn .2s ease'}}>
            <div className="flex justify-between items-center mb-5 border-b pb-3"><h3 className="text-lg font-bold">{editId?'Editar':'Agregar'} Ítem</h3><button onClick={()=>setShowManual(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full"><X size={20}/></button></div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Partida *</label><select className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase" value={manItem.cat} onChange={e=>setManItem({...manItem,cat:e.target.value,subline:''})}><option value="">Seleccione...</option>{STAGES.map(s=><option key={s.id} value={s.cat}>{s.label.substring(3)}</option>)}</select></div>
                {SUBLINES[manItem.cat]&&<div><label className="block text-xs font-medium text-slate-500 mb-1">Sublínea</label><select className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={manItem.subline} onChange={e=>setManItem({...manItem,subline:e.target.value})}>{SUBLINES[manItem.cat].map(s=><option key={s.v} value={s.v}>{s.l}</option>)}</select></div>}
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Código</label><input className="w-full p-2.5 border rounded-xl outline-none text-sm" value={manItem.code} onChange={e=>setManItem({...manItem,code:e.target.value})}/></div>
              </div>
              <div><label className="block text-xs font-medium text-slate-500 mb-1">Descripción *</label><input className="w-full p-2.5 border rounded-xl outline-none text-sm" value={manItem.name} onChange={e=>setManItem({...manItem,name:e.target.value})}/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Marca</label><input className="w-full p-2.5 border rounded-xl outline-none text-sm" value={manItem.brand} onChange={e=>setManItem({...manItem,brand:e.target.value})}/></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Unidad</label><select className="w-full p-2.5 border rounded-xl outline-none text-sm" value={manItem.unit} onChange={e=>setManItem({...manItem,unit:e.target.value})}>{['UNIDAD','MT LINEAL','MT2','CAJA','KG','LITRO','GALON','ROLLO','SET'].map(u=><option key={u} value={u}>{u}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Costo Unit. *</label><input type="number" className="w-full p-2.5 border rounded-xl outline-none text-sm" value={manItem.cost} onChange={e=>setManItem({...manItem,cost:e.target.value})}/></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1">{manItem.cat==='INSUMOS GENERALES'&&manItem.scope==='proyecto'?'Cant./Proyecto *':'Cant./POD *'}</label><input type="number" step="0.01" className="w-full p-2.5 border rounded-xl outline-none text-sm" value={manItem.qty} onChange={e=>setManItem({...manItem,qty:e.target.value})}/></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Presentación</label><input className="w-full p-2.5 border rounded-xl outline-none text-sm" placeholder="Ej: Saco 25kg" value={manItem.pres} onChange={e=>setManItem({...manItem,pres:e.target.value})}/></div>
              </div>
              {manItem.cat==='INSUMOS GENERALES'&&(
                <label className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition">
                  <input type="checkbox" checked={manItem.scope==='proyecto'} onChange={e=>setManItem({...manItem,scope:e.target.checked?'proyecto':'pod'})} className="mt-0.5 w-4 h-4 accent-amber-600 cursor-pointer"/>
                  <div className="text-xs">
                    <div className="font-semibold text-amber-800">Una vez por proyecto (no escala por POD)</div>
                    <div className="text-amber-700 mt-0.5">Marca cuando el insumo se compra una sola vez para todo el proyecto (ej: rodillo de púas, herramienta). La cantidad ingresada arriba se usa tal cual, sin multiplicar por cantidad de pods.</div>
                  </div>
                </label>
              )}
              <div className="pt-4 border-t">
                <label className="block text-xs font-semibold mb-2">Ficha Técnica (Max 2MB)</label>
                {manItem.tsN?<div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl"><div className="flex items-center gap-2 overflow-hidden"><FileText size={18} className="text-blue-500 shrink-0"/><span className="text-sm font-medium text-blue-700 truncate">{manItem.tsN}</span></div><button onClick={()=>setManItem(p=>({...p,tsN:'',tsD:''}))} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={16}/></button></div>
                :<label className="flex flex-col items-center p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer"><UploadCloud size={24} className="text-slate-400 mb-2"/><span className="text-sm text-slate-600">Adjuntar ficha</span><input type="file" accept=".pdf,image/*,.doc,.docx" className="hidden" onChange={tsUpload}/></label>}
              </div>
              <div className="pt-4 border-t flex justify-end gap-3">
                <button onClick={()=>setShowManual(false)} className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                <button onClick={saveManual} disabled={!manItem.name||!manItem.cat||manItem.cost===''||manItem.qty===''} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 disabled:opacity-50 shadow">{editId?'Actualizar':'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
