import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "./Toastify2";
function SignUp() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      showToast("error", "Passwords do not match!", 3000);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      showToast("error", "Password must be at least 8 characters", 3000);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password, contact }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }
      showToast("success", "Account Created Successfully", 3000);
      setTimeout(() => {
        navigate("/salesman");
      }, 1500);
    } catch (error) {
      showToast(
        "error",
        error.message || "Signup failed. Please try again.",
        3000
      );
      setError(error.message || "Signup failed");
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
          .signup-card {
            animation: fadeInUp 0.6s ease-out;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .signup-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
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
            border-color: #28a745;
            box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
          }
          
          .input-group:hover .form-control {
            border-color: #28a745;
          }
          
          .password-toggle {
            cursor: pointer;
            transition: color 0.2s;
          }
          
          .password-toggle:hover {
            color: #28a745;
          }
          
          .btn-signup {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            border: none;
            transition: all 0.3s ease;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          
          .btn-signup:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(40, 167, 69, 0.3);
          }
          
          .btn-signup:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          .salesman-icon {
            font-size: 2rem;
            color: #28a745;
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          .back-link {
            color: #28a745;
            transition: all 0.2s;
          }
          
          .back-link:hover {
            color: #20c997;
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
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div
              className="card signup-card shadow-lg border-0"
              style={{ borderRadius: "15px", backgroundColor: "#ffffff" }}
            >
              <div className="card-body p-3 p-sm-4">
                {/* Header */}
                <div className="text-center mb-3">
                  <i className="fas fa-user-tie salesman-icon mb-2"></i>
                  <h5 className="fw-bold mb-1" style={{ color: "#333" }}>
                    Salesman Account
                  </h5>
                  <p className="text-muted mb-0 small">
                    Create a new salesman account
                  </p>
                </div>

                <form onSubmit={handleCreateAccount}>
                  {/* Name Input */}
                  <div className="mb-3">
                    <label
                      htmlFor="name"
                      className="form-label small fw-semibold text-dark"
                    >
                      <i className="fas fa-user me-1"></i>Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      placeholder="Enter full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ borderRadius: "8px" }}
                      minLength={3}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Contact Input */}
                  <div className="mb-3">
                    <label
                      htmlFor="contact"
                      className="form-label small fw-semibold text-dark"
                    >
                      <i className="fas fa-phone me-1"></i>Contact Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="contact"
                      placeholder="Enter contact number"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      style={{ borderRadius: "8px" }}
                      required
                      disabled={isLoading}
                    />
                  </div>

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
                      placeholder="Enter email address"
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
                        placeholder="Enter password (min 8 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          borderRadius: "8px 0 0 8px",
                          borderRight: "none",
                        }}
                        minLength={8}
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

                  {/* Confirm Password Input */}
                  <div className="mb-3">
                    <label
                      htmlFor="confirmPassword"
                      className="form-label small fw-semibold text-dark"
                    >
                      <i className="fas fa-lock me-1"></i>Confirm Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control"
                        id="confirmPassword"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                          borderRadius: "8px 0 0 8px",
                          borderRight: "none",
                        }}
                        minLength={8}
                        required
                        disabled={isLoading}
                      />
                      <span
                        className="input-group-text bg-white password-toggle"
                        style={{
                          borderRadius: "0 8px 8px 0",
                          borderLeft: "none",
                        }}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        <i
                          className={`fas ${
                            showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                          } small`}
                        ></i>
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger py-2 small" role="alert">
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-signup w-100 text-white mb-3"
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
                        <span className="small">Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        <span className="small">Create Salesman Account</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Footer Text */}
            <div className="text-center mt-3">
              <p className="text-muted mb-0 small">
                <i className="fas fa-shield-alt me-1"></i>
                Secure Registration • Your data is protected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
