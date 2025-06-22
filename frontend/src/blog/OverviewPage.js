import React from "react";

const OverviewPage = () => (
  <div style={{ background: '#f5f5f5', padding: 24, borderRadius: 8, maxWidth: 900, margin: '32px auto' }}>
    <img src={process.env.PUBLIC_URL + '/uploads/dieukhoansudung.png'} alt="Dinner Chill" style={{ display: 'block', margin: '0 auto 32px', maxWidth: 600, width: '100%', height: 'auto', borderRadius: 12 }} />
    <h1 style={{ textAlign: 'center' }}>Giới thiệu nền tảng Dinner Chill – Cầu nối giữa thực khách và nhà hàng</h1>
    <div style={{ textAlign: 'left', marginTop: 24 }}>
      <p>Dinner Chill là nền tảng đặt chỗ trực tuyến, giúp thực khách dễ dàng tìm kiếm và lựa chọn nhà hàng theo sở thích và vị trí gần nhất. Với tính năng tối ưu và giao diện thân thiện, Dinner Chill không chỉ đơn giản hóa quá trình đặt bàn mà còn mở ra nhiều cơ hội trải nghiệm ẩm thực đa dạng. Nền tảng đang được chúng tôi cải tiến dựa trên kinh nghiệm hơn 10 năm phát triển và ứng dụng các công nghệ tự động hóa, chuyển đổi số đang diễn ra, để mang lại giá trị đặc biệt cho cả người dùng lẫn đối tác nhà hàng.</p>
      <h3>1. Đối với thực khách, người tiêu dùng:</h3>
      <ul>
        <li><b>Tìm kiếm nhà hàng đúng ý:</b> Dựa trên vị trí, món ăn yêu thích hoặc các khung giờ mong muốn, thực khách sẽ tìm được những lựa chọn gần nhất và phù hợp nhất. Ngay cả khi bạn trên hành trình di chuyển, đi du lịch đến thành phố lạ mọi lúc, mọi nơi.</li>
        <li><b>Trải nghiệm liền mạch:</b> Dinner Chill cho phép người dùng kiểm tra tình trạng chỗ trống, xem trước thực đơn, chương trình ưu đãi, và đặt chỗ ngay tức thì, đảm bảo mọi thứ diễn ra thuận lợi và tiết kiệm thời gian.</li>
        <li><b>Tiết kiệm chi phí và thời gian:</b> Với các chương trình khuyến mãi độc quyền chỉ có trên Dinner Chill, người dùng còn có cơ hội nhận nhiều ưu đãi hấp dẫn khi đặt chỗ trước.</li>
        <li><b>Tạo sự thuận tiện:</b> Thực khách không cần phải lo lắng về việc nhà hàng đã kín chỗ hay phải đợi lâu, vì Dinner Chill giúp đặt trước chỗ ngồi một cách chủ động và thuận tiện nhất.</li>
      </ul>
      <p>Trong đó, đội ngũ Dinner Chill sẽ tập trung tìm kiếm để hợp tác với các nhà hàng ngon, uy tín và đa dạng – tạo nên: Mạng lưới nhà hàng ngon trên Dinner Chill.</p>
      <h3>2. Đối với nhà cung cấp, các đối tác nhà hàng:</h3>
      <ul>
        <li><b>Tăng doanh số:</b> Nền tảng giúp nhà hàng dễ dàng bán chỗ trống trước cả khi đến khung giờ cao điểm, tận dụng tốt hơn các khoảng thời gian rảnh rỗi để thu hút khách.</li>
        <li><b>Quản lý hiệu quả hơn:</b> Với công cụ quản lý thông minh từ Dinner Chill, nhà hàng có thể theo dõi lượng đặt bàn, tối ưu hoá chỗ ngồi và nâng cao trải nghiệm dịch vụ.</li>
        <li><b>Tiếp cận tệp khách hàng rộng lớn:</b> Dinner Chill giúp nhà hàng tiếp cận đến một lượng lớn khách hàng tiềm năng đang tìm kiếm những trải nghiệm ẩm thực mới, đặc biệt qua các chương trình khuyến mãi và giảm giá độc quyền.</li>
        <li><b>Tiết kiệm chi phí marketing:</b> Nhà hàng có thể tập trung vào việc nâng cao chất lượng dịch vụ và ẩm thực mà không phải đầu tư quá nhiều vào quảng cáo, nhờ sự hỗ trợ từ nền tảng Dinner Chill trong việc kết nối với khách hàng.</li>
      </ul>
      <p>Các giá trị trên được hình thành bởi bộ 8 giải pháp của Dinner Chill dành cho nhà hàng, bạn có thể <span style={{ color: '#e31837', textDecoration: 'underline', cursor: 'pointer' }}>Xem thêm!</span></p>
      <h3>Tổng kết</h3>
      <p>Hy vọng Dinner Chill sẽ là lựa chọn lý tưởng để tạo ra một hệ sinh thái ẩm thực hiện đại, nơi mà cả thực khách lẫn nhà hàng đều được hưởng lợi từ sự kết nối thông minh và hiệu quả.</p>
      <h3>Thông tin liên hệ:</h3>
      <ul>
        <li>Email: cskh@dinnerchill.vn / kinhdoanh@dinnerchill.vn</li>
        <li>Tel: 19006005 / 0934626005</li>
        <li>Địa chỉ: VP. TP-Hà Nội: Tầng 9, Tòa Dinner Chill, Số 123 Đường Ẩm Thực, Quận Ẩm Thực, TP Hà Nội.</li>
      </ul>
      <p style={{ fontWeight: 600, color: '#e31837' }}>Nền tảng Dinner Chill – Đặt chỗ & Ưu đãi!</p>
      <p>Trân trọng cám ơn<br/>Dinner Chill Team</p>
    </div>
  </div>
);

export default OverviewPage; 