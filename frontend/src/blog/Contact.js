import React from "react";

const Contact = () => {
  return (
    <div style={{ maxWidth: 800, margin: '32px auto', background: '#fff', fontFamily: 'Segoe UI, Arial, Helvetica, sans-serif', fontSize: 15, color: '#222', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px #e0e0e0', border: '1px solid #f3f3f3' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#d81f26', textAlign: 'center' }}>
        Liên hệ đầu tư & hợp tác với Dinner Chill
      </h1>
      <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, marginBottom: 18, color: '#222', textAlign: 'center' }}>
        Dành cho Quý Anh/Chị, cá nhân hay tổ chức có nhu cầu Đầu tư hoặc Hợp tác với nền tảng Dinner Chill của chúng tôi
      </h2>
      <div style={{ marginBottom: 16, textAlign: 'left' }}>
        Hãy gửi Email cho chúng tôi: <a href="mailto:contact@dinnerchill.vn" style={{ color: '#d81f26', fontWeight: 600 }}>contact@dinnerchill.vn</a>
      </div>
      <div style={{ marginBottom: 18, color: '#444', textAlign: 'left' }}>
        Để lại thông tin cho chủ đề Đầu tư và Hợp tác, Ban quản trị Dinner Chill sẽ liên hệ lại sớm nhất. Các chủ đề đầu tư và hợp tác chúng ta có thể thảo luận gồm:
        <ol style={{ marginTop: 10, marginBottom: 10, paddingLeft: 22, textAlign: 'left' }}>
          <li>Bạn là công ty, tổ chức, nhà đầu tư hoặc khách sạn muốn kết nối lượng lớn lưu lượng khách du lịch quốc tế đến từ các thị trường lớn đến Việt Nam.</li>
          <li>Bạn là đơn vị môi giới, trung gian cho các Nhà hàng hoặc các Thành phố/Khu vực ngành du lịch lớn tại Việt Nam.</li>
          <li>Bạn là công ty công nghệ hoặc nhà đầu tư muốn hợp tác phát triển hệ sinh thái dịch vụ đặt chỗ trực tuyến, quản lý nhà hàng, khách sạn, du lịch.</li>
          <li>Các chủ đề khác liên quan đến ngành nhà hàng hoặc đầu tư vào lĩnh vực đặt chỗ, mở rộng bán hàng, phát triển thị trường.</li>
        </ol>
      </div>
      <div style={{ marginBottom: 18, color: '#444', textAlign: 'left' }}>
        <b>Cụ thể hơn, chúng tôi có thể hợp tác với các đối tác sau:</b>
        <ol style={{ marginTop: 10, marginBottom: 10, paddingLeft: 22, textAlign: 'left' }}>
          <li>Chủ đầu tư khu dân cư, khu đô thị, trung tâm thương mại, khách sạn, resort, khu du lịch, ...</li>
          <li>Đơn vị vận hành nhà hàng, khách sạn, chuỗi nhà hàng, chuỗi khách sạn, ...</li>
          <li>Các công ty công nghệ, giải pháp phần mềm, CRM, POS, ...</li>
          <li>Nhà cung cấp dịch vụ tài chính, các đối tác thanh toán, ví điện tử, ...</li>
          <li>Đơn vị truyền thông, quảng cáo, marketing, ...</li>
          <li>Đơn vị nghiên cứu thị trường, giải trí, sự kiện, ...</li>
          <li>Đơn vị quản lý và vận hành bất động sản, ...</li>
          <li>Đơn vị đầu tư tài chính, quỹ đầu tư tư nhân, ...</li>
        </ol>
      </div>
      <div style={{ marginBottom: 18, color: '#444', textAlign: 'left' }}>
        <b>Chúng tôi luôn trân trọng mọi đề xuất hợp tác và đầu tư từ cá nhân, tổ chức có thiện chí và quan tâm đến lĩnh vực đặt chỗ trực tuyến, nhà hàng, khách sạn, du lịch.</b>
      </div>
      <div style={{ marginBottom: 8, color: '#444', textAlign: 'left' }}>
        Trân trọng cảm ơn quý đối tác!
      </div>
      <div style={{ marginBottom: 0, color: '#888', fontSize: 14, textAlign: 'left' }}>
        T/M Ban quản trị nền tảng Dinner Chill<br />CEO. Từ Quốc Tuấn
      </div>
    </div>
  );
};

export default Contact;
