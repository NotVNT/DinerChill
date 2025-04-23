import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterBox from '../components/FilterBox';
import '../styles/HomePage.css';
import RestaurantCard from '../components/RestaurantCard';

// Danh sách nhà hàng ưu đãi Hot
const hotRestaurants = [
  {
    id: 1,
    name: 'Ưu đãi nhà hàng Lẩu tại Tp.HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 22',
    offer: 'Được đặt xuất',
    location: 'Tp.HCM',
    type: 'restaurant',
    cuisine: 'Lẩu',
    rating: 4.5,
    description: 'Nhà hàng lẩu ngon nhất khu vực',
  },
  {
    id: 2,
    name: 'Ưu đãi nhà hàng Việt Nam tại Tp.HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 23',
    offer: 'Được đặt xuất',
    location: 'Tp.HCM',
    type: 'restaurant',
    cuisine: 'Việt Nam',
    rating: 4.7,
    description: 'Ẩm thực Việt Nam truyền thống',
  },
  {
    id: 3,
    name: 'Ưu đãi nhà hàng Chay tại Tp.HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 8',
    offer: 'Được đặt xuất',
    location: 'Tp.HCM',
    type: 'restaurant',
    cuisine: 'Chay',
    rating: 4.2,
    description: 'Thực phẩm chay lành mạnh',
  },
  {
    id: 4,
    name: 'Khám phá danh sách Nhà hàng nổi bật',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 5',
    offer: 'Được đặt xuất',
    location: 'Tp.HCM',
    type: 'restaurant',
    cuisine: 'Đa dạng',
    rating: 4.8,
    description: 'Trải nghiệm ẩm thực độc đáo',
  },
  {
    id: 5,
    name: 'Nhà hàng BBQ tại Quận 1',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 15',
    offer: 'Được đặt xuất',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Nướng',
    rating: 4.6,
    description: 'BBQ phong cách Hàn Quốc',
  },
  {
    id: 6,
    name: 'Nhà hàng Hải sản tại Quận 7',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 10',
    offer: 'Được đặt xuất',
    location: 'Quận 7, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.9,
    description: 'Hải sản tươi sống',
  },
];

// Danh sách sản phẩm ưu đãi Hot
const hotProducts = [
  {
    id: 1,
    name: 'Giảm 20% Sushi Buffet T2-T6',
    image: 'https://via.placeholder.com/300x200',
    price: '249K',
    discountPrice: '199K',
    offer: 'Bán chạy',
    location: 'Bối Yuhua - Taiwanese Hotpot',
    validUntil: 'Hết 30/06/2025',
    type: 'product',
  },
  {
    id: 2,
    name: 'T2 -> T6 GIẢM 15% món ăn',
    image: 'https://via.placeholder.com/300x200',
    price: '',
    discountPrice: '',
    offer: 'Bán chạy',
    location: 'Bối Phú 79 - Phạm Ngọc Thạch',
    validUntil: 'Chỉ áp dụng từ 10h00 - 15h00',
    type: 'product',
  },
  {
    id: 3,
    name: 'Giảm 10% Buffet 648K Đã Gồm VAT',
    image: 'https://via.placeholder.com/300x200',
    price: '648K',
    discountPrice: '',
    offer: 'Bán chạy',
    location: 'Bối D*Maris - An Phú',
    validUntil: 'Hết 09/03/2025',
    type: 'product',
  },
  {
    id: 4,
    name: 'T7 & Chủ nhật GIẢM 15% món ăn',
    image: 'https://via.placeholder.com/300x200',
    price: '',
    discountPrice: '',
    offer: 'Bán chạy',
    location: 'Bối Phú 79 - 120 Sương Nguyệt Ánh',
    validUntil: 'Áp dụng cả ngày từ 9h30 - 23h30',
    type: 'product',
  },
  {
    id: 5,
    name: 'Giảm 25% Buffet Lẩu T2-T5',
    image: 'https://via.placeholder.com/300x200',
    price: '300K',
    discountPrice: '225K',
    offer: 'Bán chạy',
    location: 'Lẩu King - Quận 3',
    validUntil: 'Hết 31/12/2025',
    type: 'product',
  },
  {
    id: 6,
    name: 'Giảm 10% Set Menu Gia Đình',
    image: 'https://via.placeholder.com/300x200',
    price: '500K',
    discountPrice: '450K',
    offer: 'Bán chạy',
    location: 'Family Resto - Quận 1',
    validUntil: 'Hết 15/11/2025',
    type: 'product',
  },
];

