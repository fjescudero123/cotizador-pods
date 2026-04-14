import { UF_VALUE } from '../constants/economics.js';

export const fmtC=(v)=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(v||0);
export const fmtN=(v)=>new Intl.NumberFormat('es-CL',{maximumFractionDigits:2}).format(v||0);
export const fmtUF=(v)=>new Intl.NumberFormat('es-CL',{minimumFractionDigits:2,maximumFractionDigits:2}).format((v||0)/UF_VALUE)+' UF';
