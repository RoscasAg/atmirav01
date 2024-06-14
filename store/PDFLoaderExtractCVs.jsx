import React, { useState, useContext, useEffect, useMemo, useCallback } from "react";
import { Box, Button, Link } from "@mui/material";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import { v4 } from "uuid";
import { MuiFileInput } from "mui-file-input";
import AppNotificationContext from "../store/notification-context";
import InfoContext from "../store/Contextinfo"; // Asegúrate de que la ruta sea correcta
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Define globalSelectedPDF if it's not already defined
if (typeof globalSelectedPDF === 'undefined') {
  var globalSelectedPDF = { path: "" };
}

const PDFLoader = () => {
  const [firstMsg, setFirstMsg] = useState(true);
  const { nif, updateNIF } = useContext(InfoContext);
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUploadName, setImageUploadName] = useState(null);
  const [prompt, setPrompt] = useState();
  const [error, setError] = useState("");
  const [selectedPdfPath, setSelectedPdfPath] = useState(globalSelectedPDF.path);
  const notificationCtx = useContext(AppNotificationContext);
  const [rowData, setRowData] = useState([
    { make: 'Tesla', model: 'Model Y', price: 64950, electric: true, month: 'June' },
    { make: 'Ford', model: 'F-Series', price: 33850, electric: false, month: 'October' },
    { make: 'Toyota', model: 'Corolla', price: 29600, electric: false, month: 'August' },
    { make: 'Mercedes', model: 'EQA', price: 48890, electric: true, month: 'February' },
    { make: 'Fiat', model: '500', price: 15774, electric: false, month: 'January' },
    { make: 'Nissan', model: 'Juke', price: 20675, electric: false, month: 'March' },
    { make: 'Vauxhall', model: 'Corsa', price: 18460, electric: false, month: 'July' },
    { make: 'Volvo', model: 'EX30', price: 33795, electric: true, month: 'September' },
    { make: 'Mercedes', model: 'Maybach', price: 175720, electric: false, month: 'December' },
    { make: 'Vauxhall', model: 'Astra', price: 25795, electric: false, month: 'April' },
    { make: 'Fiat', model: 'Panda', price: 13724, electric: false, month: 'November' },
    { make: 'Jaguar', model: 'I-PACE', price: 69425, electric: true, month: 'May' },
    { make: 'Tesla', model: 'Model Y', price: 64950, electric: true, month: 'June' },
    { make: 'Ford', model: 'F-Series', price: 33850, electric: false, month: 'October' },
    { make: 'Toyota', model: 'Corolla', price: 29600, electric: false, month: 'August' },
    { make: 'Mercedes', model: 'EQA', price: 48890, electric: true, month: 'February' },
    { make: 'Fiat', model: '500', price: 15774, electric: false, month: 'January' },
    { make: 'Nissan', model: 'Juke', price: 20675, electric: false, month: 'March' },
    { make: 'Vauxhall', model: 'Corsa', price: 18460, electric: false, month: 'July' },
    { make: 'Volvo', model: 'EX30', price: 33795, electric: true, month: 'September' },
    { make: 'Mercedes', model: 'Maybach', price: 175720, electric: false, month: 'December' },
    { make: 'Vauxhall', model: 'Astra', price: 25795, electric: false, month: 'April' },
    { make: 'Fiat', model: 'Panda', price: 13724, electric: false, month: 'November' },
    { make: 'Jaguar', model: 'I-PACE', price: 69425, electric: true, month: 'May' },
  ]);

  const [columnDefs, setColumnDefs] = useState([
    {
      field: "make",
      checkboxSelection: true,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ["Tesla", "Ford", "Toyota", "Mercedes", "Fiat", "Nissan", "Vauxhall", "Volvo", "Jaguar"],
      },
    },
    { field: "model" },
    { field: "price", filter: 'agNumberColumnFilter' },
    { field: "electric" },
    {
      field: "month",
      comparator: (valueA, valueB) => {
        const months = [
          'January', 'February', 'March', 'April',
          'May', 'June', 'July', 'August',
          'September', 'October', 'November', 'December',
        ];
        const idxA = months.indexOf(valueA);
        const idxB = months.indexOf(valueB);
        return idxA - idxB;
      },
    }
  ]);

  const defaultColDef = useMemo(() => {
    return {
      filter: 'agTextColumnFilter',
      floatingFilter: true,
    }
  }, []);

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
      console.error("Error during file upload:", error);
    }
  };

  const handleInfoExtraction = async () => {
    try {
      notificationCtx.showNotification({
        title: "Loading...",
        message: "Please wait while we process your request!",
        status: "pending",
      });
      const url = await uploadFiletoFirebase();
      handleSubmitPDF("/pdf-extract", url);
    } catch (error) {
      console.error("Error during info extraction:", error);
    }
  };

  return (
    <Box style={{ display: "flex", flexDirection: "column", padding: "16px", boxShadow: "0px 0px 1px rgba(0, 0, 0, 0.5)", backgroundColor: "#fff", borderRadius: "2px" }}>
      <Box style={{ border: "1px solid #ADD8E6", padding: "10px" }}>
        <MuiFileInput
          value={imageUpload}
          onChange={(e) => {
            if (e.target && e.target.files && e.target.files.length > 0) {
              setImageUpload(e.target.files[0]);
            } else {
              console.error("No files selected or file input is not properly initialized.");
            }
          }}
          multiple
        />
        <Button variant="outlined" component="span" style={{ marginLeft: "10px" }} onClick={handleFileUpload} disabled={!imageUpload}>
          Upload File to Firebase & Pinecone
        </Button>
        <Button variant="outlined" component="span" style={{ marginLeft: "10px" }} onClick={handleInfoExtraction}>
          Extract Information
        </Button>
        <Link href={selectedPdfPath} target="_blank" rel="noreferrer" underline="none">
          {selectedPdfPath}
        </Link>
      </Box>
      <Box className="ag-theme-quartz" style={{ height: 500 }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          pagination={true}
          paginationPageSize={10}
        />
      </Box>
    </Box>
  );
};

export default PDFLoader;