// Danh sách nhà hàng được đề xuất
const recommendedRestaurants = [
  {
    id: 5,
    name: 'Phố 79 - Phạm Ngọc Thạch',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 15%',
    offer: 'Được đề xuất',
    location: '120 Sương Nguyệt Ánh, Q.1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.6,
    description: 'Đặt bàn giảm giá',
  },
  {
    id: 6,
    name: 'Dìn Ký Cửu Long Xanh - Trân Văn Trà',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: 'Được đề xuất',
    location: 'Quận 7, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Việt Nam',
    rating: 4.8,
    description: 'Ẩm thực Việt Nam đa dạng',
  },
  {
    id: 7,
    name: 'MATSURI Japanese Restaurant',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 20%',
    offer: 'Được đề xuất',
    location: 'Nguyễn Huệ, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Nhật Bản',
    rating: 4.7,
    description: 'Sushi và sashimi tươi ngon',
  },
  {
    id: 8,
    name: 'Tâm Rượu - Nướng Phường',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 10%',
    offer: 'Được đề xuất',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Nướng',
    rating: 4.5,
    description: 'Nướng và nhậu phong cách',
  },
  {
    id: 9,
    name: 'Lẩu Nấm Ashima - Lê Lợi',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 15%',
    offer: 'Được đề xuất',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Lẩu',
    rating: 4.7,
    description: 'Lẩu nấm tự nhiên',
  },
  {
    id: 10,
    name: 'The Pizza Company - Quận 3',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: 'Được đề xuất',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Pizza',
    rating: 4.4,
    description: 'Pizza phong cách Ý',
  },
];

// Danh sách nhà hàng phù hợp đặt tiệc
const partyRestaurants = [
  {
    id: 9,
    name: 'Nhà hàng đặt tiệc công ty dưới 20 người tại HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Có phòng riêng, khu riêng',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Đa dạng',
    rating: 4.9,
    description: 'Thích hợp cho tiệc công ty, sân khấu hiện đại',
  },
  {
    id: 10,
    name: 'Top nhà hàng tiệc sinh nhật phù hợp',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Trang trí sinh nhật cao cấp',
    offer: '',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Việt Nam',
    rating: 4.6,
    description: 'Không gian ấm cúng, tiệc sinh nhật lý tưởng',
  },
  {
    id: 11,
    name: 'Nhà hàng đặt tiệc công ty từ 20-50 người',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Có phòng riêng, sân khấu',
    offer: '',
    location: 'Quận 7, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.8,
    description: 'Tiệc công ty quy mô lớn',
  },
  {
    id: 12,
    name: 'Nhà hàng tiệc cưới tại Quận 1',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Trang trí cao cấp',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Đa dạng',
    rating: 4.7,
    description: 'Không gian sang trọng cho tiệc cưới',
  },
  {
    id: 13,
    name: 'Nhà hàng tiệc gia đình tại Quận 7',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Có khu vui chơi trẻ em',
    offer: '',
    location: 'Quận 7, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Việt Nam',
    rating: 4.5,
    description: 'Thích hợp cho gia đình',
  },
  {
    id: 14,
    name: 'Nhà hàng tiệc họp lớp tại Quận 3',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Có phòng riêng',
    offer: '',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Đa dạng',
    rating: 4.6,
    description: 'Không gian thân mật cho họp lớp',
  },
];

