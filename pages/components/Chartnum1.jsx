import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const BarChart = ({ nifaSegur }) => {
  const chartRef = useRef(null);
  const nifaSegurRef = useRef(nifaSegur || "Z00000300");
  const chartInstanceRef = useRef(null);
  const [rows_pol, setRowsPol] = useState([]);
  const [acc_pol, setAccPol] = useState([]);
  const colors = [
    "#ffb9b9",
    "#c5ebe7",
    "#dcd8ea",
    "#ffb9b9",
    "#ffe9a0",
    "#6ecceb",
  ]; // Example color array

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/invoices?nifaSegur=${nifaSegurRef.current}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setRowsPol(data);
      } catch (error) {
        console.error("A problem occurred when fetching the data:", error);
      }
    }
    fetchData();

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [nifaSegur]);

  useEffect(() => {
    const chartCanvas = chartRef.current.getContext("2d");

    const summary = rows_pol.reduce((acc, row) => {
      const dateString = row.F_Emision.split(" ")[0];
      const year = dateString.split("/")[2];

      if (!acc[year]) acc[year] = 0;

      const impTotal = parseFloat(row.Imp_Total);
      acc[year] += isNaN(impTotal) ? 0 : impTotal;
      return acc;
    }, {});

    const summaryRows = Object.entries(summary).map(([year, total]) => ({
      year,
      total,
    }));
    setAccPol(summaryRows);

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: summaryRows.map((row) => row.year),
        datasets: [
          {
            label: "Total by Year",
            data: summaryRows.map((row) => row.total),
            backgroundColor: "#6ecceb",
            borderColor: "#6ecceb",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [rows_pol]);

  return (
    <div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default BarChart;