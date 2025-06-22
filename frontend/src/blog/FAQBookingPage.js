import React from "react";

const FAQBookingPage = () => (
  <div style={{ background: '#f5f5f5', padding: 24, borderRadius: 8, maxWidth: 900, margin: '32px auto' }}>
    <h1 style={{ textAlign: 'center' }}>Câu hỏi thường gặp khi khách hàng đặt chỗ trên Dinner Chill</h1>
    <div style={{ textAlign: 'left', marginTop: 24 }}>
      <p>Trong quá trình sử dụng nền tảng Dinner Chill đặt chỗ nhà hàng, nhiều thực khách có những câu hỏi thắc mắc, vì vậy chúng tôi liệt kê sẵn câu hỏi khá phổ biến và kèm câu trả lời để bạn có thể tìm hiểu nhanh:</p>
      <h3>1. Đăng ký sử dụng Dinner Chill như thế nào?</h3>
      <p><b>Trả lời:</b> Để đăng ký tài khoản để sử dụng Dinner Chill, Anh/Chị vui lòng truy cập đường link website sau: https://dinnerchill.vn/dang-ky , hoặc tải App và truy cập mục Đăng ký/Đăng nhập và nhập thông tin theo yêu cầu để đăng ký.</p>
      <p>Mời bạn xem thêm hướng dẫn sử dụng Dinner Chill <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>tại đây!</a></p>
      <h3>2. Làm thế nào để đặt bàn?</h3>
      <p><b>Trả lời:</b> Bạn có thể Đặt chỗ trực tuyến mọi lúc, mọi nơi 24/7 đến các nhà hàng thông qua nền tảng Dinner Chill gồm website: dinnerchill.vn và ứng dụng di động trên iOS và Android.</p>
      <p>Hướng dẫn chi tiết <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>tại đây!</a></p>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
        <img src={process.env.PUBLIC_URL + '/uploads/huong-dan-dat-ban-truc-tuyen.png'} alt="Hướng dẫn đặt bàn Dinner Chill" style={{ maxWidth: 700, width: '100%', height: 'auto', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }} />
      </div>
      <h3>3. Tôi có thể gọi điện để hỗ trợ đặt bàn không?</h3>
      <p><b>Trả lời:</b> Có, trong trường hợp bạn không thể đặt chỗ trực tuyến trên Dinner Chill, bạn có thể gọi 19006005 (1000đ/phút) để đội ngũ DVKH của chúng tôi hỗ trợ và đặt chỗ nhà hàng giúp bạn!</p>
      <h3>4. Có phải trả phí khi đặt bàn không?</h3>
      <p><b>Trả lời:</b> Hoàn toàn miễn phí (trừ các loại cước viễn thông khi bạn dùng dịch vụ kết nối của các nhà mạng, nhà cung cấp kết nối internet,...)</p>
      <h3>5. Làm sao biết nhà hàng còn chỗ trống?</h3>
      <p><b>Trả lời:</b> Hệ thống sẽ tự động kiểm tra tính khả dụng chỗ ngồi tại nhà hàng giúp bạn, và trong nhiều trường hợp chúng tôi sẽ thêm bước xác thực với cả nhà hàng và với bạn để khả năng đảm bảo còn chỗ phục vụ theo kế hoạch của bạn là cao nhất (Theo ghi nhận trên nền tảng Dinner Chill, khi nhà hàng đã đồng ý nhận đặt chỗ thì đảm bảo cho bạn 97% chỗ ngồi đúng kế hoạch, và nếu có bất khả kháng xảy ra thì bạn cũng gần như 100% được báo trước).</p>
      <h3>6. Có thể hủy hoặc thay đổi đặt bàn không?</h3>
      <p><b>Trả lời:</b> Có, bạn có thể điều chỉnh hoặc hủy đặt chỗ bất cứ khi nào, bằng cách liên hệ với Dinner Chill hoặc trực tiếp nhà hàng. Lưu ý, với các đặt chỗ có yêu cầu đặt cọc thì bạn cần chấp thuận với điều khoản quy định về đặt cọc của nhà hàng đó!</p>
      <h3>7. Làm sao nhận ưu đãi hoặc khuyến mãi?</h3>
      <p><b>Trả lời:</b></p>
      <ul>
        <li>Phần lớn chỉ cần đặt chỗ qua Dinner Chill là đủ.</li>
        <li>Sẽ có trường hợp: nhà hàng bổ sung thêm quy định hưởng, bạn vui lòng đọc thông tin ở mục Quy định có trong Gian hàng trên Dinner Chill.</li>
      </ul>
      <h3>8. Thông tin của tôi có được bảo mật không?</h3>
      <p><b>Trả lời:</b> Có và Dinner Chill sẽ tuân thủ theo "Chính sách bảo mật thông tin", mời bạn vui lòng bấm vào để tìm hiểu.</p>
      <h3>9. Nhà hàng có chấp nhận yêu cầu đặc biệt không?</h3>
      <p><b>Mô tả thêm:</b> Ví dụ như tôi muốn yêu cầu chế độ ăn đặc biệt, ghế trẻ em, hoặc vị trí ngồi cụ thể,...</p>
      <p><b>Trả lời:</b> Hầu hết là CÓ, bạn có thể thực hiện bằng cách xem các lựa chọn trong khi điền thông tin đặt chỗ (nếu có) hoặc điền vào mục ghi chú trong mỗi đặt chỗ. Ngoài ra, chúng tôi khuyến nghị bạn có thể liên hệ với đội ngũ DVKH của chúng tôi để được trợ giúp với các yêu cầu đặc biệt.</p>
      <h3>10. Tôi có nhận được xác nhận đặt chỗ không?</h3>
      <p><b>Mô tả thêm:</b> Chắc bạn thường muốn biết liệu bạn có nhận được email, tin nhắn, cuộc gọi,... để xác nhận đặt bàn sau khi hoàn tất không?</p>
      <p><b>Trả lời:</b> Có, chúng tôi sẽ phản hồi xác nhận yêu cầu đặt chỗ của bạn là thành công hay bị từ chối từ phía nhà hàng (nhiều trường hợp kèm tư vấn bởi đội ngũ DVKH của chúng tôi).</p>
      <h3>11. Tôi đến trễ so với thời gian đã đặt bàn có được không?</h3>
      <p><b>Trả lời:</b> Anh/Chị vui lòng đến đúng thời gian đã đặt bàn. Tùy từng Nhà hàng sẽ giữ chỗ cho Anh/Chị trong vòng 15 – 30 phút – có trong quy định bạn vui lòng nên đọc. Tuy nhiên, Nếu Anh/Chị đến muộn hơn, vui lòng gọi đến Tổng đài Dinner Chill DVKH để được hỗ trợ hoặc liên hệ trực tiếp tới nhà hàng để thay đổi thời gian đến nhà hàng.</p>
      <h3>12. Làm thế nào để Nhà hàng biết tôi đã đặt bàn Dinner Chill?</h3>
      <p><b>Trả lời:</b> Khi đến Nhà hàng, Anh/Chị vui lòng thông báo đã đặt bàn qua Dinner Chill, cung cấp 5 số cuối SĐT, hoặc Tên user, thì nhà hàng sẽ kiểm tra và sắp xếp chỗ ngồi, cũng như là điều kiện để Anh/Chị hưởng chương trình ưu đãi tặng kèm (nếu có).</p>
      <h3>13. Nếu lễ tân tiếp đón nói không biết thông tin tôi đặt bàn trước qua Dinner Chill thì làm thế nào?</h3>
      <p><b>Trả lời:</b> Cũng có thể xảy ra tình huống này trong quá trình yêu cầu đặt bàn chuyển tới các bạn lễ tân tiếp đón khách của Nhà hàng. Khi ấy, mong Quý thực khách thông cảm và báo với các bạn lễ tân kiểm tra lại thông tin giúp hoặc gọi tới số 19006005 để được hỗ trợ trực tiếp và kịp thời. Chúng tôi cam kết tất cả vì quyền lợi và uy tín với thực khách để hành động.</p>
      <h3>14. Tôi không nhận được ưu đãi khi thanh toán thì phải làm thế nào?</h3>
      <p><b>Trả lời:</b> Anh/Chị vui lòng trao đổi với nhà hàng dựa trên quy định đăng tải trên Gian hàng trên Dinner Chill với nhân viên Lễ tân/Thu ngân khi đó để kiểm tra và xác định quyền hưởng ưu đãi/khuyến mại, hoặc gọi đến Tổng đài DVKH Dinner Chill để được hỗ trợ. Dinner Chill sẽ hỗ trợ kịp thời mọi vấn đề phát sinh.</p>
      <h3>15. Tôi đã đặt bàn Dinner Chill mà đến nhà hàng lại không có thông tin đặt trước, phải làm thế nào để giải quyết?</h3>
      <p><b>Trả lời:</b> Anh/Chị vui lòng cung cấp lịch sử đặt chỗ trên website hay ứng dụng Dinner Chill cho Lễ tân/Nhân viên tiếp đón của nhà hàng xem và họ kiểm tra lại, hoặc nếu không thể thì bạn gọi đến Tổng đài DVKH của Dinner Chill để được hỗ trợ và kiểm tra thông tin đặt chỗ ngay!</p>
      <h3>16. Tôi muốn tìm nhà hàng gần tôi thế nào?</h3>
      <p><b>Trả lời:</b></p>
      <ul>
        <li>Bạn nên sử dụng ứng dụng Dinner Chill, bật chế độ cho phép dùng quyền định vị. Bạn ấn vào tính năng Gần bạn, chúng tôi sẽ liệt kê nhà hàng theo vị trí bạn đứng, bạn cũng có thể xem trực quan trên bản đồ.</li>
        <li>Trường hợp bạn dùng website: Cũng tìm được theo khoảng cách bằng cách ấn vào nút biểu tượng bản đồ (hoặc thông điệp: Địa điểm gần bạn/Nhà hàng gần bạn).</li>
      </ul>
      <p>Trên đây là các câu hỏi và trả lời dành cho Khách hàng đặt chỗ nhà hàng trên Dinner Chill, hy vọng giúp bạn hài lòng khi sử dụng nền tảng Dinner Chill để đặt bàn, nếu có câu hỏi nào thêm vui lòng cho chúng tôi biết!</p>
      <h3>Bộ phận tiếp nhận và hỗ trợ: Dịch Vụ Khách Hàng (DVKH)</h3>
      <ul>
        <li>Số tổng đài chính: 19006005</li>
        <li>Số di động: 0931.006.005</li>
        <li>Zalo/Viber: 0931.006.005</li>
        <li>Email: CSKH@dinnerchill.vn</li>
      </ul>
      <p>Trân trọng cảm ơn!<br/>Dinner Chill team</p>
    </div>
  </div>
);

export default FAQBookingPage; 