// Danh sách địa danh nổi tiếng
const famousLocations = [
  {
    id: 12,
    name: 'Danh sách nhà hàng, quán ăn ở HAI BÀ TRƯNG',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 3',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Đa dạng',
    rating: 4.5,
    description: 'Ẩm thực phong phú tại Hai Bà Trưng',
  },
  {
    id: 13,
    name: 'Top nhà hàng, quán ăn ở BÀU CÁT',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 9',
    offer: '',
    location: 'Tân Bình, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Việt Nam',
    rating: 4.7,
    description: 'Trải nghiệm ẩm thực tại Bàu Cát',
  },
  {
    id: 14,
    name: 'Top nhà hàng, quán ăn ở GIGA MALL',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 3',
    offer: '',
    location: 'Thủ Đức, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Đa dạng',
    rating: 4.6,
    description: 'Ẩm thực đa dạng tại Giga Mall',
  },
  {
    id: 15,
    name: 'Top nhà hàng, quán ăn ở PHÚ MỸ HƯNG',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 5',
    offer: '',
    location: 'Quận 7, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.8,
    description: 'Nhà hàng nổi tiếng tại Phú Mỹ Hưng',
  },
  {
    id: 16,
    name: 'Top nhà hàng, quán ăn ở NGUYỄN HUỆ',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 7',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Đa dạng',
    rating: 4.7,
    description: 'Ẩm thực sôi động tại Nguyễn Huệ',
  },
  {
    id: 17,
    name: 'Top nhà hàng, quán ăn ở TÂN BÌNH',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 6',
    offer: '',
    location: 'Tân Bình, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Việt Nam',
    rating: 4.5,
    description: 'Ẩm thực đa dạng tại Tân Bình',
  },
];

// Danh sách nhà hàng hải sản ngon nhất ưu đãi
const seafoodRestaurants = [
  {
    id: 16,
    name: 'Dìn Ký Cửu Long Xanh - Trân Văn Trà',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: 'Được đề xuất',
    location: 'Quận 7, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.8,
    description: 'Hải sản tươi sống, đặt bàn giảm giá',
  },
  {
    id: 17,
    name: 'Mọ Mẹ Ốc - Cách Mạng Tháng 8',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: 'Được đề xuất',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.5,
    description: 'Ốc và hải sản đa dạng',
  },
  {
    id: 18,
    name: 'Ngọc Sương Sài Gòn - Sương Nguyệt Ánh',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 5%',
    offer: 'Được đề xuất',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.7,
    description: 'Hải sản cao cấp, không gian sang trọng',
  },
  {
    id: 19,
    name: 'Bonjour Resto - Nguyễn Trãi',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: 'Được đề xuất',
    location: 'Quận 5, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.6,
    description: 'Hải sản tươi ngon, phong cách Pháp',
  },
  {
    id: 20,
    name: 'Hải Sản Hoàng Gia - Quận 1',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 10%',
    offer: 'Được đề xuất',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.8,
    description: 'Hải sản cao cấp, không gian hiện đại',
  },
  {
    id: 21,
    name: 'Ốc Hương - Quận 4',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: 'Được đề xuất',
    location: 'Quận 4, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.4,
    description: 'Ốc tươi ngon, giá bình dân',
  },
];

// Danh sách nhà hàng món Trung
const chineseRestaurants = [
  {
    id: 20,
    name: 'Tung Garden - Tôn Thất Tùng',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: 'Được đề xuất',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Trung Hoa',
    rating: 4.7,
    description: 'Dimsum và món Trung truyền thống',
  },
  {
    id: 21,
    name: 'Tân Hải Vân - Nguyễn Đình Chiểu',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 10%',
    offer: 'Được đề xuất',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Trung Hoa',
    rating: 4.8,
    description: 'Ẩm thực Trung Hoa cao cấp',
  },
  {
    id: 22,
    name: 'Saigon 3 - Tứ Xương',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: 'Được đề xuất',
    location: 'Quận 7, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Trung Hoa',
    rating: 4.6,
    description: 'Món Trung đa dạng, giá hợp lý',
  },
  {
    id: 23,
    name: 'Long Wang - Minh Khai',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: 'Được đề xuất',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Trung Hoa',
    rating: 4.9,
    description: 'Há cảo và sủi cảo thơm ngon',
  },
  {
    id: 24,
    name: 'Dimsum House - Quận 5',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 15%',
    offer: 'Được đề xuất',
    location: 'Quận 5, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Trung Hoa',
    rating: 4.7,
    description: 'Dimsum tươi ngon, giá hợp lý',
  },
  {
    id: 25,
    name: 'Peking Duck - Quận 1',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: 'Được đề xuất',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Trung Hoa',
    rating: 4.8,
    description: 'Vịt quay Bắc Kinh chuẩn vị',
  },
];

