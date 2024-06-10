// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvJ4oaE4YagixQxKMt5hd56XBCoDn9rMk", //process.env['FIREBASE_API_KEY'],
  authDomain: "itaca-311a0.firebaseapp.com",
  databaseURL: "https://itaca-311a0-default-rtdb.firebaseio.com",
  projectId: "itaca-311a0",
  storageBucket: "itaca-311a0.appspot.com",
  messagingSenderId: "395587390975",
  appId: "1:395587390975:web:6bd480efc2127a2f3fabca",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const db2 = getDatabase(app);
export const storage = getStorage(app);

export const initFirebase = () => {
  return app;
};
