import React, { useState } from 'react';
import axios from 'axios';
import '../styles/TestPaymentPage.css';

const TestPaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [processingProduct, setProcessingProduct] = useState(null);

  const products = [
    {
      id: 1,
      name: 'Mì Hảo Hảo',
      price: 5000,
      image: 'https://cdn.tgdd.vn/Products/Images/2565/76311/bhx/mi-hao-hao-tom-chua-cay-goi-75g-202305151553013045.jpg',
      description: 'Mì tôm chua cay Hảo Hảo 75g'
    },
    {
      id: 2,
      name: 'Cơm chiên dương châu',
      price: 50000,
      image: 'https://cdn.tgdd.vn/Files/2022/01/25/1412805/cach-lam-com-chien-duong-chau-ngon-chuan-vi-nha-hang-202201250230038502.jpg', 
      description: 'Cơm chiên với thịt, trứng, đậu, cà rốt, hành'
    },
    {
      id: 3,
      name: 'Trà sữa trân châu',
      price: 30000,
      image: 'https://cdn.tgdd.vn/Files/2021/08/10/1374160/cach-lam-tra-sua-tran-chau-duong-den-tai-nha-202108100913485175.jpg',
      description: 'Trà sữa thơm ngon với trân châu đường đen'
    }
  ];

  const handlePayment = async (product) => {
    try {
      setLoading(true);
      setErrorMessage('');
      setProcessingProduct(product.id);
      
      const response = await axios.post('/api/payment/create', {
        amount: product.price,
        orderInfo: `${product.name}`,
        productId: product.id
      });
      
      // Redirect to payment URL if available
      if (response.data && response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        setErrorMessage('Không thể tạo liên kết thanh toán');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('Lỗi khi xử lý thanh toán: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-payment-container">
      <h1>Test Thanh Toán</h1>
      <p className="payment-intro">
        Chọn một sản phẩm bên dưới để thử nghiệm chức năng thanh toán PayOS
      </p>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      <div className="products-grid">
        {products.map(product => (
          <div className="product-card" key={product.id}>
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">{product.price.toLocaleString()}đ</p>
              <button 
                className="payment-button"
                onClick={() => handlePayment(product)}
                disabled={loading && processingProduct === product.id}
              >
                {loading && processingProduct === product.id ? 'Đang xử lý...' : 'Mua ngay'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestPaymentPage; 