import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: atob('QUl6YVN5QXNWZ2Y1R1JSdWYtaE50OU14cENKY2U2d2RiOWhVQjcw'),
  authDomain: 'crm---mayu.firebaseapp.com',
  projectId: 'crm---mayu',
  storageBucket: 'crm---mayu.appspot.com',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

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