import React, { useState, useEffect } from "react";
import { showToast } from "./Toastify2";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";
function SupplierShow({ role }) {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [newAmount, setNewAmount] = useState(0);

  const [contact, setContact] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [PastSuppliers, setPastSuppliers] = useState([]);
  const [searchQuery, setsearchQuery] = useState("");
  const navigate = useNavigate();
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const filteredSupplier = suppliers.filter(
    (sup) =>
      (sup.name &&
        sup.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sup.licenseNumber &&
        sup.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const handleRowClicked = (supplierId) => {
    navigate(`/details-suppliers/${supplierId}`);
  };

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
      const PastfilteredSuppliers = data.filter((supplier) => supplier.isPast);
      setSuppliers(filteredSuppliers);
      setPastSuppliers(PastfilteredSuppliers);
    } catch (error) {
      console.error("Error fetching supplier:", error);
    }
  };

  useEffect(() => {
    getSuppliers();
  }, []);
  const handlePastSuppliers = () => {
    navigate("/past-suppliers");
  };

  const handleAddSupplier = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/auth/add-supplier",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ licenseNumber, name, address, contact }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        showToast("success", "Supplier Added Successfully", 3000);
        getSuppliers();
        setAddress("");
        setContact("");
        setLicenseNumber("");
        setName("");
      } else {
        showToast("error", `${data.message}`, 3000);
      }
    } catch (error) {
      showToast("error", "An error occurred while adding supplier", 3000);
      console.error("Error:", error);
    }
  };
  const handleDeleteSupplier = async (supplier) => {
    if (!supplier) return;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete Supplier "${supplier.name}" Note:  Its not permanently delete you can recover it from past suppliers`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;
    try {
      const response = await fetch(
        `https://pharmacy-backend-beta.vercel.app/auth/delete-supplier/${supplier._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.log("Failed to delete Supplier");
        return;
      }
      showToast(
        "success",
        `Supplier ${supplier.name} deleted successfully`,
        3000
      );
      getSuppliers();
      setSuppliers((prev) => prev.filter((sup) => sup._id !== supplier._id));
    } catch (error) {
      console.error("Error deleting supplier:", error);
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
  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    const editModal = new window.bootstrap.Modal(
      document.getElementById("editSupplierModal")
    );
    editModal.show();
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    try {
      const updatedPaidAmount = selectedSupplier.paidAmount + newAmount;
      if (updatedPaidAmount > selectedSupplier.totalCost) {
        showToast("error", "Paid amount cannot exceed the total cost.", 3000);
        return;
      }

      const updatedSupplier = {
        ...selectedSupplier,
        paidAmount: updatedPaidAmount,
      };

      const response = await fetch(
        `https://pharmacy-backend-beta.vercel.app/auth/update-supplier/${selectedSupplier._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSupplier),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update Supplier");
      }

      showToast("success", "Supplier updated successfully!", 3000);
      setSuppliers((prev) =>
        prev.map((sup) =>
          sup._id === selectedSupplier._id ? updatedSupplier : sup
        )
      );

      setNewAmount(0);

      const modalElement = document.getElementById("editSupplierModal");
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    } catch (error) {
      console.error("Error updating supplier:", error.message);
    }
  };

  return (
    <div>
      <div className="container">
        <h1 style={{ textAlign: "center" }} className="my-3">
          PHARMACY MANAGEMENT SYSTEM
        </h1>
        <h2 style={{ textAlign: "center" }} className="my-3 mb-3">
          SUPPLIERS
        </h2>
        <div style={{ marginTop: 70 }}>
          <div className="container my-3">
            <form onSubmit={handleAddSupplier}>
              <div className="row">
                <div className="mb-3 col-md-4 mx-auto">
                  <label htmlFor="licenseNumber" className="form-label">
                    <b>License Number</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="licenseNumber"
                    id="licenseNumber"
                    placeholder="Enter Unique License Number"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                  />
                </div>

                <div className="mb-3 col-md-4 mx-auto">
                  <label htmlFor="name" className="form-label">
                    <b>Supplier Name</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    id="name"
                    placeholder="Enter Supplier/Company Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="mb-3 col-md-4 mx-auto">
                  <label htmlFor="contact" className="form-label">
                    <b>Contact Number</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="contact"
                    name="contact"
                    placeholder="Enter Contact Number"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>

                {/* Address Field with Button */}
                <div className="mb-3 col-md-8 mx-auto">
                  <label htmlFor="address" className="form-label">
                    <b>Address</b>
                  </label>
                  <div className="d-flex">
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      id="address"
                      placeholder="Enter Physical Address"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary ms-2"
                    >
                      <i className="fa-solid fa-map-marker-alt"></i>
                    </button>
                  </div>
                </div>

                <div
                  className="mb-3 col-md-4 mx-auto"
                  style={{ marginTop: 30 }}
                >
                  <button
                    className="btn btn-outline-success w-100"
                    type="submit"
                  >
                    Add Supplier{" "}
                    <i className="fa-solid fa-boxes-packing mx-2"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="d-flex justify-content-end" style={{ marginTop: 30 }}>
            <button
              className="btn btn-outline-dark position-relative"
              type="button"
              onClick={handlePastSuppliers}
            >
              View Past Suppliers{" "}
              <i className="fa-solid fa-clock-rotate-left mx-2"></i>
              {PastSuppliers?.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {PastSuppliers.length}
                  <span className="visually-hidden">unread messages</span>
                </span>
              )}
            </button>
          </div>
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
        {role === "admin" ? (
          <div className="row my-3 g-1 d-flex align-items-center">
            <div className="col-auto">
              <button onClick={exportToCSV} className="btn btn-primary btn-sm">
                <i className="fa-solid fa-file-csv me-2"></i>CSV
              </button>
            </div>
            <div className="col-auto">
              <button
                onClick={exportToExcel}
                className="btn btn-success btn-sm"
              >
                <i className="fa-solid fa-file-excel me-2"></i>Excel
              </button>
            </div>
            <div className="col-auto">
              <button onClick={exportToPDF} className="btn btn-danger btn-sm">
                <i className="fa-solid fa-file-pdf me-2"></i>PDF
              </button>
            </div>
          </div>
        ) : (
          ""
        )}

        <table className="table table-striped table-hover text-center my-3">
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
                  <td>Rs: {sup.totalCost}</td>
                  <td>Rs: {sup.paidAmount}</td>
                  <td style={{ color: "red" }}>
                    Rs: {sup.totalCost - sup.paidAmount}
                  </td>

                  <td>
                    <button
                      className="btn btn-outline-success btn-sm mx-1"
                      onClick={() => openEditModal(sup)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm mx-1"
                      onClick={() => handleDeleteSupplier(sup)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <button
                      className="btn btn-outline-primary btn-sm mx-1"
                      onClick={() => handleRowClicked(sup._id)}
                    >
                      <i className="fa-solid fa-angles-right"></i>
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
      </div>

      <div
        className="modal fade"
        id="editSupplierModal"
        tabIndex="-1"
        aria-labelledby="editSupplierModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editSupplierModalLabel">
                Edit Supplier
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {selectedSupplier && (
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label">License Number</label>
                    <input
                      type="Number"
                      className="form-control"
                      value={selectedSupplier.licenseNumber}
                      onChange={(e) =>
                        setSelectedSupplier({
                          ...selectedSupplier,
                          licenseNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Supplier Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedSupplier.name}
                      onChange={(e) =>
                        setSelectedSupplier({
                          ...selectedSupplier,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contact</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedSupplier.contact}
                      onChange={(e) =>
                        setSelectedSupplier({
                          ...selectedSupplier,
                          contact: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedSupplier.address}
                      onChange={(e) =>
                        setSelectedSupplier({
                          ...selectedSupplier,
                          address: e.target.value,
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
                      value={selectedSupplier.medicineQuantity}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Total Cost</label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedSupplier.totalCost}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Enter amount to be paid{" "}
                      <b>
                        (Pending Amount: Rs{" "}
                        {selectedSupplier.totalCost -
                          selectedSupplier.paidAmount}
                        )
                      </b>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={newAmount}
                      onChange={(e) =>
                        setNewAmount(Math.max(0, Number(e.target.value) || 0))
                      }
                      min="0"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Paid Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedSupplier.paidAmount + newAmount}
                      readOnly
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

export default SupplierShow;
