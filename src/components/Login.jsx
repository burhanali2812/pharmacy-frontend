import React, { useState } from "react";
import { showToast } from "./Toastify2";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("salesman");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, role }),
        }
      );

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
    } catch (error) {
      showToast("error", "Network error. Please try again.", 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-4 px-2 px-sm-3"
      style={{
        backgroundColor: "#f8f9fa",
      }}
    >
      <style>
        {`
          .login-card {
            animation: fadeInUp 0.6s ease-out;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .login-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }
          
          .input-group:hover .form-control {
            border-color: #667eea;
          }
          
          .role-option {
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 10px;
          }
          
          .role-option:hover {
            border-color: #667eea;
            background-color: #f8f9ff;
            transform: scale(1.02);
          }
          
          .role-option.active {
            border-color: #667eea;
            background-color: #667eea;
            color: white;
          }
          
          .role-option input[type="radio"] {
            cursor: pointer;
          }
          
          .password-toggle {
            cursor: pointer;
            transition: color 0.2s;
          }
          
          .password-toggle:hover {
            color: #667eea;
          }
          
          .btn-login {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            transition: all 0.3s ease;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          
          .btn-login:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          }
          
          .btn-login:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          .pharmacy-icon {
            font-size: 2rem;
            color: #667eea;
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          .forgot-link {
            color: #667eea;
            transition: all 0.2s;
          }
          
          .forgot-link:hover {
            color: #764ba2;
            text-decoration: underline !important;
          }
          
          .spinner-border-sm {
            width: 1rem;
            height: 1rem;
            border-width: 0.15em;
          }
        `}
      </style>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            <div
              className="card login-card shadow-lg border-0"
              style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}
            >
              <div className="card-body p-4 p-sm-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <i className="fas fa-pills pharmacy-icon mb-2"></i>
                  <h5 className="fw-bold mb-1" style={{ color: "#333" }}>
                    PHARMACY
                  </h5>
                  <p className="text-muted mb-0 small">
                    Welcome back! Please login to your account
                  </p>
                </div>

                <form onSubmit={handleLogin}>
                  {/* Email Input */}
                  <div className="mb-3">
                    <label
                      htmlFor="email"
                      className="form-label small fw-semibold text-dark"
                    >
                      <i className="fas fa-envelope me-1"></i>Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ borderRadius: "8px" }}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="mb-3">
                    <label
                      htmlFor="password"
                      className="form-label small fw-semibold text-dark"
                    >
                      <i className="fas fa-lock me-1"></i>Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          borderRadius: "8px 0 0 8px",
                          borderRight: "none",
                        }}
                        required
                        disabled={isLoading}
                      />
                      <span
                        className="input-group-text bg-white password-toggle"
                        style={{
                          borderRadius: "0 8px 8px 0",
                          borderLeft: "none",
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i
                          className={`fas ${
                            showPassword ? "fa-eye-slash" : "fa-eye"
                          } small`}
                        ></i>
                      </span>
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark mb-2">
                      <i className="fas fa-user-tag me-1"></i>Select Role
                    </label>
                    <div className="row g-2">
                      <div className="col-6">
                        <div
                          className={`role-option text-center ${
                            role === "admin" ? "active" : ""
                          }`}
                          onClick={() => !isLoading && setRole("admin")}
                        >
                          <input
                            type="radio"
                            id="admin"
                            name="role"
                            value="admin"
                            checked={role === "admin"}
                            onChange={(e) => setRole(e.target.value)}
                            className="d-none"
                            disabled={isLoading}
                          />
                          <i
                            className="fas fa-user-shield d-block mb-1"
                            style={{ fontSize: "1.2rem" }}
                          ></i>
                          <div className="fw-semibold small">Admin</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div
                          className={`role-option text-center ${
                            role === "salesman" ? "active" : ""
                          }`}
                          onClick={() => !isLoading && setRole("salesman")}
                        >
                          <input
                            type="radio"
                            id="salesman"
                            name="role"
                            value="salesman"
                            checked={role === "salesman"}
                            onChange={(e) => setRole(e.target.value)}
                            className="d-none"
                            disabled={isLoading}
                          />
                          <i
                            className="fas fa-user-tie d-block mb-1"
                            style={{ fontSize: "1.2rem" }}
                          ></i>
                          <div className="fw-semibold small">Salesman</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="btn btn-login w-100 text-white mb-3"
                    style={{ borderRadius: "8px", padding: "0.5rem 1rem" }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span className="small">Logging in...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        <span className="small">Login</span>
                      </>
                    )}
                  </button>

                  {/* Forgot Password Link */}
                  <div className="text-center">
                    <a
                      href="/"
                      className="forgot-link text-decoration-none small"
                    >
                      <i className="fas fa-key me-1"></i>Forgot Password?
                    </a>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer Text */}
            <div className="text-center mt-3">
              <p className="text-muted mb-0 small">
                <i className="fas fa-shield-alt me-1"></i>
                Secure Login • Protected by SSL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