// Danh sách phong cách ẩm thực phổ biến
const popularCuisines = [
  {
    id: 24,
    name: 'Buffet Nướng Ngon ở Tp.HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 30',
    offer: '',
    location: 'Quận 7, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Nướng',
    rating: 4.7,
    description: 'Buffet nướng đa dạng, giá hợp lý',
  },
  {
    id: 25,
    name: 'Tổng Hợp Danh Sách Nhà Hàng Món Âu',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 158',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Châu Âu',
    rating: 4.8,
    description: 'Ẩm thực Âu sang trọng',
  },
  {
    id: 26,
    name: 'Top Nhà Hàng Trung Hoa Ngon ở Tp.HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 24',
    offer: '',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Trung Hoa',
    rating: 4.6,
    description: 'Món Trung hấp dẫn',
  },
  {
    id: 27,
    name: 'Danh Sách Nhà Hàng Quốc Ngon ở Tp.HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 15',
    offer: '',
    location: 'Quận 5, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Quốc tế',
    rating: '4.9',
    description: 'Ẩm thực quốc tế đa dạng',
  },
  {
    id: 28,
    name: 'Top Nhà Hàng Nhật Bản tại Tp.HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 20',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Nhật Bản',
    rating: 4.7,
    description: 'Sushi và sashimi tươi ngon',
  },
  {
    id: 29,
    name: 'Danh Sách Nhà Hàng Hàn Quốc tại Tp.HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 18',
    offer: '',
    location: 'Quận 7, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hàn Quốc',
    rating: 4.6,
    description: 'Ẩm thực Hàn Quốc đậm đà',
  },
];

// Danh sách yêu thích nhất hàng tháng
const monthlyFavorites = [
  {
    id: 30,
    name: 'Đình Ký Cửu Long Xanh - Trần Văn Trà',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 7, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.8,
    description: 'Hải sản tươi sống, đặt bàn giảm giá',
  },
  {
    id: 31,
    name: 'MATSURI Japanese Restaurant - Nguyễn Huệ',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 20%',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Nhật Bản',
    rating: 4.7,
    description: 'Sushi và sashimi tươi ngon',
  },
  {
    id: 32,
    name: 'Phố 79 - 120 Sương Nguyệt Ánh',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 15%',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.6,
    description: 'Đặt bàn giảm giá',
  },
  {
    id: 33,
    name: 'Phố 79 - Phạm Ngọc Thạch',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 15%',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.7,
    description: 'Đặt bàn giảm giá',
  },
  {
    id: 34,
    name: 'Gyu Shige Ngố - Nguyễn Thị Minh Khai',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Nhật Bản',
    rating: 4.8,
    description: 'Thịt nướng phong cách Nhật',
  },
];

// Danh sách tìm nhà hàng theo tiện ích
const amenitiesRestaurants = [
  {
    id: 35,
    name: 'Top nhà hàng có karaoke phù hợp tổ chức tiệc liên hoan tại Tp.HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 12',
    offer: '',
    location: 'Tp.HCM',
    type: 'amenity',
    cuisine: 'Đa dạng',
    rating: 4.5,
    description: 'Thích hợp cho tiệc liên hoan',
  },
  {
    id: 36,
    name: 'Nhà hàng có PHÒNG RIÊNG tại Tp.HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 139',
    offer: '',
    location: 'Tp.HCM',
    type: 'amenity',
    cuisine: 'Đa dạng',
    rating: 4.6,
    description: 'Không gian riêng tư',
  },
  {
    id: 37,
    name: 'Top nhà hàng xuất hóa đơn VAT tại Tp.HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 24',
    offer: '',
    location: 'Tp.HCM',
    type: 'amenity',
    cuisine: 'Đa dạng',
    rating: 4.7,
    description: 'Hỗ trợ xuất hóa đơn VAT',
  },
  {
    id: 38,
    name: 'Top nhà hàng phục vụ trẻ em tại Tp.HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 26',
    offer: '',
    location: 'Tp.HCM',
    type: 'amenity',
    cuisine: 'Đa dạng',
    rating: 4.5,
    description: 'Không gian thân thiện với trẻ em',
  },
  {
    id: 39,
    name: 'Top nhà hàng cho trẻ em tại Tp.HCM',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Số điểm đến: 10',
    offer: '',
    location: 'Tp.HCM',
    type: 'amenity',
    cuisine: 'Đa dạng',
    rating: 4.6,
    description: 'Có khu vui chơi cho trẻ em',
  },
];

