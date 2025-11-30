import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto"; // Import Chart.js

function BarChart() {
  const chartRef = useRef(null); // Reference to the chart canvas
  const chartInstance = useRef(null); // Reference to the chart instance
  const [salesData, setSalesData] = useState([]); // State to store sales data

  // Fetch sales data from the backend
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch(
          "https://pharmacy-backend-beta.vercel.app/auth/sales/daily"
        ); // Fetch daily sales data
        const data = await response.json();
        console.log("Fetched Daily Sales Data:", data);

        // Ensure data contains 'date' before updating state
        if (Array.isArray(data) && data.length > 0 && data[0].date) {
          setSalesData(data);
        } else {
          console.log("No daily sales data available or invalid format:", data);
          setSalesData([]); // Set empty array to avoid errors
        }
      } catch (error) {
        console.error("Error fetching daily sales data:", error);
      }
    };

    fetchSalesData();
  }, []);

  // Create or update the chart
  useEffect(() => {
    if (!salesData || salesData.length === 0) return; // Wait for data

    // Destroy the previous chart instance if it exists
    if (chartInstance.current !== null) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const ctx = chartRef.current.getContext("2d");

    // Create a new chart instance
    chartInstance.current = new Chart(ctx, {
      type: "bar", // Bar chart
      data: {
        labels: salesData.map((item) => item.date), // Use 'date' as labels
        datasets: [
          {
            label: "Daily Sales (Rs)",
            data: salesData.map((item) => item.sales), // Use 'sales' as data
            backgroundColor: "rgba(54, 162, 235, 0.6)", // Blue color for bars
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true, // Make the chart responsive
        maintainAspectRatio: false, // Allow custom height/width
        scales: {
          y: {
            beginAtZero: true, // Start y-axis at 0
          },
        },
      },
    });

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (chartInstance.current !== null) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [salesData]);

  // Render the chart
  return (
    <div style={{ width: "100%", height: "400px" }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default BarChart;
