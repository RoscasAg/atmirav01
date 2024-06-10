import { Inter } from "next/font/google";
import "react-resizable/css/styles.css";
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";

const inter = Inter({ subsets: ["latin"] });

const columns_inv = [
  { field: "Poliza", headerName: "Policy", width: 90 },
  { field: "F_Emision", headerName: "Effective Date", width: 100 },
  { field: "Numrecibo", headerName: "Invoice", width: 90 },
  //{ field: "F_Efecto", headerName: "Issue Date", width: 130 },
  { field: "F_Vencim", headerName: "Expiration Date", width: 100 },
  { field: "Imp_Total", headerName: "Amount", width: 100 },
  { field: "CCC", headerName: "CCC", width: 130 },
  { field: "Estado", headerName: "Status", width: 130 },
];

export default function InvoicesGrid(props) {
  const { parnifasegurado } = props;
  const [rows_inv, setRowsInv] = useState([]);
  const [nifaSegur, setNifaSegur] = useState(parnifasegurado);

  useEffect(() => {
    async function fetchData_Inv() {
      try {
        const res = await fetch(`/api/invoices?nifaSegur=${nifaSegur}`);
        if (!res.ok) {
          // res.ok checks if the HTTP status code is 200-299
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data_inv = await res.json();
        setRowsInv(data_inv);
      } catch (error) {
        console.error("A problem occurred when fetching the data:", error);
      }
    }
    fetchData_Inv();
  }, [nifaSegur]);

  return (
    <DataGrid
      rows={rows_inv}
      columns={columns_inv}
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
