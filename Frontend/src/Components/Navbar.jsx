import { FcPackage } from "react-icons/fc";
import React, { useState } from "react";
import "./Navbar.css";
import Login from "./Login";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import { Link, useLocation } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";

function Navbar() {
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const logoutHandler = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/dashboard">
            <FcPackage />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location.pathname === "/dashboard" ? "active" : ""
                  }`}
                  aria-current={
                    location.pathname === "/dashboard" ? "page" : undefined
                  }
                  to="/dashboard"
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location.pathname === "/all-expenses" ? "active" : ""
                  }`}
                  aria-current={
                    location.pathname === "/all-expenses" ? "page" : undefined
                  }
                  to="/all-expenses"
                >
                  All Expenses
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location.pathname === "/all-incomes" ? "active" : ""
                  }`}
                  aria-current={
                    location.pathname === "/all-incomes" ? "page" : undefined
                  }
                  to="/all-incomes"
                >
                  All Incomes
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location.pathname === "/analytics" ? "active" : ""
                  }`}
                  aria-current={
                    location.pathname === "/analytics" ? "page" : undefined
                  }
                  to="/analytics"
                >
                  Analytics
                </Link>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="https://piyushmaurya-portfolio.netlify.app/#contact_id"
                  target="_self"
                  rel="noopener noreferrer"
                >
                  Contact
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  More
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className={`dropdown-item ${
                        location.pathname === "/profile" ? "active" : ""
                      }`}
                      to="/profile"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={logoutHandler}
                    >
                      Logout
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {isDarkMode ? (
                <FaSun className="theme-icon" />
              ) : (
                <FaMoon className="theme-icon" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}

export default Navbar;
