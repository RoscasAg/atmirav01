import React, { useState, useContext, useEffect } from "react";
import * as mui from "@mui/material";
import ResultWithSources from "./components/ResultWithSources";
import InfoContext from "../store/Contextinfo";
import PromptBox from "./components/PromptBox";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CarCrashIcon from "@mui/icons-material/CarCrash";
import Policiesgrid from "./components/Policiesgrid";
import Invoicesgrid from "./components/Invoicesgrid";
import Claimsgrid from "./components/Claimsgrid";
import Loading from "./components/Loading";
import AppNotificationContext from "../store/notification-context";
import { useRouter } from "next/router";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} size="large" />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const GridContainer = styled(mui.Grid)(({ theme }) => ({
  flexGrow: 1,
  margin: theme.spacing(2),
}));

// This functional component is responsible for loading PDFs
const DBLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tabvalue, setTabvalue] = React.useState(0);
  const [firstMsg, setFirstMsg] = useState(true);
  const [prompt, setPrompt] = useState();
  const [messages, setMessages] = useState([
    {
      text: "Hola, soy atmira AI. En que puedo ayudarte?",
      type: "bot",
    },
  ]);
  const [error, setError] = useState("");
  const notificationCtx = useContext(AppNotificationContext);
  const router = useRouter();
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

  const handleTabChange = (event, newValue) => {
    setTabvalue(newValue);
  };

  // This function updates the prompt value when the user types in the prompt box
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  // This function handles the submission of the user's prompt when the user hits 'Enter' or 'Submit'
  // It sends a POST request to the provided endpoint with the current prompt in the request body
  const handleSubmitPrompt = async (endpoint) => {
    try {
      notificationCtx.showNotification({
        title: "Loading...",
        message: "Please wait while we process your request!",
        status: "pending",
      });

      setPrompt("");

      // Push the user's message into the messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: prompt, type: "user", sourceDocuments: null },
      ]);

      // A POST request is sent to the backend with the current prompt in the request body
      const response = await fetch(`/api${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: prompt, nifparam: nif, firstMsg }),
      });

      // Throw an error if the HTTP status is not OK
      if (!response.ok) {
        notificationCtx.showNotification({
          title: "Error!",
          message: `HTTP error! status: ${response.status}`,
          status: "error",
        });
        throw new Error();
      }

      // Parse the response from the backend as JSON
      const searchRes = await response.json();

      console.log({ searchRes });
      setFirstMsg(false);
      // Push the response into the messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: searchRes.result.result,
          type: "bot",
          sourceDocuments: searchRes.result.sourceDocuments,
        },
      ]);
      notificationCtx.showNotification({
        title: "Success!",
        message: "Your request has been processed!",
        status: "success",
      });

      setError(""); // Clear any existing error messages
    } catch (error) {
      console.log(error);
      setError(error.message);
      notificationCtx.showNotification({
        title: "Error!",
        message: error.message,
        status: "error",
      });
    }
  };

  useEffect(() => {
    console.log("firebaseAppState " + firebaseAppState);

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
    <div className="w-full m-auto flex-col my-6" style={{ marginTop: "50px" }}>
      <GridContainer container spacing={3}>
        <mui.Grid xs={12} sm={6} md={12} lg={7}>
          <Box style={{ border: "1px solid #D3D3D3", padding: "16px" }}>
            <Tabs
              value={tabvalue}
              onChange={handleTabChange}
              aria-label="icon label tabs example"
            >
              <Tab icon={<ContentCopyIcon />} label="POLICIES" />
              <Tab icon={<ReceiptIcon />} label="INVOICES" />
              <Tab icon={<CarCrashIcon />} label="CLAIMS" />
            </Tabs>
            {tabvalue === 0 ? <Policiesgrid parnifasegurado={nif} /> : null}
            {tabvalue === 1 ? <Invoicesgrid parnifasegurado={nif} /> : null}
            {tabvalue === 2 ? <Claimsgrid parnifasegurado={nif} /> : null}
          </Box>
        </mui.Grid>
        <mui.Grid xs={12} sm={6} md={12} lg={5}>
          <Box style={{ border: "1px solid #D3D3D3", padding: "16px" }}>
            <ResultWithSources messages={messages} pngFile="pdf" height={500} />
            <PromptBox
              prompt={prompt}
              handlePromptChange={handlePromptChange}
              handleSubmit={() => handleSubmitPrompt("/db-query")}
              placeHolderText="Preguntame algo acerca de tus pólizas, recibos o siniestros?"
              error={error}
            />
          </Box>
        </mui.Grid>
      </GridContainer>
    </div>
  );
};

export default DBLoader;
