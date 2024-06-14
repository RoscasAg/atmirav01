// Import FirebaseAuth and firebase.
import React, { useState, useContext, useEffect } from "react";
import * as mui from "@mui/material";
import { useRouter } from "next/router";
import InfoContext from "../store/Contextinfo";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import { firebaseApp } from "../store/firebase"; // Importa la instancia de Firebase
import "firebase/compat/auth";
import dynamic from "next/dynamic";
import { getDatabase, ref, get, onValue } from "firebase/database";
import { db2 } from "../store/firebase";
import { GoogleAuthProvider, EmailAuthProvider, PhoneAuthProvider } from "firebase/auth";
const StyledFirebaseAuth = dynamic(
  () => import("../store/StyledFirebaseAuth"),
  {
    ssr: false,
  },
);

const GridContainer = styled(mui.Grid)(({ theme }) => ({
  flexGrow: 1,
  margin: theme.spacing(2),
}));

// Configure FirebaseUI.
const uiConfig = {
  signInFlow: "popup",
  signInOptions: [
    GoogleAuthProvider.PROVIDER_ID,
    EmailAuthProvider.PROVIDER_ID,
    PhoneAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
};

function SignInScreen() {
  const [isSignedIn, setIsSignedIn] = useState(false); // Local signed-in state.
  const {
    nif,
    updateNIF,
    firebaseUserID,
    firebaseApp,
    updateFirebaseuserID,
    initializeFirebase,
    firebaseAppState,
    updateFirebaseAppState,
  } = useContext(InfoContext);

  const router = useRouter();

  useEffect(() => {
    if (!firebaseApp) {
      console.error("Firebase app is not initialized");
      return;
    }
  
    const unregisterAuthObserver = firebaseApp.auth().onAuthStateChanged((user) => {
      setIsSignedIn(!!user);
    });
    return () => unregisterAuthObserver();
  }, [firebaseApp]);

  if (!firebaseApp) return null;

  updateFirebaseAppState(true);

  if (!isSignedIn) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <GridContainer
          container
          spacing={3}
          direction="column"
          alignItems="center"
          justify="center"
        >
          <mui.Grid item xs={12} sm={6} md={4} lg={5}>
            <Image
              src="/assets/images/atmira-logo_2.png"
              alt="Itaca Logo"
              width={200}
              height={100}
            />
          </mui.Grid>
          <mui.Grid item xs={12} sm={6} md={4} lg={5}>
            <StyledFirebaseAuth
              uiConfig={uiConfig}
              firebaseAuth={firebaseApp.auth()}
            />
          </mui.Grid>
        </GridContainer>
      </div>
    );
  } else {
    console.log("User is signed in ", firebaseApp.auth().currentUser.uid);
    updateFirebaseuserID(firebaseApp.auth().currentUser.uid);

    const userData = ref(db2, `admins/${firebaseUserID}`);

    get(userData).then((snapshot) => {
      const nif = snapshot.val().nif;
      updateNIF(nif);
    });

    router.push("/home");
    return null;
  }
}

export default SignInScreen;
