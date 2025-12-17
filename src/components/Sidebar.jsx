import React, { useState, useEffect } from "react";
import { showToast } from "./Toastify2";
import { useNavigate } from "react-router-dom";

function Sidebar({ children, cart, role, user }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToast = () => {
    showToast("success", "LogOut Successfully!", 3000);
    localStorage.removeItem("email");
    setTimeout(() => {
      navigate("/login");
    }, 1300);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileMenu(!showMobileMenu);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="d-flex vh-100 position-relative">
      {/* Mobile Hamburger Button */}
      <button
        className="btn btn-dark position-fixed top-0 start-0 m-2 d-md-none"
        style={{ zIndex: 1050 }}
        onClick={toggleSidebar}
      >
        <i className={`fas ${showMobileMenu ? "fa-times" : "fa-bars"}`}></i>
      </button>

      {/* Mobile Overlay */}
      {isMobile && showMobileMenu && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
          style={{ zIndex: 998, opacity: 0.5 }}
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar bg-dark text-white d-flex flex-column p-2 p-md-3 
          ${isOpen ? "sidebar-open" : "sidebar-collapsed"}
          ${
            isMobile
              ? showMobileMenu
                ? "mobile-sidebar-open"
                : "mobile-sidebar-closed"
              : ""
          }`}
        style={{
          position: "fixed",
          height: "100vh",
          zIndex: 999,
          overflowY: "auto",
          top: 0,
          left: 0,
        }}
      >
        {/* Logo */}
        <div className="text-center my-2 my-md-3">
          <i
            className="fa-solid fa-prescription-bottle-medical me-2"
            style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)" }}
          ></i>
          {(isOpen || showMobileMenu) && (
            <h4
              className="fw-bold text-white d-inline-block mb-0"
              style={{ fontSize: "clamp(0.75rem, 2vw, 1.25rem)" }}
            >
              PHARMACY MANAGEMENT SYSTEM
            </h4>
          )}
        </div>

        {/* User Info */}
        <div
          className={`d-flex ${
            isOpen || showMobileMenu ? "flex-row" : "flex-column"
          } align-items-center justify-content-center gap-2 mb-2 mb-md-3 flex-wrap`}
        >
          <i
            className="fa-solid fa-user-circle text-secondary"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}
          ></i>
          {(isOpen || showMobileMenu) && (
            <>
              <h6
                className="mb-0 text-center"
                style={{ fontSize: "clamp(0.875rem, 2vw, 1.125rem)" }}
              >
                {user?.name || "Loading..."}
              </h6>
              <span
                className={`badge ${
                  role === "admin" ? "bg-danger" : "bg-primary"
                }`}
                style={{ fontSize: "clamp(0.7rem, 1.5vw, 0.875rem)" }}
              >
                {role === "admin" ? "Admin" : "Salesman"}
              </span>
            </>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="my-2 my-md-3 flex-grow-1">
          <ul className="nav flex-column gap-1">
            {role === "admin" && (
              <li className="nav-item">
                <a
                  href="/dashboard"
                  className="nav-link text-white d-flex align-items-center"
                  onClick={() => isMobile && setShowMobileMenu(false)}
                >
                  <i
                    className="fas fa-home"
                    style={{
                      fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                      minWidth: "24px",
                    }}
                  ></i>
                  {(isOpen || showMobileMenu) && (
                    <span
                      className="ms-2"
                      style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                    >
                      Dashboard
                    </span>
                  )}
                </a>
              </li>
            )}

            <li className="nav-item">
              <a
                href="/addMedicine"
                className="nav-link text-white d-flex align-items-center"
                onClick={() => isMobile && setShowMobileMenu(false)}
              >
                <i
                  className="fa-solid fa-square-plus"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                    minWidth: "24px",
                  }}
                ></i>
                {(isOpen || showMobileMenu) && (
                  <span
                    className="ms-2"
                    style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                  >
                    Add Medicine
                  </span>
                )}
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/buy"
                className="nav-link text-white d-flex align-items-center"
                onClick={() => isMobile && setShowMobileMenu(false)}
              >
                <i
                  className="fa-solid fa-pills"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                    minWidth: "24px",
                  }}
                ></i>
                {(isOpen || showMobileMenu) && (
                  <span
                    className="ms-2"
                    style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                  >
                    Buy Medicine
                  </span>
                )}
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/search"
                className="nav-link text-white d-flex align-items-center"
                onClick={() => isMobile && setShowMobileMenu(false)}
              >
                <i
                  className="fas fa-edit"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                    minWidth: "24px",
                  }}
                ></i>
                {(isOpen || showMobileMenu) && (
                  <span
                    className="ms-2"
                    style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                  >
                    Edit Medicine
                  </span>
                )}
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/prescription"
                className="nav-link text-white d-flex align-items-center"
                onClick={() => isMobile && setShowMobileMenu(false)}
              >
                <i
                  className="fa-solid fa-file-medical"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                    minWidth: "24px",
                  }}
                ></i>
                {(isOpen || showMobileMenu) && (
                  <span
                    className="ms-2"
                    style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                  >
                    Medicine Prescription
                  </span>
                )}
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/checkout"
                className="nav-link text-white d-flex align-items-center"
                onClick={() => isMobile && setShowMobileMenu(false)}
              >
                <i
                  className="fa-solid fa-cart-plus"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                    minWidth: "24px",
                  }}
                ></i>
                {(isOpen || showMobileMenu) && (
                  <span
                    className="ms-2 d-flex align-items-center gap-2"
                    style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                  >
                    Cart{" "}
                    <span
                      className="badge bg-secondary"
                      style={{ fontSize: "clamp(0.7rem, 1.5vw, 0.75rem)" }}
                    >
                      {cart.length}
                    </span>
                  </span>
                )}
                {!isOpen && !showMobileMenu && (
                  <span
                    className="badge bg-secondary position-absolute"
                    style={{ fontSize: "0.6rem", top: "0", right: "0" }}
                  >
                    {cart.length}
                  </span>
                )}
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/userInvoice"
                className="nav-link text-white d-flex align-items-center"
                onClick={() => isMobile && setShowMobileMenu(false)}
              >
                <i
                  className="fa-solid fa-file-invoice"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                    minWidth: "24px",
                  }}
                ></i>
                {(isOpen || showMobileMenu) && (
                  <span
                    className="ms-2"
                    style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                  >
                    Invoices
                  </span>
                )}
              </a>
            </li>
            <li className="nav-item">
              <div
                className="nav-link text-white d-flex align-items-center"
                onClick={() => {
                  if (isMobile) setShowMobileMenu(false);
                  handleToast();
                }}
                style={{ cursor: "pointer" }}
              >
                <i
                  className="fa-solid fa-right-from-bracket"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                    minWidth: "24px",
                  }}
                ></i>
                {(isOpen || showMobileMenu) && (
                  <span
                    className="ms-2"
                    style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                  >
                    LogOut
                  </span>
                )}
              </div>
            </li>
          </ul>
        </nav>

        {/* Sidebar Toggle Button (desktop only) */}
        <div className="mt-auto text-center pb-2 d-none d-md-block">
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            <i
              className={`fas ${isOpen ? "fa-angle-left" : "fa-angle-right"}`}
            ></i>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-grow-1 p-2 p-sm-3 p-md-4 w-100"
        style={{
          marginLeft: isMobile ? "0" : isOpen ? "250px" : "80px",
          transition: "margin-left 0.3s ease-in-out",
          paddingTop: isMobile ? "60px" : "1rem",
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        {children}
      </div>

      {/* Sidebar Styles */}
      <style>{`
        .sidebar {
          width: 250px;
          transition: all 0.3s ease-in-out;
          -webkit-overflow-scrolling: touch;
        }
        .sidebar-collapsed {
          width: 80px;
        }
        .sidebar-collapsed .nav-link span {
          display: none;
        }
        .nav-link {
          padding: 0.5rem 0.75rem;
          transition: background 0.3s;
          border-radius: 0.375rem;
          margin-bottom: 0.25rem;
          position: relative;
        }
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .nav-link:active {
          background: rgba(255, 255, 255, 0.25);
        }
        
        /* Mobile styles */
        @media (max-width: 767.98px) {
          .sidebar {
            width: 280px;
            max-width: 85vw;
          }
          .mobile-sidebar-closed {
            transform: translateX(-100%);
          }
          .mobile-sidebar-open {
            transform: translateX(0);
          }
        }
        
        @media (min-width: 768px) {
          .mobile-sidebar-closed {
            transform: translateX(0);
          }
        }

        /* Smooth scrolling for sidebar */
        .sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}

export default Sidebar;
