import { Inter } from "next/font/google";
import "react-resizable/css/styles.css";
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";

const inter = Inter({ subsets: ["latin"] });

const columns_pol = [
  { field: "Product", headerName: "Product", width: 90 },
  { field: "Policy", headerName: "Policy", width: 90 },
  { field: "Status", headerName: "Status", width: 90 },
  { field: "Agent", headerName: "Agent", width: 90 },
  //{ field: "NIF", headerName: "NIF", width: 130 },
  //{ field: "Holder", headerName: "Holder", width: 130 },
  { field: "EffectiveDate", headerName: "Effective Date", width: 100 },
  //{ field: "ExpirationDate", headerName: "Expiration Date", width: 130 },
  { field: "CancellationDate", headerName: "Cancellation Date", width: 100 },
];

export default function PoliciesGrid(props) {
  const { parnifasegurado } = props;
  const [rows_pol, setRowsPol] = useState([]);
  const [nifaSegur, setNifaSegur] = useState(parnifasegurado);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/policies?nifaSegur=${nifaSegur}`);
        if (!res.ok) {
          // res.ok checks if the HTTP status code is 200-299
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setRowsPol(data);
      } catch (error) {
        console.error("A problem occurred when fetching the data:", error);
      }
    }
    fetchData();
  }, [nifaSegur]);

  return (
    <DataGrid
      rows={rows_pol}
      columns={columns_pol}
      rowHeight={40}
      columnHeaderHeight={40}
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
