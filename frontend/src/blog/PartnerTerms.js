import React from "react";

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  margin: '24px 0',
  background: '#fff',
};
const thtdStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  verticalAlign: 'top',
  fontSize: 15,
};
const thStyle = {
  ...thtdStyle,
  background: '#f0f0f0',
  fontWeight: 'bold',
};

const PartnerTerms = () => (
  <div style={{ background: '#f5f5f5', padding: 24, borderRadius: 8, maxWidth: 900, margin: '32px auto' }}>
    <h1 style={{ textAlign: 'center' }}>Điều khoản với Đối tác kinh doanh trên Dinner Chill</h1>
    <p style={{ textAlign: 'center', fontStyle: 'italic' }}>Cập nhật và có hiệu lực: Ngày 5 tháng 6 năm 2024</p>
    <img src={process.env.PUBLIC_URL + '/uploads/DinnerChill.png'} alt="Dinner Chill" style={{ display: 'block', margin: '24px auto', maxWidth: 800, width: '100%', height: 'auto' }} />
    <div style={{ textAlign: 'left' }}>
      <p>Đây là các điều khoản về những chính sách hay thỏa thuận áp dụng dành cho Đối tác kinh doanh trên Dinner Chill – còn gọi là Nhà cung cấp, khi Nhà cung cấp đăng ký sử dụng Gói dịch vụ của Dinner Chill nhằm phục vụ mục đích kinh doanh trên nền tảng Dinner Chill. Nhà cung cấp trên Dinner Chill thường là: các Doanh nghiệp như Nhà hàng,...và đã ký Hợp đồng hợp tác với Dinner Chill.</p>
      <h3>Điều khoản 1: Các thuật ngữ, khái niệm và quy định chung:</h3>
      <ol>
        <li><b>Vai trò của Điều khoản với Đối tác:</b><br/>
          Điều khoản với Đối tác sẽ là một phần không tách rời và có tính đồng bộ, nhất quán với các Tài liệu khác: "Quy chế Hoạt động",  "Điều khoản sử dụng Dinner Chill", "Chính sách bảo mật thông tin", "Hợp đồng hợp tác",... nghĩa là bạn đọc có thể thấy các quy định, khái niệm hay thuật ngữ trình bày ở tài liệu này hoặc các tài liệu trên mà chưa hiểu, thì chắc chắn đã được định nghĩa một trong các Tài liệu đã nêu ở đây, bạn đọc vui lòng tra cứu. Và dưới đây là các khái niệm, thuật ngữ chúng ta sẽ sử dụng:
        </li>
        <li><b>Nền tảng Dinner Chill ("Dinner Chill"):</b> thuộc sở hữu của Công ty cùng tên: Công ty Cổ phần Dinner Chill (Nền tảng Dinner Chill là gì - đã được mô tả trong "Quy chế Hoạt động"). Trong Hợp đồng hợp tác gọi tắt là Bên A.</li>
        <li><b>Đối tác Nhà cung cấp:</b> hay "Đối tác kinh doanh", "Đối tác", "Bạn": Là bên chủ sở hữu các Doanh nghiệp, như: một hoặc nhiều nhà hàng hoặc nhà hàng thương hiệu chuỗi. Trong Hợp đồng Hợp tác, còn gọi tắt là Bên B.</li>
        <li><b>Khách hàng Dinner Chill:</b> hay "Khách hàng": Là những người sử dụng nền tảng Dinner Chill của Bên A, để đặt chỗ trước khi tới nhà hàng của Bên B.</li>
        <li><b>Gian hàng:</b> Là nơi để Bên B trình bày mỗi cơ sở kinh doanh nhà hàng của mình trên nền tảng Dinner Chill để Khách hàng tìm hiểu, lựa chọn và đặt chỗ trước khi đến ăn. Các thông số hình thành nên Gian hàng gọi là Hồ sơ Gian hàng.</li>
        <li><b>Sản phẩm:</b> là các dạng hàng hóa hoặc dịch vụ của Bên B như: món ăn, đồ uống, kiểu chỗ ngồi (như phòng riêng, ban công, ngoài trời, ...), để bán cho Khách hàng.</li>
        <li><b>Giờ phục vụ:</b> Là khung giờ mà Bên B đã sẵn sàng để thực hiện việc cung cấp Sản phẩm cho mọi khách hàng khi đến ăn tại nhà hàng.</li>
        <li><b>Giờ chờ nhận:</b>  Là khung giờ mà Bên B lên lịch để sẵn sàng xử lý nhận các yêu cầu đặt chỗ của Khách hàng Dinner Chill gửi đến.</li>
        <li><b>Chỗ trống:</b> Là những chỗ ngồi tại Bên B chưa sử dụng theo thời gian thực hoặc thời điểm trong tương lai, có thể phục vụ các Khách hàng đặt chỗ từ nền tảng Dinner Chill. Số chỗ trống này do Bên B quản lý và cập nhật lên hồ sơ Gian hàng.</li>
        <li><b>Gói dịch vụ và Bảng tác vụ:</b> Gói dịch vụ là những quyền lợi hoặc giá trị mà nền tảng Dinner Chill cung cấp cho người sử dụng Gói dịch vụ (Bên B), có nhiều cấp độ Gói dịch vụ, với mỗi cấp độ kèm theo sẽ là một mức chi phí và mức quyền lợi tương ứng. Những quyền lợi hoặc giá trị của một Gói dịch vụ sẽ được cung cấp thông qua một danh sách các tính năng, tiện ích hoặc nhiệm vụ và được gọi là: Bảng tác vụ.</li>
      </ol>
      <p><b>2. Các tài liệu mà Đối tác cần đọc kỹ, hiểu rõ:</b> Bên cạnh Điều khoản với Đối tác này, mỗi Đối tác đồng ý và mặc định hiểu rằng cần xem xét kỹ gồm: Quy chế Hoạt động, Chính sách bảo mật thông tin, và Hợp đồng Hợp tác (đã hoặc sẽ ký).</p>
      <h3>Điều khoản 2: Các Điều khoản về các thỏa thuận, nguyên tắc hợp tác căn bản:</h3>
      <ol>
        <li><b>Thỏa thuận hợp tác căn bản:</b><br/>
          Đây là những điều kiện cần, là những thỏa thuận căn bản nhất để có thể mang lại hiệu quả và bền vững cho cả Dinner Chill và Đối tác:
          <ol type="a">
            <li>Chọn Gói dịch vụ khi hợp tác với Dinner Chill: nghĩa là Bên B đồng ý đăng ký sử dụng nền tảng Dinner Chill - Bằng cách bên B chọn một trong các Gói dịch vụ là Bắt đầu/Cơ bản/Cốt lõi</li>
            <li>Môi trường Hợp tác tốt: Bên B đồng ý cùng Dinner Chill không ngừng cải tiến để tạo ra môi trường kinh doanh tốt và ngày càng tốt hơn trên nền tảng Dinner Chill: Đó là môi trường mang lại hiệu quả kinh doanh tốt cho cả 2, cùng thắng, với 3 chủ đề chính cần phối hợp thực thi như sau:
              <ul>
                <li>Dịch vụ đặt chỗ tốt: Đó là các quy định về dịch vụ đặt chỗ trước khi đến mà Bên B toàn quyền tạo ra nhưng cam kết rằng nó công khai, minh bạch và có tính công bằng cho mọi khách hàng (bao gồm cả thực khách đến từ Dinner Chill - "Khách hàng Dinner Chill").</li>
                <li>Sản phẩm tốt: Do Bên B toàn quyền tạo ra các sản phẩm, dịch vụ hàng hóa trên cơ sở phù hợp năng lực Bên B nhưng cần hướng tới đúng nhu cầu tệp/phân khúc Khách hàng có trên nền tảng Dinner Chill. Tùy theo Gói dịch vụ Bên B sử dụng mà Dinner Chill sẽ có mức độ trách nhiệm trong việc cung cấp các công cụ hỗ trợ để thực thi tạo ra sản phẩm tốt hiệu quả hơn (thỏa thuận rõ hơn trong Hợp đồng hợp tác).</li>
                <li>Quy định bán hàng tốt: Đó là các quy định, chính sách, điều kiện áp dụng cho khách hàng của Bên B nói chung, trong đó có Khách hàng Dinner Chill. Ở đây, Bên B đồng ý với Dinner Chill là sẽ tạo ra các Quy định bán hàng mang tính công khai, công bằng, minh bạch và tránh tạo ra các quy định mang tính phân biệt đối xử với Khách hàng Dinner Chill.</li>
              </ul>
            </li>
          </ol>
        </li>
        <li><b>Nguyên tắc về các Điều khoản bổ sung:</b><br/>
          Đó là các điều khoản hay điều kiện khác biệt mà Dinner Chill và Đối tác thỏa thuận thêm, bổ sung vào trong Hợp đồng hợp tác (nếu có), và vẫn cần đảm bảo không xung đột hay mâu thuẫn với Điều khoản với Đối tác kinh doanh này. Trường hợp, Bạn vẫn thực thi những điều vi phạm những điều khoản đã thống nhất ngay cả khi chúng tôi không phản đối thì điều đó vẫn hình thành ra sự vi phạm, vì vậy hãy liên lạc với chúng tôi để bổ sung kịp thời các Điều khoản bổ sung nếu Bạn muốn. Hoặc Dinner Chill sẽ liên hệ với Bạn để cùng thảo luận các Điều khoản bổ sung để áp dụng cho các dịch vụ hợp tác riêng lẻ (nếu có).
        </li>
        <li><b>Quan hệ hợp đồng, yêu cầu đăng ký, đăng ký, sửa đổi điều khoản sử dụng</b>
          <ol type="a">
            <li>Chỉ những chủ nhà hàng có đầy đủ năng lực pháp lý mới được tham gia vào các Điều khoản này. Mối quan hệ hợp đồng chỉ giới hạn ở Bạn với tư cách là Đối tác và không được chuyển nhượng.</li>
            <li>Dinner Chill là một nền tảng trực tuyến, để đặt chỗ tại nhà hàng. Chúng tôi kết nối nhà hàng và khách hàng thông qua hệ thống đặt chỗ của chúng tôi và cũng cung cấp cho bạn phần mềm để quản lý đặt chỗ. Chúng tôi cho phép khách hàng đặt chỗ tại nhà hàng của bạn bất kỳ lúc nào và từ bất kỳ thiết bị nào (gọi chung là "Dịch vụ Dinner Chill" của chúng tôi). Để sử dụng Dịch vụ Dinner Chill của chúng tôi, bạn cần thiết lập một tài khoản người dùng ("Tài khoản người dùng") với Dinner Chill. Để đăng ký, bạn cần một địa chỉ email hợp lệ, số điện thoại di động và mật khẩu do bạn lựa chọn. Bạn cam kết cung cấp thông tin đúng và đầy đủ trong quá trình đăng ký và cập nhật thông tin này trong thời hạn hợp đồng của bạn. Bạn đồng ý rằng Dinner Chill có thể liên lạc với bạn thông qua Tài khoản người dùng, số điện thoại và địa chỉ email đã lưu trữ của bạn.</li>
            <li>Bạn đồng ý bảo vệ thông tin truy cập của mình mọi lúc và không cho phép bên thứ ba trái phép truy cập vào Tài khoản người dùng của bạn và Dịch vụ Dinner Chill được cung cấp cho bạn (ngoại trừ nhân viên được bạn ủy quyền).</li>
            <li>Dinner Chill có toàn quyền sửa đổi các Điều khoản này, Bạn đồng ý rõ ràng hoặc ngầm định với điều này. Trường hợp Bạn không đồng ý, Bạn có thể gửi email tới kinhdoanh@dinnerchill.vn và contact@dinnerchill.vn trong vòng tối đa 30 ngày Bạn sẽ nhận được phản hồi của chúng tôi, để Dinner Chill và Bạn cùng thảo luận về sự phản đối của Bạn. Trường hợp chúng ta không có được sự thỏa thuận nào: Bạn hoặc Dinner Chill sẽ hoàn toàn có quyền dừng hợp tác, chấm dứt hợp đồng khi cùng nhau hoàn tất nghĩa vụ của nhau.</li>
            <li>Đối tác đảm bảo về thông tin: Trong suốt thời hạn của hợp đồng, Bạn sẽ đảm bảo rằng thông tin bạn cung cấp hoặc tự đăng tải đáp ứng mọi yêu cầu theo luật định và hợp đồng, không vi phạm bất kỳ quyền nào của bên thứ ba và là đúng, chính xác và không gây hiểu lầm. Ngay khi thông tin đó không hoặc không còn tuân thủ Điều khoản này, Bạn sẽ ngay lập tức sửa thông tin đó hoặc nếu Bạn không thể tự sửa, hãy thông báo ngay cho chúng tôi bằng văn bản hoặc gửi email.</li>
            <li>Trách nhiệm kiểm tra thông tin của Bạn: Bạn cũng sẽ kiểm tra xem thông tin doanh nghiệp của Bạn đã được Dinner Chill hoặc người dùng Dịch vụ Dinner Chill công bố trên trang web/app Dinner Chill hay dự định công bố trên trang web/app Dinner Chill có đáp ứng các yêu cầu Điều khoản này và đảm bảo đúng hay không.</li>
            <li>Quyền thay đổi thông tin của Dinner Chill: Chúng tôi có quyền xóa hoặc sửa bất kỳ thông tin nào không chính xác hoặc vi phạm bất kỳ điều khoản nào của Điều khoản này hoặc Hợp đồng Hợp tác hoặc luật pháp, nhưng chúng tôi không có nghĩa vụ phải làm như vậy.</li>
            <li>Quyền công bố các đánh giá của Khách hàng (nếu có): Chúng tôi có toàn quyền công bố nếu người dùng cuối gửi đánh giá về Bạn cho chúng tôi, nhưng chúng tôi không có nghĩa vụ phải làm như vậy. Chúng tôi có quyền không công bố các đánh giá riêng lẻ, toàn bộ hoặc một phần, hoặc xóa chúng, đặc biệt là khi vi phạm Điều khoản này hoặc Điều khoản sử dụng của chúng tôi.</li>
            <li>Trách nhiệm truyền thông của Dinner Chill: Chúng tôi toàn quyền khai thác các thông tin trên Gian hàng để truyền thông: đảm bảo và chịu trách nhiệm không vị phạm pháp luật và đáp ứng đúng đủ các tác vụ trong Bảng tác vụ theo Gói dịch vụ mà Đối tác đang sử dụng. Bảng thông tin đầu việc và đầu mối làm việc:</li>
          </ol>
        </li>
      </ol>
      <h3>Điều khoản 3: Thông tin - Đầu việc và đầu mối phối hợp làm việc của Dinner Chill trong quá trình hợp tác:</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>TT</th>
            <th style={thStyle}>Mô tả đầu việc cần phối hợp</th>
            <th style={thStyle}>Đầu mối Dinner Chill</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={thtdStyle}>1. Dịch vụ Khách hàng</td>
            <td style={thtdStyle}>
              Mục tiêu cùng nhau giúp Khách hàng thuận lợi, hài lòng khi đặt chỗ trên Dinner Chill tới nhà hàng:<br/>
              - Phối hợp giúp cho thực khách đặt chỗ nhanh chóng, kịp thời, chu đáo.<br/>
              - Phối hợp giải quyết khiếu kiện khiếu nại của Khách hàng đặt chỗ (nếu có)<br/>
              - Hỗ trợ, phối hợp kiểm tra các đặt chỗ bị hủy, cần đối soát, chăm sóc,...
            </td>
            <td style={thtdStyle}>
              1. Bộ phận DVKH<br/>
              2. Các kênh liên hệ:<br/>
              • Số tổng đài chính: 19006005<br/>
              • Số di động: 0931.006.005<br/>
              • Zalo/Viber: 0931.006.005<br/>
              • Email: CSKH@dinnerchill.vn
            </td>
          </tr>
          <tr>
            <td style={thtdStyle}>2. Đối Soát & Thu Chi</td>
            <td style={thtdStyle}>
              Cùng nhau thực hiện nhiệm vụ về đối soát đặt chỗ, hoa hồng, đối soát thu - chi của 2 Bên, đảm bảo đúng, đủ, kịp thời, hợp lý, hợp lệ; tránh sai lệnh, nợ đọng và theo đúng thỏa thuận hợp tác.
            </td>
            <td style={thtdStyle}>
              1. Bp.Kế toán & Tổng hợp<br/>
              2. Kênh liên hệ:<br/>
              a. SĐT: 0246.2598463<br/>
              b. Zalo: 0903265356<br/>
              c. Email đối soát số liệu<br/>
              • Tại Hà Nội & khác: doisoat@dinnerchill.vn<br/>
              • Tại Tp.Hồ Chí Minh: doisoathcm@dinnerchill.vn<br/>
              d. Email Kế toán Dinner Chill: ketoan@dinnerchill.vn
            </td>
          </tr>
          <tr>
            <td style={thtdStyle}>3. Vận hành, thực thi Hợp tác</td>
            <td style={thtdStyle}>
              Phối hợp để các hoạt động kinh doanh của Nhà cung cấp diễn ra thuận lợi trên Dinner Chill.<br/>
              1. Báo cáo và giải đáp việc thực thi Gói dịch vụ nhà hàng đang sử dụng.<br/>
              2. Hỗ trợ các nhà hàng chưa thể tự thực thi các việc sau: Thay đổi thông tin Gian hàng, thay đổi thông tin sản phẩm, dịch vụ, ưu đãi, thực đơn, bảng giá, món ăn,...<br/>
              3. Trao đổi, tư vấn để cùng nhà hàng tạo ra 3 tốt: sản phẩm tốt, dịch vụ đặt chỗ tốt, quy định bán hàng tốt<br/>
              4. Tư vấn, hỗ trợ, hướng dẫn nhà hàng đối tác khai thác sử dụng các công cụ của nền tảng Dinner Chill.
            </td>
            <td style={thtdStyle}>
              1. Bộ phận Vận hành<br/>
              2. Các kênh liên hệ:<br/>
              a. SĐT: 0901.006.005<br/>
              b. Email: lienhedoitac@dinnerchill.vn<br/>
              c. Zalo: 0901.006.005
            </td>
          </tr>
          <tr>
            <td style={thtdStyle}>4. Hiệu quả hợp tác & Mở rộng hợp tác</td>
            <td style={thtdStyle}>
              Cùng nhau phát triển và theo sát tình hình hợp tác. Sẵn sàng cùng nhau trao đổi, giải đáp các nhu cầu về điều chỉnh mở rộng hợp tác, dừng hợp tác. Bởi vậy, các nhiệm vụ có thể là:<br/>
              1. Về việc mở thêm Gian hàng mới, thương hiệu mới<br/>
              2. Về việc thay đổi Gói dịch vụ và chính sách phí<br/>
              3. Về việc tạm nghỉ, dừng hợp tác,.. <br/>
              4. Đánh giá hiệu quả Gói dịch vụ<br/>
              5. Tư vấn để tăng hiệu quả Đặt chỗ.
            </td>
            <td style={thtdStyle}>
              1. Bp.Kinh doanh & Phát triển thị trường<br/>
              2. Các kênh liên hệ:<br/>
              a. Hotline (Zalo/Skype): 0934.626.005<br/>
              b. Email: kinhdoanh@dinnerchill.vn
            </td>
          </tr>
        </tbody>
      </table>
      <h3>Điều khoản 4: Các điều khoản cuối cùng</h3>
      <ol>
        <li><b>Thêm về trách nhiệm & miễn trách nhiệm của Dinner Chill:</b><br/>
          Dinner Chill sẽ không chịu trách nhiệm đối với bất kỳ thiệt hại đặc biệt, gián tiếp, ngẫu nhiên hoặc thiệt hại do hậu quả, hoặc đối với việc gián đoạn liên lạc, mất hoạt động kinh doanh, mất dữ liệu hoặc mất lợi nhuận phát sinh từ hoặc liên quan đến các Điều khoản này.
        </li>
        <li><b>Thỏa thuận cuối:</b>
          <ol type="a">
            <li>Luật pháp của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam được áp dụng, và tạo Thành phố: Hà nội và/hoặc tại địa điểm/địa chỉ đăng ký kinh doanh của chúng tôi.</li>
            <li>Nếu các điều khoản riêng lẻ bị hoặc trở nên hoàn toàn hoặc một phần vô hiệu, phần còn lại của hợp đồng vẫn có hiệu lực.</li>
            <li>Việc hợp tác giữa hai bên Dinner Chill và Nhà cung cấp ngoài căn cứ vào Điều khoản này, còn căn cứ vào: Quy chế Hoạt động, Chính sách Bảo mật thông tin và Hợp đồng hợp tác.</li>
          </ol>
        </li>
      </ol>
    </div>
  </div>
);

export default PartnerTerms; 