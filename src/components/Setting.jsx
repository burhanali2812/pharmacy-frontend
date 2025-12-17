import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "./Toastify2";
import Swal from "sweetalert2";
function Setting({ user, setUser }) {
  const [name, setName] = useState(user?.name || "Loading...");
  const [email, setEmail] = useState(user?.email || "Loading...");
  const [contact, setContact] = useState(user?.contact || "Loading...");

  const [nname, setnName] = useState("");
  const [nemail, setnEmail] = useState("");
  const [ncontact, setnContact] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState([]);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");

  const navigate = useNavigate();
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to updated "${user.name}" Profile`,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Update it!",
    });

    if (!result.isConfirmed) return;
    try {
      const updatedSalesMan = {
        name: name,
        contact: contact,
        email: email,
      };

      const response = await fetch(
        `https://pharmacy-backend-beta.vercel.app/user/update-user/${user._id}`,
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
      const updatedUser = { ...user, name, email, contact };
      setUser(updatedUser);
      showToast("success", "User updated successfully!", 3000);
    } catch (error) {
      console.error("Error updating supplier:", error.message);
    }
  };

  const handleLogoutAllDevices = () => {
    alert("Logged out from all devices!");
  };

  const makeAdminFromSalesMan = () => {
    const position = "SalesManToAdmin";
    localStorage.setItem("SalesManToAdmin", position);
    navigate("/salesman");
  };
  const openEditModalPassword = () => {
    setSelectedUser(user);
    const editModal = new window.bootstrap.Modal(
      document.getElementById("editUserModalPassword")
    );
    editModal.show();
  };

  const openEditModal = () => {
    setSelectedUser(user);
    const editModal = new window.bootstrap.Modal(
      document.getElementById("editUserModal")
    );
    editModal.show();
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (password !== confirmPassword) {
      showToast("error", "password does not match", 3000);
      return;
    }

    try {
      const updatedSalesMan = {
        name: nname,
        contact: ncontact,
        email: nemail,
        password: password,
        role: "admin",
      };

      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/auth/signup",
        {
          method: "POST",
          headers: {
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

      showToast("success", "Admin Created successfully!", 3000);

      const modalElement = document.getElementById("editUserModal");
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    } catch (error) {
      console.error("Error updating supplier:", error.message);
    }
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== newConfirmPassword) {
      showToast(
        "error",
        "New password and confirm password do not match",
        3000
      );
      return;
    }
    if(oldPassword === newPassword || oldPassword === newConfirmPassword){
      showToast(
        "error",
        "Old password and new password cannot be the same",
        3000
      );
      return;
    }
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to Change "${user.name}" password!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Change it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `https://pharmacy-backend-beta.vercel.app/user/change-password/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        showToast("error", data.message, 3000);
        return;
      }

      showToast("success", "Password updated successfully!", 3000);
      const modalElement = document.getElementById("editUserModalPassword");
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showToast("error", "Something went wrong", 3000);
    }
  };

  return (
    <>
      <div className="container mt-4">
        <h2 className="mb-4">
          <i className="fas fa-cogs"></i> Admin Settings
        </h2>

        {/* Profile Settings */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title fw-bold">
              <i className="fas fa-user-edit"></i> Edit Profile
            </h5>

            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-user"></i> Name
              </label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-envelope"></i> Email
              </label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-phone"></i> Contact
              </label>
              <input
                type="text"
                className="form-control"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>

            {/* Update Profile Button */}
            <div className="text-end">
              <button
                className="btn btn-primary px-4"
                onClick={handleProfileUpdate}
              >
                <i className="fas fa-save"></i> Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* Security & Role Management - Two Cards in a Row */}
        <div className="row g-3">
          {/* Role Management Card */}
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold">
                  <i className="fas fa-users-cog"></i> Role Management
                </h5>

                <div className="d-flex flex-column gap-2 mt-auto">
                  <button
                    className="btn btn-outline-success"
                    onClick={openEditModal}
                  >
                    <i className="fas fa-user-plus"></i> Make New Admin
                  </button>

                  <button
                    className="btn btn-outline-dark"
                    onClick={makeAdminFromSalesMan}
                  >
                    <i className="fas fa-user-shield"></i> Promote Salesman to
                    Admin
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold">
                  <i className="fas fa-lock"></i> Security Settings
                </h5>

                <div className="d-flex flex-column gap-2 mt-auto">
                  <button
                    className="btn btn-outline-warning"
                    onClick={openEditModalPassword}
                  >
                    <i className="fas fa-key"></i> Change Password
                  </button>

                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleLogoutAllDevices}
                  >
                    <i className="fas fa-sign-out-alt"></i> Logout from All
                    Devices
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                Make New Admin
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {selectedUser && (
                <form onSubmit={handleUpdate}>
                  <div className="mb-3 input-group">
                    <span className="input-group-text">
                      <i className="fas fa-user"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Admin Name"
                      value={nname}
                      onChange={(e) => setnName(e.target.value)}
                      minLength={3}
                      required
                    />
                  </div>

                  <div className="mb-3 input-group">
                    <span className="input-group-text">
                      <i className="fas fa-phone"></i>
                    </span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Contact Number"
                      value={ncontact}
                      onChange={(e) => setnContact(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3 input-group">
                    <span className="input-group-text">
                      <i className="fas fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email Address"
                      value={nemail}
                      onChange={(e) => setnEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3 input-group">
                    <span className="input-group-text">
                      <i className="fas fa-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>

                  <div className="mb-3 input-group">
                    <span className="input-group-text">
                      <i className="fas fa-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={8}
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
                      Make Admin
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editUserModalPassword"
        tabIndex="-1"
        aria-labelledby="editUserModalLabelPassword"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content shadow-sm rounded-3">
            <div className="modal-header">
              <h5 className="modal-title" id="editUserModalLabelPassword">
                Change Password
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {selectedUser && (
                <>
                  {/* Displaying User Name */}
                  <p className="text-muted mb-3">
                    Changing password for: <strong>{selectedUser.name}</strong>
                  </p>

                  <form onSubmit={handleChangePassword}>
                    {/* Old Password */}
                    <div className="mb-3">
                      <label className="form-label">Old Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fas fa-lock"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter Old Password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          minLength={8}
                          required
                        />
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fas fa-lock"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          minLength={8}
                          required
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-3">
                      <label className="form-label">Confirm Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fas fa-lock"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Confirm New Password"
                          value={newConfirmPassword}
                          onChange={(e) =>
                            setNewConfirmPassword(e.target.value)
                          }
                          minLength={8}
                          required
                        />
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        data-bs-dismiss="modal"
                      >
                        Close
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Change Password
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Setting;
