import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ sales }) => {
  const doughnutChartData = {
    labels: ["Discounted Profit", "Non-Discounted Profit"],
    datasets: [
      {
        data: [sales.profit, sales.totalSalesPrice - sales.totalActualPrice],
        backgroundColor: ["#2ecc71", "#e67e22"],
      },
    ],
  };

  return (
    <div className="card shadow-lg border-0 p-4 bg-dark text-white">
      <h5 className="text-center fw-bold mb-4">
        <i className="fa-solid fa-chart-pie me-2"></i> Profit Breakdown
      </h5>
      <div className="text-center">
        <Doughnut data={doughnutChartData} />
      </div>
    </div>
  );
};

export default DoughnutChart;
