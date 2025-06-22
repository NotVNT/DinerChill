import React from "react";

const BookingGuidePage = () => (
  <div style={{ background: '#f5f5f5', padding: 24, borderRadius: 8, maxWidth: 900, margin: '32px auto' }}>
    <img src={process.env.PUBLIC_URL + '/uploads/dieukhoansudung.png'} alt="Dinner Chill" style={{ display: 'block', margin: '0 auto 32px', maxWidth: 600, width: '100%', height: 'auto', borderRadius: 12 }} />
    <h1 style={{ textAlign: 'center' }}>Hướng dẫn cách đặt chỗ trên nền tảng Dinner Chill</h1>
    <div style={{ textAlign: 'left', marginTop: 24 }}>
      <p>Dinner Chill là một ứng dụng đặt bàn nhà hàng tiện lợi và uy tín tại Việt Nam, giúp người dùng tìm kiếm, đặt chỗ nhanh chóng tại các nhà hàng yêu thích. Với hàng ngàn đối tác nhà hàng đa dạng, Dinner Chill cung cấp các ưu đãi, giảm giá hấp dẫn cho người dùng, từ ẩm thực truyền thống đến quốc tế.</p>
      <h3>1. Truy cập trang web hoặc ứng dụng Dinner Chill:</h3>
      <ul>
        <li>Tải ứng dụng Dinner Chill từ App Store, Google Play hoặc truy cập trang web <a href="https://dinnerchill.vn" target="_blank" rel="noopener noreferrer">https://dinnerchill.vn</a></li>
        <li><b>Hướng dẫn tải app Dinner Chill:</b> (liên kết hoặc mô tả chi tiết nếu có)</li>
        <li>Hoặc truy cập trang web Dinner Chill <a href="https://dinnerchill.vn" target="_blank" rel="noopener noreferrer">tại đây</a></li>
      </ul>
      <h3>2. Đăng nhập hoặc tạo tài khoản:</h3>
      <ul>
        <li>Nếu bạn đã có tài khoản, hãy đăng nhập. Nếu chưa, bạn có thể tạo tài khoản mới bằng cách cung cấp thông tin cá nhân cơ bản như số điện thoại và email, tạo mật khẩu.</li>
        <li><b>Hướng dẫn đăng ký tài khoản Dinner Chill:</b> (liên kết hoặc mô tả chi tiết nếu có)</li>
      </ul>
      <h3>3. Tìm kiếm nhà hàng:</h3>
      <ul>
        <li>Sử dụng thanh tìm kiếm để nhập tên nhà hàng, loại hình ẩm thực, hoặc vị trí mà bạn muốn tìm kiếm. Bạn cũng có thể sử dụng các bộ lọc để thu hẹp kết quả tìm kiếm theo phong cách ẩm thực, kiểu phục vụ, giá cả, hoặc khoảng cách,...</li>
        <li><b>Hướng dẫn tìm kiếm điểm đến:</b> (liên kết hoặc mô tả chi tiết nếu có)</li>
      </ul>
      <h3>4. Chọn nhà hàng:</h3>
      <ul>
        <li>Duyệt qua danh sách các nhà hàng và chọn nhà hàng mà bạn muốn đặt chỗ. Bạn có thể xem thông tin chi tiết về nhà hàng, bao gồm thực đơn, hình ảnh, và những thông tin khác.</li>
        <li><b>Tra cứu thông tin gian hàng:</b> (liên kết hoặc mô tả chi tiết nếu có)</li>
      </ul>
      <h3>5. Đặt chỗ:</h3>
      <ul>
        <li>Nhấp vào nút "Đặt chỗ" trên trang của nhà hàng. Chọn ngày, giờ, và số lượng người tham gia. Sau đó, nhấp vào "Xác nhận"</li>
        <li><b>Thông số thông tin của một đặt chỗ, gồm:</b>
          <ul>
            <li>Số chỗ: người lớn & trẻ em</li>
            <li>Ngày giờ đến</li>
            <li>Sản phẩm chọn kèm (nếu có)</li>
            <li>Kiểu chỗ ngồi (nếu có)</li>
            <li>Yêu cầu khác (nếu có)</li>
            <li>Thông tin Khách hàng</li>
          </ul>
        </li>
        <li><b>Thực hiện đặt chỗ:</b> (liên kết hoặc mô tả chi tiết nếu có)</li>
      </ul>
      <h3>6. Xác nhận & phản hồi yêu cầu đặt chỗ của bạn:</h3>
      <ul>
        <li>Kiểm tra lại thông tin đặt chỗ của bạn và nhấp vào "Xác nhận" để hoàn tất yêu cầu đặt chỗ. Bạn sẽ nhận được phản hồi xác nhận từ Dinner Chill với thông tin chi tiết về đặt chỗ của bạn, đó là nhà hàng tiếp nhận hay nhà hàng từ chối nhận. Thông tin phản hồi qua các kênh giao tiếp sau:</li>
        <ul>
          <li>Thông tin xác nhận & phản hồi bằng tin Push</li>
          <li>Thông tin xác nhận & phản hồi bằng cuộc gọi DVKH của Dinner Chill</li>
          <li>Thông tin xác nhận & phản hồi bằng tin nhắn SMS hoặc Email từ Dinner Chill</li>
        </ul>
        <li><b>Sơ đồ tóm tắt quy trình đặt chỗ của bạn (Bên B, là Nhà hàng):</b> (nếu có hình ảnh, chèn tại đây)</li>
      </ul>
      <h3>7. Chờ đến và quản lý đặt chỗ:</h3>
      <ul>
        <li>Trong lúc chờ lịch tới nhà hàng, bạn có thể quản lý các đặt chỗ của mình thông qua tài khoản Dinner Chill. Hệ thống cũng sẽ gửi tin Push tới App của bạn để hỗ trợ nhắc bạn, để bạn không quên lịch hẹn.</li>
        <li><b>Xem lịch sử đặt chỗ:</b> (liên kết hoặc mô tả chi tiết nếu có)</li>
      </ul>
      <p>Nếu trong quá trình đặt chỗ như trên, bạn gặp bất kỳ vấn đề nào hoặc trường hợp bạn chưa thể tạo tài khoản cũng như không thể truy cập web/app Dinner Chill nhưng bạn đang cần đặt chỗ ngay: Bạn có thể gọi ngay tới số: 19006005 (1000đ/phút) để đội ngũ Dịch vụ Khách hàng của Dinner Chill hỗ trợ và Đặt chỗ giúp bạn.</p>
      <p><b>Chúc bạn có những trải nghiệm ẩm thực tuyệt vời!</b></p>
    </div>
  </div>
);

export default BookingGuidePage; 