// Danh sách top nhà hàng cao cấp
const luxuryRestaurants = [
  {
    id: 40,
    name: 'Katana Wagyu Kappo - Mai Thị Lựu',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Nhật Bản',
    rating: 4.9,
    description: 'Ẩm thực Nhật Bản cao cấp',
  },
  {
    id: 41,
    name: 'Fashionista Café - Fashion & Cuisine - Phùng Khắc Khoan',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Châu Âu',
    rating: 4.8,
    description: 'Không gian sang trọng, phong cách châu Âu',
  },
  {
    id: 42,
    name: 'Lux 68 Restaurant - Nguyễn Đình Chiểu',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Đa dạng',
    rating: 4.7,
    description: 'Nhà hàng cao cấp, không gian hiện đại',
  },
  {
    id: 43,
    name: 'Twilight SKY Bar - Lý Tự Trọng',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Đa dạng',
    rating: 4.8,
    description: 'Không gian rooftop, view đẹp',
  },
  {
    id: 44,
    name: 'Cloud Nine Restaurant - Lý Tự Trọng',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Châu Âu',
    rating: 4.7,
    description: 'Ẩm thực châu Âu, không gian sang trọng',
  },
];

// Danh sách đặt chỗ ưu tín
const trustedRestaurants = [
  {
    id: 45,
    name: 'Bếp Thái Koh Yam - Bà Huyện Thanh Quan',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 10%',
    offer: '',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Thái Lan',
    rating: 4.6,
    description: 'Ẩm thực Thái Lan chính gốc',
  },
  {
    id: 46,
    name: 'Le Monde Steak - Cao Thắng',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Ưu đãi hấp dẫn',
    offer: '',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Châu Âu',
    rating: 4.7,
    description: 'Steak phong cách Pháp',
  },
  {
    id: 47,
    name: 'Thai Market - Cao Thắng',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm tối 20%',
    offer: '',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Thái Lan',
    rating: 4.6,
    description: 'Ẩm thực Thái Lan đa dạng',
  },
  {
    id: 48,
    name: 'Khoái - Lê Quý Đôn',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 10%',
    offer: '',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Việt Nam',
    rating: 4.5,
    description: 'Ẩm thực Việt Nam truyền thống',
  },
  {
    id: 49,
    name: 'Kobe Teppan Xuong',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 10%',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Nhật Bản',
    rating: 4.8,
    description: 'Teppan phong cách Nhật',
  },
];

// Danh sách danh cho du khách
const touristRestaurants = [
  {
    id: 50,
    name: 'Ốc Bạc - Nguyễn Thượng Hiền',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.5,
    description: 'Ốc tươi ngon, đặc sản Sài Gòn',
  },
  {
    id: 51,
    name: 'Quán Bún Mắm - Lẩu Mắm Di Sâu - Tôn Thất Tùng',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 7, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Việt Nam',
    rating: 4.6,
    description: 'Bún mắm, lẩu mắm đậm đà',
  },
  {
    id: 52,
    name: 'Cơm Tấm Thưởng Thức - Tôn Thất Tùng',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 7, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Việt Nam',
    rating: 4.5,
    description: 'Cơm tấm chuẩn vị Sài Gòn',
  },
  {
    id: 53,
    name: 'Bò Tơ Quán Mộc - Nguyễn Thị Minh Khai',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Việt Nam',
    rating: 4.7,
    description: 'Bò tơ nướng thơm ngon',
  },
  {
    id: 54,
    name: 'Ốc Chỉ Em - Quốc Tế',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Giảm 10%',
    offer: '',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.6,
    description: 'Ốc tươi ngon, giá bình dân',
  },
];

