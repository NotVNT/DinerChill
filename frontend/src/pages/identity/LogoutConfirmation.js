import React from 'react';
import '../../styles/layout/logout-confirmation.css';

function LogoutConfirmation({ onConfirm, onCancel }) {
  return (
    <div className="logout-confirmation">
      <div className="logout-confirmation-dialog">
        <h3>Đăng xuất</h3>
        <p>Bạn có muốn đăng xuất không?</p>
        <div className="logout-confirmation-buttons">
          <button onClick={onCancel}>Hủy</button>
          <button onClick={onConfirm}>Đăng xuất</button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirmation; 