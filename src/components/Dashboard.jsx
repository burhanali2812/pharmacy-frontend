import React, { useEffect, useState } from "react";
import useAuth from "./useAuth";
import { useNavigate } from "react-router-dom";
import "./MedicineTable.css";
import "react-calendar/dist/Calendar.css";
import Charts from "./Charts";
import DoughnutChart from "./DoughnutChart";

function Dashboard({
  medicines,
  expireMedicines,
  outOfStock,
  lowStock,
  salesManUsers,
  preExpireMedicines,
}) {
  const navigate = useNavigate();
  const token = useAuth();
  const [time, setTime] = useState(new Date());
  const [suppliers, setSuppliers] = useState([]);
  const [sales, setSales] = useState([]);
  const [todaySales, setTodaySale] = useState(null);

  const handleSetting = () => {
    navigate("/setting");
  };

  const getTodaySales = async () => {
    try {
      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/invoice/sales/today",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        console.log("Failed to fetch today's sales");
        return;
      }

      const data = await response.json();
      setTodaySale(data.todaySales); // Store only the sales number
    } catch (error) {
      console.error("Error fetching today's sales:", error);
    }
  };

  useEffect(() => {
    getTodaySales();
  }, []);

  const getSuppliers = async () => {
    try {
      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/supplier/get-supplier",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        console.log("Failed to fetch Suppliers");
      }
      const data = await response.json();
      const filteredSuppliers = data.filter((supplier) => !supplier.isPast);
      setSuppliers(filteredSuppliers);
    } catch (error) {
      console.error("Error fetching supplier:", error);
    }
  };

  useEffect(() => {
    getSuppliers();
  }, []);
  console.log("salesman", salesManUsers);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const getSales = async () => {
    try {
      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/auth/getPriceDetails",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        console.log("Failed to fetch sales");
      }
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error("Error fetching supplier:", error);
    }
  };
  useEffect(() => {
    getSales();
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(
          "https://pharmacy-backend-beta.vercel.app/auth/dashboard",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch user profile");
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error("Error fetching profile:", error.message);
        navigate("/login");
      }
    };

    fetchUser();
  }, [token, navigate]);

  // Dashboard cards data
  const cardsData = [
    {
      id: 1,
      icon: "fa-coins",
      title: "Total Sales",
      count: `Rs ${(sales.totalSalesPrice || 0).toFixed(2)}`,
      description: "Total sales revenue.",
    },
    {
      id: 2,
      icon: "fa-chart-bar",
      title: "Discounted Profit",
      count: `Rs ${Number(sales.profit || 0).toFixed(2)}`,
      description: "Profit including discounts.",
    },
    {
      id: 3,
      icon: "fa-chart-line",
      title: "Non-Discounted Profit",
      count: `Rs ${(sales.totalSalesPrice - sales.totalActualPrice).toFixed(
        2
      )}`,
      description: "Profit without discounts.",
    },
    {
      id: 4,
      icon: "fa-pills",
      title: "Total Medicines",
      count: medicines.length,
      description: "All available medicines in stock.",
    },
    {
      id: 5,
      icon: "fa-exclamation-triangle",
      title: "Expired Medicines",
      count: expireMedicines.length,
      description: "Medicines past their expiry date.",
    },
    {
      id: 6,
      icon: "fa-box-open",
      title: "Low Stock Medicines",
      count: lowStock.length,
      description: "Medicines running low on stock.",
    },
    {
      id: 7,
      icon: "fa-ban",
      title: "Out of Stock Medicines",
      count: outOfStock.length,
      description: "Completely out-of-stock medicines.",
    },
    {
      id: 8,
      icon: "fa-users",
      title: "Salesmen",
      count: salesManUsers.length,
      description: "Total number of sales staff.",
    },
    {
      id: 9,
      icon: "fa-truck",
      title: "Suppliers",
      count: suppliers.length,
      description: "Pharmacy suppliers and distributors.",
    },
  ];

  const handleDetailsClick = (card) => {
    if (card.id === 4) {
      navigate("/search");
    } else if (card.id === 5) {
      navigate("/expired-medicines");
    } else if (card.id === 6) {
      navigate("/low-stock");
    } else if (card.id === 7) {
      navigate("/outOfStock");
    } else if (card.id === 8) {
      navigate("/salesman");
    } else if (card.id === 9) {
      navigate("/suppliers");
    } else {
      navigate(`/details/${card.id}`);
    }
  };
  console.log("hello low stock", lowStock);

  return (
    <div className="container-fluid mt-4">
      <h1 style={{ textAlign: "center" }} className="my-3">
        PHARMACY MANAGEMENT SYSTEM
      </h1>
      <div className="mt-5">
        <div className="row gx-2">
          {/* Left Side - Dashboard Cards */}
          <div className="col-lg-9">
            <div className="card shadow-lg border-0 p-3">
              <div className="d-flex justify-content-between align-items-center mb-4 mt-5">
                <h4 className="fw-bold text-dark">
                  <i className="fa-solid fa-chart-line me-2"></i> Pharmacy
                  Dashboard
                </h4>
                <button
                  className="btn btn-outline-dark"
                  onClick={handleSetting}
                >
                  <i className="fa-solid fa-cog me-2"></i> Settings
                </button>
              </div>

              <div className="row">
                {cardsData.map((item, index) => (
                  <div key={item.id} className="col-md-4 mb-3 mt-2">
                    <div className="card text-center shadow-sm border-0 p-3 h-100 d-flex flex-column justify-content-between position-relative">
                      <i className={`fa ${item.icon} fa-lg text-dark mb-3`}></i>
                      <h6 className="fw-bold">{item.title}</h6>
                      <p className="fw-bold text-secondary">{item.count}</p>

                      {/* Conditionally render the button for all except Total Sales & Profit cards */}
                      {item.id !== 1 && item.id !== 2 && item.id !== 3 && (
                        <button
                          className="btn btn-outline-dark btn-sm position-absolute bottom-0 end-0 m-2"
                          onClick={() => handleDetailsClick(item)}
                        >
                          <i className="fa-solid fa-angle-double-right"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Charts
                  medicines={medicines}
                  lowStock={lowStock}
                  outOfStock={outOfStock}
                  expireMedicines={expireMedicines}
                  totalSales={sales.totalSalesPrice}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-3">
            {/* Merged Right-Side Card */}
            <div className="card shadow-lg border-0 p-4 bg-dark text-white">
              {/* Digital Clock Section */}

              <h5 className="text-center fw-bold mb-4">
                <i className="fa-solid fa-clock me-2"></i> Digital Clock
              </h5>
              <h2 className="text-center my-3">{time.toLocaleTimeString()}</h2>

              <hr className="text-white" />

              {/* Today's Sales Section */}
              <h5 className="text-center fw-bold mb-4">
                <i className="fa-solid fa-cash-register me-2"></i> Today's Sales
              </h5>
              <h2 className="text-center my-3">Rs {todaySales || 0}</h2>

              <hr className="text-white" />

              {/* Expiring Soon Medicines Section */}
              <h5 className="text-center fw-bold mb-4">
                <i className="fa-solid fa-exclamation-triangle me-2 text-warning"></i>{" "}
                Expiring Soon
              </h5>
              {preExpireMedicines.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {preExpireMedicines.slice(0, 5).map((med) => (
                    <li
                      key={med.id}
                      className="list-group-item bg-dark text-white d-flex justify-content-between"
                    >
                      <span>{med.name}</span>
                      <span className="text-warning">{med.expire}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted">No upcoming expiries</p>
              )}

              <hr className="text-white" />

              {/* Doughnut Chart */}
              <DoughnutChart sales={sales} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