// Danh sách trưa nay ăn gì
const lunchSuggestions = [
  {
    id: 55,
    name: 'Sushi Buffet Chay TRƯA T2 - T6',
    image: 'https://via.placeholder.com/300x200',
    price: '250K',
    discountPrice: '',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    validUntil: '11h00 - 14h00',
    type: 'product',
    description: 'Sushi buffet chay ngon miệng',
  },
  {
    id: 56,
    name: 'Sushi Buffet Trưa T2-T6, Giá 295K',
    image: 'https://via.placeholder.com/300x200',
    price: '295K',
    discountPrice: '',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    validUntil: 'Hạn sử dụng: Bắc, Trung, Nam',
    type: 'product',
    description: 'Sushi buffet trưa giá hợp lý',
  },
  {
    id: 57,
    name: 'Sushi Buffet Trưa T2-T6 Trưa T7-CN, Giá 431K',
    image: 'https://via.placeholder.com/300x200',
    price: '431K',
    discountPrice: '',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    validUntil: 'Hạn sử dụng: Bắc, Trung, Nam',
    type: 'product',
    description: 'Buffet sushi cao cấp',
  },
  {
    id: 58,
    name: 'Sushi Buffet Trưa Ngậy Ăn Chay & Lề Tế, Giá 239K - Cơ Hội Kết Bạn Sẻn',
    image: 'https://via.placeholder.com/300x200',
    price: '239K',
    discountPrice: '',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    validUntil: '29/4, vui vẻ, thân thiện 1, 14, 15, 30 AL',
    type: 'product',
    description: 'Buffet sushi chay thân thiện',
  },
  {
    id: 59,
    name: 'Sushi Buffet Cơ Hội Kết Bạn Sẻn - Khách Sẵn',
    image: 'https://via.placeholder.com/300x200',
    price: '295K',
    discountPrice: '',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    validUntil: 'Hạn sử dụng: Bắc, Trung, Nam',
    type: 'product',
    description: 'Buffet sushi ngon, giá hợp lý',
  },
];

// Danh sách mới nhất trên DinerChill
const newOnDinerChill = [
  {
    id: 60,
    name: 'Katana Wagyu Kappo - Mai Thị Lựu',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Nhật Bản',
    rating: 4.9,
    description: 'Ẩm thực Nhật Bản cao cấp',
  },
  {
    id: 61,
    name: 'Fashionista Café - Fashion & Cuisine - Phùng Khắc Khoan',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Châu Âu',
    rating: 4.8,
    description: 'Không gian sang trọng, phong cách châu Âu',
  },
  {
    id: 62,
    name: 'Lux 68 Restaurant - Nguyễn Đình Chiểu',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Đa dạng',
    rating: 4.7,
    description: 'Nhà hàng cao cấp, không gian hiện đại',
  },
  {
    id: 63,
    name: 'Coco Grill Saigon - Nam Kỳ Khởi Nghĩa',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 1, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Đa dạng',
    rating: 4.8,
    description: 'Thịt nướng phong cách hiện đại',
  },
  {
    id: 64,
    name: 'Phố Di Băng Số - Nguyễn Đình Chiểu',
    image: 'https://via.placeholder.com/300x200',
    discount: 'Đặt bàn giảm giá',
    offer: '',
    location: 'Quận 3, Tp.HCM',
    type: 'restaurant',
    cuisine: 'Hải sản',
    rating: 4.7,
    description: 'Hải sản tươi ngon, không gian hiện đại',
  },
];

// Danh sách tin tức & blog
const newsAndBlog = [
  {
    id: 65,
    name: 'CÁCH TỔ CHỨC TIỆC SINH NHẬT ĐƠN GIẢN NHẤT chỉ với 5 BƯỚC',
    image: 'https://via.placeholder.com/300x200',
    date: '00:00 07/04/2025',
    type: 'blog',
    description: 'DinerChill tuyen gap NHA Vien Ke toan Nơi BỐ, 1 năm kinh nghiệm nghiem',
  },
  {
    id: 66,
    name: '15 cách làm gỏi gà ngon từ DỄ ĐẾN MIỆNG không bị ngậy',
    image: 'https://via.placeholder.com/300x200',
    date: '00:00 05/02/2024',
    type: 'blog',
    description: '20+ món ngon dễ làm từ gỏi gà thơm ngon, hấp dẫn tại nhà',
  },
  {
    id: 67,
    name: '2 cách làm ruốc thịt heo ngon MÀY XANH',
    image: 'https://via.placeholder.com/300x200',
    date: '00:00 05/12/2023',
    type: 'blog',
    description: 'Cách làm ruốc thịt heo thơm ngon, đơn giản tại nhà',
  },
  {
    id: 68,
    name: 'TOP 4 cách nấu canh mọc vừa ngon vừa bổ dưỡng cực đơn giản tại nhà',
    image: 'https://via.placeholder.com/300x200',
    date: '00:00 07/02/2024',
    type: 'blog',
    description: 'Hướng dẫn nấu canh mọc thơm ngon, bổ dưỡng cho gia đình',
  },
  {
    id: 69,
    name: 'Cách làm tôm rang thịt ba chỉ CHẢY vị ngọt cả nhà T',
    image: 'https://via.placeholder.com/300x200',
    date: '00:00 27/09/2023',
    type: 'blog',
    description: 'Cách làm tôm rang thịt ba chỉ thơm ngon, đậm đà',
  },
];





