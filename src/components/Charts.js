import React, { useEffect, useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Charts = ({
  medicines,
  lowStock,
  outOfStock,
  expireMedicines,
  totalSales,
}) => {
  const [salesData, setSalesData] = useState({
    monthlySales: Array(12).fill(0),
    totalSales: 0,
  });

  // Line Chart (Sales Trends)
  const lineChartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: `Total Sales (Rs) ${totalSales}`,
        data: salesData.monthlySales,
        borderColor: "#4CAF50",
        fill: false,
      },
    ],
  };

  useEffect(() => {
    const getMonthlySales = async () => {
      try {
        const response = await fetch(
          "https://pharmacy-backend-beta.vercel.app/auth/monthly-sales",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          console.log("Failed to fetch Monthly Sales");
        }
        const data = await response.json();
        setSalesData({
          monthlySales: data.monthlySales,
          totalSales: data.totalSales,
        });
      } catch (error) {
        console.error("Error fetching Monthly sales:", error);
      }
    };
    getMonthlySales();
  }, []);

  // Bar Chart (Stock Levels)
  const barChartData = {
    labels: ["Total Medicines", "Low Stock", "Out of Stock", "Expired"],
    datasets: [
      {
        label: "Stock Count",
        data: [
          medicines.length,
          lowStock.length,
          outOfStock.length,
          expireMedicines.length,
        ],
        backgroundColor: [
          "#3498db",
          "#FF8C00",
          "rgb(167, 81, 20)",
          "rgb(255, 0, 0)",
        ],
      },
    ],
  };

  return (
    <div className="row mt-4">
      {/* Line Chart */}
      <div className="col-md-6">
        <div className="card p-3 shadow-sm">
          <h5 className="text-center">Sales Trends</h5>
          <Line data={lineChartData} />
        </div>
      </div>

      {/* Bar Chart */}
      <div className="col-md-6">
        <div className="card p-3 shadow-sm">
          <h5 className="text-center">Stock Levels</h5>
          <Bar data={barChartData} />
        </div>
      </div>
    </div>
  );
};

export default Charts;
