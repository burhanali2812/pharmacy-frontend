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

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToast = () => {
    showToast("success", "LogOut Successfully!", 3000);
    localStorage.removeItem("email");
    setTimeout(() => {
      navigate('/login');
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
    <div className="d-flex vh-100">
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button 
          className="btn btn-dark position-fixed m-2" 
          style={{ zIndex: 1000 }}
          onClick={toggleSidebar}
        >
          <i className="fas fa-bars"></i>
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar bg-dark text-white d-flex flex-column p-3 
          ${isOpen ? "sidebar-open" : "sidebar-collapsed"}
          ${isMobile ? (showMobileMenu ? "mobile-sidebar-open" : "mobile-sidebar-closed") : ""}`}
        style={{ 
          position: "fixed", 
          height: "100vh",
          zIndex: 999
        }}
      >
        {/* Logo */}
        <h4 className="text-center my-3 fw-bold text-white">
          <i className="fa-solid fa-prescription-bottle-medical me-2"></i>
          {!isMobile || showMobileMenu ? "PHARMACY MANAGEMENT SYSTEM" : ""}
        </h4>

        {/* User Info */}
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
          <i className="fa-solid fa-user-circle fa-2x text-secondary"></i>
          {(!isMobile || showMobileMenu) && (
            <>
              <h5 className="mb-0">{user?.name || "Loading..."}</h5>
              <span className={`badge ${role === "admin" ? "bg-danger" : "bg-primary"}`}>
                {role === "admin" ? "Admin" : "Salesman"}
              </span>
            </>
          )}
        </div>

        {/* Navigation Links */}
        <div className="my-3">
          <ul className="nav flex-column">
            {role === "admin" && (
              <li className="nav-item">
                <a 
                  href="/dashboard" 
                  className="nav-link text-white"
                  onClick={() => isMobile && setShowMobileMenu(false)}
                >
                  <i className="fas fa-home"></i> 
                  {(!isMobile || showMobileMenu) && <span className="ms-2">Dashboard</span>}
                </a>
              </li>
            )}

            <li className="nav-item">
              <a 
                href="/addMedicine" 
                className="nav-link text-white"
                onClick={() => isMobile && setShowMobileMenu(false)}
              >
                <i className="fa-solid fa-square-plus"></i> 
                {(!isMobile || showMobileMenu) && <span className="ms-2">Add Medicine</span>}
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="/buy" 
                className="nav-link text-white"
                onClick={() => isMobile && setShowMobileMenu(false)}
              >
                <i className="fa-solid fa-pills"></i> 
                {(!isMobile || showMobileMenu) && <span className="ms-2">Buy Medicine</span>}
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="/search" 
                className="nav-link text-white"
                onClick={() => isMobile && setShowMobileMenu(false)}
              >
                <i className="fas fa-edit"></i> 
                {(!isMobile || showMobileMenu) && <span className="ms-2">Edit Medicine</span>}
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="/prescription" 
                className="nav-link text-white"
                onClick={() => isMobile && setShowMobileMenu(false)}
              >
                <i className="fa-solid fa-file-medical"></i> 
                {(!isMobile || showMobileMenu) && <span className="ms-2">Medicine Prescription</span>}
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="/checkout" 
                className="nav-link text-white"
                onClick={() => isMobile && setShowMobileMenu(false)}
              >
                <i className="fa-solid fa-cart-plus"></i>
                {(!isMobile || showMobileMenu) && (
                  <span className="ms-2">
                    Cart <span className="badge text-bg-secondary">{cart.length}</span>
                  </span>
                )}
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="/userInvoice" 
                className="nav-link text-white"
                onClick={() => isMobile && setShowMobileMenu(false)}
              >
                <i className="fa-solid fa-file-invoice"></i> 
                {(!isMobile || showMobileMenu) && <span className="ms-2">Invoices</span>}
              </a>
            </li>
            <li className="nav-item">
              <div 
                className="nav-link text-white" 
                onClick={() => {
                  if (isMobile) setShowMobileMenu(false);
                  handleToast();
                }} 
                style={{ cursor: "pointer" }}
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                {(!isMobile || showMobileMenu) && <span className="ms-2">LogOut</span>}
              </div>
            </li>
          </ul>
        </div>

        {/* Sidebar Toggle Button (desktop only) */}
        {!isMobile && (
          <div className="mt-auto text-center">
            <button className="btn btn-outline-light" onClick={() => setIsOpen(!isOpen)}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className="flex-grow-1 p-4"
        style={{
          marginLeft: isMobile ? "0" : isOpen ? "250px" : "80px",
          transition: "margin-left 0.3s ease-in-out",
          paddingTop: isMobile ? "60px" : "0"
        }}
      >
        {children}
      </div>

      {/* Sidebar Styles */}
      <style>{`
        .sidebar {
          width: 250px;
          transition: all 0.3s ease-in-out;
        }
        .sidebar-collapsed {
          width: 80px;
        }
        .sidebar-collapsed span {
          display: none;
        }
        .nav-link {
          padding: 10px;
          transition: background 0.3s;
        }
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 5px;
        }
        
        /* Mobile styles */
        .mobile-sidebar-closed {
          transform: translateX(-100%);
        }
        .mobile-sidebar-open {
          transform: translateX(0);
        }
        
        @media (min-width: 768px) {
          .mobile-sidebar-closed {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Sidebar;