function HomePage() {
  return (
    <div className="home-page">
      <SearchBar />
      
      <div className="container">
        <FilterBox />
      </div>
      {/* Top nhà hàng ưu đãi Hot */}
      <div className="hot-restaurants-section">
        <div className="section-header">
          <div>
            <h2>Top nhà hàng ưu đãi Hot</h2>
            <p>Khám phá những Nhà hàng đang có ưu đãi hấp dẫn ngay</p>
          </div>
          <Link to="/restaurants/hot" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="hot-restaurants">
          {hotRestaurants.slice(0, 4).map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </div>

      {/* Top sản phẩm ưu đãi Hot */}
      <div className="hot-products-section">
        <div className="section-header">
          <div>
            <h2>Top sản phẩm ưu đãi Hot</h2>
            <p>Khám phá những Sản phẩm đang có ưu đãi hấp dẫn ngay</p>
          </div>
          <Link to="/products/hot" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="hot-products">
          {hotProducts.slice(0, 4).map((product) => (
            <RestaurantCard
              key={product.id}
              restaurant={product}
            />
          ))}
        </div>
      </div>

      {/* Nhà hàng được đề xuất */}
      <div className="recommended-restaurants-section">
        <div className="section-header">
          <div>
            <h2>Nhà hàng được đề xuất</h2>
            <p>Mời bạn lựa chọn và đặt bàn trước qua DinerChill để nhận ngay ưu đãi.</p>
          </div>
          <Link to="/restaurants/recommended" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="recommended-restaurants">
          {recommendedRestaurants.slice(0, 4).map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </div>

      {/* Nhà hàng phù hợp đặt tiệc */}
      <div className="party-restaurants-section">
        <div className="section-header">
          <div>
            <h2>Nhà hàng phù hợp đặt tiệc</h2>
            <p>Với nhiều ưu đãi để đặt tiệc giúp bạn dễ dàng lựa chọn hơn!</p>
          </div>
          <Link to="/restaurants/party" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="party-restaurants">
          {partyRestaurants.slice(0, 4).map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </div>

      {/* Địa danh nổi tiếng */}
      <div className="famous-locations-section">
        <div className="section-header">
          <div>
            <h2>Địa danh nổi tiếng</h2>
            <p>Cùng DinerChill giới thiệu những địa danh ẩm thực nổi tiếng tại Tp.HCM.</p>
          </div>
          <Link to="/restaurants/locations" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="famous-locations">
          {famousLocations.slice(0, 4).map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </div>

      {/* Nhà hàng hải sản ngon nhất ưu đãi */}
      <div className="seafood-restaurants-section">
        <div className="section-header">
          <div>
            <h2>Nhà hàng hải sản ngon nhất ưu đãi</h2>
            <p>Mời bạn tham khảo ngay nhà hàng hải sản được yêu thích!</p>
          </div>
          <Link to="/restaurants/seafood" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="seafood-restaurants">
          {seafoodRestaurants.slice(0, 4).map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </div>

      {/* Ăn món Trung ngon ở đâu? */}
      <div className="chinese-restaurants-section">
        <div className="section-header">
          <div>
            <h2>Ăn món Trung ngon ở đâu?</h2>
            <p>Xem ngay top quán Trung ngon được DinerChill lựa chọn!</p>
          </div>
          <Link to="/restaurants/chinese" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="chinese-restaurants">
          {chineseRestaurants.slice(0, 4).map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </div>

      {/* Phong cách ẩm thực phổ biến */}
      <div className="popular-cuisines-section">
        <div className="section-header">
          <div>
            <h2>Phong cách ẩm thực phổ biến</h2>
            <p>Với nhiều ưu đãi để ẩm thực giúp bạn dễ dàng lựa chọn hơn!</p>
          </div>
          <Link to="/restaurants/cuisines" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="popular-cuisines">
          {popularCuisines.slice(0, 4).map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </div>

            {/* Yêu thích nhất hàng tháng */}
            <div className="section-wrapper monthly-favorites-section">
        <div className="section-header">
          <div>
            <h2>Yêu thích nhất hàng tháng</h2>
            <p>Khám phá nhà hàng được đặt chỗ nhiều nhất ngay</p>
          </div>
          <Link to="/restaurants/monthly-favorites" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="horizontal-section monthly-favorites">
          {monthlyFavorites.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </div>

      {/* Tìm nhà hàng theo tiện ích */}
      <div className="section-wrapper amenities-restaurants-section">
        <div className="section-header">
          <div>
            <h2>Tìm nhà hàng theo tiện ích</h2>
            <p>Khám phá danh sách nhà hàng theo tiện ích phù hợp để lựa chọn địa điểm nhanh nhất</p>
          </div>
          <Link to="/restaurants/amenities" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="horizontal-section amenities-restaurants">
          {amenitiesRestaurants.map((amenity) => (
            <RestaurantCard
              key={amenity.id}
              restaurant={amenity}
            />
          ))}
        </div>
      </div>

      {/* Top nhà hàng cao cấp */}
      <div className="section-wrapper luxury-restaurants-section">
        <div className="section-header">
          <div>
            <h2>Top nhà hàng cao cấp</h2>
            <p>Khám phá nhà hàng cao cấp món ngon, không gian sang trọng, đẳng cấp ưu đãi tốt</p>
          </div>
          <Link to="/restaurants/luxury" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="horizontal-section luxury-restaurants">
          {luxuryRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </div>

      {/* Đặt chỗ ưu tín */}
      <div className="section-wrapper trusted-restaurants-section">
        <div className="section-header">
          <div>
            <h2>Đặt chỗ ưu tín</h2>
            <p>Gợi ý nhà hàng ngon, chất lượng, đ.điểm đặt chỗ qua DinerChill</p>
          </div>
          <Link to="/restaurants/trusted" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="horizontal-section trusted-restaurants">
          {trustedRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </div>

      {/* Danh cho du khách */}
      <div className="section-wrapper tourist-restaurants-section">
        <div className="section-header">
          <div>
            <h2>Danh cho du khách</h2>
            <p>Thưởng thức đặc sản Sài Gòn tại đây</p>
          </div>
          <Link to="/restaurants/tourist" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="horizontal-section tourist-restaurants">
          {touristRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </div>

      {/* Trưa nay ăn gì */}
      <div className="section-wrapper lunch-suggestions-section">
        <div className="section-header">
          <div>
            <h2>Trưa nay ăn gì?</h2>
            <p>Mời bạn lựa chọn và đặt bàn trước qua DinerChill ngay</p>
          </div>
          <Link to="/products/lunch" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="horizontal-section lunch-suggestions">
          {lunchSuggestions.map((product) => (
            <RestaurantCard
              key={product.id}
              restaurant={product}
            />
          ))}
        </div>
      </div>

      {/* Mới nhất trên DinerChill */}
      <div className="section-wrapper new-on-DinerChill-section">
        <div className="section-header">
          <div>
            <h2>Mới nhất trên DinerChill</h2>
            <p>Dự án đây là các nhà hàng mới nhất đặt chỗ qua DinerChill. Khám phá ngay!</p>
          </div>
          <Link to="/restaurants/new-on-DinerChill" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="horizontal-section new-on-DinerChill">
          {newOnDinerChill.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </div>

      {/* Tin tức & Blog */}
      <div className="section-wrapper news-and-blog-section">
        <div className="section-header">
          <div>
            <h2>Tin tức & Blog</h2>
            <p>Những thông tin hữu ích về ẩm thực, sức khỏe, mẹo vặt,... cho bạn dễ dàng tìm hiểu đặt cập nhật liên tục tại DinerChill</p>
          </div>
          <Link to="/blog" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <div className="horizontal-section news-and-blog">
          {newsAndBlog.map((blog) => (
            <RestaurantCard
              key={blog.id}
              restaurant={blog}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;