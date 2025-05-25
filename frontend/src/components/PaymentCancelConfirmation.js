import React from 'react';
import '../styles/PaymentCancelConfirmation.css';

function PaymentCancelConfirmation({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="cancel-confirmation-dialog">
        <h3>HỦY THANH TOÁN</h3>
        <p>Quý khách có chắc chắn muốn hủy giao dịch này?</p>
        <div className="confirmation-buttons">
          <button className="btn-secondary" onClick={onCancel}>Đóng</button>
          <button className="btn-primary" onClick={onConfirm}>Xác nhận hủy</button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancelConfirmation; 