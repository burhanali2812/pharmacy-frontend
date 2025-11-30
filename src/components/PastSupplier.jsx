import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { showToast } from "./Toastify2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";
function PastSupplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setsearchQuery] = useState("");
  const filteredSupplier = suppliers.filter(
    (sup) =>
      (sup.name &&
        sup.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sup.licenseNumber &&
        sup.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );
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
      const filteredSuppliers = data.filter((supplier) => supplier.isPast);
      setSuppliers(filteredSuppliers);
    } catch (error) {
      console.error("Error fetching supplier:", error);
    }
  };

  useEffect(() => {
    getSuppliers();
  }, []);

  const handleDeletePermanently = async (passtSupplier) => {
    if (!passtSupplier) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete Supplier "${passtSupplier.name}" Permanently!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete permanently!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `https://pharmacy-backend-beta.vercel.app/auth/delete-permanent-supplier/${passtSupplier._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.json();
      if (!response.ok) {
        console.log("Failed to delete Supplier");
        return;
      }
      showToast("success", data.message, 3000);
      showToast(
        "success",
        `Supplier ${passtSupplier.name} deleted Permanently successfully`,
        3000
      );
      setSuppliers((prev) =>
        prev.filter((sup) => sup._id !== passtSupplier._id)
      );
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  const handleRecoverSupplier = async (supplier) => {
    if (!supplier) return;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to Recover Supplier "${supplier.name}"`,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Recover it!",
    });

    if (!result.isConfirmed) return;
    try {
      const response = await fetch(
        `https://pharmacy-backend-beta.vercel.app/auth/recover-supplier/${supplier._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.log("Failed to recover supplier");
        return;
      }
      showToast(
        "success",
        `Supplier ${supplier.name} recover successfully`,
        3000
      );
      setSuppliers((prev) => prev.filter((sup) => sup._id !== supplier._id));
    } catch (error) {
      console.error("Error recover supplier:", error);
    }
  };
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Suppliers Report", 14, 10);

    const tableColumn = [
      "License Number",
      "Supplier Name",
      "Contact",
      "Medicine Quantity",
      "Total Cost",
      "Paid Amount",
      "Pending Amount",
    ];
    const tableRows = filteredSupplier.map((med) => [
      med.licenseNumber,
      med.name,
      med.contact,
      med.medicineQuantity,
      med.totalCost,
      med.paidAmount,
      med.totalCost - med.paidAmount,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("suppliers.pdf");
  };
  const exportToCSV = () => {
    const tableColumn = [
      "License Number",
      "Supplier Name",
      "Contact",
      "Medicine Quantity",
      "Total Cost",
      "Paid Amount",
      "Pending Amount",
    ];
    const tableRows = filteredSupplier.map((med) => [
      med.licenseNumber,
      med.name,
      med.contact,
      med.medicineQuantity,
      med.totalCost,
      med.paidAmount,
      med.totalCost - med.paidAmount,
    ]);
    const csvData = Papa.unparse({
      fields: tableColumn,
      data: tableRows,
    });

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "suppliers.csv");
  };
  const exportToExcel = () => {
    const tableData = filteredSupplier.map((med) => ({
      "License Number": med.licenseNumber,
      "Supplier Name": med.name,
      Contact: med.contact,
      "Medicine Quantity": med.medicineQuantity,
      "Total Cost": med.totalCost,
      "Paid Amount": med.paidAmount,
      "Pending Amount": med.totalCost - med.paidAmount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medicines");

    XLSX.writeFile(workbook, "suppliers.xlsx");
  };

  return (
    <>
      <div>
        <h1 style={{ textAlign: "center" }} className="my-3">
          PHARMACY MANAGEMENT SYSTEM
        </h1>
        <h2 style={{ textAlign: "center" }} className="my-3 mb-3">
          PAST SUPPLIERS
        </h2>
        <label className="form-label my-3">
          <b>Search Suppliers</b>
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Search Suppliers By Licens Number or Name "
          value={searchQuery}
          onChange={(e) => setsearchQuery(e.target.value)}
        />
      </div>
      <div className="row my-3 g-1 d-flex align-items-center">
        <div className="col-auto">
          <button onClick={exportToCSV} className="btn btn-primary btn-sm">
            <i className="fa-solid fa-file-csv me-2"></i>CSV
          </button>
        </div>
        <div className="col-auto">
          <button onClick={exportToExcel} className="btn btn-success btn-sm">
            <i className="fa-solid fa-file-excel me-2"></i>Excel
          </button>
        </div>
        <div className="col-auto">
          <button onClick={exportToPDF} className="btn btn-danger btn-sm">
            <i className="fa-solid fa-file-pdf me-2"></i>PDF
          </button>
        </div>
      </div>
      <table className="table table-striped table-hover text-left my-3">
        <thead>
          <tr>
            <th>#</th>
            <th>License Number</th>
            <th>Supplier Name</th>
            <th>Contact</th>
            <th>Medicine Quantity</th>
            <th>Total Cost</th>
            <th>Paid Amount</th>
            <th>Pending Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSupplier.length > 0 ? (
            filteredSupplier.map((sup, index) => (
              <tr key={sup._id}>
                <td>{index + 1}</td>
                <td>{sup.licenseNumber}</td>
                <td>{sup.name}</td>
                <td>{sup.contact}</td>
                <td>{sup.medicineQuantity}</td>
                <td>{sup.totalCost}</td>
                <td>{sup.paidAmount}</td>
                <td style={{ color: "red" }}>
                  {sup.totalCost - sup.paidAmount}
                </td>

                <td>
                  <button
                    className="btn btn-outline-dark btn-sm mx-1"
                    onClick={() => handleRecoverSupplier(sup)}
                  >
                    <i className="fas fa-recycle"></i>
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm mx-1"
                    onClick={() => handleDeletePermanently(sup)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No Suppliers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default PastSupplier;
