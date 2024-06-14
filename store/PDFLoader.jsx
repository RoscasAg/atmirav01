import React, { useState, useContext, useEffect } from "react";
import ResultWithSources from "../pages/components/ResultWithSources";
import InfoContext from "./Contextinfo";
import PromptBox from "../pages/components/PromptBox";
import { setGlobalSelectedPDF, globalSelectedPDF } from "./global.js";
import { Box } from "@mui/material";
import {
  TextField,
  Button,
  Grid,
  styled,
  Link,
  Typography,
} from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import { v4 } from "uuid";
import AppNotificationContext from "../store/notification-context";

// This functional component is responsible for loading PDFs
const PDFLoader = () => {
  const [firstMsg, setFirstMsg] = useState(true);
  const { nif, updateNIF } = useContext(InfoContext);
  const [imageUpload, setImageUpload] = useState(null);
  const [prompt, setPrompt] = useState();
  const [messages, setMessages] = useState([
    {
      text: "Hola, soy atmira AI. En que puedo ayudarte?",
      type: "bot",
    },
  ]);
  const [error, setError] = useState("");

  const [selectedPdfPath, setSelectedPdfPath] = useState(
    globalSelectedPDF.path,
  );

  const notificationCtx = useContext(AppNotificationContext);

  // This function updates the prompt value when the user types in the prompt box
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const uploadFiletoFirebase = () => {
    return new Promise((resolve, reject) => {
      if (imageUpload == null) {
        reject(new Error("No file selected"));
        return;
      }
      const imageRef = ref(storage, `documents/${imageUpload.name + v4()}`);
      uploadBytes(imageRef, imageUpload)
        .then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            setSelectedPdfPath(url);
            setGlobalSelectedPDF(url);
            resolve(url);
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  // This function handles the submission of the user's PDF when the user hits 'Enter' or 'Submit'
  const handleSubmitPDF = async (endpoint, fileURL) => {
    try {
      notificationCtx.showNotification({
        title: "Loading...",
        message: "Please wait while we process your request!",
        status: "pending",
      });

      // A POST request is sent to the backend with the selected PDF file in the request body
      const response = await fetch(`/api${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pdfpath: fileURL, nifparam: nif }),
      });

      // The response from the backend is parsed as JSON
      const uploadRes = await response.json();
      console.log(uploadRes);
      setError(""); // Clear any existing error messages
      notificationCtx.showNotification({
        title: "Success!",
        message: "Your request has been processed!",
        status: "success",
      });
    } catch (error) {
      setError(error.message);
      notificationCtx.showNotification({
        title: "Error!",
        message: error.message,
        status: "error",
      });
    }
  };

  const handleSubmitInfo = async (endpoint, fileJSON) => {
    try {
      notificationCtx.showNotification({
        title: "Loading...",
        message: "Please wait while we process your request!",
        status: "pending",
      });
      const response = await fetch(`/api${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filejson: fileJSON, nifparam: nif }),
      });

      // The response from the backend is parsed as JSON
      const uploadRes = await response.json();
      console.log(uploadRes);
      setError(""); // Clear any existing error messages
      notificationCtx.showNotification({
        title: "Success!",
        message: "Your request has been processed!",
        status: "success",
      });
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
          text: searchRes.result.text,
          //text: searchRes.result.output,
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

  const handleChange = (event) => {
    setImageUpload(event.target.files);
  };

  const handleFileUpload = async () => {
    try {
      notificationCtx.showNotification({
        title: "Loading...",
        message: "Please wait while we process your request!",
        status: "pending",
      });
      const url = await uploadFiletoFirebase();
      handleSubmitPDF("/pdf-upload", url);
    } catch (error) {
      // catch error
    }
  };

  const handleInfoUpload = async () => {
    try {
      const res = await fetch(`/api/policies?nifaSegur=${nif}`);
      if (!res.ok) {
        // res.ok checks if the HTTP status code is 200-299
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log(data);

      // Move the handleSubmitInfo function call inside the try block
      handleSubmitInfo("policies-upload", data);
    } catch (error) {
      console.error("A problem occurred when fetching the data:", error);
    }
  };

  // The component returns a two column layout with various child components
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "16px",
        boxShadow: "0px 0px 1px rgba(0, 0, 0, 0.5)",
        backgroundColor: "#fff",
        borderRadius: "2px",
      }}
    >
      <Box style={{ border: "1px solid #ADD8E6", padding: "10px" }}>
        <input
          type="file"
          webkitdirectory="true"
          directory="true"
          onChange={handleChange}
          multiple
        />
        <Button
          variant="outlined"
          component="span"
          style={{ marginLeft: "10px" }}
          onClick={handleFileUpload}
        >
          Upload Files to Firebase & Pinecone
        </Button>
        <Link
          href={selectedPdfPath}
          target="_blank"
          rel="noreferrer"
          underline="none"
          style={{ marginLeft: "16px" }}
        >
          <PictureAsPdf sx={{ color: "secondary" }} />
          <Typography
            variant="body1"
            component="span"
            color="secondary"
          ></Typography>
        </Link>
      </Box>
      <ResultWithSources messages={messages} pngFile="pdf" />
      <PromptBox
        // prompt={prompt}
        // handlePromptChange={handlePromptChange}
        // handleSubmit={() => handleSubmitPrompt("/pdf-query")}
        // placeHolderText="Ask something about your documents?"
        // error={error}
      />
    </Box>
  );
};

export default PDFLoader;