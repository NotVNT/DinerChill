import React from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../styles/TaskPricingPage.css";

const TaskPricingPage = () => {
  return (
    <>
      <main role="main" className="pb-3">
        <h1 className="d-none">DinerChill</h1>
        <div className="container mt-2 mt-sm-5 px-4 py-3 p-sm-0">
          <div className="card shadow-sm">
            <div className="row p-4">
              <div className="col-12 mb-2 text-center">
                <h2 className="fs-2">
                  Bảng giới thiệu chi tiết các gói dịch vụ của DinerChill
                </h2>
                <p>
                  DinerChill cung cấp các gói dịch vụ linh hoạt, được thiết kế
                  để đáp ứng đa dạng nhu cầu kinh doanh của các nhà hàng. Khám
                  phá các gói dưới đây để tìm lựa chọn phù hợp với bạn!
                </p>
              </div>
              <h3 className="fs-4 fw-bold">1. Tóm tắt về Gói & Báo giá</h3>
              {/* Package Cards */}
              <div className="col-md-6 col-lg-4 mt-3 text-center">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h4 className="fs-4">Gói bắt đầu</h4>
                      <p>
                        Thêm kênh bán hàng thông qua khai thác cộng đồng thực
                        khách trên DinerChill, khai thác nền tảng chuyên về dịch
                        vụ đặt chỗ trước khi đến để Nhà hàng có thêm khách.
                      </p>
                    </div>
                    <div className="fw-medium fs-5">
                      Miễn phí/Mỗi tháng
                      <br />
                      <button
                        className="btn btn-dark mt-2 px-4"
                        onClick={() =>
                          window.open(
                            "https://forms.gle/X1FWGJpgYdTGT9cf7",
                            "_blank",
                            "noopener noreferrer"
                          )
                        }
                      >
                        Đăng ký
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4 mt-3 text-center">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h4 className="fs-4">Gói cơ bản</h4>
                      <p>
                        Không chỉ giúp bạn có thêm khách hàng, bạn có thể tự
                        mình tối ưu sản phẩm, dịch vụ, tối ưu điều hành nhà hàng
                        của bạn dễ hơn. Phần mềm giúp bạn quản lý hiệu quả kinh
                        doanh.
                      </p>
                    </div>
                    <div className="fw-medium fs-5">
                      Từ 299K/Mỗi tháng
                      <br />
                      <button
                        className="btn btn-dark mt-2 px-4"
                        onClick={() =>
                          window.open(
                            "https://forms.gle/X1FWGJpgYdTGT9cf7",
                            "_blank",
                            "noopener noreferrer"
                          )
                        }
                      >
                        Đăng ký
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4 mt-3 text-center mx-auto">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h4 className="fs-4">Gói cốt lõi</h4>
                      <p>
                        Một giải pháp gần như hoàn chỉnh nhất để bạn xây dựng
                        nhà hàng của mình kinh doanh không chỉ đông khách hơn mà
                        còn hoạt động hiệu quả, hiệu suất, ổn định.
                      </p>
                    </div>
                    <div className="fw-medium fs-5">
                      Từ 999K/Mỗi tháng
                      <br />
                      <button
                        className="btn btn-dark mt-2 px-4"
                        onClick={() =>
                          window.open(
                            "https://forms.gle/X1FWGJpgYdTGT9cf7",
                            "_blank",
                            "noopener noreferrer"
                          )
                        }
                      >
                        Đăng ký
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 mt-4">
                <h3 className="fs-4 fw-bold">
                  2. Bảng chi tiết các tác vụ theo gói dịch vụ DinerChill.
                </h3>
                <div>Phiên bản: 1.0 – Phát hành và áp dụng từ 2024</div>
                <div className="table-responsive">
                  <table className="table table-bordered table-striped align-middle scp-service-table">
                    <thead>
                      <tr>
                        <th
                          style={{ width: "40%" }}
                          className="fs-4 fw-medium"
                          scope="col"
                        >
                          Tác vụ
                        </th>
                        <th
                          style={{ width: "20%" }}
                          className="fs-4 text-center fw-medium"
                          scope="col"
                        >
                          Gói bắt đầu
                        </th>
                        <th
                          style={{ width: "20%" }}
                          className="fs-4 text-center fw-medium"
                          scope="col"
                        >
                          Gói cơ bản
                        </th>
                        <th
                          style={{ width: "20%" }}
                          className="fs-4 text-center fw-medium"
                          scope="col"
                        >
                          Gói cốt lõi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Cài đặt Tên Gian hàng</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Chọn Thị trường</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Chọn ngành Kinh doanh</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Địa chỉ Gian hàng</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Địa chỉ bản đồ</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Chọn Phân khúc</td>
                        <td className="text-center">Chọn 1 Phân khúc</td>
                        <td className="text-center">Chọn dưới 3 Phân khúc</td>
                        <td className="text-center">Chọn dưới 5 Phân khúc</td>
                      </tr>
                      <tr>
                        <td>Nhóm món ăn</td>
                        <td className="text-center">Chọn 5 - 7 Món đích</td>
                        <td className="text-center">Chọn 5 - 7 Món đích</td>
                        <td className="text-center">Chọn 10 - 20 Món đích</td>
                      </tr>
                      <tr>
                        <td>Loại Khoảng giá</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">
                          Không giới hạn, tới 20 Mức đích
                        </td>
                      </tr>
                      <tr>
                        <td>Loại hình dịch vụ</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Phạm vi ảnh hưởng</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                      </tr>
                      <tr>
                        <td>Chính sách ẩm thực</td>
                        <td className="text-center"></td>
                        <td className="text-center">Và bảng 5 đặc điểm</td>
                        <td className="text-center">Và bảng 10 đặc điểm</td>
                      </tr>
                      <tr>
                        <td>Kiểu Khuyến mại</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Bộ sưu tập món ăn</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Món đặc sắc</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Rượu Khách tự mang</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                      </tr>
                      <tr>
                        <td>Ảnh món</td>
                        <td className="text-center">Mô tả chứ (text)</td>
                        <td className="text-center">
                          Mô tả chứ (text) + Ảnh (nâng cấp dần)
                        </td>
                        <td className="text-center">
                          Mô tả chứ (text) & Ảnh + Video (nâng cấp dần)
                        </td>
                      </tr>
                      <tr>
                        <td>Giới thiệu</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                      </tr>
                      <tr>
                        <td>Tổng số vật chất</td>
                        <td className="text-center">Mô tả</td>
                        <td className="text-center">Mô tả</td>
                        <td className="text-center">
                          Mô tả & Thêm ảnh + video (nâng cấp dần)
                        </td>
                      </tr>
                      <tr>
                        <td>Tổng số chỗ</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                      </tr>
                      <tr>
                        <td>Kiểu món/thức uống</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                      </tr>
                      <tr>
                        <td>Tiện ích</td>
                        <td className="text-center">Mô tả</td>
                        <td className="text-center">
                          Mô tả & Thêm ảnh + video (nâng cấp dần)
                        </td>
                        <td className="text-center">
                          Mô tả & Thêm ảnh + video (nâng cấp dần)
                        </td>
                      </tr>
                      <tr>
                        <td>Chỗ đỗ xe</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Chỉ đường</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Quy định</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Bảng giá</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Ảnh Gian hàng</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Bài giới thiệu</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Thẻ từ khóa Gian hàng</td>
                        <td className="text-center">Từ 3-5 từ khóa</td>
                        <td className="text-center">
                          Từ 5-7 từ khóa
                          <br />
                          (Có lựa chọn Gian hàng đặt từ khóa)
                        </td>
                        <td className="text-center">
                          Từ 7-10 từ khóa
                          <br />
                          (Có lựa chọn Gian hàng đặt từ khóa)
                        </td>
                      </tr>
                      <tr>
                        <td>Gắn địa danh</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Đặt chỗ trực tuyến</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Tiếp nhận đặt chỗ</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Từ chối đặt chỗ</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Xem đặt chỗ chờ đến</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Thời gian đặt trước</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Thời gian được giữ chỗ</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Banner Trang chủ Dinner Chill</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Banner Trang chủ Blog</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Banner chuyên mục Blog</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Banner bài viết Blog</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>PopUp trang chủ Dinner Chill</td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>PopUp bài Blog</td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Top Thương hiệu</td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>BST Gian hàng - Loại hình dịch vụ</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">
                          Được gắn nhãn truyền thông
                        </td>
                      </tr>
                      <tr>
                        <td>BST Gian hàng - Mức dịch đi ăn</td>
                        <td className="text-center">Tối đa 4 BST</td>
                        <td className="text-center">Tối đa 7 BST</td>
                        <td className="text-center">
                          1. Không giới hạn BST
                          <br />
                          2. Ưu tiên Top10/BST
                          <br />
                          3. Được gắn nhãn truyền thông
                        </td>
                      </tr>
                      <tr>
                        <td>BST Gian hàng Ưu đãi hấp dẫn</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">
                          Nếu đủ điều kiện + Ưu tiên top10 + Được gắn nhãn
                          truyền thông
                        </td>
                      </tr>
                      <tr>
                        <td>BST Gian hàng Địa danh</td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                        <td className="text-center">
                          Được gắn nhãn truyền thông
                        </td>
                      </tr>
                      <tr>
                        <td>BST Gian hàng Loại hình ẩm thực</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">
                          Được gắn nhãn truyền thông
                        </td>
                      </tr>
                      <tr>
                        <td>BST Gian hàng Được yêu thích</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                      </tr>
                      <tr>
                        <td>KP Top địa điểm - Về Món ăn đặc sắc/Khu vực</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">
                          Top10 trong 7 ngày. Đổi lùi dần về sau.
                        </td>
                      </tr>
                      <tr>
                        <td>
                          Thứ tự KP top địa điểm - Về Món ăn đặc sắc/Khu vực
                        </td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">
                          Top10 trong 7 ngày. Đổi lùi dần về sau.
                        </td>
                      </tr>
                      <tr>
                        <td>
                          KP Top địa điểm - Về Loại hình ẩm thực Quốc gia/Khu
                          vực
                        </td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>
                          Thứ tự KP top địa điểm - Về Loại hình ẩm thực Quốc
                          gia/Khu vực
                        </td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>
                          KP Top địa điểm - Về Mức dịch đi ăn của thực khách/Khu
                          vực
                        </td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>
                          Thứ tự KP top địa điểm - Về Mức dịch đi ăn của thực
                          khách/Khu vực
                        </td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>
                          KP Top địa điểm - Về các địa điểm ăn uống có phong
                          cách hay gì đó đặc sắc/Khu vực
                        </td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>
                          Thứ tự KP top địa điểm - Về các địa điểm ăn uống có
                          phong cách hay gì đó đặc sắc/Khu vực
                        </td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>
                          KP Top địa điểm - Có mặt trong các địa danh nổi
                          tiếng/Khu vực
                        </td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>
                          Thứ tự KP top địa điểm - Có mặt trong các địa danh nổi
                          tiếng/Khu vực
                        </td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>
                          KP Top địa điểm - Có mặt trong danh sách các nhà hàng
                          dịch vụ ăn uống/Khu vực
                        </td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>
                          Thứ tự KP top địa điểm - Có mặt trong danh sách các
                          nhà hàng dịch vụ ăn uống/Khu vực
                        </td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>
                          KP Top địa điểm - Nhóm nhà hàng theo thời điểm đi ăn
                        </td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>
                          Thứ tự KP top địa điểm - Nhóm nhà hàng theo thời điểm
                          đi ăn
                        </td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Trang chủ 1: Khám phá cùng Dinner Chill</td>
                        <td className="text-center"></td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">
                          1. Có mặt
                          <br />
                          2. Vị trí do Dinner Chill sắp xếp
                        </td>
                      </tr>
                      <tr>
                        <td>Trang chủ 2: Top Thương hiệu</td>
                        <td className="text-center"></td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">
                          1. Có mặt
                          <br />
                          2. Vị trí do Dinner Chill sắp xếp
                        </td>
                      </tr>
                      <tr>
                        <td>Trang chủ 3: Bạn muốn ăn gì tại nhà hàng?</td>
                        <td className="text-center"></td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">
                          1. Có mặt
                          <br />
                          2. Vị trí do Dinner Chill sắp xếp
                        </td>
                      </tr>
                      <tr>
                        <td>Trang chủ 4: Ưu đãi HOT</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">
                          1. Có mặt
                          <br />
                          2. Vị trí do Dinner Chill sắp xếp
                        </td>
                      </tr>
                      <tr>
                        <td>Trang chủ 5: Khám phá HOT</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">
                          1. Có mặt
                          <br />
                          2. Vị trí do Dinner Chill sắp xếp
                        </td>
                      </tr>
                      <tr>
                        <td>Trang chủ 6: Mới nhất trên Dinner Chill</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">
                          1. Có mặt
                          <br />
                          2. Vị trí do Dinner Chill sắp xếp
                        </td>
                      </tr>
                      <tr>
                        <td>
                          Trang chủ 7: Nhà hàng xuất hiện nhiều lượt xem tuần
                        </td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">
                          1. Có mặt
                          <br />
                          2. Vị trí do Dinner Chill sắp xếp
                        </td>
                      </tr>
                      <tr>
                        <td>Trang chủ 8: Được truy cập & tìm xem nhiều</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">
                          1. Có mặt
                          <br />
                          2. Vị trí do Dinner Chill sắp xếp
                        </td>
                      </tr>
                      <tr>
                        <td>
                          Trang chủ 9: Bạn muốn tìm nhà hàng theo dịp đặc biệt
                        </td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">
                          1. Có mặt
                          <br />
                          2. Vị trí do Dinner Chill sắp xếp
                        </td>
                      </tr>
                      <tr>
                        <td>Viết bài Blog - Món ngon & Công thức</td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Viết bài Blog - Top 10 món ngon</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Viết bài Blog - Chuyên mục ẩm thực</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Viết bài Blog - Chuyên mục</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Chèn link bài Blog</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                      </tr>

                      <tr>
                        <td>Số hóa Sản phẩm</td>
                        <td className="text-center"></td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Quản lý các SP</td>
                        <td className="text-center"></td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Công cụ Tạo Sản phẩm bán chạy</td>
                        <td className="text-center"></td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Phiên bản Beta</td>
                      </tr>
                      <tr>
                        <td>Quản lý Sản phẩm bán chạy</td>
                        <td className="text-center"></td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Phiên bản Beta</td>
                      </tr>
                      <tr>
                        <td>Công cụ Tạo Ưu đãi bán chạy</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center">Phiên bản Beta</td>
                      </tr>
                      <tr>
                        <td>Quản lý Ưu đãi bán chạy</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center">Phiên bản Beta</td>
                      </tr>
                      <tr>
                        <td>Quản lý chỗ ngồi</td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Cài đặt đặt chỗ</td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Cài đặt chỗ trống</td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Bộ lọc</td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Gian hàng tương tự</td>
                        <td className="text-center"></td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Gắn nhãn Truyền thông</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Gắn nhãn Uy tín</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">Nếu đủ điều kiện</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Gắn bạn</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                        <td className="text-center">✔</td>
                      </tr>
                      <tr>
                        <td>Công cụ MB Dinner Chill</td>
                        <td className="text-center"></td>
                        <td className="text-center">✔</td>
                        <td className="text-center">Nâng cấp thường xuyên</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subscription Modal */}
      <div
        className="modal fade"
        id="subscriptionModal"
        tabIndex="-1"
        aria-labelledby="subscriptionModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="subscriptionModalLabel">
                Đăng ký gói dịch vụ
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">{/* Add subscription form here */}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskPricingPage;
