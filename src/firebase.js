import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: atob('QUl6YVN5QXNWZ2Y1R1JSdWYtaE50OU14cENKY2U2d2RiOWhVQjcw'),
  authDomain: 'crm---mayu.firebaseapp.com',
  projectId: 'crm---mayu',
  storageBucket: 'crm---mayu.appspot.com',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// --- Conexion a emuladores locales (VITE_USE_EMULATOR=true en .env.local) ---
if (import.meta.env.VITE_USE_EMULATOR === 'true' && !globalThis.__mayuEmuWired) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  globalThis.__mayuEmuWired = true;
  console.info('[firebase] Emuladores conectados: firestore:8080, auth:9099');
}

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('[Firebase] Persistencia offline no disponible: múltiples tabs abiertos.');
  } else if (err.code === 'unimplemented') {
    console.warn('[Firebase] Persistencia offline no soportada en este navegador.');
  }
});

export const ensureAuth = () =>
  new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth).then((cred) => resolve(cred.user)).catch(reject);
      }
    });
  });

export default app;