import { initializeApp, getApps, getApp } from "firebase/app";
import 'firebase/compat/auth'; // Asegúrate de importar auth si usas compat
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDH3ChyFmobXH2I4DtznefpNJ2ohFUEhho",
  authDomain: "admincvatmira.firebaseapp.com",
  databaseURL: "https://admincvatmira-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "admincvatmira",
  storageBucket: "admincvatmira.appspot.com",
  messagingSenderId: "952821472045",
  appId: "1:952821472045:web:c545c1b2f33930a317d1a4",
  measurementId: "G-83FZDV2DK8"
};

// Initialize Firebase
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

export const db = getFirestore(firebaseApp); // Cambiado 'app' por 'firebaseApp'
export const db2 = getDatabase(firebaseApp); // Cambiado 'app' por 'firebaseApp'
export const storage = getStorage(firebaseApp); // Cambiado 'app' por 'firebaseApp'

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(firebaseApp); // Cambiado 'app' por 'firebaseApp'
}

export { analytics };

export const initFirebase = () => {
  return firebaseApp; // Cambiado 'app' por 'firebaseApp'
};