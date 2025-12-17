import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function SupplierDetails() {
  const [selectedSupplier, setSelectedSupplier] = useState({});
  const [medicines, setMedicines] = useState([]);
  const { supplierId } = useParams();

  const supplierMedicines = medicines.filter(
    (med) => med.supplier === selectedSupplier?.name
  );
  const totalMedicineQuantity = supplierMedicines.reduce(
    (sum, med) => sum + (med?.quantity || 0),
    0
  );
  const totalMedicineCost = supplierMedicines.reduce(
    (sum, med) => sum + (med?.quantity || 0) * (med?.actualPrice || 0),
    0
  );

  useEffect(() => {
    const getSuppliers = async () => {
      try {
        const response = await fetch(
          `https://pharmacy-backend-beta.vercel.app/auth/get-supplier/${supplierId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch supplier");
        }
        const data = await response.json();
        setSelectedSupplier(data);
      } catch (error) {
        console.error("Error fetching supplier:", error);
      }
    };
    getSuppliers();
  }, [supplierId]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch(
          "https://pharmacy-backend-beta.vercel.app/auth/get-supplier-medicine",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch medicines");
        }

        const data = await response.json();
        setMedicines(data);
      } catch (error) {
        console.error("Error fetching medicines:", error.message);
      }
    };

    fetchMedicines();
  }, []);

  return (
    <div>
      <div className="container mt-5">
        <h1 style={{ textAlign: "center" }} className="my-3">
          PHARMACY MANAGEMENT SYSTEM
        </h1>
        <h2 style={{ textAlign: "center" }} className="my-3 mb-3">
          MEDICINE SUPPLIER DETAILS
        </h2>
        <div className="card shadow-lg p-4 my-3">
          <h4 className="mb-3">Supplier Information</h4>
          <div className="row">
            <div className="col-md-6">
              <b>License Number:</b>{" "}
              <span id="licenseNumber">{selectedSupplier.licenseNumber}</span>
            </div>
            <div className="col-md-6">
              <b>Supplier Name:</b>{" "}
              <span id="supplierName">{selectedSupplier.name}</span>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-6">
              <b>Contact:</b>{" "}
              <span id="contact">{selectedSupplier.contact}</span>
            </div>
            <div className="col-md-6">
              <b>Address:</b>{" "}
              <span id="address">{selectedSupplier.address}</span>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-3">
              <b>Total Medicine Quantity:</b>{" "}
              <span id="totalQuantity">{totalMedicineQuantity}</span>
            </div>
            <div className="col-md-3">
              <b>Total Cost:</b> Rs:{" "}
              <span id="totalCost">{totalMedicineCost}</span>
            </div>
            <div className="col-md-3">
              <b>Paid Amount:</b> Rs:{" "}
              <span id="paidAmount">{selectedSupplier.paidAmount}</span>
            </div>
            <div className="col-md-3">
              <b>Pending Amount:</b> Rs:{" "}
              <span className="text-danger">
                {totalMedicineCost - selectedSupplier.paidAmount}
              </span>
            </div>
          </div>
        </div>

        <div className="card shadow-lg mt-5 p-4">
          <h4 className="mb-3">Medicine List</h4>
          <div className="table-responsive mt-3">
            <table className="table table-striped table-hover align-middle text-center responsive-table">
              <thead>
                <tr>
                  <th>Medicine ID</th>
                  <th>Medicine Name</th>
                  <th>Supplier Name</th>
                  <th>Quantity</th>
                  <th>Actual Price</th>
                  <th>Total Price</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {supplierMedicines.length > 0 ? (
                  supplierMedicines.map((med) => (
                    <tr key={med._id}>
                      <td>{med.sID}</td>
                      <td>{med.name}</td>
                      <td>{med.supplier}</td>
                      <td>{med.quantity}</td>
                      <td>Rs {med.actualPrice}</td>
                      <td>Rs {med.quantity * med.actualPrice}</td>
                      <td>{med.expire}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      No medicines available for this supplier
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupplierDetails;
