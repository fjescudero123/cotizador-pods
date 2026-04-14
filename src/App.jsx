// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calculator, Ruler, Settings, Database, Layers, Box, LayoutDashboard, Search, Factory, X, Plus, UploadCloud, Trash2, CheckCircle2, AlertTriangle, Edit2, FileText, Download, LayoutGrid, Square, Hexagon, PanelBottom, ChevronDown, ChevronRight, Wrench, Send, Filter, Paperclip, DoorOpen, Zap, Droplets, ShowerHead, PaintBucket, Home, BarChart3, Package, Menu, CircleDollarSign, RefreshCw
} from 'lucide-react';
import { SUBLINES } from './constants/sublines.js';
import { STROKE_COLORS } from './constants/colors.js';
import { UF_VALUE, REND_ADHESIVO_M2_SACO, REND_FRAGUE_M2_SACO, REND_ESPACIADOR_M2_BOLSA, REND_ESQUINERO_ML_TIRA, REND_PASTA_M2_SACO, REND_LATEX_M2_TINETA, REND_ESMALTE_M2_TINETA, MO_COSTO_MENSUAL, MO_PODS_SEMANA, MO_SEMANAS_MES, MO_COST_POD, REND_CUARZ_M2_TINETA, REND_MORTERO_M2_SACO, EST_REF_AREA_NETA, EST_REF_KG, EST_MERMA, BASE_REF_AREA_PISO } from './constants/economics.js';
import { STAGES } from './constants/stages.js';
import { defGeom, defConf, defTyp } from './constants/defaults.js';
import { classifyToStage } from './utils/classify.js';
import { fmtC, fmtN, fmtUF } from './utils/format.js';
import { DEMO_MATS } from './constants/demoMats.js';
import { CostChart } from './components/ui/CostChart.jsx';
import { MAYU_LOGO_SVG } from './components/ui/MayuLogo.jsx';
import { Notify } from './components/ui/Notify.jsx';
import { ConfirmDlg } from './components/ui/ConfirmDlg.jsx';
import { DkSel } from './components/ui/DkSel.jsx';
import { DkIn } from './components/ui/DkIn.jsx';
import { ResBadge } from './components/ui/ResBadge.jsx';
import ProjectView from './views/ProjectView.jsx';
import BomView from './views/BomView.jsx';
import DashboardView from './views/DashboardView.jsx';
import DatabaseView from './views/DatabaseView.jsx';
const useCRMProjects = () => { const [crmProjects] = useState([]); const [crmLoading] = useState(false); return { crmProjects, crmLoading }; };

