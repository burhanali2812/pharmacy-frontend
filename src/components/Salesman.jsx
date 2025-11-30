import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { showToast } from "./Toastify2";
import Papa from "papaparse";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
function Salesman() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [salesManUsers, setSalesManUsers] = useState([]);
  const [SelectedSalesMan, setSelectedSalesMan] = useState([]);
  const [isPromoting, setIsPromoting] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const isPosition = localStorage.getItem("SalesManToAdmin");
    setIsPromoting(isPosition);

    return () => {
      localStorage.removeItem("SalesManToAdmin");
    };
  }, []);
  const getUsers = async () => {
    try {
      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/auth/get-user",
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

      if (isPromoting === "SalesManToAdmin") {
        console.log("mydata", data);
        const email = localStorage.getItem("email");
        const userFind = data.find((user) => user.email === email);
        setUserData(userFind);
        setSalesManUsers(data);
      } else {
        const salesMan = data.filter((user) => user.role === "salesman");
        console.log("mydataold", salesMan);
        setSalesManUsers(salesMan);
      }
    } catch (error) {
      console.error("Error fetching Salesman:", error);
    }
  };
  useEffect(() => {
    if (isPromoting !== null) {
      getUsers();
    }
  }, [isPromoting]);

  const makeAdmin = async (user) => {
    const newRole = user.role === "admin" ? "salesman" : "admin";
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to change "${user.name}"'s role from "${user.role}" to "${newRole}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Change it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `https://pharmacy-backend-beta.vercel.app/auth/update-user-role/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        showToast("success", `User ${user.name} is now a ${newRole}!`, 3000);
        getUsers();

        if (
          user.email === localStorage.getItem("email") &&
          newRole !== "admin"
        ) {
          showToast(
            "success",
            "Your admin access has been revoked. Logging out...",
            3000
          );

          localStorage.removeItem("token");
          localStorage.removeItem("email");
          localStorage.removeItem("role");

          setTimeout(() => {
            navigate("/login");
          }, 1300);
        }
      } else {
        alert("Failed to update role.");
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleDeleteSalesMan = async (saleman) => {
    if (!saleman) {
      console.error("Salesman is undefined!");
      return;
    }

    console.log("Attempting to delete:", saleman._id, saleman.name);

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${saleman.name}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `https://pharmacy-backend-beta.vercel.app/auth/delete-user/${saleman._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      showToast("success", `${saleman.name} deleted successfully!`, 3000);

      await getUsers();
    } catch (error) {
      console.error("Failed to delete user:", error.message);
      showToast("error", "Error deleting Salesman!", 3000);
    }
  };

  const filteredUsers = salesManUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Salesmen Report", 14, 10);

    const tableColumn = ["Sales Man Name", "Contact", "Email", "Joined At"];
    const tableRows = filteredUsers.map((med) => [
      med.name,
      med.contact,
      med.email,
      new Date(med.joinedAt).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("salesmen.pdf");
  };
  const exportToCSV = () => {
    const tableColumn = ["Sales Man Name", "Contact", "Email", "Joined At"];
    const tableRows = filteredUsers.map((med) => [
      med.name,
      med.contact,
      med.email,
      new Date(med.joinedAt).toLocaleString(),
    ]);
    const csvData = Papa.unparse({
      fields: tableColumn,
      data: tableRows,
    });

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "salesman.csv");
  };
  const exportToExcel = () => {
    const tableData = filteredUsers.map((med) => ({
      "Sales Man Name": med.name,
      Contact: med.contact,
      Email: med.email,
      "Joined At": new Date(med.joinedAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medicines");

    XLSX.writeFile(workbook, "salesmen.xlsx");
  };
  const handleCreateAccount = async () => {
    await getUsers();
    navigate("/signup");
  };
  const openEditModal = (saleman) => {
    setSelectedSalesMan(saleman);
    const editModal = new window.bootstrap.Modal(
      document.getElementById("editUserModal")
    );
    editModal.show();
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!SelectedSalesMan) return;

    try {
      const updatedSalesMan = {
        name: SelectedSalesMan.name,
        contact: SelectedSalesMan.contact,
        email: SelectedSalesMan.email,
      };

      const response = await fetch(
        `https://pharmacy-backend-beta.vercel.app/auth/update-user/${SelectedSalesMan._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSalesMan),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        showToast("warning", data.message, 3000);
        return;
      }

      showToast("success", "User updated successfully!", 3000);
      setSalesManUsers((prev) =>
        prev.map((user) =>
          user._id === SelectedSalesMan._id
            ? { ...user, ...updatedSalesMan }
            : user
        )
      );
      const modalElement = document.getElementById("editUserModal");
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    } catch (error) {
      console.error("Error updating supplier:", error.message);
    }
  };
  return (
    <>
      <div className="container">
        <h1 className="my-3 text-center">PHARMACY MANAGEMENT SYSTEM</h1>
        <h2 className="my-3 mb-3 text-center">SALESMAN</h2>
        <div className="d-flex justify-content-end " style={{ marginTop: 70 }}>
          <button
            className="btn btn-outline-dark position-relative"
            type="button"
            onClick={handleCreateAccount}
          >
            Create SalesMan Account{" "}
            <i className="fa-solid fa-user-plus mx-2"></i>
          </button>
        </div>

        <label className="form-label my-3">
          <b>Search Salesman</b>
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Search Salesman by Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="row my-4 g-1 d-flex align-items-center">
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

        <table className="table table-striped table-hover text-center my-4">
          <thead>
            <tr>
              <th>#</th>
              <th>Sales Man Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>joined At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.contact}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.joinedAt).toLocaleString()}</td>
                  {isPromoting === "SalesManToAdmin" ? (
                    <td>
                      <button
                        className={`btn btn-${
                          user.role === "admin" ? "danger" : "success"
                        } btn-sm mx-1`}
                        onClick={() => makeAdmin(user)}
                      >
                        <i
                          className={`fas ${
                            user.role === "admin"
                              ? "fa-user-minus"
                              : "fa-user-shield"
                          }`}
                        ></i>
                        {user.role === "admin"
                          ? " Cancel Adminship"
                          : " Make Admin"}
                      </button>
                    </td>
                  ) : (
                    <td>
                      <button
                        className="btn btn-outline-success btn-sm mx-1"
                        onClick={() => openEditModal(user)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm mx-1"
                        onClick={() => handleDeleteSalesMan(user)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No Sales Man found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        className="modal fade"
        id="editUserModal"
        tabIndex="-1"
        aria-labelledby="editUserModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editUserModalLabel">
                Edit Sales Man
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {SelectedSalesMan && (
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={SelectedSalesMan.name}
                      onChange={(e) =>
                        setSelectedSalesMan({
                          ...SelectedSalesMan,
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
                      value={SelectedSalesMan.contact}
                      onChange={(e) =>
                        setSelectedSalesMan({
                          ...SelectedSalesMan,
                          contact: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={SelectedSalesMan.email}
                      onChange={(e) =>
                        setSelectedSalesMan({
                          ...SelectedSalesMan,
                          email: e.target.value,
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
    </>
  );
}

export default Salesman;
