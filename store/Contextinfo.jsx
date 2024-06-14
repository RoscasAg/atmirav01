import React, { createContext, useContext, useState, useEffect } from "react";
import { firebaseApp as importedFirebaseApp } from './firebase'; // Renombra la importación para evitar conflictos

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
  const [firebaseUserID, setFirebaseUserID] = useState("H7CJNAn8mDTRaxkeLAizP4Mieht2");
  const [firebaseApp, setFirebaseApp] = useState(importedFirebaseApp); // Usa la instancia importada con el nuevo nombre
  const [firebaseAppState, setFirebaseAppState] = useState(false);

  function updateNIFHandler(customerNIF) {
    setUserNIF(customerNIF);
  }

  function updateFirebaseUserIDHandler(customerFirebaseUserID) {
    setFirebaseUserID(customerFirebaseUserID);
  }

  function initializeFirebaseHandler() {
    // Esta función puede ser innecesaria si siempre usas la instancia importada
    setFirebaseApp(importedFirebaseApp);
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