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
const COL_POD_PROJECTS = 'pod_projects';
const SUB_TYPS = 'typs';

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

// localStorage helpers — usados solo como cache de primer paint.
// La fuente de verdad es siempre Firestore via subscribeProject().
export function saveProjectLocal(proj) {
  try { localStorage.setItem('mayu_proj', JSON.stringify(proj)); } catch (e) {}
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
  try { localStorage.setItem('mayu_typs', JSON.stringify(typs)); } catch (e) {}
}

export function loadTypologiesLocal() {
  try {
    const raw = localStorage.getItem('mayu_typs');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// ═══════════════════════════════════════════════════════
//  PROYECTOS POD — pod_projects + subcolección typs
//  Modelo:
//    pod_projects/{projectId} → { name, proj, updatedAt, createdAt, createdBy }
//    pod_projects/{projectId}/typs/{typId} → { ...typData, order, updatedAt }
//  Backwards-compat: docs legacy traen `typs` array embebido. Se migran on-load.
// ═══════════════════════════════════════════════════════

export async function loadProjectFull(projectId) {
  const ref = doc(db, COL_POD_PROJECTS, projectId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  const typsSnap = await getDocs(
    query(collection(db, COL_POD_PROJECTS, projectId, SUB_TYPS), orderBy('order', 'asc'))
  );
  let typs = typsSnap.docs.map(d => d.data());
  // Legacy: si la subcolección está vacía y el doc principal trae typs embebidos,
  // migramos a subcolección y devolvemos esos typs.
  if (typs.length === 0 && Array.isArray(data.typs) && data.typs.length > 0) {
    typs = data.typs;
    try { await saveTypsBatch(projectId, typs); } catch (e) {
      console.warn('[loadProjectFull] migration to subcollection failed:', e.message);
    }
  }
  return { _id: projectId, ...data, typs };
}

// Listener combinado: doc principal + subcolección typs.
// Llama onUpdate({proj, typs, hasPendingWrites, exists}) en cada cambio remoto.
export function subscribeProject(projectId, onUpdate) {
  let projData = null;
  let typsData = null;
  let projExists = true;
  let projPending = false;
  let typsPending = false;
  let useEmbedded = false;

  const emit = () => {
    if (projData === null && projExists) return;
    onUpdate({
      proj: projData?.proj || null,
      typs: useEmbedded ? (projData?.typs || []) : (typsData || []),
      hasPendingWrites: projPending || typsPending,
      exists: projExists,
      raw: projData,
    });
  };

  const unMain = onSnapshot(
    doc(db, COL_POD_PROJECTS, projectId),
    (snap) => {
      projPending = snap.metadata.hasPendingWrites;
      if (!snap.exists()) {
        projExists = false;
        projData = null;
        emit();
        return;
      }
      projExists = true;
      projData = snap.data();
      emit();
    },
    (err) => console.warn('[subscribeProject:main]', err.message)
  );

  const unTyps = onSnapshot(
    query(collection(db, COL_POD_PROJECTS, projectId, SUB_TYPS), orderBy('order', 'asc')),
    (snap) => {
      typsPending = snap.metadata.hasPendingWrites;
      typsData = snap.docs.map(d => d.data());
      // Si subcolección está vacía pero el doc principal trae typs embebidos (legacy),
      // usar embedded en este snapshot. La migración se dispara en loadProjectFull.
      useEmbedded = typsData.length === 0 && Array.isArray(projData?.typs) && projData.typs.length > 0;
      emit();
    },
    (err) => console.warn('[subscribeProject:typs]', err.message)
  );

  return () => { unMain(); unTyps(); };
}

export async function saveProjectMain(projectId, projData, opts = {}) {
  const { isNew = false, createdBy = 'unknown' } = opts;
  const ref = projectId
    ? doc(db, COL_POD_PROJECTS, projectId)
    : doc(collection(db, COL_POD_PROJECTS));
  const payload = {
    name: projData.name || '',
    proj: projData,
    updatedAt: serverTimestamp(),
    ...(isNew ? { createdAt: serverTimestamp(), createdBy } : {}),
  };
  await setDoc(ref, payload, { merge: !isNew });
  return ref.id;
}

export async function saveTyp(projectId, typ, order = 0) {
  if (!projectId || !typ?.id) return;
  await setDoc(
    doc(db, COL_POD_PROJECTS, projectId, SUB_TYPS, typ.id),
    { ...typ, order, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// Diff dos objetos en paths con dot-notation (para escrituras Firestore granulares).
// Arrays se tratan como atómicos (Firestore no soporta dot-notation con índices numéricos).
// Strings JSON-encoded (ej. termWallCfg) también se tratan como primitivos.
export function diffPaths(oldObj, newObj, prefix = '') {
  const changes = {};
  const a = oldObj || {};
  const b = newObj || {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    const oldVal = a[key];
    const newVal = b[key];
    if (oldVal === newVal) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(newVal) || Array.isArray(oldVal)) {
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[path] = newVal === undefined ? null : newVal;
      }
      continue;
    }
    const aIsObj = typeof oldVal === 'object' && oldVal !== null;
    const bIsObj = typeof newVal === 'object' && newVal !== null;
    if (aIsObj && bIsObj) {
      Object.assign(changes, diffPaths(oldVal, newVal, path));
      continue;
    }
    changes[path] = newVal === undefined ? null : newVal;
  }
  return changes;
}

// Convierte un objeto plano con dot-notation paths a un objeto nested.
// Ej: {'config.artMampara':'X', name:'Y'} → {config:{artMampara:'X'}, name:'Y'}.
// Necesario porque setDoc(merge:true) NO interpreta keys con dots como nested paths
// — los trata como nombres de campo literales (creando campos con dots en el nombre).
// setDoc con objetos nested SÍ hace deep merge (preserva campos hermanos).
function pathsToNested(paths) {
  const result = {};
  for (const [path, value] of Object.entries(paths)) {
    const parts = path.split('.');
    if (parts.length === 1) {
      result[path] = value;
      continue;
    }
    let cur = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      if (typeof cur[k] !== 'object' || cur[k] === null || Array.isArray(cur[k])) cur[k] = {};
      cur = cur[k];
    }
    cur[parts[parts.length - 1]] = value;
  }
  return result;
}

// Escribe campos específicos de un typ con deep merge nativo de Firestore.
// Permite que dos PCs editando campos distintos del mismo typ no se pisen.
export async function saveTypFields(projectId, typId, fields) {
  if (!projectId || !typId || !fields || Object.keys(fields).length === 0) return;
  const nested = pathsToNested(fields);
  nested.updatedAt = serverTimestamp();
  await setDoc(
    doc(db, COL_POD_PROJECTS, projectId, SUB_TYPS, typId),
    nested,
    { merge: true }
  );
}

// Escribe campos específicos del doc principal del proyecto.
export async function saveProjectFields(projectId, fields) {
  if (!projectId || !fields || Object.keys(fields).length === 0) return;
  const nested = pathsToNested(fields);
  nested.updatedAt = serverTimestamp();
  await setDoc(doc(db, COL_POD_PROJECTS, projectId), nested, { merge: true });
}

export async function saveTypsBatch(projectId, typs) {
  if (!projectId || !Array.isArray(typs) || typs.length === 0) return;
  const CHUNK = 450;
  for (let i = 0; i < typs.length; i += CHUNK) {
    const chunk = typs.slice(i, i + CHUNK);
    const batch = writeBatch(db);
    chunk.forEach((t, idx) => {
      if (!t?.id) return;
      batch.set(
        doc(db, COL_POD_PROJECTS, projectId, SUB_TYPS, t.id),
        { ...t, order: i + idx, updatedAt: serverTimestamp() },
        { merge: true }
      );
    });
    await batch.commit();
  }
}

export async function deleteTypDoc(projectId, typId) {
  if (!projectId || !typId) return;
  await deleteDoc(doc(db, COL_POD_PROJECTS, projectId, SUB_TYPS, typId));
}

export async function deleteProjectFull(projectId) {
  if (!projectId) return;
  // Borra todos los docs de la subcolección + doc principal.
  const typsSnap = await getDocs(collection(db, COL_POD_PROJECTS, projectId, SUB_TYPS));
  if (typsSnap.size > 0) {
    const CHUNK = 450;
    const refs = typsSnap.docs.map(d => d.ref);
    for (let i = 0; i < refs.length; i += CHUNK) {
      const batch = writeBatch(db);
      refs.slice(i, i + CHUNK).forEach(r => batch.delete(r));
      await batch.commit();
    }
  }
  await deleteDoc(doc(db, COL_POD_PROJECTS, projectId));
}

export async function duplicateProjectFull(projectId, newName) {
  const original = await loadProjectFull(projectId);
  if (!original) throw new Error('Proyecto origen no existe');
  const newProj = { ...original.proj, name: newName || (original.proj?.name || '') + ' (copia)' };
  const newTyps = (original.typs || []).map(t => ({
    ...t,
    id: `typ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }));
  const newId = await saveProjectMain(null, newProj, { isNew: true });
  await saveTypsBatch(newId, newTyps);
  return { _id: newId, proj: newProj, typs: newTyps };
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