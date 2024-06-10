import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const BarChart = ({ nifaSegur }) => {
  const chartRef = useRef(null);
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
  let chartInstance = null;

  useEffect(() => {
    if (nifaSegur == null || nifaSegur == undefined) {
      nifaSegur = "Z00000300";
    }

    async function fetchData() {
      try {
        const res = await fetch(`/api/invoices?nifaSegur=${nifaSegur}`);
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

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [nifaSegur]);

  useEffect(() => {
    const chartCanvas = chartRef.current.getContext("2d");

    const summary = rows_pol.reduce((acc, row) => {
      const dateString = row.F_Emision.split(" ")[0]; // Extract the date part
      const year = dateString.split("/")[2]; // Extract the year part

      if (!acc[year]) acc[year] = 0; // Initialize if not already done

      const impTotal = parseFloat(row.Imp_Total); // Attempt to convert Imp_Total to a number

      // If impTotal is a number, accumulate it, else treat it as 0
      acc[year] += isNaN(impTotal) ? 0 : impTotal;
      return acc;
    }, {});

    const summaryRows = Object.entries(summary).map(([year, total]) => ({
      year,
      total,
    }));
    setAccPol(summaryRows);

    if (chartInstance) {
      chartInstance.destroy();
    }

    // Assuming chartRef is the reference to your canvas element and Chart is imported from 'chart.js'

    chartInstance = new Chart(chartRef.current, {
      type: "line", // specify the type as bar
      data: {
        labels: summaryRows.map((row) => row.year), // map to the 'year' property of each row in summaryRows
        datasets: [
          {
            label: "Total by Year",
            data: summaryRows.map((row) => row.total), // map to the 'total' property of each row in summaryRows
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
      if (chartInstance) {
        chartInstance.destroy();
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
