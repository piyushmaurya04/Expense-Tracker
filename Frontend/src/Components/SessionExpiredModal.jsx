import React from "react";
import "./SessionExpiredModal.css";
import { MdLogout, MdWarning } from "react-icons/md";

function SessionExpiredModal({ isOpen, onRelogin }) {
  if (!isOpen) return null;

  return (
    <div className="session-expired-overlay">
      <div
        className="session-expired-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-expired-title"
      >
        <div className="session-expired-icon">
          <MdWarning />
        </div>

        <h2 id="session-expired-title">Session expired</h2>
        <p className="session-expired-message">
          Your session has ended for security reasons. You have been logged out
          automatically.
        </p>
        <p className="session-expired-subtext">
          Please log in again to continue using your account.
        </p>

        <button className="session-expired-button" onClick={onRelogin}>
          <MdLogout /> Logout &amp; Re-login
        </button>
      </div>
    </div>
  );
}

export default SessionExpiredModal;
