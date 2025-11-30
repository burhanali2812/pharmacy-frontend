import React, { useEffect, useState } from "react";
import useAuth from "./useAuth";
import { showToast } from "./Toastify2";
import Swal from "sweetalert2";
import "./MedicineTable.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";

function Search({ cart, setCart, medicines, setMedicines, role }) {
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchQuery, setsearchQuery] = useState("");
  const token = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [supplierMedicine, setSupplierMedicine] = useState([]);
  const expireMedicines = medicines.filter(
    (med) => new Date(med.expire) < new Date()
  ).length;
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
      console.log("Fetched Medicines:", data);
      setSupplierMedicine(data);
      console.log("hello i am updated", supplierMedicine);
    } catch (error) {
      console.error("Error fetching medicines:", error.message);
    }
  };
  useEffect(() => {
    fetchMedicines();
  }, []);

  const openEditModal = (medicine) => {
    setSelectedMedicine({ ...medicine, oldQuantity: medicine.quantity });
    const editModal = new window.bootstrap.Modal(
      document.getElementById("editMedicineModal")
    );
    editModal.show();
  };
  const handleUpdateSupplier = async () => {
    await fetchMedicines();
    if (!selectedMedicine) {
      console.error("No medicine selected.");
      return;
    }
    if (supplierMedicine.length === 0) {
      console.error("supplierMedicine is empty, cannot find medicine.");
      return;
    }

    const medicine = supplierMedicine.find(
      (med) => med.sID === selectedMedicine.sID
    );

    if (!medicine) {
      console.error("Medicine not found in supplierMedicine list.");
      return;
    }
    await fetchMedicines();
    const selectedSupplierMedicines = supplierMedicine.filter(
      (sup) => sup.supplier === medicine.supplier
    );
    const selectedSupplierID = suppliers.find(
      (sup) => sup.name === medicine.supplier
    );
    console.log("suppliers:", suppliers);
    console.log("Selected suppliers ID:", selectedSupplierID);
    console.log("Selected suppliers medicine:", selectedSupplierMedicines);
    const totalMedicineQuantity = selectedSupplierMedicines.reduce(
      (sum, med) => sum + med.quantity,
      0
    );
    const totalMedicineCost = selectedSupplierMedicines.reduce(
      (sum, med) => sum + med.quantity * med.actualPrice,
      0
    );
    console.log("Medicine Found:", totalMedicineQuantity);
    console.log("Selected cost:", totalMedicineCost);
    const existingSupplierQuantity = Number(medicine.quantity);
    const existingMedicineQuantity = Number(selectedMedicine.oldQuantity);
    const updatedMedicineQuantity = Number(selectedMedicine.quantity);
    const existingMedicineCost = Number(selectedMedicine.actualPrice);
    const newQuantity =
      existingSupplierQuantity +
      (updatedMedicineQuantity - existingMedicineQuantity);
    const newTotalMEdicinequantity =
      totalMedicineQuantity +
      (updatedMedicineQuantity - existingMedicineQuantity);
    const newTotalMEdicineCost =
      Number(totalMedicineCost) +
      (updatedMedicineQuantity - existingMedicineQuantity) *
        existingMedicineCost;
    console.log("final quantity:", newTotalMEdicinequantity);
    console.log("final cost:", newTotalMEdicineCost);

    try {
      console.log("Selected Supplier:", selectedSupplierMedicines);
      const response = await fetch(
        `https://pharmacy-backend-beta.vercel.app/auth/update-quantity/${selectedSupplierID._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            additionalQuantity: newTotalMEdicinequantity,
            totalPrice: newTotalMEdicineCost,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        showToast("success", "Medicine Updated Successfully", 3000);
        await fetchMedicines();
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
        `https://pharmacy-backend-beta.vercel.app/auth/update-supplier-medicine/${medicine._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newQuantity }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update supplier medicine info");
      }

      showToast(
        "success",
        "Supplier medicine info updated successfully!",
        3000
      );
      await fetchMedicines();
      console.log("Supplier medicine info updated successfully!");
    } catch (error) {
      console.error("Error updating supplier medicine:", error.message);
    }
  };
  const handleDeleteAllMedicines = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete all Medicines",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it all!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/auth/delete-all-medicines",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        showToast("success", "All medicines deleted successfully", 3000);
        setMedicines([]); // Clear the medicines state
      } else {
        showToast(
          "error",
          `Failed to delete medicines: ${data.error || "Unknown error"}`,
          3000
        );
      }
    } catch (error) {
      showToast("error", "An error occurred while deleting medicines.", 3000);
      console.error("Error:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedMedicine) return;

    try {
      const response = await fetch(
        `https://pharmacy-backend-beta.vercel.app/auth/update-medicine/${selectedMedicine._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedMedicine),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update medicine");
      }

      showToast("success", "Medicine updated successfully!", 3000);
      await handleUpdateSupplier();
      setMedicines((prev) =>
        prev.map((med) =>
          med._id === selectedMedicine._id ? selectedMedicine : med
        )
      );
      const modalElement = document.getElementById("editMedicineModal");
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    } catch (error) {
      console.error("Error updating medicine:", error.message);
    }
  };

  const handleDelete = async (medicineDel) => {
    if (!medicineDel) {
      return;
    }
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${medicineDel.name}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `https://pharmacy-backend-beta.vercel.app/auth/delete-medicine/${medicineDel._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(medicineDel),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update medicine");
      }

      showToast("success", `${medicineDel.name} deleted successfully!`, 3000);
      setMedicines((prev) => prev.filter((med) => med._id !== medicineDel._id));
    } catch (error) {
      console.error("Error updating medicine:", error.message);
    }
  };
  const filteredMedicines = medicines.filter(
    (med) =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.sID &&
        String(med.sID).toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const outOfStockCount = medicines.filter((med) => med.quantity === 0).length;
  const lowStockCount = medicines.filter(
    (med) => med.quantity > 0 && med.quantity < 10
  ).length;
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Medicines Report", 14, 10);

    const tableColumn = [
      "Medicine ID",
      "Medicine Name",
      "Quantity",
      "Price",
      "Supplier Name",
      "Expiry Date",
    ];
    const tableRows = medicines.map((med) => [
      med.sID,
      med.name,
      med.quantity,
      med.price,
      med.supplier,
      med.expire,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("medicines.pdf");
  };
  const exportToCSV = () => {
    const tableColumn = [
      "Medicine ID",
      "Medicine Name",
      "Quantity",
      "Price",
      "Supplier Name",
      "Expiry Date",
    ];
    const tableRows = medicines.map((med) => [
      med.sID,
      med.name,
      med.quantity,
      med.price,
      med.supplier,
      med.expire,
    ]);

    const csvData = Papa.unparse({
      fields: tableColumn,
      data: tableRows,
    });

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "medicines.csv");
  };
  const exportToExcel = () => {
    const tableData = medicines.map((med) => ({
      "Medicine ID": med.sID,
      "Medicine Name": med.name,
      Quantity: med.quantity,
      Price: med.price,
      "Supplier Name": med.supplier,
      "Expiry Date": med.expire,
    }));

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medicines");

    XLSX.writeFile(workbook, "medicines.xlsx");
  };

  return (
    <div>
      <div className="container">
        <h1 style={{ textAlign: "center" }} className="my-3">
          PHARMACY MANAGEMENT SYSTEM
        </h1>
        <h2 style={{ textAlign: "center" }} className="my-3 mb-3">
          EDIT-MEDICINE
        </h2>
        <label className="form-label my-3">
          <b>Search Medicine</b>
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Search Medicine By Id or Name"
          value={searchQuery}
          onChange={(e) => setsearchQuery(e.target.value)}
        />

        {role === "admin" ? (
          <div className="d-flex justify-content-end" style={{ marginTop: 40 }}>
            <button
              className="btn btn-outline-dark position-relative"
              type="button"
              onClick={handleDeleteAllMedicines}
            >
              Delete All Medicines <i className="fas fa-trash-alt mx-2"></i>
            </button>
          </div>
        ) : (
          ""
        )}
        <div
          className="d-flex justify-content-between align-items-center "
          style={{ marginTop: 30 }}
        >
          <div className="d-flex align-items-center">
            {role === "admin" && (
              <>
                <button
                  onClick={exportToCSV}
                  className="btn btn-primary btn-sm me-2"
                >
                  <i className="fa-solid fa-file-csv me-2"></i>CSV
                </button>
                <button
                  onClick={exportToExcel}
                  className="btn btn-success btn-sm me-2"
                >
                  <i className="fa-solid fa-file-excel me-2"></i>Excel
                </button>
                <button onClick={exportToPDF} className="btn btn-danger btn-sm">
                  <i className="fa-solid fa-file-pdf me-2"></i>PDF
                </button>
              </>
            )}
          </div>

          {/* Right Side - Stock Indicators */}
          <div className="d-flex justify-content-end" style={{ marginTop: 30 }}>
            <div className="d-flex align-items-center me-3">
              <span
                className="color-box"
                style={{
                  backgroundColor: "rgb(167, 81, 20)",
                  width: "12px",
                  height: "12px",
                  display: "inline-block",
                  borderRadius: "3px",
                }}
              ></span>
              <span className="ms-2">Out of Stock: {outOfStockCount}</span>
            </div>
            <div className="d-flex align-items-center me-3">
              <span
                className="color-box"
                style={{
                  backgroundColor: "#FF8C00",
                  width: "12px",
                  height: "12px",
                  display: "inline-block",
                  borderRadius: "3px",
                }}
              ></span>
              <span className="ms-2">Low Stock: {lowStockCount}</span>
            </div>
            <div className="d-flex align-items-center">
              <span
                className="color-box"
                style={{
                  backgroundColor: "rgb(255, 0, 0)",
                  width: "12px",
                  height: "12px",
                  display: "inline-block",
                  borderRadius: "3px",
                }}
              ></span>
              <span className="ms-2">Expired Medicine: {expireMedicines}</span>
            </div>
          </div>
        </div>

        <table className="table table-striped table-hover text-center my-3">
          <thead>
            <tr>
              <th>#</th>
              <th>Medicine ID</th>
              <th>Medicine Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Supplier Name</th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map((med, index) => {
                const isExpired = new Date(med.expire) < new Date();
                const stockClass = isExpired
                  ? "expired"
                  : med.quantity === 0
                  ? "end-stock"
                  : med.quantity < 10
                  ? "low-stock"
                  : "";

                return (
                  <tr key={med._id} className={stockClass}>
                    <td>{index + 1}</td>
                    <td>{med.sID}</td>
                    <td>{med.name}</td>
                    <td>{med.quantity}</td>
                    <td>{med.price}</td>
                    <td>{med.supplier}</td>
                    <td>{med.expire}</td>
                    <td>
                      <button
                        className="btn btn-outline-success btn-sm mx-1"
                        onClick={() => openEditModal(med)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm mx-1"
                        onClick={() => handleDelete(med)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No medicines found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        className="modal fade"
        id="editMedicineModal"
        tabIndex="-1"
        aria-labelledby="editMedicineModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editMedicineModalLabel">
                Edit Medicine
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {selectedMedicine && (
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label">Medicine Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedMedicine.name}
                      onChange={(e) =>
                        setSelectedMedicine({
                          ...selectedMedicine,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedMedicine.quantity}
                      onChange={(e) =>
                        setSelectedMedicine({
                          ...selectedMedicine,
                          quantity: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedMedicine.price}
                      onChange={(e) =>
                        setSelectedMedicine({
                          ...selectedMedicine,
                          price: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={selectedMedicine.expire}
                      onChange={(e) =>
                        setSelectedMedicine({
                          ...selectedMedicine,
                          expire: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      data-bs-dismiss="modal"
                    >
                      Close
                    </button>
                    <button type="submit" className="btn btn-outline-primary">
                      Save changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
