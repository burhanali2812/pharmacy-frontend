import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AddMedicine from "./components/AddMedicine";
import Sidebar from "./components/Sidebar";
import Search from "./components/Search";
import CheckOut from "./components/CheckOut";
import useAuth from "../src/components/useAuth";
import Prescription from "./components/Prescription";
import Bill from "./components/Bill";
import BuyMedicine from "./components/BuyMedicine";
import UserInvoices from "./components/UserInvoices";
import { ToastContainer } from "react-toastify";
import Dashboard from "./components/Dashboard";
import Bill_invoice from "./components/Bill_invoice";
import PastSupplier from "./components/PastSupplier";
import SupplierDetails from "./components/SupplierDetails";
import SupplierShow from "./components/SupplierShow";
import ExpiredMedicines from "./components/ExpiredMedicines";
import LowStockMedicines from "./components/LowStockMedicines";
import OutOfStockMedicines from "./components/OutOfStockMedicines";
import Salesman from "./components/Salesman";
import Setting from "./components/Setting";

function App() {
  const [medicines, setMedicines] = useState([]);
  const [expireMedicines, setExpiredMedicines] = useState([]);
  const [preExpireMedicines, setPreExpiredMedicines] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const token = useAuth();
  const role = localStorage.getItem("role");

  const [salesManUsers, setSalesManUsers] = useState([]);
  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetch(
          "https://pharmacy-backend-beta.vercel.app/user/get-user",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          console.log("Failed to fetch Salesman");
        }
        const data = await response.json();

        const email = localStorage.getItem("email");
        const salesMan = data?.filter((user) => user.role === "salesman");
        const userFind = data?.find((user) => user.email === email);

        if (userFind) {
          setUser(userFind);
        }
        setSalesManUsers(salesMan);
      } catch (error) {
        console.error("Error fetching Salesman:", error);
      }
    };
    getUsers();
  }, [token]);

     const fetchMedicines = async () => {
      try {
        const response = await fetch(
          "https://pharmacy-backend-beta.vercel.app/medicine/get-medicine",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch medicines");
        }

        const data = await response.json();
        console.log("Fetched Medicines:", data);
        setMedicines(data);
      } catch (error) {
        console.error("Error fetching medicines:", error.message);
      }
    };

  useEffect(() => {
    if (!token) return;
    fetchMedicines();
  }, [token]);

  useEffect(() => {
    if(refresh){
      fetchMedicines();
      setRefresh(false);
    }
  },[refresh]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    const today = new Date();
    const expire = medicines.filter((med) => new Date(med.expire) < today);
    setExpiredMedicines(expire);
    const preExpire = medicines.filter((med) => {
      const expireDate = new Date(med.expire);
      const sevenDaysBeforeExpire = new Date(expireDate);
      sevenDaysBeforeExpire.setDate(sevenDaysBeforeExpire.getDate() - 7); // Subtract 7 days

      return today >= sevenDaysBeforeExpire && today < expireDate; // Expiring soon but not expired yet
    });

    setPreExpiredMedicines(preExpire);
    const outStock = medicines.filter((med) => med.quantity === 0);
    setOutOfStock(outStock);
    const lStock = medicines.filter(
      (med) => med.quantity > 0 && med.quantity < 10
    );
    setLowStock(lStock);
  }, [medicines]);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <Sidebar cart={cart} role={role} user={user}>
              <Routes>
                <Route
                  path="/search"
                  element={
                    <Search
                      cart={cart}
                      setCart={setCart}
                      medicines={medicines}
                      setMedicines={setMedicines}
                      role={role}
                    />
                  }
                />
                <Route
                  path="/addMedicine"
                  element={
                    <AddMedicine
                      medicines={medicines}
                      setMedicines={setMedicines}
                    />
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <CheckOut
                      cart={cart}
                      setCart={setCart}
                      medicines={medicines}
                      setRefresh={setRefresh}
                    />
                  }
                />
                <Route
                  path="/prescription"
                  element={<Prescription medicines={medicines} />}
                />
                <Route
                  path="/dashboard"
                  element={
                    <Dashboard
                      medicines={medicines}
                      expireMedicines={expireMedicines}
                      outOfStock={outOfStock}
                      lowStock={lowStock}
                      salesManUsers={salesManUsers}
                      preExpireMedicines={preExpireMedicines}
                    />
                  }
                />
                <Route
                  path="/buy"
                  element={
                    <BuyMedicine
                      cart={cart}
                      setCart={setCart}
                      medicines={medicines}
                      setMedicines={setMedicines}
                    />
                  }
                />
                <Route path="/bill" element={<Bill />} />
                <Route
                  path="/userInvoice"
                  element={<UserInvoices role={role} />}
                />
                <Route path="/bill-Invoice/:id" element={<Bill_invoice />} />
                <Route path="/past-suppliers" element={<PastSupplier />} />
                <Route
                  path="/details-suppliers/:supplierId"
                  element={<SupplierDetails />}
                />
                <Route
                  path="/suppliers"
                  element={<SupplierShow role={role} />}
                />
                <Route
                  path="/expired-medicines"
                  element={
                    <ExpiredMedicines expireMedicines={expireMedicines} />
                  }
                />
                <Route
                  path="/low-stock"
                  element={<LowStockMedicines lowStock={lowStock} />}
                />
                <Route
                  path="/outOfStock"
                  element={<OutOfStockMedicines outOfStock={outOfStock} />}
                />
                <Route path="/salesman" element={<Salesman />} />
                <Route
                  path="/setting"
                  element={<Setting user={user} setUser={setUser} />}
                />
              </Routes>
            </Sidebar>
          }
        />
      </Routes>
    </>
  );
}

export default App;