export default function App() {
  const [tab,setTab] = useState('project');
  const [selCat,setSelCat] = useState(null);
  const [busy,setBusy] = useState(false);
  const [expStage,setExpStage] = useState('estructura');
  const [notif,setNotif] = useState(null);
  const [mobMenu,setMobMenu] = useState(false);
  const [mats,setMats] = useState([]);
  const [proj,setProj] = useState(()=>{try{const s=localStorage.getItem('mayu_proj');return s?JSON.parse(s):{name:'Cotización B2B',client:'',clientRut:'',clientAddress:'',clientPhone:'',clientEmail:'',contactName:'',marginPct:20,contingencyPct:5};}catch(e){return{name:'Cotización B2B',client:'',clientRut:'',clientAddress:'',clientPhone:'',clientEmail:'',contactName:'',marginPct:20,contingencyPct:5};}});
  const [typs,setTyps] = useState(()=>{try{const s=localStorage.getItem('mayu_typs');return s?JSON.parse(s):[defTyp];}catch(e){return[defTyp];}});
  const [actTypId,setActTypId] = useState(typs[0]?.id);
  const { crmProjects, crmLoading } = useCRMProjects();
  const actTyp = useMemo(()=>typs.find(t=>t.id===actTypId)||typs[0]||defTyp,[typs,actTypId]);
  const nfy = useCallback((m,t='success')=>setNotif({message:m,type:t}),[]);
  useEffect(()=>{
    const demoMats = DEMO_MATS;
    /* demoMats array extracted to constants/demoMats.js */
    const saved = localStorage.getItem('mayu_materialsDb');
    if (saved) {
      try { const parsed = JSON.parse(saved); if (parsed.length > 0) { setMats(parsed); nfy(`Biblioteca cargada: ${parsed.length} ítems.`); return; } } catch(e) {}
    }
    setMats(demoMats.map(m => ({ waste:0,laborY:0,laborC:0,techSheetName:'',techSheetData:'',...m, catOriginal: m.cat, cat: classifyToStage(m.cat) })));
    nfy("BOM Baumax cargado: 153 ítems reales con precios y cantidades comerciales por POD.");
  },[]);
  useEffect(()=>{if(mats.length>0)localStorage.setItem('mayu_materialsDb',JSON.stringify(mats));},[mats]);
  useEffect(()=>{localStorage.setItem('mayu_proj',JSON.stringify(proj));},[proj]);
  useEffect(()=>{localStorage.setItem('mayu_typs',JSON.stringify(typs));},[typs]);
  useEffect(()=>{if(notif){const t=setTimeout(()=>setNotif(null),4000);return()=>clearTimeout(t);}},[notif]);
  const loadCRMProject = (crm) => {
    setProj(p => ({...p, name: crm.nombre || p.name, client: crm.cliente || p.client, contactName: crm.responsable_comercial || '', clientAddress: crm.ubicacion || ''}));
    if (crm.cantidad_unidades > 1) {
      setTyps(p => p.map((t, i) => i === 0 ? {...t, count: crm.cantidad_unidades} : t));
    }
    setTab('design');
    nfy('Proyecto cargado desde CRM: ' + crm.nombre);
  };
  const addTyp=()=>{const id=`typ-${Date.now()}`;setTyps(p=>[...p,{...defTyp,id,name:`Baño Tipo ${p.length+1}`}]);setActTypId(id);nfy("Tipología creada.");};
  const updTyp=(id,f,v)=>setTyps(p=>p.map(t=>t.id===id?{...t,[f]:v}:t));
  const delTyp=(id)=>{if(typs.length<=1)return nfy("Mínimo 1 tipología.",'error');if(window.confirm("¿Eliminar?")){const n=typs.filter(t=>t.id!==id);setTyps(n);if(actTypId===id)setActTypId(n[0].id);}};
  const updGeom=(typId,u)=>setTyps(p=>p.map(t=>t.id===typId?{...t,geometry:{...t.geometry,...u}}:t));
  const updConf=(typId,u)=>setTyps(p=>p.map(t=>t.id===typId?{...t,config:{...t.config,...u}}:t));
  const addSide=(typId)=>setTyps(p=>p.map(t=>t.id===typId?{...t,geometry:{...t.geometry,polygonSides:[...(t.geometry.polygonSides||[]),{id:Date.now(),dir:'R',len:1.0}]}}:t));
  const rmSide=(typId,sideId)=>setTyps(p=>p.map(t=>t.id===typId?{...t,geometry:{...t.geometry,polygonSides:(t.geometry.polygonSides||[]).filter(s=>s.id!==sideId)}}:t));
  const updSide=(typId,sideId,f,v)=>setTyps(p=>p.map(t=>t.id===typId?{...t,geometry:{...t.geometry,polygonSides:(t.geometry.polygonSides||[]).map(s=>s.id===sideId?{...s,[f]:v}:s)}}:t));
  const dlTemplate=()=>{
    const a=document.createElement('a');a.href='/Plantilla_MAYU_Materiales.xlsx';a.download='Plantilla_MAYU_Materiales.xlsx';a.click();
    nfy('Plantilla descargada.');
  };
  const uploadFile=async(e)=>{
    const f=e.target.files[0];if(!f)return;setBusy(true);
    try{
      const X=await import('https://esm.sh/xlsx');const d=await f.arrayBuffer();const wb=X.read(d,{type:'array'});
      const rows=X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:""});
      if(!rows.length)throw new Error("Vacío");
      let hdrRow=0;
      for(let r=0;r<Math.min(rows.length,10);r++){
        const test=rows[r].map(h=>String(h||'').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim());
        if(test.some(h=>h.includes('PARTIDA'))&&test.some(h=>h.includes('DESCRIPCION')||h.includes('CODIGO'))){hdrRow=r;break;}
      }
      const hdr=rows[hdrRow].map(h=>String(h||'').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim());
      let iP=hdr.findIndex(h=>h.includes('PARTIDA'));if(iP===-1)iP=1;
      let iC=hdr.findIndex(h=>h.includes('CODIGO')||h==='SKU');if(iC===-1)iC=0;
      let iD=hdr.findIndex(h=>h.includes('DESCRIPCION'));if(iD===-1)iD=3;
      let iPr=hdr.findIndex(h=>h.includes('PROVEEDOR')||h.includes('MARCA'));if(iPr===-1)iPr=4;
      let iU=hdr.findIndex(h=>h.includes('UNIDAD'));if(iU===-1)iU=5;
      let iCo=hdr.findIndex(h=>h.includes('COSTO')||h.includes('PRECIO'));if(iCo===-1)iCo=7;
      let iCa=hdr.findIndex(h=>h.includes('CANTIDAD'));if(iCa===-1)iCa=8;
      let iSub=hdr.findIndex(h=>h.includes('SUBLINEA'));
      let iPres=hdr.findIndex(h=>h.includes('PRESENTACION'));
      const cleanSub=(s)=>{const v=(s||'').trim();return(!v||v==='(sin sublínea)'||v==='(dejar vacío)'||v==='-')?'':v;};
      const ndb=[];
      rows.slice(hdrRow+1,hdrRow+500).forEach((r,idx)=>{
        const cat=String(r[iP]||'').trim().toUpperCase();const nm=String(r[iD]||'').trim();
        if(!cat||!nm||nm.toLowerCase().includes('total:')||nm.toLowerCase().includes('ejemplo'))return;
        const cs=String(r[iC]||'').trim();const fid=cs||`Fila_${idx+2}`;
        const sub=iSub>=0?cleanSub(r[iSub]):'';
        const pres=iPres>=0?String(r[iPres]||'').trim():'';
        const classified=classifyToStage(cat);
        const subProps={};
        if(sub){
          if(classified==='TERMINACION DE MURO')subProps.termGroup=sub;
          else if(classified==='PISO')subProps.pisoGroup=sub;
          else if(classified==='SANITARIO ARTEFACTOS'||classified==='PUERTAS'||classified==='ACCESORIOS'||classified==='ELECTRICO')subProps.slot=sub;
          else if(classified==='REVESTIMIENTO DE MURO')subProps.revRole=sub;
        }
        ndb.push({id:fid,cat:classified,catOriginal:cat,name:nm,brand:r[iPr]?String(r[iPr]).trim():'',unit:r[iU]?String(r[iU]).trim().toUpperCase():'UNIDAD',cost:parseFloat(String(r[iCo]||'0').replace(',','.'))||0,baseQty:parseFloat(String(r[iCa]||'0').replace(',','.'))||0,waste:0,laborY:0,laborC:0,pres:pres,techSheetName:'',techSheetData:'',...subProps});
      });
      setMats(prev => {
        const merged = [...prev];
        let added = 0, updated = 0, drafts = 0;
        ndb.forEach(newItem => {
          const idx = merged.findIndex(m => m.id === newItem.id);
          if (idx >= 0) { merged[idx] = {...merged[idx], ...newItem}; updated++; }
          else {
            const hasSub = newItem.termGroup||newItem.pisoGroup||newItem.slot||newItem.revRole;
            if (!hasSub) { newItem.draft = true; drafts++; }
            merged.push(newItem); added++;
          }
        });
        const msg = drafts > 0
          ? `${added} nuevos (${drafts} en borrador), ${updated} actualizados. Total: ${merged.length}. Los ítems fijos nuevos deben activarse manualmente en Data Maestra.`
          : `${added} nuevos, ${updated} actualizados. Total: ${merged.length}`;
        nfy(msg);
        return merged;
      });
    }catch(e){nfy("Error procesando Excel.",'error');}finally{setBusy(false);e.target.value=null;}
  };
  const procTS=(f,cb)=>{if(!f)return;if(f.size>2*1024*1024){nfy("Max 2MB.",'error');return;}const r=new FileReader();r.onload=ev=>cb(f.name,ev.target.result);r.readAsDataURL(f);};
  const directTS=async(e,mid)=>{procTS(e.target.files[0],async(n,d)=>{setMats(p=>p.map(m=>m.id===mid?{...m,techSheetName:n,techSheetData:d}:m));nfy("Ficha vinculada.");});e.target.value=null;};
  const saveMaterial=(itemData, existingId)=>{
    if(existingId)setMats(p=>p.map(x=>x.id===existingId?{...x,...itemData}:x));else setMats(p=>[itemData,...p]);
    nfy("Ítem guardado.");
  };
  const deleteMaterial=(matId)=>{if(!matId)return;setMats(p=>p.filter(m=>m.id!==matId));nfy("Eliminado.");};
  const swapMaterial=(fromId,toId)=>{setMats(p=>p.map(m=>{if(m.id===fromId)return{...m,draft:false};if(m.id===toId)return{...m,draft:true};return m;}));const nm=mats.find(m=>m.id===fromId)?.name||'';nfy(`"${nm}" activado. El anterior pasó a borrador.`);};
  const clearAll=()=>{localStorage.removeItem('mayu_materialsDb');localStorage.removeItem('mayu_proj');localStorage.removeItem('mayu_typs');setMats([]);setProj({name:'Nuevo Proyecto',client:'',clientRut:'',clientAddress:'',clientPhone:'',clientEmail:'',contactName:'',marginPct:20,contingencyPct:5});const nid=`typ-${Date.now()}`;setTyps([{...defTyp,id:nid}]);setActTypId(nid);setShowClear(false);nfy("Memoria borrada.");};
  const exportXls=async()=>{
    setBusy(true);
    try{
      const X=await import('https://esm.sh/xlsx');const wb=X.utils.book_new();
      const res=[["COTIZACIÓN PRELIMINAR - MAYU POD"],["Proyecto:",proj.name],["Cliente:",proj.client],["Fecha:",new Date().toLocaleDateString('es-CL')],["Valor UF:",UF_VALUE],[""],["Total PODs:",calc.totalPods],["Costo Directo:",calc.totals.directCost],["Mano de Obra:",calc.totals.labor],["Contingencia:",calc.totals.contingency],["Precio Venta Total (CLP):",calc.totals.salePriceTotal],["Precio Venta Total (UF):",Math.round(calc.totals.salePriceTotal/UF_VALUE*100)/100],["Precio / POD (CLP):",calc.totals.salePricePerPod],["Precio / POD (UF):",Math.round(calc.totals.salePricePerPod/UF_VALUE*100)/100],["Margen Bruto:",calc.totals.grossMargin]];
      X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet(res),"Resumen");
      const bH=["Partida","Código","Descripción","Presentación","Cant. Necesaria","Cant. Compra","P.U.","Costo"];
      const bR=calc.bom.map(i=>[i.category,i.key,i.name,i.pres||'',Math.round(i.realQty*100)/100,i.purchaseQty,i.cost,Math.round(i.materialCost)]);
      X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet([bH,...bR]),"BOM");
      const tH=["Tipología","Cantidad","Área m²","Perímetro ml","M.O./POD"];
      const tR=typs.map(t=>[t.name,t.count,Math.round((calc.typMetrics[t.id]?.floorArea||0)*100)/100,Math.round((calc.typMetrics[t.id]?.perimeter||0)*100)/100,t.config.laborCostPerPod||0]);
      X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet([tH,...tR]),"Tipologías");
      X.writeFile(wb,`Cotizacion_MAYU_${proj.name.replace(/\s+/g,'_')}_${new Date().toISOString().slice(0,10)}.xlsx`);
      nfy("Exportado.");
    }catch(e){nfy("Error al exportar.",'error');}finally{setBusy(false);}
  };
  const calc = useMemo(()=>{
    const tm={};let totL=0,totP=0;const bm={};
    mats.forEach(m=>{bm[m.id]={key:m.id,name:m.name,brand:m.brand,category:m.cat,unit:m.unit,cost:m.cost,pres:m.pres||'Unidad',slot:m.slot||'',revRole:m.revRole||'',termGroup:m.termGroup||'',pisoGroup:m.pisoGroup||'',theoreticalQty:0,realQty:0,purchaseQty:0,materialCost:0,laborCost:0,totalCost:0,techSheetName:m.techSheetName,techSheetData:m.techSheetData};});
    typs.forEach(typ=>{
      const g=typ.geometry||defGeom;const c=typ.config||defConf;const cnt=Number(typ.count)||0;totP+=cnt;
      let fa=0,per=0,closed=true,pc=[{x:0,y:0}];
      if(g.mode==='rect'){fa=(Number(g.length)||0)*(Number(g.width)||0);per=2*((Number(g.length)||0)+(Number(g.width)||0));pc=[{x:0,y:0},{x:Number(g.length)||0,y:0},{x:Number(g.length)||0,y:Number(g.width)||0},{x:0,y:Number(g.width)||0},{x:0,y:0}];}
      else{let cx=0,cy=0;(g.polygonSides||[]).forEach(s=>{per+=Number(s.len)||0;if(s.dir==='U')cy-=Number(s.len)||0;if(s.dir==='D')cy+=Number(s.len)||0;if(s.dir==='L')cx-=Number(s.len)||0;if(s.dir==='R')cx+=Number(s.len)||0;pc.push({x:cx,y:cy});});if(Math.abs(cx)>0.01||Math.abs(cy)>0.01)closed=false;else{let ac=0;for(let i=0;i<pc.length-1;i++)ac+=pc[i].x*pc[i+1].y-pc[i+1].x*pc[i].y;fa=Math.abs(ac)/2;}}
      const dCnt=Number(g.doorCount)||1;const dA=dCnt*(Number(g.doorWidth)||0.75)*(Number(g.doorHeight)||2.0);
      const nwa=Math.max(0,(per*(Number(g.height)||2.4))-dA);const ca=fa;
      const tA=((Number(c.tileLength)||60)/100)*((Number(c.tileWidth)||60)/100);
      const efa=g.mode==='polygon'?fa*(1+(Number(c.tileWastePct)||5)/100):fa;
      let ppP=0;
      if(g.mode==='rect'){const tL=(Number(c.tileLength)||60)/100;const tW=(Number(c.tileWidth)||60)/100;ppP=Math.min(Math.ceil((Number(g.length)||0)/tL)*Math.ceil((Number(g.width)||0)/tW),Math.ceil((Number(g.length)||0)/tW)*Math.ceil((Number(g.width)||0)/tL));}
      else ppP=Math.ceil(efa/tA);
      const tpT=ppP*cnt;const yM2=Number(c.boxYieldM2)||1.44;const ppB=Math.round(yM2/tA)||1;const tbT=Math.ceil(tpT/ppB);const tmP=tbT*yM2;const am2=cnt>0?(tmP/cnt):0;
      tm[typ.id]={floorArea:fa,perimeter:per,netWallArea:nwa,ceilingArea:ca,isClosed:closed,polyCoords:pc,piecesPerPod:ppP,piecesPerBox:ppB,totalBoxesTypology:tbT,totalM2PurchasedTypology:tmP,effectiveFloorArea:efa};
      const labPP=Number(c.laborCostPerPod)||0;totL+=labPP*cnt;
      if(cnt>0){
        mats.forEach(mat=>{
          let tQ=0,w=mat.waste||0,isP=false,pQ=0;
          if(mat.cat==='BASE'){const _bn=(mat.name||'').toUpperCase();if(mat.pres==='MT2'||mat.unit==='MT2'){pQ=fa;}else if(mat.id==='BASE-CUARZ'||_bn.includes('CUARZ')){pQ=fa/REND_CUARZ_M2_TINETA;}else if(mat.id==='BASE-MORTERO'||_bn.includes('MORTERO')){pQ=fa/REND_MORTERO_M2_SACO;}else{const floorRatio=fa/BASE_REF_AREA_PISO;pQ=mat.baseQty*floorRatio*(1+EST_MERMA);}isP=true;}
          if(mat.cat==='ELECTRICO'){if(mat.slot){const ek={iluminacion:'elecIluminacion'}[mat.slot];if(ek&&c[ek]===mat.id){pQ=mat.baseQty;isP=true;}}else{pQ=mat.baseQty;isP=true;}}
          if(mat.cat==='SANITARIO AGUA POTABLE'){pQ=mat.baseQty;isP=true;}
          if(mat.cat==='SANITARIO ALCANTARILLADO'){pQ=mat.baseQty;isP=true;}
          if(mat.cat==='TERMINACION DE MURO'){
            if(!mat.termGroup){pQ=mat.baseQty;isP=true;}
            else{
              try{const twCfg=JSON.parse(c.termWallCfg||'[]');const h=Number(g.height)||2.4;
              let wallLens=[];if(g.mode==='rect')wallLens=[Number(g.length)||0,Number(g.width)||0,Number(g.length)||0,Number(g.width)||0];
              else wallLens=(g.polygonSides||[]).map(s=>Number(s.len)||0);
              let ceramArea=0,pintArea=0,latexArea=0,esmalteArea=0,latexCoats=2,esmalteCoats=2;
              twCfg.forEach((tw,wi)=>{if(wi>=wallLens.length)return;let wA=wallLens[wi]*h;if(wi===0){const dA=(Number(g.doorCount)||1)*(Number(g.doorWidth)||0.75)*(Number(g.doorHeight)||2.0);wA=Math.max(0,wA-dA);}
              if(tw.type==='ceramica')ceramArea+=wA;
              if(tw.type==='pintura'){pintArea+=wA;if(tw.paint==='POD_142'){latexArea+=wA;latexCoats=tw.coats||2;}if(tw.paint==='POD_143'){esmalteArea+=wA;esmalteCoats=tw.coats||2;}}});
              if(c.termFaldon==='ceramica')ceramArea+=0.6;
              if(c.termFaldon==='pintura')pintArea+=0.6;
              if(mat.termGroup==='ceramica'&&ceramArea>0){
                if(mat.id==='POD_099')pQ=ceramArea/REND_ADHESIVO_M2_SACO;
                else if(mat.id==='CTE042')pQ=ceramArea/REND_FRAGUE_M2_SACO;
                else if(mat.id==='POD_100')pQ=ceramArea/REND_ESPACIADOR_M2_BOLSA;
                else if(mat.id==='POD_139'){const nCorners=Math.min(wallLens.length,twCfg.filter(w=>w.type==='ceramica').length)*2;pQ=nCorners*h/REND_ESQUINERO_ML_TIRA;}
                else pQ=ceramArea/10;
                isP=true;}
              if(mat.termGroup==='pintura'&&pintArea>0){pQ=pintArea/REND_PASTA_M2_SACO;isP=true;}
              if(mat.termGroup==='pintura_latex'&&latexArea>0){pQ=latexArea*latexCoats/REND_LATEX_M2_TINETA;isP=true;}
              if(mat.termGroup==='pintura_esmalte'&&esmalteArea>0){pQ=esmalteArea*esmalteCoats/REND_ESMALTE_M2_TINETA;isP=true;}
              }catch(e){}
            }
          }
          if(mat.cat==='CIELO'){pQ=mat.baseQty;isP=true;}
          if(mat.cat==='PISO'){
            if(mat.pisoGroup){
              if(mat.pisoGroup===c.pisoType && c.pisoMat===mat.id){pQ=Math.ceil(fa/2.34);isP=true;}
            } else {pQ=mat.baseQty;isP=true;}
          }
          if(mat.cat==='REVESTIMIENTO DE MURO'){
            if(mat.revRole==='revFibro'){
              if(c.revFibro===mat.id){const aR=nwa/EST_REF_AREA_NETA;pQ+=mat.baseQty*aR*(1+EST_MERMA);isP=true;}
            } else if(mat.revRole){
              try{const wCfg=JSON.parse(c.revWallCfg||'[]');const PLANCHA_M2=2.88;const h=Number(g.height)||2.4;
              let wallLens=[];
              if(g.mode==='rect')wallLens=[Number(g.length)||0,Number(g.width)||0,Number(g.length)||0,Number(g.width)||0];
              else wallLens=(g.polygonSides||[]).map(s=>Number(s.len)||0);
              let totalPlanchas=0;
              wCfg.forEach((wc,wi)=>{if(wi>=wallLens.length)return;let wArea=wallLens[wi]*h;if(wi===0){const dA=(Number(g.doorCount)||1)*(Number(g.doorWidth)||0.75)*(Number(g.doorHeight)||2.0);wArea=Math.max(0,wArea-dA);}
              ['int','ext'].forEach(face=>{const fc=wc[face];if(fc&&fc.mat===mat.id){totalPlanchas+=Math.ceil(wArea/PLANCHA_M2)*(fc.layers||1);}});});
              if(c.cieloYC===mat.id){const cieloPl=Math.ceil(ca/PLANCHA_M2)*(Number(c.cieloLayers)||1);totalPlanchas+=cieloPl;}
              if(totalPlanchas>0){pQ+=totalPlanchas;isP=true;}}catch(e){}
            } else {const aR=nwa/EST_REF_AREA_NETA;pQ+=mat.baseQty*aR*(1+EST_MERMA);isP=true;}
          }
          if(mat.cat==='SANITARIO ARTEFACTOS'){
            if(mat.slot){
              const slotToConf={tina:'artTina',wc_tanque:'artWCTanque',wc_taza:'artWCTaza',wc_asiento:'artWCAsiento',lavamanos:'artLavamanos',pedestal:'artPedestal',grif_lav:'artGrifLav',grif_tina:'artGrifTina',extractor:'artExtractor',mampara_barra:'artMampara'};
              const confKey=slotToConf[mat.slot];
              if(confKey && c[confKey]===mat.id){pQ=mat.baseQty;isP=true;}
            } else {pQ=mat.baseQty;isP=true;}
          }
          if(mat.cat==='ESTRUCTURA'){if(mat.pres==='fijo'){pQ=mat.baseQty;}else{const areaRatio=nwa/EST_REF_AREA_NETA;pQ=mat.baseQty*areaRatio*(mat.pres==='kg'?1:(1+EST_MERMA));}isP=true;}
          if(mat.cat==='INSUMOS GENERALES'){pQ=mat.baseQty;isP=true;}
          if(mat.cat==='TECHO'){const PLANCHA_TECHO_M2=2.9768;pQ=Math.ceil(ca/PLANCHA_TECHO_M2);isP=true;}
          if(mat.cat==='PUERTAS'){
            if(mat.slot==='puerta'){if(c.puertaMat===mat.id){pQ=Number(c.puertaQty)||1;isP=true;}}
            else if(mat.slot==='cerradura'){if(c.cerraduraMat===mat.id){pQ=Number(c.puertaQty)||1;isP=true;}}
            else {pQ=mat.baseQty;isP=true;}
          }
          if(mat.cat==='ACCESORIOS'){if(mat.slot){const ak={percha:'accPercha',portarollo:'accPortarollo',toallero:'accToallero'}[mat.slot];if(ak&&c[ak]===mat.id){pQ=mat.baseQty;isP=true;}}else{pQ=mat.baseQty;isP=true;}}
          if(isP&&!mat.draft){tQ=pQ;}
          const rQ=tQ*(1+w);
          bm[mat.id].theoreticalQty+=(tQ*cnt);bm[mat.id].realQty+=(rQ*cnt);
        });
      }
    });
    const isContinuous=(pres)=>{const p=(pres||'').toLowerCase();return p==='metro lineal'||p==='kg'||p==='mt2'||p==='m2';};
    let totM=0,totMTheo=0;
    Object.values(bm).forEach(item=>{
      if(item.realQty>0){
        item.purchaseQty=isContinuous(item.pres)?Math.round(item.realQty*100)/100:Math.ceil(item.realQty);
        item.materialCost=item.purchaseQty*item.cost;
        item.theoreticalCost=item.theoreticalQty*item.cost;
        item.totalCost=item.materialCost;
        totM+=item.materialCost;
        totMTheo+=item.theoreticalCost;
      }
    });
    const bom=Object.values(bm).filter(i=>i.realQty>0||i.theoreticalQty>0);
    const byCat={},costsCat={};
    bom.forEach(i=>{if(!byCat[i.category]){byCat[i.category]=[];costsCat[i.category]={materialCost:0,totalCost:0};}byCat[i.category].push(i);costsCat[i.category].materialCost+=i.materialCost;costsCat[i.category].totalCost+=i.totalCost;});
    const dc=totM+totL;const cg=dc*((Number(proj.contingencyPct)||0)/100);const cwc=dc+cg;
    const spt=cwc/(1-((Number(proj.marginPct)||0)/100));const spp=totP>0?spt/totP:0;
    return{typMetrics:tm,totalPods:totP,bom,bomByCategory:byCat,costsByCategory:costsCat,totals:{material:totM,materialTheoretical:totMTheo,labor:totL,directCost:dc,contingency:cg,costWithContingency:cwc,grossMargin:spt-cwc,salePricePerPod:spp,salePriceTotal:spt}};
  },[typs,proj.contingencyPct,proj.marginPct,mats]);
  const wallData = useMemo(()=>{
    let s=[];
    if(actTyp.geometry.mode==='rect')s=[{l:'M1',len:Number(actTyp.geometry.length)||0,c:STROKE_COLORS[0]},{l:'M2',len:Number(actTyp.geometry.width)||0,c:STROKE_COLORS[1]},{l:'M3',len:Number(actTyp.geometry.length)||0,c:STROKE_COLORS[2]},{l:'M4',len:Number(actTyp.geometry.width)||0,c:STROKE_COLORS[3]}];
    else s=(actTyp.geometry.polygonSides||[]).map((x,i)=>({l:`M${i+1}`,len:Number(x.len)||0,c:STROKE_COLORS[i%STROKE_COLORS.length]}));
    return s.map(x=>({...x,area:x.len*(Number(actTyp.geometry.height)||0)}));
  },[actTyp.geometry]);
  const cm=calc.typMetrics[actTypId]||{floorArea:0,perimeter:0,netWallArea:0,ceilingArea:0,effectiveFloorArea:0,piecesPerPod:0,totalBoxesTypology:0,isClosed:false};
  const mo=(fn)=>mats.filter(fn).map(m=>({v:m.id,l:`${m.name} - ${fmtC(m.cost)}/${m.unit}`}));
  const allMo=mats.map(m=>({v:m.id,l:`${m.name} - ${fmtC(m.cost)}/${m.unit}`}));
  const prtOpts=mo(m=>m.cat.toUpperCase()==='PUERTAS');
  const renderSVG=()=>{
    const co=calc.typMetrics[actTypId]?.polyCoords;if(!co||!co.length)return null;
    let mnX=co[0].x,mxX=co[0].x,mnY=co[0].y,mxY=co[0].y;
    co.forEach(p=>{if(p.x<mnX)mnX=p.x;if(p.x>mxX)mxX=p.x;if(p.y<mnY)mnY=p.y;if(p.y>mxY)mxY=p.y;});
    const w=mxX-mnX,h=mxY-mnY,pad=Math.max(Math.max(w,h)*.2,.2);
    const vb=`${mnX-pad} ${mnY-pad} ${w+pad*2} ${h+pad*2}`;
    const sw=Math.max(w,h)*.015||.05;const cr=Math.max(w,h)*.025||.08;
    return(
      <svg viewBox={vb} className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
        <polygon points={co.map(p=>`${p.x},${p.y}`).join(' ')} fill={cm.isClosed?"#1e293b":"transparent"} stroke="transparent"/>
        {co.slice(0,-1).map((p,i)=><line key={i} x1={p.x} y1={p.y} x2={co[i+1].x} y2={co[i+1].y} stroke={STROKE_COLORS[i%STROKE_COLORS.length]} strokeWidth={sw} strokeLinecap="round"/>)}
        {co.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={cr} fill={i===0?"#10B981":"#3B82F6"}/>)}
      </svg>
    );
  };
  const isStageDone=(sid)=>{const c=actTyp.config;const ch={base:mats.some(m=>m.cat==='BASE'),estructura:mats.some(m=>m.cat==='ESTRUCTURA'),techo:mats.some(m=>m.cat==='TECHO'),electrico:mats.some(m=>m.cat==='ELECTRICO'),sanitario_ap:mats.some(m=>m.cat==='SANITARIO AGUA POTABLE'),sanitario_al:mats.some(m=>m.cat==='SANITARIO ALCANTARILLADO'),revestimiento_muro:c.revWallCfg,cielo:c.cieloYC,sanitarios_artefactos:c.artTina||c.artWCTanque||c.artLavamanos,terminacion_muro:true,piso:c.pisoType,puertas:c.puertaMat,accesorios:mats.some(m=>m.cat==='ACCESORIOS'),insumos:true};return!!ch[sid];};
  const stageUI=(sid)=>{
    const c=actTyp.config;const g=actTyp.geometry;
    const GenS=({mk,yk,so,yl,ys,rl,rv,ph,children})=>(
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-white space-y-3">
        <DkSel value={c[mk]} onChange={e=>updConf(actTypId,{[mk]:e.target.value})} opts={so.length?so:allMo} ph={ph||'Seleccionar...'}/>
        {c[mk]&&<>{yk&&<DkIn label={yl||'Rendimiento'} value={c[yk]} onChange={e=>updConf(actTypId,{[yk]:Number(e.target.value)})} sfx={ys} step="0.1"/>}<ResBadge label={rl||'Cantidad/POD'} value={rv}/>{children}</>}
      </div>
    );
    switch(sid){
      case 'base': {
        const bi=mats.filter(m=>m.cat==='BASE'&&!m.draft);const fa=cm.floorArea;const _isCont=(p)=>{const pl=(p||'').toLowerCase();return pl==='metro lineal'||pl==='kg'||pl==='mt2'||pl==='m2';};
        const biCalc=bi.map(m=>{const mn=(m.name||'').toUpperCase();let q;if(m.pres==='MT2'||m.unit==='MT2'){q=fa;}else if(m.id==='BASE-CUARZ'||mn.includes('CUARZ')){q=fa/REND_CUARZ_M2_TINETA;}else if(m.id==='BASE-MORTERO'||mn.includes('MORTERO')){q=fa/REND_MORTERO_M2_SACO;}else{q=m.baseQty*(fa/BASE_REF_AREA_PISO)*(1+EST_MERMA);}const pq=Math.round(q*100)/100;return{...m,calcQty:pq,calcCost:pq*m.cost};});
        const bc=biCalc.reduce((s,m)=>s+m.calcCost,0);
        return <AutoStage title="Base POD" badge={`Auto · Rend. ficha técnica`} badgeColor="text-emerald-400 bg-emerald-900/50" items={biCalc} total={bc} desc={`Tarima ($155.000/m²) + TX-Cuarz PRO (${REND_CUARZ_M2_TINETA} m²/tineta) + Mortero (${fmtN(REND_MORTERO_M2_SACO)} m²/saco). Área piso: ${fmtN(fa)} m²`}>
          <div className="bg-slate-800/80 rounded-xl p-4"><div className="grid grid-cols-3 gap-3 text-center"><div><p className="text-[10px] text-slate-400 uppercase mb-1">Área piso</p><p className="text-lg font-bold">{fmtN(fa)} m²</p></div><div><p className="text-[10px] text-slate-400 uppercase mb-1">Rendimiento</p><p className="text-sm font-bold">Ficha técnica</p></div><div><p className="text-[10px] text-slate-400 uppercase mb-1">$/m²</p><p className="text-lg font-bold text-amber-400">{fa>0?fmtC(bc/fa):'-'}</p></div></div></div>
        </AutoStage>;
      }
      case 'estructura': {
        const ei2=mats.filter(m=>m.cat==='ESTRUCTURA');const er=ei2.reduce((s,m)=>s+(m.baseQty*m.cost),0);const ar=EST_REF_AREA_NETA>0?cm.netWallArea/EST_REF_AREA_NETA:0;const ec=er*ar*(1+EST_MERMA);const ek=EST_REF_KG*ar*(1+EST_MERMA);const ckA=EST_REF_KG>0?er/EST_REF_KG:0;
        return <AutoStage title="Estructura Steel Frame" badge={`Auto · ${fmtN(ar)}x · 5% merma`} badgeColor="text-emerald-400 bg-emerald-900/50" items={ei2} total={ec} desc={`Ref Baumax ${EST_REF_AREA_NETA}m² = ${fmtC(er)}. Ratio ${fmtN(EST_REF_KG/EST_REF_AREA_NETA)} kg/m²`}>
          <div className="bg-slate-800/80 rounded-xl p-4"><div className="grid grid-cols-4 gap-3 text-center"><div><p className="text-[10px] text-slate-400 uppercase mb-1">Área neta</p><p className="text-lg font-bold">{fmtN(cm.netWallArea)} m²</p></div><div><p className="text-[10px] text-slate-400 uppercase mb-1">Factor</p><p className="text-lg font-bold">{fmtN(ar)}x</p></div><div><p className="text-[10px] text-slate-400 uppercase mb-1">KG est.</p><p className="text-lg font-bold">{fmtN(ek)} kg</p></div><div><p className="text-[10px] text-slate-400 uppercase mb-1">$/kg</p><p className="text-lg font-bold text-amber-400">{fmtC(ckA)}</p></div></div></div>
        </AutoStage>;
      }
      case 'techo': {
        const ti=mats.filter(m=>m.cat==='TECHO');const PLT=2.9768;const tPl=Math.ceil(cm.ceilingArea/PLT);const tt=ti.reduce((s,m)=>s+(Math.ceil(cm.ceilingArea/PLT)*m.cost),0);
        return <AutoStage title="Techo (Terciado Estructural)" badge={`Auto · ${tPl} planchas`} badgeColor="text-emerald-400 bg-emerald-900/50" items={ti} total={tt} desc={`Terciado estructural 1220×2440mm (${fmtN(PLT)} m²/plancha). Área cielo: ${fmtN(cm.ceilingArea)} m² → ${tPl} planchas enteras.`}>
          <div className="bg-slate-800/80 rounded-xl p-4"><div className="grid grid-cols-3 gap-3 text-center"><div><p className="text-[10px] text-slate-400 uppercase mb-1">Área cielo</p><p className="text-lg font-bold text-white">{fmtN(cm.ceilingArea)} m²</p></div><div><p className="text-[10px] text-slate-400 uppercase mb-1">Plancha</p><p className="text-lg font-bold text-white">{fmtN(PLT)} m²</p></div><div><p className="text-[10px] text-slate-400 uppercase mb-1">Planchas</p><p className="text-lg font-bold text-emerald-400">{tPl}</p></div></div></div>
        </AutoStage>;
      }
      case 'electrico': {
        const elecAll=mats.filter(m=>m.cat==='ELECTRICO'&&!m.draft);
        const elecFijos=elecAll.filter(m=>!m.slot);const elecIlum=elecAll.filter(m=>m.slot==='iluminacion');
        const selIlum=elecAll.find(m=>m.id===c.elecIluminacion);
        const et=elecFijos.reduce((s,m)=>s+(m.baseQty*m.cost),0)+(selIlum?selIlum.baseQty*selIlum.cost:0);
        return(
        <div className="space-y-4"><div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden text-white">
          <div className="p-4 border-b border-slate-700/50 flex justify-between items-center"><h4 className="font-bold text-blue-400 text-sm uppercase">Instalación Eléctrica</h4><span className="text-[10px] text-amber-400 bg-amber-900/50 px-2 py-1 rounded font-bold">Fijo + Iluminación</span></div>
          <div className="p-5 space-y-4">
            {elecIlum.length>0&&<div className="bg-slate-800/60 rounded-xl p-3 space-y-2"><label className="text-[10px] text-slate-400 uppercase font-bold">Iluminación</label><select className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs outline-none" value={c.elecIluminacion||''} onChange={e=>updConf(actTypId,{elecIluminacion:e.target.value})}><option value="">Sin iluminación seleccionada</option>{elecIlum.map(o=><option key={o.id} value={o.id}>{o.name} — {fmtC(o.cost)}</option>)}</select></div>}
            <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-4 flex justify-between items-center"><p className="text-xs text-emerald-300/70 uppercase font-bold">Total eléctrico por POD</p><div className="text-right"><p className="text-2xl font-black text-emerald-400">{fmtC(et)}</p><p className="text-xs text-emerald-300/60 mt-0.5">{fmtUF(et)}</p></div></div>
            {elecFijos.length>0&&<div className="bg-slate-800/50 rounded-xl overflow-hidden"><div className="p-3 border-b border-slate-700/50"><span className="text-[10px] text-slate-400 uppercase font-bold">Insumos fijos ({elecFijos.length})</span></div><div className="max-h-32 overflow-y-auto">{elecFijos.map(m=><div key={m.id} className="flex items-center justify-between px-3 py-1 border-b border-slate-700/30 text-[11px]"><span className="text-slate-300 flex-1 truncate mr-2">{m.name}</span><span className="text-white font-medium w-16 text-right shrink-0">{fmtC(m.baseQty*m.cost)}</span></div>)}</div></div>}
          </div>
        </div></div>);
      }
      case 'sanitario_ap': {
        const ai=mats.filter(m=>m.cat==='SANITARIO AGUA POTABLE');const at=ai.reduce((s,m)=>s+(m.baseQty*m.cost),0);
        return <AutoStage title="Agua Potable (PPR)" badge="Fijo por POD · APO-02" items={ai} total={at} desc="Tubería PPR 20/25mm + fittings + llaves de paso. Plano APO-02."/>;
      }
      case 'sanitario_al': {
        const li=mats.filter(m=>m.cat==='SANITARIO ALCANTARILLADO');const lt=li.reduce((s,m)=>s+(m.baseQty*m.cost),0);
        return <AutoStage title="Alcantarillado (PVC)" badge="Fijo por POD · ALC-01" items={li} total={lt} desc="PVC 110/50/40mm + TEEs + reducciones + zócalo. Plano ALC-01."/>;
      }
      case 'revestimiento_muro': {
        const revAll = mats.filter(m=>m.cat==='REVESTIMIENTO DE MURO');
        const revPlanchas = revAll.filter(m=>m.revRole&&m.revRole!=='revFibro');
        const revInsumos = revAll.filter(m=>!m.revRole);
        const faldonMat = revAll.find(m=>m.id===c.revFibro);
        const aR = EST_REF_AREA_NETA>0 ? cm.netWallArea/EST_REF_AREA_NETA : 0;
        let wCfg=[];try{wCfg=JSON.parse(c.revWallCfg||'[]');}catch(e){}
        const PLANCHA_M2=2.88;
        const updWFace=(wi,face,field,val)=>{const nw=JSON.parse(JSON.stringify(wCfg));while(nw.length<=wi)nw.push({int:{mat:'',layers:1},ext:{mat:'',layers:1}});if(!nw[wi])nw[wi]={int:{mat:'',layers:1},ext:{mat:'',layers:1}};if(!nw[wi][face])nw[wi][face]={mat:'',layers:1};nw[wi][face]={...nw[wi][face],[field]:field==='layers'?Number(val):val};updConf(actTypId,{revWallCfg:JSON.stringify(nw)});};
        let planchaCost=0;
        wallData.forEach((w,wi)=>{const wc=wCfg[wi];if(!wc)return;let wArea=w.area;if(wi===0){const dA=(Number(actTyp.geometry.doorCount)||1)*(Number(actTyp.geometry.doorWidth)||0.75)*(Number(actTyp.geometry.doorHeight)||2.0);wArea=Math.max(0,wArea-dA);}
        ['int','ext'].forEach(face=>{const fc=wc[face];if(!fc||!fc.mat)return;const mat=revAll.find(m=>m.id===fc.mat);if(!mat)return;planchaCost+=Math.ceil(wArea/PLANCHA_M2)*(fc.layers||1)*mat.cost;});});
        const faldonCost=faldonMat?faldonMat.baseQty*faldonMat.cost*aR*(1+EST_MERMA):0;
        const insumoCost=revInsumos.reduce((s,m)=>s+(m.baseQty*m.cost*aR*(1+EST_MERMA)),0);
        const totalRev=planchaCost+faldonCost+insumoCost;
        const renderFace=(wi,face,label,wArea2)=>{const wc2=wCfg[wi]||{};const fc=(wc2[face])||{mat:'',layers:1};const sel=revAll.find(m=>m.id===fc.mat);const pl=sel?Math.ceil(wArea2/PLANCHA_M2)*(fc.layers||1):0;return(
          <div key={face} className="flex items-center gap-2">
            <span className="text-[9px] text-slate-500 w-8 shrink-0 text-right uppercase font-bold">{label}</span>
            <select className="flex-1 p-1.5 bg-slate-700 border border-slate-600 rounded text-white text-[11px] outline-none" value={fc.mat} onChange={e=>updWFace(wi,face,'mat',e.target.value)}>
              <option value="">-</option>
              {revPlanchas.map(o=><option key={o.id} value={o.id}>{o.name} - {fmtC(o.cost)}</option>)}
            </select>
            <select className="w-16 p-1.5 bg-slate-700 border border-slate-600 rounded text-white text-[10px] outline-none shrink-0" value={fc.layers||1} onChange={e=>updWFace(wi,face,'layers',e.target.value)}>
              <option value={1}>x1</option>
              <option value={2}>x2</option>
            </select>
            {sel&&<span className="text-[9px] text-emerald-400 font-bold shrink-0 w-16 text-right">{pl}pl</span>}
          </div>
        );};
        return(
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden text-white">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
              <h4 className="font-bold text-blue-400 text-sm uppercase">Revestimiento de Muro</h4>
              <span className="text-[10px] text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded font-bold">Int + Ext por elevación</span>
            </div>
            <div className="p-5 space-y-3">
              {wallData.map((w,wi)=>{let wArea=w.area;if(wi===0){const dA=(Number(actTyp.geometry.doorCount)||1)*(Number(actTyp.geometry.doorWidth)||0.75)*(Number(actTyp.geometry.doorHeight)||2.0);wArea=Math.max(0,wArea-dA);}return(
                <div key={wi} className="bg-slate-800/60 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor:w.c}}></span><span className="text-xs font-bold text-white">{w.l}</span><span className="text-[10px] text-slate-400">{fmtN(w.len)}m x {fmtN(Number(actTyp.geometry.height)||2.4)}m = {fmtN(wArea)} m²</span></div>
                  {renderFace(wi,"int","Int",wArea)}
                  {renderFace(wi,"ext","Ext",wArea)}
                </div>
              );})}
              <div className="bg-slate-800/60 rounded-xl p-3 space-y-2">
                <h5 className="text-[11px] text-amber-400 font-bold uppercase">Faldón Tina</h5>
                <select className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs outline-none" value={c.revFibro||''} onChange={e=>updConf(actTypId,{revFibro:e.target.value})}>
                  <option value="">Sin faldón</option>
                  {revAll.filter(m=>m.revRole==='revFibro').map(o=><option key={o.id} value={o.id}>{o.name} - {fmtC(o.cost)}</option>)}
                </select>
              </div>
              <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-4 flex justify-between items-center">
                <div><p className="text-xs text-emerald-300/70 uppercase font-bold">Total revestimiento por POD</p><p className="text-[10px] text-slate-400 mt-0.5">Planchas ({fmtC(planchaCost)}) + faldón ({fmtC(faldonCost)}) + insumos ({fmtC(insumoCost)})</p></div>
                <div className="text-right"><p className="text-2xl font-black text-emerald-400">{fmtC(totalRev)}</p><p className="text-xs text-emerald-300/60 mt-0.5">{fmtUF(totalRev)}</p></div>
              </div>
              {revInsumos.length>0 && (<div className="bg-slate-800/50 rounded-xl overflow-hidden"><div className="p-3 border-b border-slate-700/50"><span className="text-[10px] text-slate-400 uppercase font-bold">Insumos instalación (automáticos)</span></div><div className="max-h-32 overflow-y-auto">{revInsumos.map(m=><div key={m.id} className="flex items-center justify-between px-3 py-1 border-b border-slate-700/30 text-[11px]"><span className="text-slate-300 flex-1 truncate mr-2">{m.name}</span><span className="text-white font-medium w-16 text-right shrink-0">{fmtC(m.baseQty*m.cost)}</span></div>)}</div></div>)}
            </div>
          </div>
        </div>
      );}
      case 'cielo': {
        const revAll = mats.filter(m=>m.cat==='REVESTIMIENTO DE MURO');
        const revPlanchas = revAll.filter(m=>m.revRole&&m.revRole!=='revFibro');
        const cieloInsumos = mats.filter(m=>m.cat==='CIELO');
        const PLANCHA_M2=2.88;
        const selMat = revAll.find(m=>m.id===c.cieloYC);
        const planchas = selMat ? Math.ceil(cm.ceilingArea/PLANCHA_M2)*(Number(c.cieloLayers)||1) : 0;
        const planchaCost = selMat ? planchas*selMat.cost : 0;
        const insumoCost = cieloInsumos.reduce((s,m)=>s+(m.baseQty*m.cost),0);
        const totalCielo = planchaCost + insumoCost;
        const sameAsWall = c.revWallCfg && c.cieloYC && (c.revWallCfg.includes(c.cieloYC));
        return(
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden text-white">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
              <h4 className="font-bold text-blue-400 text-sm uppercase">Cielo</h4>
              <span className="text-[10px] text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded font-bold">Área: {fmtN(cm.ceilingArea)} m²</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-800/60 rounded-xl p-3 space-y-2">
                <h5 className="text-[11px] text-blue-400 font-bold uppercase">Yeso Cartón Cielo</h5>
                <div className="flex items-center gap-2">
                  <select className="flex-1 p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-[11px] outline-none" value={c.cieloYC||''} onChange={e=>updConf(actTypId,{cieloYC:e.target.value})}>
                    <option value="">Sin revestimiento</option>
                    {revPlanchas.map(o=><option key={o.id} value={o.id}>{o.name} - {fmtC(o.cost)}</option>)}
                  </select>
                  <select className="w-16 p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-[10px] outline-none shrink-0" value={c.cieloLayers||1} onChange={e=>updConf(actTypId,{cieloLayers:Number(e.target.value)})}>
                    <option value={1}>x1</option>
                    <option value={2}>x2</option>
                  </select>
                  {selMat&&<span className="text-[10px] text-emerald-400 font-bold shrink-0">{planchas} pl</span>}
                </div>
                {sameAsWall&&<p className="text-[10px] text-cyan-400 mt-1">Mismo YC que muros - las planchas se consolidan en la compra</p>}
              </div>
              <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-4 flex justify-between items-center">
                <div><p className="text-xs text-emerald-300/70 uppercase font-bold">Total cielo por POD</p><p className="text-[10px] text-slate-400 mt-0.5">Planchas ({fmtC(planchaCost)}) + insumos ({fmtC(insumoCost)})</p></div>
                <div className="text-right"><p className="text-2xl font-black text-emerald-400">{fmtC(totalCielo)}</p><p className="text-xs text-emerald-300/60 mt-0.5">{fmtUF(totalCielo)}</p></div>
              </div>
              {cieloInsumos.length>0 && (<div className="bg-slate-800/50 rounded-xl overflow-hidden"><div className="p-3 border-b border-slate-700/50"><span className="text-[10px] text-slate-400 uppercase font-bold">Insumos instalación (fijos por POD)</span></div><div className="max-h-32 overflow-y-auto">{cieloInsumos.map(m=><div key={m.id} className="flex items-center justify-between px-3 py-1 border-b border-slate-700/30 text-[11px]"><span className="text-slate-300 flex-1 truncate mr-2">{m.name}</span><span className="text-white font-medium w-16 text-right shrink-0">{fmtC(m.baseQty*m.cost)}</span></div>)}</div></div>)}
            </div>
          </div>
        </div>
      );}
      case 'sanitarios_artefactos': {
        const artAll = mats.filter(m=>m.cat==='SANITARIO ARTEFACTOS');
        const artFijos = artAll.filter(m=>!m.slot);
        const fijosCost = artFijos.reduce((s,m)=>s+(m.baseQty*m.cost),0);
        const slotDefs=[
          {key:'artTina',slot:'tina',label:'Tina / Receptáculo'},
          {key:'artWCTanque',slot:'wc_tanque',label:'WC Tanque'},
          {key:'artWCTaza',slot:'wc_taza',label:'WC Taza'},
          {key:'artWCAsiento',slot:'wc_asiento',label:'WC Asiento'},
          {key:'artLavamanos',slot:'lavamanos',label:'Lavamanos'},
          {key:'artPedestal',slot:'pedestal',label:'Pedestal / Mueble'},
          {key:'artGrifLav',slot:'grif_lav',label:'Grifería Lavamanos'},
          {key:'artGrifTina',slot:'grif_tina',label:'Grifería Tina/Ducha'},
          {key:'artExtractor',slot:'extractor',label:'Extractor'},
        ];
        const selCost = slotDefs.reduce((s,sd)=>{const sel=artAll.find(m=>m.id===c[sd.key]);return s+(sel?sel.baseQty*sel.cost:0);},0);
        const totalArt = selCost + fijosCost;
        const slotGroups=[
          {title:'Tina / Receptáculo',slots:['artTina']},
          {title:'WC',slots:['artWCTanque','artWCTaza','artWCAsiento']},
          {title:'Lavamanos',slots:['artLavamanos','artPedestal']},
          {title:'Griferías',slots:['artGrifLav','artGrifTina']},
          {title:'Extractor',slots:['artExtractor']},
        ];
        return(
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden text-white">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
              <h4 className="font-bold text-blue-400 text-sm uppercase">Artefactos Sanitarios</h4>
              <span className="text-[10px] text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded font-bold">Seleccionables + insumos fijos</span>
            </div>
            <div className="p-5 space-y-4">
              {slotGroups.map(sg=><div key={sg.title} className="bg-slate-800/60 rounded-xl p-3 space-y-2">
                <h5 className="text-[11px] text-blue-400 font-bold uppercase">{sg.title}</h5>
                <div className={`grid gap-2 ${sg.slots.length>=3?'grid-cols-3':sg.slots.length===2?'grid-cols-2':''}`}>
                  {sg.slots.map(sk=>{const sd=slotDefs.find(d=>d.key===sk);if(!sd)return null;const opts=artAll.filter(m=>m.slot===sd.slot);const sel=artAll.find(m=>m.id===c[sk]);return(
                    <div key={sk}>
                      <select className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs outline-none" value={c[sk]||''} onChange={e=>updConf(actTypId,{[sk]:e.target.value})}>
                        <option value="">{sd.label}...</option>
                        {opts.map(o=><option key={o.id} value={o.id}>{o.name} - {fmtC(o.cost)}</option>)}
                      </select>
                      {sel&&<p className="text-[10px] text-slate-400 mt-1 px-1">{sel.brand} · {sel.pres} · {fmtC(sel.cost)}</p>}
                    </div>
                  );})}
                </div>
              </div>)}
              <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-4 flex justify-between items-center">
                <div><p className="text-xs text-emerald-300/70 uppercase font-bold">Total artefactos por POD</p><p className="text-[10px] text-slate-400 mt-0.5">Seleccionados ({fmtC(selCost)}) + insumos fijos ({fmtC(fijosCost)})</p></div>
                <div className="text-right"><p className="text-2xl font-black text-emerald-400">{fmtC(totalArt)}</p><p className="text-xs text-emerald-300/60 mt-0.5">{fmtUF(totalArt)}</p></div>
              </div>
              {artFijos.length>0 && (<div className="bg-slate-800/50 rounded-xl overflow-hidden"><div className="p-3 border-b border-slate-700/50"><span className="text-[10px] text-slate-400 uppercase font-bold">Insumos instalación (fijos por POD)</span></div><div className="max-h-36 overflow-y-auto">{artFijos.map(m=><div key={m.id} className="flex items-center justify-between px-3 py-1 border-b border-slate-700/30 text-[11px]"><span className="text-slate-300 flex-1 truncate mr-2">{m.name}</span><span className="text-slate-500 w-12 text-right shrink-0">{m.baseQty}</span><span className="text-white font-medium w-16 text-right shrink-0">{fmtC(m.baseQty*m.cost)}</span></div>)}</div></div>)}
            </div>
          </div>
        </div>
      );}
      case 'terminacion_muro': {
        const tmAll = mats.filter(m=>m.cat==='TERMINACION DE MURO');
        const tmFijos = tmAll.filter(m=>!m.termGroup);
        const tmCeram = tmAll.filter(m=>m.termGroup==='ceramica');
        const tmPintLatex = tmAll.filter(m=>m.termGroup==='pintura_latex');
        const tmPintEsm = tmAll.filter(m=>m.termGroup==='pintura_esmalte');
        const tmPintInsumo = tmAll.filter(m=>m.termGroup==='pintura');
        const paintOpts = [...tmPintLatex,...tmPintEsm];
        let twCfg=[];try{twCfg=JSON.parse(c.termWallCfg||'[]');}catch(e){}
        const updTW=(wi,field,val)=>{const nw=JSON.parse(JSON.stringify(twCfg));while(nw.length<=wi)nw.push({type:'pintura',paint:'POD_142',coats:2});nw[wi]={...nw[wi],[field]:field==='coats'?Number(val):val};updConf(actTypId,{termWallCfg:JSON.stringify(nw)});};
        const hasTina = c.artTina && mats.some(m=>m.id===c.artTina);
        const fijosCost = tmFijos.reduce((s,m)=>s+(m.baseQty*m.cost),0);
        return(
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden text-white">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
              <h4 className="font-bold text-blue-400 text-sm uppercase">Terminación Muro</h4>
              <span className="text-[10px] text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded font-bold">Cerámica / Pintura por elevación</span>
            </div>
            <div className="p-5 space-y-3">
              {wallData.map((w,wi)=>{const tw=twCfg[wi]||{type:'pintura',paint:'POD_142',coats:2};return(
                <div key={wi} className="bg-slate-800/60 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor:w.c}}></span><span className="text-xs font-bold text-white">{w.l}</span><span className="text-[10px] text-slate-400">{fmtN(w.area)} m²</span></div>
                  <div className="flex items-center gap-2">
                    <select className="w-24 p-1.5 bg-slate-700 border border-slate-600 rounded text-white text-[11px] outline-none shrink-0" value={tw.type} onChange={e=>updTW(wi,'type',e.target.value)}>
                      <option value="ceramica">Cerámica</option>
                      <option value="pintura">Pintura</option>
                    </select>
                    {tw.type==='pintura'&&<>
                      <select className="flex-1 p-1.5 bg-slate-700 border border-slate-600 rounded text-white text-[11px] outline-none" value={tw.paint||''} onChange={e=>updTW(wi,'paint',e.target.value)}>
                        {paintOpts.map(o=><option key={o.id} value={o.id}>{o.name} - {fmtC(o.cost)}</option>)}
                      </select>
                      <select className="w-16 p-1.5 bg-slate-700 border border-slate-600 rounded text-white text-[10px] outline-none shrink-0" value={tw.coats||2} onChange={e=>updTW(wi,'coats',e.target.value)}>
                        <option value={1}>1 mano</option>
                        <option value={2}>2 manos</option>
                        <option value={3}>3 manos</option>
                      </select>
                    </>}
                    {tw.type==='ceramica'&&<span className="text-[10px] text-slate-400 flex-1">Adhesivo + fragüe + esquinero automáticos</span>}
                  </div>
                </div>
              );})}
              {hasTina&&<div className="bg-slate-800/60 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2 mb-1"><span className="text-[11px] text-amber-400 font-bold uppercase">Faldón Tina</span></div>
                <select className="w-full p-1.5 bg-slate-700 border border-slate-600 rounded text-white text-[11px] outline-none" value={c.termFaldon||'ceramica'} onChange={e=>updConf(actTypId,{termFaldon:e.target.value})}>
                  <option value="ceramica">Cerámica</option>
                  <option value="pintura">Pintura</option>
                </select>
              </div>}
              <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-xs text-emerald-300/70 uppercase font-bold mb-2">Insumos automáticos según selección</p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div><span className="text-slate-400">Cerámica:</span> <span className="text-white">{tmCeram.map(m=>m.name.substring(0,25)).join(', ')}</span></div>
                  <div><span className="text-slate-400">Pintura:</span> <span className="text-white">{tmPintInsumo.map(m=>m.name.substring(0,25)).join(', ')}</span></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">+ Fijos: impermeab. Cave Polflex, guardapolvo, molduras ({fmtC(fijosCost)})</p>
              </div>
            </div>
          </div>
        </div>
      );}
      case 'piso': {
        const pisoAll = mats.filter(m=>m.cat==='PISO');
        const pisoMats = pisoAll.filter(m=>m.pisoGroup);
        const pisoInsumos = pisoAll.filter(m=>!m.pisoGroup);
        const selPiso = pisoAll.find(m=>m.id===c.pisoMat);
        const pisoTypes = [{v:'ceramica',l:'Cerámica'},{v:'vinilico',l:'Vinílico'},{v:'porcelanato',l:'Porcelanato'}];
        const cajas = selPiso ? Math.ceil(cm.floorArea/2.34) : 0;
        const pisoCost = selPiso ? cajas*selPiso.cost : 0;
        const insumoCost = pisoInsumos.reduce((s,m)=>s+(m.baseQty*m.cost),0);
        return(
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden text-white">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
              <h4 className="font-bold text-blue-400 text-sm uppercase">Terminación Piso</h4>
              <span className="text-[10px] text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded font-bold">Área: {fmtN(cm.floorArea)} m²</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                {pisoTypes.map(pt=><button key={pt.v} onClick={()=>updConf(actTypId,{pisoType:pt.v})} className={`flex-1 py-2 rounded-lg text-xs font-bold ${c.pisoType===pt.v?'bg-blue-600 text-white':'bg-slate-800 text-slate-400 border border-slate-700'}`}>{pt.l}</button>)}
              </div>
              <select className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs outline-none" value={c.pisoMat||''} onChange={e=>updConf(actTypId,{pisoMat:e.target.value})}>
                <option value="">Seleccionar material...</option>
                {pisoMats.filter(m=>m.pisoGroup===c.pisoType).map(o=><option key={o.id} value={o.id}>{o.name} — {fmtC(o.cost)}</option>)}
              </select>
              {selPiso&&<div className="bg-slate-800/60 rounded-xl p-3 text-[11px] text-slate-300"><span className="text-emerald-400 font-bold">{cajas} cajas</span> ({fmtN(cm.floorArea)} m² / 2,34 m²/caja) = {fmtC(pisoCost)}</div>}
              <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-4 flex justify-between items-center">
                <div><p className="text-xs text-emerald-300/70 uppercase font-bold">Total piso por POD</p></div>
                <div className="text-right"><p className="text-2xl font-black text-emerald-400">{fmtC(pisoCost+insumoCost)}</p><p className="text-xs text-emerald-300/60 mt-0.5">{fmtUF(pisoCost+insumoCost)}</p></div>
              </div>
            </div>
          </div>
        </div>
      );}
      case 'puertas': {
        const prtAll = mats.filter(m=>m.cat==='PUERTAS');
        const prtSlots = [{key:'puertaMat',slot:'puerta',label:'Puerta'},{key:'cerraduraMat',slot:'cerradura',label:'Cerradura'}];
        const prtInsumos = prtAll.filter(m=>!m.slot);
        const selCost = prtSlots.reduce((s,ps)=>{const sel=prtAll.find(m=>m.id===c[ps.key]);return s+(sel?sel.cost*(Number(c.puertaQty)||1):0);},0);
        const insumoCost = prtInsumos.reduce((s,m)=>s+(m.baseQty*m.cost),0);
        return(
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden text-white">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
              <h4 className="font-bold text-blue-400 text-sm uppercase">Puertas</h4>
              <span className="text-[10px] text-amber-400 bg-amber-900/50 px-2 py-1 rounded font-bold">{Number(c.puertaQty)||1} un/POD</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-slate-800/60 rounded-xl p-3 space-y-2">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Cantidad por POD</label>
                <input type="number" min="1" max="4" className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs outline-none" value={c.puertaQty||1} onChange={e=>updConf(actTypId,{puertaQty:Number(e.target.value)})}/>
              </div>
              {prtSlots.map(ps=>{const opts=prtAll.filter(m=>m.slot===ps.slot);return(
                <div key={ps.key} className="bg-slate-800/60 rounded-xl p-3 space-y-2">
                  <h5 className="text-[11px] text-blue-400 font-bold uppercase">{ps.label}</h5>
                  <select className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs outline-none" value={c[ps.key]||''} onChange={e=>updConf(actTypId,{[ps.key]:e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {opts.map(o=><option key={o.id} value={o.id}>{o.name} — {fmtC(o.cost)}</option>)}
                  </select>
                </div>
              );})}
              <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-4 flex justify-between items-center">
                <div><p className="text-xs text-emerald-300/70 uppercase font-bold">Total puertas por POD</p><p className="text-[10px] text-slate-400 mt-0.5">Seleccionables ({fmtC(selCost)}) + insumos ({fmtC(insumoCost)})</p></div>
                <div className="text-right"><p className="text-2xl font-black text-emerald-400">{fmtC(selCost+insumoCost)}</p><p className="text-xs text-emerald-300/60 mt-0.5">{fmtUF(selCost+insumoCost)}</p></div>
              </div>
              {prtInsumos.length>0&&<div className="bg-slate-800/50 rounded-xl overflow-hidden"><div className="p-3 border-b border-slate-700/50"><span className="text-[10px] text-slate-400 uppercase font-bold">Insumos instalación (automáticos)</span></div><div className="max-h-32 overflow-y-auto">{prtInsumos.map(m=><div key={m.id} className="flex items-center justify-between px-3 py-1 border-b border-slate-700/30 text-[11px]"><span className="text-slate-300 flex-1 truncate mr-2">{m.name}</span><span className="text-white font-medium w-16 text-right shrink-0">{fmtC(m.baseQty*m.cost)}</span></div>)}</div></div>}
            </div>
          </div>
        </div>
      );}
      case 'accesorios': {
        const accAll = mats.filter(m=>m.cat==='ACCESORIOS'&&!m.draft);
        const accSlots = [{slot:'percha',label:'Percha',confKey:'accPercha'},{slot:'portarollo',label:'Portarollo',confKey:'accPortarollo'},{slot:'toallero',label:'Toallero',confKey:'accToallero'}];
        const accFijos = accAll.filter(m=>!m.slot);
        const accTotal = accSlots.reduce((s,sl)=>{const sel=accAll.find(m=>m.id===c[sl.confKey]);return s+(sel?sel.baseQty*sel.cost:0);},0) + accFijos.reduce((s,m)=>s+(m.baseQty*m.cost),0);
        return(
        <div className="space-y-4"><div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden text-white">
          <div className="p-4 border-b border-slate-700/50 flex justify-between items-center"><h4 className="font-bold text-blue-400 text-sm uppercase">Accesorios</h4></div>
          <div className="p-5 space-y-4">
            {accSlots.map(sl=>{const opts=accAll.filter(m=>m.slot===sl.slot);return opts.length>0?(
              <div key={sl.slot} className="bg-slate-800/60 rounded-xl p-3 space-y-2">
                <label className="text-[10px] text-slate-400 uppercase font-bold">{sl.label}</label>
                <select className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs outline-none" value={c[sl.confKey]||''} onChange={e=>updConf(actTypId,{[sl.confKey]:e.target.value})}>
                  <option value="">Sin {sl.label.toLowerCase()}</option>
                  {opts.map(o=><option key={o.id} value={o.id}>{o.name} — {fmtC(o.cost)}</option>)}
                </select>
              </div>):null;})}
            <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-4 flex justify-between items-center">
              <p className="text-xs text-emerald-300/70 uppercase font-bold">Total accesorios por POD</p>
              <div className="text-right"><p className="text-2xl font-black text-emerald-400">{fmtC(accTotal)}</p><p className="text-xs text-emerald-300/60 mt-0.5">{fmtUF(accTotal)}</p></div>
            </div>
            {accFijos.length>0&&<div className="bg-slate-800/50 rounded-xl overflow-hidden"><div className="p-3 border-b border-slate-700/50"><span className="text-[10px] text-slate-400 uppercase font-bold">Insumos fijos</span></div><div className="max-h-32 overflow-y-auto">{accFijos.map(m=><div key={m.id} className="flex items-center justify-between px-3 py-1 border-b border-slate-700/30 text-[11px]"><span className="text-slate-300 flex-1 truncate mr-2">{m.name}</span><span className="text-white font-medium w-16 text-right shrink-0">{fmtC(m.baseQty*m.cost)}</span></div>)}</div></div>}
          </div>
        </div></div>);
      }
      case 'insumos': {
        const gi=mats.filter(m=>m.cat==='INSUMOS GENERALES');const gt=gi.reduce((s,m)=>s+(m.baseQty*m.cost),0);
        return <AutoStage title="Insumos Generales" badge="Fijo por POD" items={gi} total={gt} desc="Consumibles de fabricación: cintas, film stretch, rodillo púas, tarugos, adhesivo tapagoteras, spray marcado. Fijos por POD."/>;
      }
      default: return(
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-blue-200 rounded-xl bg-white">
          <Wrench size={32} className="text-blue-300 mb-3"/>
          <h4 className="font-bold text-slate-700 mb-2">Listo para Parametrizar</h4>
          <p className="text-sm text-slate-500">Selecciona materiales de la base de datos para esta partida.</p>
        </div>
      );
    }
  };
const AutoStage=({title,badge,badgeColor,desc,items,total,subtitle,children})=>(
<div className="space-y-4"><div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden text-white">
<div className="p-4 border-b border-slate-700/50 flex justify-between items-center"><h4 className="font-bold text-blue-400 text-sm uppercase">{title}</h4><span className={`text-[10px] ${badgeColor||'text-amber-400 bg-amber-900/50'} px-2 py-1 rounded font-bold`}>{badge}</span></div>
<div className="p-5 space-y-4">{children}
<div className="bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-4 flex justify-between items-center"><div><p className="text-xs text-emerald-300/70 uppercase font-bold">{subtitle||'Total por POD'}</p></div><div className="text-right"><p className="text-2xl font-black text-emerald-400">{fmtC(total)}</p><p className="text-xs text-emerald-300/60 mt-0.5">{fmtUF(total)}</p></div></div>
{items.length>0&&<div className="bg-slate-800/50 rounded-xl overflow-hidden"><div className="p-3 border-b border-slate-700/50 flex justify-between"><span className="text-[10px] text-slate-400 uppercase font-bold">Composición</span><span className="text-[10px] text-slate-500">{items.length} ítems</span></div><div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-600/50 bg-slate-700/40"><span className="text-[9px] text-slate-400 uppercase font-bold flex-1">Material</span><span className="text-[9px] text-slate-400 uppercase font-bold w-12 text-right shrink-0">Qty/POD</span><span className="text-[9px] text-slate-400 uppercase font-bold w-16 text-right shrink-0">Costo/POD</span></div><div className="max-h-40 overflow-y-auto">{items.map(m=><div key={m.id} className="flex items-center justify-between px-3 py-1 border-b border-slate-700/30 text-[11px]"><span className="text-slate-300 flex-1 truncate mr-2">{m.name}</span><span className="text-slate-500 w-12 text-right shrink-0">{m.calcQty!=null?m.calcQty:m.baseQty}</span><span className="text-white font-medium w-16 text-right shrink-0">{fmtC(m.calcCost!=null?m.calcCost:(m.baseQty*m.cost))}</span></div>)}</div></div>}
</div></div>{desc&&<div className="bg-slate-100 border rounded-xl p-3 text-xs text-slate-600 mt-2">{desc}</div>}</div>);
  const ctx = useMemo(() => ({
    data: { mats, typs, proj, calc, actTyp, actTypId, crmProjects, crmLoading },
    nav: { tab, setTab, expStage, setExpStage, selCat, setSelCat },
    setters: { setMats, setTyps, setProj, setActTypId },
    business: { addTyp, updTyp, delTyp, updGeom, updConf, addSide, rmSide, updSide, uploadFile, directTS, saveMaterial, deleteMaterial, swapMaterial, clearAll, exportXls, dlTemplate, loadCRMProject, procTS },
    io: { nfy, busy, setBusy },
  }), [mats, typs, proj, calc, actTyp, actTypId, crmProjects, crmLoading, tab, expStage, selCat, busy]);
  const navTabs=[{id:'project',icon:<Layers size={18}/>,l:'Proyecto'},{id:'design',icon:<LayoutGrid size={18}/>,l:'Diseño'},{id:'bom',icon:<Calculator size={18}/>,l:'BOM'},{id:'dashboard',icon:<LayoutDashboard size={18}/>,l:'Dashboard'},{id:'database',icon:<Database size={18}/>,l:'Data'}];
  return(
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}.cscr::-webkit-scrollbar{height:6px}.cscr::-webkit-scrollbar-track{background:#f1f5f9;border-radius:3px}.cscr::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}`}</style>
      <Notify n={notif} onClose={()=>setNotif(null)}/>
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 py-2 shadow-sm flex justify-between items-center z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" onClick={()=>setMobMenu(!mobMenu)}><Menu size={22}/></button>
          <MAYU_LOGO_SVG s={40}/>
          <div><h1 className="text-lg font-bold leading-tight" style={{color:'#2c2c2a'}}>Cotizador de PODs</h1><p className="text-[10px] font-medium tracking-widest uppercase hidden sm:block" style={{color:'#9B9B5B'}}>Motor Paramétrico de Costos</p></div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border" style={{color:'#9B9B5B',borderColor:'#d4d0c8'}}><div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor:'#9B9B5B'}}/><span className="hidden sm:inline">v2.0</span></div>
      </header>
      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR */}
        <nav className={`${mobMenu?'translate-x-0':'-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-52 bg-white border-r p-3 flex flex-col gap-1 shrink-0 transition-transform duration-200 pt-16 lg:pt-3`}>
          <button className="lg:hidden absolute top-3 right-3 p-1 hover:bg-slate-100 rounded" onClick={()=>setMobMenu(false)}><X size={20}/></button>
          {navTabs.map(t=><button key={t.id} onClick={()=>{setTab(t.id);setMobMenu(false);}} className={`flex items-center gap-3 p-3 rounded-xl text-left text-sm ${tab===t.id?'bg-amber-50 text-amber-800 font-bold':'hover:bg-slate-100 text-slate-600'}`}>{t.icon} {t.l}</button>)}
          <div className="mt-auto pt-4 border-t border-slate-100"><div className="text-[10px] text-slate-400 font-medium px-3 space-y-1"><p>PODs: <span className="text-blue-600 font-bold text-xs">{calc.totalPods}</span></p><p>Costo: <span className="font-bold text-xs">{fmtC(calc.totals.directCost)}</span></p></div></div>
        </nav>
        {mobMenu&&<div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={()=>setMobMenu(false)}/>}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          {/* TAB PROJECT */}
          {tab==='project'&&<ProjectView ctx={ctx}/>}
          {/* TAB DESIGN */}
          {tab==='design'&&(
            <div className="max-w-7xl mx-auto" style={{animation:'slideUp .3s ease'}}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b pb-4 gap-3">
                <h2 className="text-2xl font-bold">Diseño & Parametría</h2>
                <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-xl border shadow-sm"><label className="font-bold text-slate-500 text-sm">Diseñando:</label><select value={actTypId} onChange={e=>setActTypId(e.target.value)} className="p-1 border-0 bg-transparent text-blue-700 font-black outline-none cursor-pointer text-base">{typs.map(t=><option key={t.id} value={t.id}>{t.name} ({t.count})</option>)}</select></div>
              </div>
              <div className="flex bg-slate-200 p-1 rounded-xl w-max mb-6">
                <button onClick={()=>updGeom(actTypId,{mode:'rect'})} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${actTyp.geometry.mode==='rect'?'bg-white shadow text-blue-600':'text-slate-500'}`}><Square size={16}/> Rectangular</button>
                <button onClick={()=>updGeom(actTypId,{mode:'polygon'})} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${actTyp.geometry.mode==='polygon'?'bg-white shadow text-blue-600':'text-slate-500'}`}><Hexagon size={16}/> Polígono</button>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-5"><Ruler size={20}/> Dimensiones</h3>
                    {actTyp.geometry.mode==='rect'?
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div><label className="block text-xs font-medium text-slate-500 mb-1">Largo (m)</label><input type="number" step="0.01" className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold" value={actTyp.geometry.length} onChange={e=>updGeom(actTypId,{length:Number(e.target.value)})}/></div>
                        <div><label className="block text-xs font-medium text-slate-500 mb-1">Ancho (m)</label><input type="number" step="0.01" className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold" value={actTyp.geometry.width} onChange={e=>updGeom(actTypId,{width:Number(e.target.value)})}/></div>
                        <div><label className="block text-xs font-medium text-slate-500 mb-1">Alto (m)</label><input type="number" step="0.01" className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold" value={actTyp.geometry.height} onChange={e=>updGeom(actTypId,{height:Number(e.target.value)})}/></div>
                      </div>
                    :<>
                      <div className="flex justify-between items-center mb-4"><span className="text-xs font-medium text-slate-500">Alto (m)</span><input type="number" step="0.01" className="w-24 p-2 border rounded-lg outline-none text-sm font-semibold" value={actTyp.geometry.height} onChange={e=>updGeom(actTypId,{height:Number(e.target.value)})}/></div>
                      <div className="bg-slate-50 border rounded-xl overflow-hidden mb-4"><table className="w-full text-sm"><thead className="bg-slate-100 text-slate-600"><tr><th className="p-2 w-10 text-center">#</th><th className="p-2">Dir</th><th className="p-2">Largo</th><th className="p-2 w-12"></th></tr></thead><tbody>{(actTyp.geometry.polygonSides||[]).map((s,i)=><tr key={s.id} className="border-t bg-white"><td className="p-2"><div className="flex items-center justify-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:STROKE_COLORS[i%STROKE_COLORS.length]}}></span><span className="text-xs text-slate-400">{i+1}</span></div></td><td className="p-2"><select className="w-full p-1.5 border rounded text-xs outline-none" value={s.dir} onChange={e=>updSide(actTypId,s.id,'dir',e.target.value)}><option value="U">↑</option><option value="R">→</option><option value="D">↓</option><option value="L">←</option></select></td><td className="p-2"><input type="number" step="0.01" className="w-full p-1.5 border rounded text-xs outline-none" value={s.len} onChange={e=>updSide(actTypId,s.id,'len',e.target.value)}/></td><td className="p-2 text-center"><button onClick={()=>rmSide(actTypId,s.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>
                      <button onClick={()=>addSide(actTypId)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"><Plus size={16}/> Tramo</button>
                    </>}
                    {/* PUERTA */}
                    <div className="mt-5 pt-5 border-t border-slate-100">
                      <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-3 text-sm"><DoorOpen size={18} className="text-blue-500"/> Vano de Puerta</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div><label className="block text-xs font-medium text-slate-500 mb-1">Ancho (m)</label><input type="number" step="0.01" className="w-full p-2 border rounded-lg outline-none text-sm font-semibold" value={actTyp.geometry.doorWidth} onChange={e=>updGeom(actTypId,{doorWidth:Number(e.target.value)})}/></div>
                        <div><label className="block text-xs font-medium text-slate-500 mb-1">Alto (m)</label><input type="number" step="0.01" className="w-full p-2 border rounded-lg outline-none text-sm font-semibold" value={actTyp.geometry.doorHeight} onChange={e=>updGeom(actTypId,{doorHeight:Number(e.target.value)})}/></div>
                        <div><label className="block text-xs font-medium text-slate-500 mb-1">Cantidad</label><input type="number" min="0" className="w-full p-2 border rounded-lg outline-none text-sm font-semibold" value={actTyp.geometry.doorCount} onChange={e=>updGeom(actTypId,{doorCount:Number(e.target.value)})}/></div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Descuento: {fmtN((actTyp.geometry.doorCount||1)*(actTyp.geometry.doorWidth||.75)*(actTyp.geometry.doorHeight||2))} m²</p>
                    </div>
                    {/* PREVIEW */}
                    <div className="mt-5 bg-slate-900 rounded-xl relative border border-slate-800 overflow-hidden" style={{height: actTyp.geometry.mode==='polygon' ? '13rem' : '12rem'}}>
                      <div className="absolute top-2 left-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider z-10">Preview 2D</div>
                      <div className="absolute inset-0 flex items-center justify-center p-6 pt-8" style={{bottom: actTyp.geometry.mode==='polygon' ? '1.75rem' : '0'}}>{renderSVG()}</div>
                      {actTyp.geometry.mode==='polygon'&&<div className={`absolute bottom-0 left-0 right-0 p-1.5 text-xs text-center font-medium border-t z-10 ${cm.isClosed?'bg-emerald-900/80 text-emerald-400 border-emerald-800':'bg-red-900/80 text-red-400 border-red-800'}`}>{cm.isClosed?'✓ Cerrado':'⚠ Abierto'}</div>}
                    </div>
                  </div>
                  {/* ELEVACIONES */}
                  <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><PanelBottom size={20}/> Elevaciones</h3>
                    <div className="flex gap-2 overflow-x-auto pb-4 items-end bg-slate-50 p-4 rounded-xl border cscr">
                      {wallData.map((w,i)=>{const ww=Math.max(w.len*40,40);const hh=Math.max((Number(actTyp.geometry.height)||0)*40,40);return(<div key={i} className="flex flex-col items-center flex-shrink-0"><div className="bg-white border-4 border-b-8 flex flex-col items-center justify-center shadow-sm rounded-sm" style={{width:`${ww}px`,height:`${hh}px`,borderColor:w.c}}><span className="text-[10px] font-bold text-slate-400">{w.l}</span><span className="text-sm font-black text-slate-700">{fmtN(w.area)}</span></div><span className="text-[10px] font-mono font-bold text-slate-500 mt-2 bg-slate-200 px-2 py-0.5 rounded">{fmtN(w.len)}m</span></div>);})}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-6 pt-4 border-t">
                      {[['Perímetro',fmtN(cm.perimeter),'ml',false],['Área Piso',fmtN(cm.floorArea),'m²',false],['Muros Neto',fmtN(cm.netWallArea),'m²',true],['Cielo',fmtN(cm.ceilingArea),'m²',false]].map(([l,v,u,a])=><div key={l}><span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{l}</span><span className={`text-lg font-black ${a?'text-blue-600':'text-slate-700'}`}>{v} <span className="text-xs font-medium text-slate-400">{u}</span></span></div>)}
                    </div>
                  </div>
                </div>
                {/* TIMELINE */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 text-lg mb-2">Línea de Fabricación</h3>
                  {STAGES.map((st,idx)=>{const open=expStage===st.id;const done=isStageDone(st.id);const Ic=st.icon;return(
                    <div key={st.id} className={`bg-white rounded-2xl border shadow-sm ${open?'border-blue-300 ring-2 ring-blue-50':'hover:border-slate-300'}`}>
                      <button onClick={()=>setExpStage(open?null:st.id)} className="w-full flex items-center justify-between p-4 focus:outline-none">
                        <div className="flex items-center gap-3"><span className={`w-7 h-7 rounded-lg flex items-center justify-center ${open?'bg-blue-600 text-white':done?'bg-emerald-100 text-emerald-600':'bg-slate-100 text-slate-400'}`}><Ic size={14}/></span><span className={`font-semibold text-sm ${open?'text-blue-700':'text-slate-700'}`}>{st.label.substring(3)}</span></div>
                        <div className="flex items-center gap-3">{done&&!open&&<span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">✓</span>}{open?<ChevronDown size={18} className="text-blue-600"/>:<ChevronRight size={18} className="text-slate-400"/>}</div>
                      </button>
                      {open&&<div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">{stageUI(st.id)}</div>}
                    </div>
                  );})}
                  {/* LABOR */}
                  <div className="bg-white rounded-2xl border shadow-sm p-5 mt-4">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-3"><CircleDollarSign size={18} className="text-amber-500"/> Mano de Obra</h4>
                    <p className="text-xs text-slate-500 mb-3">Configura en pestaña Proyecto (columna M.O./POD).</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between items-center"><span className="text-sm text-amber-800 font-medium">M.O./POD:</span><span className="text-lg font-bold text-amber-700">{fmtC(actTyp.config.laborCostPerPod||0)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* TAB BOM */}
          {tab==='bom'&&<BomView ctx={ctx}/>}
          {/* TAB DASHBOARD */}
          {tab==='dashboard'&&<DashboardView ctx={ctx}/>}
          {/* TAB DATABASE */}
          {tab==='database'&&<DatabaseView ctx={ctx}/>}
        </main>
      {selCat&&calc.bomByCategory[selCat]&&(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col" style={{animation:'scaleIn .2s ease'}}>
            <div className="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl"><div><div className="flex items-center gap-2 text-blue-600 mb-1"><Layers size={20}/><span className="text-xs font-bold uppercase tracking-wider">{selCat}</span></div><p className="text-sm text-slate-500">{calc.bomByCategory[selCat].length} productos · {fmtC(calc.costsByCategory[selCat]?.totalCost||0)}</p></div><button onClick={()=>setSelCat(null)} className="text-slate-400 hover:text-slate-700 bg-slate-200 p-2 rounded-full"><X size={20}/></button></div>
            <div className="flex-1 overflow-y-auto p-6"><table className="w-full text-left border-collapse"><thead><tr className="bg-slate-100 text-slate-600 text-xs uppercase"><th className="p-3 border-b">ID</th><th className="p-3 border-b">Descripción</th><th className="p-3 border-b">Pres.</th><th className="p-3 border-b text-right">Cant. Compra</th><th className="p-3 border-b text-right">P.U.</th><th className="p-3 border-b text-right">Costo Total</th></tr></thead><tbody className="text-sm">
              {calc.bomByCategory[selCat].map((it,idx)=>{const hasWaste=it.purchaseQty>it.realQty*1.01;return(<tr key={idx} className="border-b hover:bg-slate-50"><td className="p-3"><span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{it.key}</span></td><td className="p-3 font-semibold text-slate-800">{it.name}</td><td className="p-3"><span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{it.pres}</span></td><td className="p-3 text-right"><span className="font-bold text-blue-600">{fmtN(it.purchaseQty)}</span>{hasWaste&&<span className="block text-[10px] text-slate-400">({fmtN(it.realQty)} teórico)</span>}</td><td className="p-3 text-right text-slate-500">{fmtC(it.cost)}</td><td className="p-3 text-right font-bold border-l text-slate-800">{fmtC(it.materialCost)}</td></tr>);})}
            </tbody></table></div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}