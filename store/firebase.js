import { initializeApp, getApps, getApp } from "firebase/app";
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
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db = getFirestore(app);
export const db2 = getDatabase(app);
export const storage = getStorage(app);

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { analytics };

export const initFirebase = () => {
  return app;
};