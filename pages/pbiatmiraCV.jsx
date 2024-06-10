import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { getSession } from "next-auth/react";
import InfoContext from "../store/Contextinfo";
import { useRouter } from "next/router";
import { useContext } from "react";
import Loading from "./components/Loading";

const LinkPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (!firebaseAppState) {
      router.push("/");
      return;
    }
    // Simulate a delay of 2 seconds to show the loading spinner
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, [firebaseAppState, router]);

  if (isLoading) {
    return <Loading type="spinningBubbles" color="#157ba7" />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "50px",
        marginLeft: "250px",
      }}
    >
      <Box sx={{ width: "1450px", height: "900px" }}>
        <iframe
          title="Report Section"
          width="100%"
          height="100%"
          src="https://app.powerbi.com/reportEmbed?reportId=20846899-2208-492a-9b40-d9fef61d1d7a&autoAuth=true&ctid=08b6784e-efec-46e0-9f90-f464963a50df"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </Box>
    </Box>
  );
};

export default LinkPage;
