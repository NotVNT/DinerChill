import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import '../../styles/profile_imformation/WalletPaymentPage.css';
import LogoutHandler from '../identity/LogoutHandler';

function WalletPaymentPage() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('payment-methods');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Mock data for payment methods
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'credit', cardNumber: '**** **** **** 4567', cardHolder: 'Vinh Ngoc Tran', expiryDate: '12/25', isDefault: true },
    { id: 2, type: 'debit', cardNumber: '**** **** **** 8901', cardHolder: 'Vinh Ngoc Tran', expiryDate: '09/24', isDefault: false }
  ]);
  
  // Mock data for transactions
  const [transactions] = useState([
    { id: 101, date: '2023-11-15', amount: 250000, type: 'payment', description: 'Thanh toán đặt bàn - Nhà hàng ABC', status: 'completed' },
    { id: 102, date: '2023-11-10', amount: 50000, type: 'deposit', description: 'Nạp tiền vào ví', status: 'completed' },
    { id: 103, date: '2023-11-05', amount: 180000, type: 'payment', description: 'Thanh toán đặt bàn - Nhà hàng XYZ', status: 'completed' },
    { id: 104, date: '2023-10-28', amount: 200, type: 'deposit', description: 'Nạp tiền vào ví', status: 'completed' },
    { id: 105, date: '2023-10-20', amount: 150000, type: 'payment', description: 'Thanh toán đặt bàn - Nhà hàng DEF', status: 'completed' }
  ]);
  
  // Mock wallet balance
  const [walletBalance] = useState(320000);
  
  const handleSetDefaultPaymentMethod = (id) => {
    setPaymentMethods(prevMethods => 
      prevMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    
    setToast({
      show: true,
      message: 'Đã đặt phương thức thanh toán mặc định',
      type: 'success'
    });
    
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };
  
  const handleRemovePaymentMethod = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phương thức thanh toán này?')) {
      setPaymentMethods(prevMethods => 
        prevMethods.filter(method => method.id !== id)
      );
      
      setToast({
        show: true,
        message: 'Đã xóa phương thức thanh toán',
        type: 'success'
      });
      
      setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 3000);
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN').format(date);
  };
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!user || !user.name) return '?';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="avatar-image" />
              ) : (
                getInitials()
              )}
            </div>
            <div className="username">{user?.name}</div>
            <div className="user-info">ID: {user?.id}</div>
            <div className="user-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg> {user?.phone}
            </div>
          </div>
          
          <nav className="profile-nav">
            <ul>
              <li>
                <Link to="/profile">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  Thông tin tài khoản
                </Link>
              </li>
              <li>
                <Link to="/my-reservations">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </span>
                  Lịch sử đặt chỗ
                </Link>
              </li>
              <li>
                <Link to="/favorites">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </span>
                  Danh sách yêu thích
                </Link>
              </li>
              <li>
                <Link to="/change-password">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  Quản lý mật khẩu
                </Link>
              </li>
              <li>
                <Link to="/linked-accounts" className="active">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                  </span>
                  Ví tiền/Thanh toán
                </Link>
              </li>
              <li>
                <LogoutHandler />
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="profile-content">
          <div className="wallet-balance-card">
            <div className="balance-header">
              <h2>Số dư ví của bạn</h2>
              <div className="balance-amount">{formatCurrency(walletBalance)}</div>
            </div>
            <div className="balance-actions">
              <button className="btn-deposit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Nạp tiền
              </button>
              <button className="btn-withdraw">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Rút tiền
              </button>
            </div>
          </div>
          
          <div className="wallet-tabs">
            <div 
              className={`tab ${activeTab === 'payment-methods' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment-methods')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              Phương thức thanh toán
            </div>
            <div 
              className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
              </svg>
              Lịch sử giao dịch
            </div>
          </div>
          
          {activeTab === 'payment-methods' && (
            <div className="payment-methods-container">
              <div className="payment-methods-header">
                <h2>Phương thức thanh toán của bạn</h2>
                <button className="btn-add-payment">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Thêm phương thức mới
                </button>
              </div>
              
              {paymentMethods.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                  </div>
                  <h3>Bạn chưa có phương thức thanh toán nào</h3>
                  <p>Thêm phương thức thanh toán để đặt bàn dễ dàng hơn</p>
                  <button className="btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Thêm phương thức thanh toán
                  </button>
                </div>
              ) : (
                <div className="payment-methods-list">
                  {paymentMethods.map(method => (
                    <div key={method.id} className={`payment-method-card ${method.isDefault ? 'default' : ''}`}>
                      <div className="card-type-icon">
                        {method.type === 'credit' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                            <line x1="1" y1="10" x2="23" y2="10"></line>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                            <line x1="1" y1="10" x2="23" y2="10"></line>
                          </svg>
                        )}
                      </div>
                      
                      <div className="card-details">
                        <div className="card-number">{method.cardNumber}</div>
                        <div className="card-info">
                          <div className="card-holder">{method.cardHolder}</div>
                          <div className="card-expiry">Hết hạn: {method.expiryDate}</div>
                        </div>
                        {method.isDefault && (
                          <div className="default-badge">Mặc định</div>
                        )}
                      </div>
                      
                      <div className="card-actions">
                        {!method.isDefault && (
                          <button 
                            className="btn-set-default"
                            onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            Đặt làm mặc định
                          </button>
                        )}
                        <button 
                          className="btn-remove"
                          onClick={() => handleRemovePaymentMethod(method.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'transactions' && (
            <div className="transactions-container">
              <div className="transactions-header">
                <h2>Lịch sử giao dịch</h2>
              </div>
              
              {transactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <h3>Chưa có giao dịch nào</h3>
                  <p>Các giao dịch của bạn sẽ hiển thị ở đây</p>
                </div>
              ) : (
                <div className="transactions-list">
                  {transactions.map(transaction => (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-icon">
                        {transaction.type === 'payment' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="payment-icon">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <polyline points="19 12 12 19 5 12"></polyline>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="deposit-icon">
                            <line x1="12" y1="19" x2="12" y2="5"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                          </svg>
                        )}
                      </div>
                      
                      <div className="transaction-details">
                        <div className="transaction-description">{transaction.description}</div>
                        <div className="transaction-date">{formatDate(transaction.date)}</div>
                      </div>
                      
                      <div className={`transaction-amount ${transaction.type === 'payment' ? 'payment' : 'deposit'}`}>
                        {transaction.type === 'payment' ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </div>
                      
                      <div className={`transaction-status ${transaction.status}`}>
                        {transaction.status === 'completed' ? 'Hoàn thành' : 
                         transaction.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Toast notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}
    </div>
  );
}

export default WalletPaymentPage; 