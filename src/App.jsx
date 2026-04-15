// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Database, Layers, LayoutDashboard, LayoutGrid, Menu, X } from 'lucide-react';
import { UF_VALUE, REND_ADHESIVO_M2_SACO, REND_FRAGUE_M2_SACO, REND_ESPACIADOR_M2_BOLSA, REND_ESQUINERO_ML_TIRA, REND_PASTA_M2_SACO, REND_LATEX_M2_TINETA, REND_ESMALTE_M2_TINETA, REND_CUARZ_M2_TINETA, REND_MORTERO_M2_SACO, EST_REF_AREA_NETA, EST_MERMA, BASE_REF_AREA_PISO } from './constants/economics.js';
import { defGeom, defConf, defTyp } from './constants/defaults.js';
import { classifyToStage } from './utils/classify.js';
import { fmtC, fmtN } from './utils/format.js';
import { DEMO_MATS } from './constants/demoMats.js';
import { MAYU_LOGO_SVG } from './components/ui/MayuLogo.jsx';
import { Notify } from './components/ui/Notify.jsx';
import { useNotification } from './hooks/useNotification.js';
import ProjectView from './views/ProjectView.jsx';
import BomView from './views/BomView.jsx';
import DashboardView from './views/DashboardView.jsx';
import DatabaseView from './views/DatabaseView.jsx';
import DesignView from './views/DesignView.jsx';
const useCRMProjects = () => { const [crmProjects] = useState([]); const [crmLoading] = useState(false); return { crmProjects, crmLoading }; };

export default function App() {
  const [tab,setTab] = useState('project');
  const [selCat,setSelCat] = useState(null);
  const [busy,setBusy] = useState(false);
  const [expStage,setExpStage] = useState('estructura');
  const [notif, nfy] = useNotification(4000);
  const [mobMenu,setMobMenu] = useState(false);
  const [mats,setMats] = useState([]);
  const [proj,setProj] = useState(()=>{try{const s=localStorage.getItem('mayu_proj');return s?JSON.parse(s):{name:'Cotización B2B',client:'',clientRut:'',clientAddress:'',clientPhone:'',clientEmail:'',contactName:'',marginPct:20,contingencyPct:5};}catch(e){return{name:'Cotización B2B',client:'',clientRut:'',clientAddress:'',clientPhone:'',clientEmail:'',contactName:'',marginPct:20,contingencyPct:5};}});
  const [typs,setTyps] = useState(()=>{try{const s=localStorage.getItem('mayu_typs');return s?JSON.parse(s):[defTyp];}catch(e){return[defTyp];}});
  const [actTypId,setActTypId] = useState(typs[0]?.id);
  const { crmProjects, crmLoading } = useCRMProjects();
  const actTyp = useMemo(()=>typs.find(t=>t.id===actTypId)||typs[0]||defTyp,[typs,actTypId]);
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
  const clearAll=()=>{localStorage.removeItem('mayu_materialsDb');localStorage.removeItem('mayu_proj');localStorage.removeItem('mayu_typs');setMats([]);setProj({name:'Nuevo Proyecto',client:'',clientRut:'',clientAddress:'',clientPhone:'',clientEmail:'',contactName:'',marginPct:20,contingencyPct:5});const nid=`typ-${Date.now()}`;setTyps([{...defTyp,id:nid}]);setActTypId(nid);nfy("Memoria borrada.");};
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
  const ctx = useMemo(() => ({
    data: { mats, typs, proj, calc, actTyp, actTypId, crmProjects },
    nav: { tab, setTab, expStage, setExpStage, selCat, setSelCat },
    setters: { setMats, setTyps, setProj, setActTypId },
    business: { addTyp, updTyp, delTyp, updGeom, updConf, addSide, rmSide, updSide, uploadFile, directTS, saveMaterial, deleteMaterial, swapMaterial, clearAll, exportXls, dlTemplate, loadCRMProject, procTS },
    io: { nfy, busy, setBusy },
  }), [mats, typs, proj, calc, actTyp, actTypId, crmProjects, tab, expStage, selCat, busy]);
  const navTabs=[{id:'project',icon:<Layers size={18}/>,l:'Proyecto'},{id:'design',icon:<LayoutGrid size={18}/>,l:'Diseño'},{id:'bom',icon:<Calculator size={18}/>,l:'BOM'},{id:'dashboard',icon:<LayoutDashboard size={18}/>,l:'Dashboard'},{id:'database',icon:<Database size={18}/>,l:'Data'}];
  return(
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}.cscr::-webkit-scrollbar{height:6px}.cscr::-webkit-scrollbar-track{background:#f1f5f9;border-radius:3px}.cscr::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}`}</style>
      <Notify n={notif} onClose={()=>nfy(null)}/>
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
          {tab==='design'&&<DesignView ctx={ctx}/>}
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