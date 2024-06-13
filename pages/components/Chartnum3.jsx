import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const PieChart = ({ nifaSegur }) => {
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
        const res = await fetch(`/api/policies?nifaSegur=${nifaSegurRef.current}`);
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
    const summary = rows_pol.reduce((acc, row) => {
      const { Product } = row;
      if (!acc[Product]) {
        acc[Product] = 0;
      }
      acc[Product]++;
      return acc;
    }, {});

    const summaryRows = Object.entries(summary).map(([product, count]) => ({
      product,
      count,
    }));
    setAccPol(summaryRows);

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "pie",
      data: {
        labels: summaryRows.map((row) => row.product),
        datasets: [
          {
            label: "Products",
            data: summaryRows.map((row) => row.count),
            backgroundColor: colors,
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

export default PieChart;