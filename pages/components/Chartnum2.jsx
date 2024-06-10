import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const LineChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartCanvas = chartRef.current.getContext("2d");
    let chartInstance = null;

    const createChart = () => {
      chartInstance = new Chart(chartCanvas, {
        type: "line",
        data: {
          labels: ["2018", "2019", "2020", "2021", "2022", "2023"],
          datasets: [
            {
              label: "Rentability",
              data: [-5, 5, 10, 12, 9, 15],
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
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
    };

    createChart();

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);

  return (
    <div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default LineChart;
