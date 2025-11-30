import React, { useState } from "react";
import { showToast } from "./Toastify2";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("salesman"); 
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, role }) 
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email);
      console.log("email", data.email);
      

      showToast("success", "Login Successfully", 3000);
      console.log(data.role);
      
      setTimeout(() => {
        navigate(data.role === "admin" ? "/dashboard" : "/search"); 
      }, 1300);
    } else {
      showToast("error", "Login failed: " + data.message, 3000);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4 border-0" style={{ width: "350px", borderRadius: "10px" }}>
        <div className="card-body">
          <h2 className="my-2 text-center">PHARMACY</h2>
          <h3 className="text-center mb-4 text-dark">
            <i className="fas fa-user-circle"></i> Login
          </h3>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" className="form-control" id="password"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label htmlFor="role" className="form-label ">Select Role</label>
              <select className="form-control " id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="salesman">Salesman</option>
              </select>
            </div>

            <button type="submit" className="btn btn-outline-primary w-100">
              <i className="fas fa-sign-in-alt"></i> Login
            </button>

            <div className="text-center mt-2">
              <a href="/" className="text-decoration-none">Forgot Password?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
