import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  getDocs 
} from 'firebase/firestore';

// Regras recomendadas para o Firestore do Teu Barber Studio
export const FIRESTORE_RULES_GUIDE = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite leitura e escrita das coleções operacionais da barbearia
    match /appointments/{docId} {
      allow read, write: if true;
    }
    match /clients/{docId} {
      allow read, write: if true;
    }
    match /barbers/{docId} {
      allow read, write: if true;
    }
    match /services/{docId} {
      allow read, write: if true;
    }
    match /financial/{docId} {
      allow read, write: if true;
    }
    match /settings/{docId} {
      allow read, write: if true;
    }
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

// Recupera a configuração do Firebase das variáveis Vite ou do localStorage
export const getFirebaseConfig = () => {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'teubarber',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  };

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
    // Tenta gravar um documento leve de ping de teste
    const testDocRef = doc(db, 'system_test', 'ping');
    await setDoc(testDocRef, {
      status: 'online',
      appName: 'Teu Barber Studio',
      timestamp: new Date().toISOString()
    });

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

// Salva ou atualiza um documento no Firestore
export const saveFirestoreDoc = async (collectionName, docId, data) => {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const docRef = doc(db, collectionName, String(docId));
    const cleaned = cleanFirestoreData(data);
    await setDoc(docRef, cleaned, { merge: true });
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
