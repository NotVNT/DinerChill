import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getReviews();
      setReviews(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Không thể tải danh sách đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (reviewId) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      try {
        await adminAPI.deleteReview(reviewId);
        setReviews(prev => prev.filter(review => review.id !== reviewId));
      } catch (err) {
        console.error('Error deleting review:', err);
        setError('Không thể xóa đánh giá. Vui lòng thử lại.');
      }
    }
  };

  const handleVerifyClick = async (reviewId, currentStatus) => {
    try {
      await adminAPI.updateReviewVerification(reviewId, !currentStatus);
      setReviews(prev => prev.map(review => 
        review.id === reviewId ? {...review, isVerified: !currentStatus} : review
      ));
    } catch (err) {
      console.error('Error updating verification status:', err);
      setError('Không thể cập nhật trạng thái xác minh. Vui lòng thử lại.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading && reviews.length === 0) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-content-container">
      <h1>Quản lý Đánh giá</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {reviews.length === 0 ? (
        <div className="no-data">Chưa có đánh giá nào.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nhà hàng</th>
              <th>Người dùng</th>
              <th>Đánh giá</th>
              <th>Nội dung</th>
              <th>Ngày ghé</th>
              <th>Hình ảnh</th>
              <th>Xác minh</th>
              <th>Ngày tạo</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td>{review.id}</td>
                <td>{review.restaurantId}</td>
                <td>{review.userId}</td>
                <td>
                  <div className="star-rating">
                    {review.rating} ⭐
                  </div>
                </td>
                <td>
                  <div className="review-content">
                    {review.comment}
                  </div>
                </td>
                <td>{formatDate(review.visitDate)}</td>
                <td>
                  {review.photos && (
                    <div className="review-photos">
                      {review.photos ? 'Có' : 'Không'}
                    </div>
                  )}
                </td>
                <td>
                  <button 
                    className={`btn btn-sm ${review.isVerified ? 'btn-verified' : 'btn-unverified'}`}
                    onClick={() => handleVerifyClick(review.id, review.isVerified)}
                  >
                    {review.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                  </button>
                </td>
                <td>{formatDate(review.createdAt)}</td>
                <td>{formatDate(review.updatedAt)}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-delete"
                    onClick={() => handleDeleteClick(review.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminReviews; 