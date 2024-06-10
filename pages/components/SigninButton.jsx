import React from "react";
import { useContext } from "react";
import { Button } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/router";
import InfoContext from "../../store/Contextinfo";

const SigninButton = () => {
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

  /*initFirebase();
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);*/
  const router = useRouter();

  const handleSignIn = async () => {
    router.push("/");
  };

  const handleSignOut = () => {
    firebaseApp.auth().signOut();
    updateFirebaseAppState(false);
    router.push("/");
  };

  return (
    <>
      {firebaseAppState ? (
        <div className="flex gap-4 ml-auto">
          <Button
            onClick={() => handleSignOut()}
            color="error"
            variant="contained"
            size="medium"
            startIcon={<LogoutIcon />}
          >
            SIGN OUT
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleSignIn}
          color="primary"
          variant="contained"
          size="medium"
          startIcon={<LoginIcon />}
        >
          SIGN IN
        </Button>
      )}
    </>
  );
};

export default SigninButton;
