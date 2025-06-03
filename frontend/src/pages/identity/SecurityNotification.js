import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/identity/SecurityNotification.css";

const SecurityNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we should show the notification (could be based on time since last password change)
    // For now, we'll just show it based on a value in localStorage
    const lastPasswordUpdate = localStorage.getItem("lastPasswordUpdate");
    const shouldShowNotification =
      !lastPasswordUpdate ||
      new Date().getTime() - parseInt(lastPasswordUpdate) >
        90 * 24 * 60 * 60 * 1000; // 90 days

    if (shouldShowNotification) {
      setShowNotification(true);
    }
  }, []);

  const handleUpdateNow = () => {
    // Navigate to the change password page
    navigate("/change-password");
  };

  const handleDismiss = () => {
    setShowNotification(false);
    // Remember that we've dismissed this notification
    localStorage.setItem(
      "passwordNotificationDismissed",
      new Date().getTime().toString()
    );
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="security-notification">
      <div className="security-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      </div>
      <div className="notification-text">
        Để bảo mật tài khoản, hãy cập nhật mật khẩu của bạn thường xuyên.
      </div>
      <div className="notification-actions">
        <button className="btn-update-now" onClick={handleUpdateNow}>
          Cập nhật ngay
        </button>
        <button className="btn-dismiss" onClick={handleDismiss}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SecurityNotification;
