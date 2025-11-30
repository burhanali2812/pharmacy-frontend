import React, { useEffect, useState } from "react";
import useAuth from "./useAuth";
import { showToast } from "./Toastify2";
function AddMedicine({ medicines, setMedicines }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sID, setSID] = useState("");
  const [price, setPrice] = useState("");
  const [actualPrice, setActualPrice] = useState("");
  const [profit, setProfit] = useState("");
  const [expire, setExpire] = useState("");
  const [prescription, setPrescription] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState("");
  const [selectedSupplierID, setSelectedSupplierID] = useState({});
  const [supmedicines, setSupMedicines] = useState([]);

  const token = useAuth();
  const getSuppliers = async () => {
    try {
      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/auth/get-supplier-medicine",
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
      setSupMedicines(data);
    } catch (error) {
      console.error("Error fetching supplier:", error);
    }
  };
  useEffect(() => {
    getSuppliers();
  },[]);

  useEffect(() => {
    const actualPriceNum = parseFloat(actualPrice);
    const profitNum = parseFloat(profit);
    if (!isNaN(actualPriceNum) && !isNaN(profitNum)) {
      const calculatedPrice =
        actualPriceNum + (actualPriceNum * profitNum) / 100;
      setPrice(calculatedPrice.toFixed(2));
    } else {
      setPrice("");
    }
  }, [actualPrice, profit]);

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    await getSuppliers();
    setPrice(actualPrice + actualPrice * profit);
    if (!Array.isArray(medicines)) {
      showToast("error", "Something went wrong. Please try again.", 3000);
      return;
    }
    if (!selectedSuppliers) {
      showToast(
        "error",
        "Please select a supplier before adding the medicine.",
        3000
      );
      return;
    }
    await getSuppliers();

    const existingMedicine = medicines.find((medicine) => medicine.sID === sID);
    if (existingMedicine) {
      showToast(
        "warning",
        "This ID Medicine Already Exists. Please Update or Delete it.",
        3000
      );
      return;
    }
    if (quantity <= 0) {
      showToast("warning", "Quantity must be greater than 0", 3000);
      return;
    }
    await getSuppliers();
    let formattedExpire = "";
    if (expire) {
      const dateObj = new Date(expire);
      if (!isNaN(dateObj.getTime())) {
        formattedExpire = dateObj.toISOString().split("T")[0];
      } else {
        showToast(
          "error",
          "Invalid expiry date. Please select a valid date.",
          3000
        );
        return;
      }
    } else {
      showToast("error", "Expiry date is required.", 3000);
      return;
    }
    await getSuppliers();

    const supplierMedicines = supmedicines.filter(
      (med) => med.supplier === selectedSuppliers
    );
    const totalMedicineQuantity = supplierMedicines.reduce(
      (sum, med) => sum + med.quantity,
      0
    );
    const totalMedicineCost = supplierMedicines.reduce(
      (sum, med) => sum + med.quantity * med.actualPrice,
      0
    );
    const updatedQuantity = totalMedicineQuantity + quantity;
    const upCost = parseInt(quantity) * parseFloat(actualPrice).toFixed(2);
    const updatedCost = totalMedicineCost + upCost;
    console.log("total medicine quantity:", totalMedicineQuantity);
    console.log("cost:", totalMedicineCost);
    console.log("updted quantity:", updatedQuantity);
    console.log("updated cost:", updatedCost);

    try {
      console.log("Selected Supplier:", selectedSupplierID);
      const response = await fetch(
        `https://pharmacy-backend-beta.vercel.app/auth/update-quantity/${selectedSupplierID._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            additionalQuantity: updatedQuantity,
            totalPrice: updatedCost,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        showToast("success", "Medicine Updated Successfully", 3000);
        await getSuppliers();
      } else {
        showToast(
          "error",
          `Failed to update quantity: ${data.message || "Unknown error"}`,
          3000
        );
        console.error("Error response:", data);
      }
    } catch (error) {
      showToast("error", "An error occurred while adding medicine.", 3000);
      console.error("Error:", error);
    }
    try {
      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/auth/add-medicine",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sID,
            name,
            quantity,
            price,
            expire: formattedExpire,
            prescription,
            actualPrice,
            profit,
            supplier: selectedSuppliers,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        showToast("success", "Medicine Added Successfully", 3000);
        await getSuppliers();
        setMedicines((prevMedicines) => [...prevMedicines, data]);
        setExpire("");
        setName("");
        setPrescription("");
        setQuantity("");
        setPrice("");
        setSID("");
        setActualPrice("");
        setProfit("");
        setSelectedSuppliers("");
      } else {
        showToast(
          "error",
          `Failed to add medicine: ${data.message || "Unknown error"}`,
          3000
        );
        console.error("Error response:", data);
      }
    } catch (error) {
      showToast("error", "An error occurred while adding medicine.", 3000);
      console.error("Error:", error);
    }

    try {
      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/auth/add-supplier-Medicine",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sID,
            name,
            quantity,
            price,
            expire: formattedExpire,
            prescription,
            actualPrice,
            profit,
            supplier: selectedSuppliers,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        showToast("success", "Medicine double Successfully", 3000);
        await getSuppliers();
      } else {
        showToast(
          "error",
          `Failed to add medicine: ${data.message || "Unknown error"}`,
          3000
        );
        console.error("Error response:", data);
      }
    } catch (error) {
      showToast("error", "An error occurred while adding medicine.", 3000);
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    const getSuppliers = async () => {
      try {
        const response = await fetch(
          "https://pharmacy-backend-beta.vercel.app/auth/get-supplier",
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
    getSuppliers();
  }, []);

  return (
    <div>
      <div className="container">
        <h1 style={{ textAlign: "center" }} className="my-3">
          PHARMACY MANAGEMENT SYSTEM
        </h1>
        <h2 style={{ textAlign: "center" }} className="my-3 mb-3">
          ADD-MEDICINE
        </h2>
        <div style={{ marginTop: 70 }}>
          <div className="container my-3">
            <form>
              <div className="row">
                <div className="mb-3 col-md-4 mx-auto">
                  <label htmlFor="sID" className="form-label">
                    <b>Medicine ID</b>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="sID"
                    id="sID"
                    placeholder="Enter Unique ID"
                    required
                    value={sID}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setSID(value);
                      } else {
                        setSID(0);
                      }
                    }}
                    min="0"
                  />
                </div>

                <div className="mb-3 col-md-4 mx-auto">
                  <label htmlFor="name" className="form-label">
                    <b>Medicine Name</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    id="name"
                    placeholder="Enter Medicine Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="mb-3 col-md-4 mx-auto">
                  <label htmlFor="quantity" className="form-label">
                    <b>Quantity</b>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="quantity"
                    id="quantity"
                    placeholder="Enter Quantity"
                    required
                    value={quantity}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setQuantity(value);
                      } else {
                        setQuantity(0);
                      }
                    }}
                    min="0"
                  />
                </div>
                <div className="mb-3 col-md-4 mx-auto">
                  <label htmlFor="actualPrice" className="form-label">
                    <b>Actual Price</b>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="actualPrice"
                    name="actualPrice"
                    placeholder="Enter Actual Price"
                    required
                    value={actualPrice}
                    onChange={(e) => setActualPrice(e.target.value)}
                  />
                </div>
                <div className="mb-3 col-md-4 mx-auto">
                  <label htmlFor="profit" className="form-label">
                    <b>Profit (%)</b>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="profit"
                    name="profit"
                    required
                    value={profit}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setProfit(value);
                      } else {
                        setProfit(0);
                      }
                    }}
                    min="0"
                  />
                </div>
                <div className="mb-3 col-md-4 mx-auto">
                  <label htmlFor="price" className="form-label">
                    <b>Sell Price</b>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="price"
                    name="price"
                    placeholder="Sell Price"
                    required
                    value={price}
                    readOnly
                  />
                </div>
                <div className="mb-3 col-md-6 mx-auto">
                  <label htmlFor="prescription" className="form-label">
                    <b>Prescription</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="prescription"
                    name="prescription"
                    placeholder="Enter Prescription of medicine"
                    required
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                  />
                </div>
                <div className="mb-3 col-md-3 mx-auto">
                  <label htmlFor="expire" className="form-label">
                    <b>Expiry Date</b>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    name="expire"
                    id="expire"
                    required
                    value={expire}
                    onChange={(e) => setExpire(e.target.value)}
                  />
                </div>
                <div
                  className="mb-3 col-md-3 mx-auto"
                  style={{ marginTop: 30 }}
                >
                  <div class="dropdown">
                    <button
                      class="btn btn-outline-dark dropdown-toggle w-100"
                      type="button"
                      id="dropdownMenuButton"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {selectedSuppliers || "Select Supplier"}
                    </button>
                    <ul
                      class="dropdown-menu"
                      aria-labelledby="dropdownMenuButton"
                    >
                      {suppliers.map((supplier, index) => (
                        <li key={index}>
                          <button
                            className="dropdown-item"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedSuppliers(supplier.name);
                              setSelectedSupplierID(supplier);
                            }}
                          >
                            {supplier.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-outline-success mx-2 my-2"
                  type="submit"
                  onClick={handleAddMedicine}
                >
                  Add Medicine
                  <i className="fa-solid fa-capsules mx-2"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMedicine;
