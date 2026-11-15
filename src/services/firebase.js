import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  limit,
  getDocs,
  getDocsFromServer
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';

// Login por nome de usuário: "TeuAdmin" -> "teuadmin@teubarber.app" (e-mail interno, não precisa existir).
// Se o valor já contiver "@", é usado como e-mail normal.
export const ADMIN_EMAIL_DOMAIN = 'teubarber.app';
export const usernameToEmail = (username) => {
  const value = String(username || '').trim();
  if (value.includes('@')) return value.toLowerCase();
  const slug = value.toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return slug ? `${slug}@${ADMIN_EMAIL_DOMAIN}` : '';
};
export const emailToUsername = (email) => {
  const value = String(email || '');
  return value.endsWith(`@${ADMIN_EMAIL_DOMAIN}`) ? value.split('@')[0] : value;
};

// Campos sensíveis do barbeiro: ficam em /barbers_private (somente admin)
export const PRIVATE_BARBER_FIELDS = ['document', 'pixKey', 'pixKeyType', 'commissionRate', 'phone'];

export const splitBarberData = (barber) => {
  const publicData = {};
  const privateData = {};
  Object.entries(barber || {}).forEach(([key, value]) => {
    if (PRIVATE_BARBER_FIELDS.includes(key)) privateData[key] = value;
    else publicData[key] = value;
  });
  return { publicData, privateData };
};

// ID determinístico do horário ocupado (impede sobrescrita pelo público)
export const getSlotId = (barberId, date, time) =>
  `${barberId}_${date}_${String(time || '').replace(':', '')}`;

// Recupera a configuração do Firebase: variáveis de build (VITE_) têm prioridade;
// o localStorage só é usado como fallback quando o build não traz credenciais.
export const getFirebaseConfig = () => {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'teubarber-c38cc',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('teu_barber_firebase_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.projectId && parsed.apiKey) {
          return parsed;
        }
      } catch (e) {
        console.warn('Erro ao ler config do Firebase do localStorage:', e);
      }
    }
  }

  return envConfig;
};

// Salva as credenciais do Firebase no localStorage
export const saveFirebaseConfig = (config) => {
  if (typeof window !== 'undefined') {
    if (config && config.projectId && config.apiKey) {
      localStorage.setItem('teu_barber_firebase_config', JSON.stringify({
        apiKey: config.apiKey.trim(),
        authDomain: config.authDomain?.trim() || '',
        projectId: config.projectId.trim(),
        storageBucket: config.storageBucket?.trim() || '',
        messagingSenderId: config.messagingSenderId?.trim() || '',
        appId: config.appId?.trim() || ''
      }));
    } else {
      localStorage.removeItem('teu_barber_firebase_config');
    }
  }
};

// Verifica se há configuração válida preenchida
export const isFirebaseConfigured = () => {
  const cfg = getFirebaseConfig();
  return Boolean(cfg && cfg.apiKey && cfg.projectId && cfg.apiKey.length > 5);
};

// Remove valores undefined para evitar erros de serialização no Firestore
export const cleanFirestoreData = (data) => {
  if (data === null || data === undefined) return null;
  if (typeof data !== 'object') return data;
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) {
    return data.map(item => cleanFirestoreData(item));
  }
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      result[key] = null;
    } else if (value && typeof value === 'object') {
      result[key] = cleanFirestoreData(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

let firebaseAppInstance = null;
let firestoreDbInstance = null;
let lastProjectId = '';

export const getFirebaseApp = () => {
  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  if (firebaseAppInstance && lastProjectId === config.projectId) {
    return firebaseAppInstance;
  }

  try {
    lastProjectId = config.projectId;
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseAppInstance = getApp();
    } else {
      firebaseAppInstance = initializeApp(config);
    }
    firestoreDbInstance = getFirestore(firebaseAppInstance);
    return firebaseAppInstance;
  } catch (err) {
    console.error('Erro ao inicializar Firebase App:', err);
    return null;
  }
};

export const getFirestoreDb = () => {
  if (!firestoreDbInstance) {
    getFirebaseApp();
  }
  return firestoreDbInstance;
};

// Teste de conexão com o Firestore
export const testFirebaseConnection = async (customConfig = null) => {
  try {
    const config = customConfig || getFirebaseConfig();
    if (!config || !config.apiKey || !config.projectId) {
      return { success: false, message: 'Credenciais incompletas (API Key e Project ID são obrigatórios).' };
    }

    let app;
    const existing = getApps();
    if (existing.length > 0) {
      app = getApp();
    } else {
      app = initializeApp(config, 'test-connection-app-' + Date.now());
    }

    const db = getFirestore(app);
    // Teste somente leitura em coleção pública (não exige login de admin)
    await getDocs(query(collection(db, 'services'), limit(1)));

    return { 
      success: true, 
      message: `Conectado com sucesso ao projeto "${config.projectId}" no Firebase Firestore!` 
    };
  } catch (err) {
    console.error('Falha no teste de conexão Firebase:', err);
    let msg = err.message || 'Erro desconhecido ao conectar no Firebase.';
    if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
      msg = 'Conexão estabelecida, mas as regras de segurança do Firestore bloquearam a escrita. Verifique as Regras do Firestore (aba "Regras de Segurança" no modal).';
    }
    return { success: false, message: msg };
  }
};

