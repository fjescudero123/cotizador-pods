import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const COL_MATERIALS = 'pod_materials';
const COL_QUOTES = 'pod_quotes';
const COL_CONFIG = 'pod_config';
const COL_CRM_PROJECTS = 'projects';

const LS_MATERIALS = 'mayu_materialsDb';
const LS_CONFIG = 'mayu_pod_config';

// ═══════════════════════════════════════════════════════
//  MATERIALES — pod_materials
// ═══════════════════════════════════════════════════════

export async function loadMaterials() {
  try {
    const snap = await getDocs(collection(db, COL_MATERIALS));
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ ...d.data(), _docId: d.id }));
      localStorage.setItem(LS_MATERIALS, JSON.stringify(items));
      return { items, source: 'firestore' };
    }
  } catch (err) {
    console.warn('[loadMaterials] Firestore error, intentando localStorage:', err.message);
  }
  try {
    const raw = localStorage.getItem(LS_MATERIALS);
    if (raw) {
      const items = JSON.parse(raw);
      if (items.length > 0) return { items, source: 'localStorage' };
    }
  } catch (e) {
    console.warn('[loadMaterials] localStorage parse error:', e);
  }
  return { items: [], source: 'empty' };
}

export async function saveMaterial(mat) {
  const docId = mat.id || mat._docId || `mat_${Date.now()}`;
  const data = { ...mat, updatedAt: serverTimestamp() };
  delete data._docId;
  try {
    await setDoc(doc(db, COL_MATERIALS, docId), data, { merge: true });
  } catch (err) {
    console.warn('[saveMaterial] Firestore write failed:', err.message);
  }
  _updateLocalMaterial(docId, data);
}

