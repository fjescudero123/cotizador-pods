import { useSyncExternalStore } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

// Store singleton de la UF. Una sola fuente de verdad consumida por
// `fmtUF`, `App.jsx`, `DashboardView.jsx`, etc. Cachea en Firestore
// `eco_indicators/uf` (compartido entre apps del ecosistema) + localStorage
// para hidratar al primer paint sin parpadeo. Si el cache > 7 dias, refetch
// automatico contra mindicador.cl (API publica gratis, sin auth).

const FALLBACK = 39841.72; // Valor congelado al 27 abr 2026; ultimo recurso si todo falla.
const COL = 'eco_indicators';
const DOC_ID = 'uf';
const STALE_MS = 7 * 24 * 60 * 60 * 1000;
const LS_KEY = 'mayu_uf_cache';

let state = { value: FALLBACK, fetchedAt: null, source: 'fallback', fecha: null };
const listeners = new Set();
let initPromise = null;

function setState(next) {
  state = { ...state, ...next };
  listeners.forEach((cb) => cb());
}

function hydrateFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.value === 'number' && parsed.value > 0) {
      setState({
        value: parsed.value,
        fetchedAt: parsed.fetchedAt || null,
        source: 'localStorage',
        fecha: parsed.fecha || null,
      });
    }
  } catch {}
}

async function fetchFromMindicador() {
  try {
    const res = await fetch('https://mindicador.cl/api/uf');
    if (!res.ok) return null;
    const data = await res.json();
    const today = data?.serie?.[0];
    const valor = Number(today?.valor);
    if (!valor || !Number.isFinite(valor) || valor <= 0) return null;
    return { value: valor, fecha: today?.fecha || null };
  } catch (e) {
    console.warn('[ufStore] mindicador fetch failed:', e?.message);
    return null;
  }
}

export function getUF() {
  return state.value;
}

export function getUFState() {
  return state;
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useUFValue() {
  return useSyncExternalStore(subscribe, getUF, getUF);
}

export function useUFState() {
  return useSyncExternalStore(subscribe, getUFState, getUFState);
}

export function initUF() {
  if (initPromise) return initPromise;
  hydrateFromLocalStorage();
  initPromise = (async () => {
    let cached = null;
    let cachedAtMs = null;
    try {
      const ref = doc(db, COL, DOC_ID);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        cached = snap.data();
        cachedAtMs = cached?.fetchedAt?.toMillis?.() ?? null;
        if (cachedAtMs && Number.isFinite(Number(cached.value))) {
          setState({
            value: Number(cached.value),
            fetchedAt: cachedAtMs,
            source: 'firestore',
            fecha: cached.fecha || null,
          });
          try {
            localStorage.setItem(LS_KEY, JSON.stringify({
              value: Number(cached.value),
              fetchedAt: cachedAtMs,
              fecha: cached.fecha || null,
            }));
          } catch {}
        }
      }
      const fresh = (!cachedAtMs || (Date.now() - cachedAtMs) > STALE_MS)
        ? await fetchFromMindicador()
        : null;
      if (!fresh) return;
      const now = Date.now();
      setState({ value: fresh.value, fetchedAt: now, source: 'mindicador', fecha: fresh.fecha });
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({
          value: fresh.value,
          fetchedAt: now,
          fecha: fresh.fecha,
        }));
      } catch {}
      try {
        await setDoc(doc(db, COL, DOC_ID), {
          value: fresh.value,
          fecha: fresh.fecha,
          fetchedAt: serverTimestamp(),
          source: 'mindicador.cl',
        });
      } catch (e) {
        console.warn('[ufStore] firestore write failed:', e?.message);
      }
    } catch (e) {
      console.warn('[ufStore] init failed:', e?.message);
    }
  })();
  return initPromise;
}
