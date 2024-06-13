import React, { createContext, useContext, useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// Configure Firebase.
// Configure Firebase.
const config = {
  apiKey: "AIzaSyDvJ4oaE4YagixQxKMt5hd56XBCoDn9rMk",
  authDomain: "itaca-311a0.firebaseapp.com",
  databaseURL: "https://itaca-311a0-default-rtdb.firebaseio.com",
  projectId: "itaca-311a0",
  storageBucket: "itaca-311a0.appspot.com",
  messagingSenderId: "395587390975",
  appId: "1:395587390975:web:6bd480efc2127a2f3fabca",
};

const InfoContext = createContext({
  nif: "Z00000300",
  firebaseUserID: "H7CJNAn8mDTRaxkeLAizP4Mieht2",
  firebaseApp: null,
  firebaseAppState: false,
  updateNIF: (customerNIF) => {},
  updateFirebaseuserID: (customerFirebaseUserID) => {},
  initializeFirebase: () => {},
});

export function UserContextProvider(props) {
  const [userNIF, setUserNIF] = useState("Z00000300");
  const [firebaseUserID, setFirebaseUserID] = useState(
    "H7CJNAn8mDTRaxkeLAizP4Mieht2",
  );
  const [firebaseApp, setFirebaseApp] = useState(null);
  const [firebaseAppState, setFirebaseAppState] = useState(false);

  function updateNIFHandler(customerNIF) {
    setUserNIF(customerNIF);
  }

  function updateFirebaseUserIDHandler(customerFirebaseUserID) {
    setFirebaseUserID(customerFirebaseUserID);
  }

  function initializeFirebaseHandler() {
    if (!firebase.apps.length) {
      setFirebaseApp(firebase.initializeApp(config));
    } else {
      setFirebaseApp(firebase.app());
    }
  }

  function updateFirebaseAppStateHandler(firebasestate) {
    setFirebaseAppState(firebasestate);
  }

  const context = {
    nif: userNIF,
    firebaseUserID: firebaseUserID,
    firebaseApp: firebaseApp,
    firebaseAppState: firebaseAppState,
    updateNIF: updateNIFHandler,
    updateFirebaseuserID: updateFirebaseUserIDHandler,
    initializeFirebase: initializeFirebaseHandler,
    updateFirebaseAppState: updateFirebaseAppStateHandler,
  };

  return (
    <InfoContext.Provider value={context}>
      {props.children}
    </InfoContext.Provider>
  );
}

export default InfoContext;