export async function saveMaterialsBatch(materials) {
  const CHUNK = 450;
  try {
    for (let i = 0; i < materials.length; i += CHUNK) {
      const chunk = materials.slice(i, i + CHUNK);
      const batch = writeBatch(db);
      chunk.forEach((mat) => {
        const docId = mat.id || `mat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const data = { ...mat, updatedAt: serverTimestamp() };
        delete data._docId;
        batch.set(doc(db, COL_MATERIALS, docId), data, { merge: true });
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('[saveMaterialsBatch] Firestore batch failed:', err.message);
  }
  localStorage.setItem(LS_MATERIALS, JSON.stringify(materials));
}

export async function deleteMaterial(matId) {
  try {
    await deleteDoc(doc(db, COL_MATERIALS, matId));
  } catch (err) {
    console.warn('[deleteMaterial] Firestore delete failed:', err.message);
  }
  try {
    const raw = localStorage.getItem(LS_MATERIALS);
    if (raw) {
      const items = JSON.parse(raw).filter((m) => m.id !== matId);
      localStorage.setItem(LS_MATERIALS, JSON.stringify(items));
    }
  } catch (e) {}
}

export function onMaterialsChange(callback) {
  return onSnapshot(
    collection(db, COL_MATERIALS),
    (snap) => {
      const items = snap.docs.map((d) => ({ ...d.data(), _docId: d.id }));
      callback(items);
    },
    (err) => {
      console.warn('[onMaterialsChange] snapshot error:', err.message);
    }
  );
}

function _updateLocalMaterial(docId, data) {
  try {
    const raw = localStorage.getItem(LS_MATERIALS);
    let items = raw ? JSON.parse(raw) : [];
    const idx = items.findIndex((m) => m.id === docId);
    const clean = { ...data };
    if (clean.updatedAt && typeof clean.updatedAt !== 'string') {
      clean.updatedAt = new Date().toISOString();
    }
    if (idx >= 0) items[idx] = { ...items[idx], ...clean };
    else items.push({ ...clean, id: docId });
    localStorage.setItem(LS_MATERIALS, JSON.stringify(items));
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════
//  COTIZACIONES — pod_quotes
// ═══════════════════════════════════════════════════════

export async function saveQuote(quoteData, crmProjectId = null) {
  const quoteId = `COT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const data = {
    quoteId,
    ...quoteData,
    crmProjectId: crmProjectId || null,
    createdAt: serverTimestamp(),
    status: 'draft',
  };
  try {
    const docRef = doc(db, COL_QUOTES, quoteId);
    await setDoc(docRef, data);
    return quoteId;
  } catch (err) {
    console.warn('[saveQuote] Firestore write failed:', err.message);
    try {
      const saved = JSON.parse(localStorage.getItem('mayu_quotes') || '[]');
      saved.push({ ...data, createdAt: new Date().toISOString() });
      localStorage.setItem('mayu_quotes', JSON.stringify(saved));
    } catch (e) {}
    return quoteId;
  }
}

export async function loadQuotes(crmProjectId = null) {
  try {
    let q;
    if (crmProjectId) {
      q = query(
        collection(db, COL_QUOTES),
        where('crmProjectId', '==', crmProjectId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, COL_QUOTES), orderBy('createdAt', 'desc'));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), _docId: d.id }));
  } catch (err) {
    console.warn('[loadQuotes] Firestore read failed:', err.message);
    try {
      const saved = JSON.parse(localStorage.getItem('mayu_quotes') || '[]');
      return crmProjectId ? saved.filter((q) => q.crmProjectId === crmProjectId) : saved;
    } catch (e) {
      return [];
    }
  }
}

export async function updateQuoteStatus(quoteId, status) {
  try {
    await updateDoc(doc(db, COL_QUOTES, quoteId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('[updateQuoteStatus] failed:', err.message);
  }
}

// ═══════════════════════════════════════════════════════
//  CONFIGURACIÓN — pod_config
// ═══════════════════════════════════════════════════════

const CONFIG_DOC_ID = 'default';

export const DEFAULT_CONFIG = {
  ufValue: 39841.72,
  moCostoMensual: 14840000,
  moPodsSemana: 10,
  rendAdhesivoM2Saco: 3.83,
  rendFragueM2Saco: 11.1,
  rendEspaciadorM2Bolsa: 5,
  rendEsquineroMlTira: 2.5,
  rendPastaM2Saco: 25,
  rendLatexM2Tineta: 100,
  rendEsmalteM2Tineta: 105,
  estRefAreaNeta: 16.74,
  estRefKg: 104.6,
  estMerma: 0.05,
  baseRefAreaPiso: 3.52,
};

export async function loadConfig() {
  try {
    const snap = await getDoc(doc(db, COL_CONFIG, CONFIG_DOC_ID));
    if (snap.exists()) {
      const data = { ...DEFAULT_CONFIG, ...snap.data() };
      localStorage.setItem(LS_CONFIG, JSON.stringify(data));
      return { config: data, source: 'firestore' };
    }
  } catch (err) {
    console.warn('[loadConfig] Firestore error:', err.message);
  }
  try {
    const raw = localStorage.getItem(LS_CONFIG);
    if (raw) return { config: { ...DEFAULT_CONFIG, ...JSON.parse(raw) }, source: 'localStorage' };
  } catch (e) {}
  return { config: { ...DEFAULT_CONFIG }, source: 'defaults' };
}

export async function saveConfig(config) {
  const data = { ...config, updatedAt: serverTimestamp() };
  try {
    await setDoc(doc(db, COL_CONFIG, CONFIG_DOC_ID), data, { merge: true });
  } catch (err) {
    console.warn('[saveConfig] Firestore write failed:', err.message);
  }
  const localData = { ...config, updatedAt: new Date().toISOString() };
  localStorage.setItem(LS_CONFIG, JSON.stringify(localData));
}

export function onConfigChange(callback) {
  return onSnapshot(
    doc(db, COL_CONFIG, CONFIG_DOC_ID),
    (snap) => {
      if (snap.exists()) callback({ ...DEFAULT_CONFIG, ...snap.data() });
    },
    (err) => console.warn('[onConfigChange] error:', err.message)
  );
}

// ═══════════════════════════════════════════════════════
//  PROYECTOS CRM — lectura desde colección `projects`
// ═══════════════════════════════════════════════════════

export function onCRMProjectsChange(callback) {
  const q = query(
    collection(db, COL_CRM_PROJECTS),
    where('linea_negocio', '==', 'Pods'),
    where('estado', '==', 'Antecedentes técnicos recibidos')
  );
  return onSnapshot(
    q,
    (snap) => {
      const projects = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(projects);
    },
    (err) => {
      console.warn('[onCRMProjectsChange] snapshot error:', err.message);
      callback([]);
    }
  );
}

// ═══════════════════════════════════════════════════════
//  PROYECTO + TIPOLOGÍAS — localStorage
// ═══════════════════════════════════════════════════════

export function saveProjectLocal(proj) {
  localStorage.setItem('mayu_proj', JSON.stringify(proj));
}

export function loadProjectLocal() {
  try {
    const raw = localStorage.getItem('mayu_proj');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveTypologiesLocal(typs) {
  localStorage.setItem('mayu_typs', JSON.stringify(typs));
}

export function loadTypologiesLocal() {
  try {
    const raw = localStorage.getItem('mayu_typs');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function migrateLocalToFirestore() {
  try {
    const snap = await getDocs(collection(db, COL_MATERIALS));
    if (!snap.empty) return { migrated: false, reason: 'firestore_not_empty' };
    const raw = localStorage.getItem(LS_MATERIALS);
    if (!raw) return { migrated: false, reason: 'no_local_data' };
    const items = JSON.parse(raw);
    if (!items.length) return { migrated: false, reason: 'empty_local_data' };
    await saveMaterialsBatch(items);
    return { migrated: true, count: items.length };
  } catch (err) {
    return { migrated: false, reason: err.message };
  }
}