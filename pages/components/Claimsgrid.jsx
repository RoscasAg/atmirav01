import { Inter } from "next/font/google";
import "react-resizable/css/styles.css";
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";

const inter = Inter({ subsets: ["latin"] });

const columns_cla = [
  { field: "Poliza", headerName: "Policy", width: 90 },
  { field: "Siniestro", headerName: "Claim", width: 90 },
  { field: "F_Siniestro", headerName: "Claim Date", width: 100 },
  { field: "Causa", headerName: "Cause", width: 100 },
  { field: "Motivo", headerName: "Reason", width: 100 },
  { field: "Estado_Sin", headerName: "Status", width: 100 },
  { field: "F_Orden_Pago", headerName: "Order Date", width: 100 },
  { field: "Imp_Total_Pago", headerName: "Amount", width: 100 },
];

export default function ClaimsGrid(props) {
  const { parnifasegurado } = props;
  const [rows_cla, setRowsCla] = useState([]);
  const [nifaSegur, setNifaSegur] = useState(parnifasegurado);

  useEffect(() => {
    async function fetchData_Cla() {
      try {
        const res = await fetch(`/api/claims?nifaSegur=${nifaSegur}`);
        if (!res.ok) {
          // res.ok checks if the HTTP status code is 200-299
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data_cla = await res.json();
        setRowsCla(data_cla);
      } catch (error) {
        console.error("A problem occurred when fetching the data:", error);
      }
    }
    fetchData_Cla();
  }, [nifaSegur]);

  return (
    <DataGrid
      rows={rows_cla}
      columns={columns_cla}
      columnHeaderHeight={40}
      rowHeight={40}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 5,
          },
        },
      }}
      pageSizeOptions={[5]}
      disableRowSelectionOnClick
      style={{ backgroundColor: "white" }}
    />
  );
}
