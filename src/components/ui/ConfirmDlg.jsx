import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDlg = ({title,msg,onOk,onNo,danger}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm" style={{animation:'scaleIn .2s ease'}}>
      <div className={`flex items-center gap-3 mb-3 ${danger?'text-red-600':'text-amber-600'}`}><AlertTriangle size={24}/><h3 className="text-xl font-bold">{title}</h3></div>
      <p className="text-slate-600 mb-6 text-sm">{msg}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onNo} className="px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl">Cancelar</button>
        <button onClick={onOk} className={`px-4 py-2.5 text-white font-medium rounded-xl shadow-sm ${danger?'bg-red-600 hover:bg-red-700':'bg-amber-600 hover:bg-amber-700'}`}>Confirmar</button>
      </div>
    </div>
  </div>
);