// Escuta em tempo real uma coleção com onSnapshot
export const subscribeToCollection = (collectionName, onUpdate, onError) => {
  const db = getFirestoreDb();
  if (!db) {
    if (onError) onError(new Error('Firestore não inicializado'));
    return () => {};
  }

  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(items);
    }, (err) => {
      console.warn(`Erro no listener da coleção "${collectionName}":`, err);
      if (onError) onError(err);
    });

    return unsubscribe;
  } catch (err) {
    console.error(`Erro ao criar subscription para ${collectionName}:`, err);
    if (onError) onError(err);
    return () => {};
  }
};

// Lê um único documento (usado pelo cliente para buscar o próprio cadastro pelo telefone)
// Verifica no SERVIDOR (nunca no cache) se a coleção está vazia.
// Retorna null em caso de erro, para quem chama não tratar falha como "vazia".
export const isCollectionEmptyOnServer = async (collectionName) => {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const snap = await getDocsFromServer(query(collection(db, collectionName), limit(1)));
    return snap.empty;
  } catch (err) {
    console.warn(`Erro ao verificar ${collectionName}:`, err);
    return null;
  }
};

export const getFirestoreDocOnce = async (collectionName, docId) => {
  const db = getFirestoreDb();
  if (!db || !docId) return null;
  try {
    const snap = await getDoc(doc(db, collectionName, String(docId)));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.warn(`Erro ao ler ${collectionName}/${docId}:`, err);
    return null;
  }
};

// ---------- Autenticação do painel administrativo ----------
export const getFirebaseAuth = () => {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
};

export const adminSignIn = async (usernameOrEmail, password) => {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('firebase-not-configured');
  const email = usernameToEmail(usernameOrEmail);
  if (!email) throw new Error('auth/invalid-email');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const isAdmin = await checkIsAdmin(cred.user.uid);
  if (!isAdmin) {
    await signOut(auth);
    throw new Error('not-admin');
  }
  return cred.user;
};

export const adminSignOut = async () => {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
};

// Admin = existe o documento /admins/{uid} (criado manualmente no console do Firebase)
export const checkIsAdmin = async (uid) => {
  const db = getFirestoreDb();
  if (!db || !uid) return false;
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch (err) {
    console.warn('Falha ao verificar permissão de admin:', err);
    return false;
  }
};

// ---------- Gestão de usuários do painel (executado por um admin logado) ----------

// Cria o login numa instância secundária do Firebase para NÃO deslogar o admin atual,
// depois libera o acesso gravando /admins/{uid}.
export const createAdminUser = async ({ username, password, name }) => {
  const db = getFirestoreDb();
  const currentAuth = getFirebaseAuth();
  if (!db || !currentAuth?.currentUser) throw new Error('not-admin');

  const email = usernameToEmail(username);
  if (!email) throw new Error('auth/invalid-email');

  const secondaryName = 'admin-user-creator';
  const secondaryApp = getApps().find(a => a.name === secondaryName)
    || initializeApp(getFirebaseConfig(), secondaryName);
  const secondaryAuth = getAuth(secondaryApp);

  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  await signOut(secondaryAuth);

  await setDoc(doc(db, 'admins', cred.user.uid), {
    username: emailToUsername(email),
    email,
    name: String(name || '').trim() || emailToUsername(email),
    createdAt: new Date().toISOString(),
    createdBy: currentAuth.currentUser.uid
  });
  return cred.user.uid;
};

// Remove o acesso ao painel (o login continua existindo no Auth, mas sem /admins não abre nada)
export const revokeAdminAccess = async (uid) => {
  const db = getFirestoreDb();
  const currentAuth = getFirebaseAuth();
  if (!db) throw new Error('firebase-not-configured');
  if (currentAuth?.currentUser?.uid === uid) throw new Error('cannot-revoke-self');
  await deleteDoc(doc(db, 'admins', uid));
};

// Troca a senha do próprio usuário logado (exige a senha atual)
export const changeOwnPassword = async (currentPassword, newPassword) => {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!user?.email) throw new Error('not-admin');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};

// Observa a sessão: callback(user | null) — user só é repassado se for admin
export const subscribeToAdminAuth = (callback) => {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return callback(null);
    const ok = await checkIsAdmin(user.uid);
    callback(ok ? user : null);
  });
};

// Salva ou atualiza um documento no Firestore
// options.merge=false sobrescreve o documento inteiro (remove campos antigos)
export const saveFirestoreDoc = async (collectionName, docId, data, options = { merge: true }) => {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const docRef = doc(db, collectionName, String(docId));
    const cleaned = cleanFirestoreData(data);
    await setDoc(docRef, cleaned, { merge: options.merge !== false });
    return true;
  } catch (err) {
    console.error(`Erro ao salvar no Firestore (${collectionName}/${docId}):`, err);
    return false;
  }
};

// Deleta documento no Firestore
export const deleteFirestoreDoc = async (collectionName, docId) => {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error(`Erro ao deletar documento (${collectionName}/${docId}):`, err);
    return false;
  }
};
