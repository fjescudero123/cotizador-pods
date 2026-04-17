import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, FolderOpen, Copy, Trash2, Clock, User, Box, ChevronRight, Save } from 'lucide-react';

export default function ProjectsListView({ ctx }) {
  const { proj, projectId, projectsList, projectsLoading, calc } = ctx.data;
  const { saveProject, loadProject, duplicateProject, newProject, deleteProject, loadProjectsList } = ctx.business;
  const { setTab } = ctx.nav;
  const { nfy, busy } = ctx.io;
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');

  useEffect(() => { loadProjectsList(); }, []);

  const fmtDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSaveAs = () => {
    if (!saveAsName.trim()) { nfy('Ingresa un nombre.', 'error'); return; }
    saveProject(saveAsName.trim());
    setSaveAsOpen(false);
    setSaveAsName('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" style={{ animation: 'slideUp .3s ease' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-2xl font-bold">Proyectos</h2>
        <div className="flex gap-2">
          <button onClick={() => loadProjectsList()} disabled={projectsLoading} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-50">
            <RefreshCw size={15} className={projectsLoading ? 'animate-spin' : ''} /> Actualizar
          </button>
          <button onClick={newProject} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90" style={{ backgroundColor: '#D4A44C' }}>
            <Plus size={16} /> Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Active project banner */}
      {projectId && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#D4A44C' }}><FolderOpen size={18} className="text-white" /></div>
            <div>
              <p className="font-bold text-sm text-amber-800">Proyecto activo</p>
              <p className="text-xs text-amber-600">{proj.name} {proj.client ? `· ${proj.client}` : ''} · {calc.totalPods} PODs</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTab('project')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200">Continuar editando</button>
            <button onClick={() => { setSaveAsName(proj.name + ' (copia)'); setSaveAsOpen(true); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border hover:bg-slate-50">Guardar como...</button>
          </div>
        </div>
      )}

      {/* No active project */}
      {!projectId && proj.name !== 'Nuevo Proyecto' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500"><Save size={18} className="text-white" /></div>
            <div>
              <p className="font-bold text-sm text-blue-800">Proyecto sin guardar</p>
              <p className="text-xs text-blue-600">{proj.name} · {calc.totalPods} PODs · Los cambios solo estan en este navegador</p>
            </div>
          </div>
          <button onClick={() => saveProject()} disabled={busy} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">Guardar ahora</button>
        </div>
      )}

      {/* Save As dialog */}
      {saveAsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" style={{ animation: 'scaleIn .2s ease' }}>
            <h3 className="font-bold text-lg">Guardar como nuevo proyecto</h3>
            <input className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" placeholder="Nombre del proyecto" value={saveAsName} onChange={e => setSaveAsName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveAs()} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setSaveAsOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button onClick={handleSaveAs} disabled={busy} className="px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#D4A44C' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Project list */}
      {projectsLoading && !projectsList.length && (
        <div className="text-center py-12 text-slate-400"><RefreshCw size={24} className="animate-spin mx-auto mb-2" /><p className="text-sm">Cargando proyectos...</p></div>
      )}

      {!projectsLoading && !projectsList.length && (
        <div className="text-center py-16 space-y-3">
          <FolderOpen size={48} className="mx-auto text-slate-300" />
          <p className="text-slate-500 font-medium">No hay proyectos guardados</p>
          <p className="text-sm text-slate-400">Crea un proyecto nuevo y guardalo para verlo aqui.</p>
        </div>
      )}

      {projectsList.length > 0 && (
        <div className="space-y-3">
          {projectsList.map(p => {
            const isActive = p._id === projectId;
            const podCount = (p.typs || []).reduce((s, t) => s + (t.count || 0), 0);
            const typCount = (p.typs || []).length;
            return (
              <div key={p._id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow p-4 ${isActive ? 'ring-2 ring-amber-400 border-amber-200' : ''}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 truncate">{p.name}</h3>
                      {isActive && <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Activo</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      {p.proj?.client && <span>{p.proj.client}</span>}
                      <span className="flex items-center gap-1"><Box size={12} /> {typCount} tip. · {podCount} PODs</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {fmtDate(p.updatedAt)}</span>
                      {p.createdBy && <span className="flex items-center gap-1"><User size={12} /> {p.createdBy}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!isActive && (
                      <button onClick={() => loadProject(p)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: '#D4A44C' }}>
                        <ChevronRight size={14} /> Abrir
                      </button>
                    )}
                    {isActive && (
                      <button onClick={() => setTab('project')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200">
                        <ChevronRight size={14} /> Continuar
                      </button>
                    )}
                    <button onClick={() => duplicateProject(p)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 border hover:bg-slate-50">
                      <Copy size={14} /> Duplicar
                    </button>
                    <button onClick={() => deleteProject(p._id)} disabled={busy} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
