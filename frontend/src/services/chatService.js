class ChatService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
  }

  // Simulate bot response - can be replaced with actual AI API
  async getBotResponse(message, conversationHistory = []) {
    try {
      // For now, using local logic. This can be replaced with:
      // - OpenAI GPT API
      // - Google Dialogflow
      // - Custom AI backend

      const response = this.generateLocalResponse(message);

      // Simulate API delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      return {
        success: true,
        message: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Chat service error:", error);
      return {
        success: false,
        message: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
        timestamp: new Date().toISOString(),
      };
    }
  }

  generateLocalResponse(userInput) {
    const input = userInput.toLowerCase();

    // Restaurant suggestions
    if (input.includes("nhà hàng") || input.includes("quán ăn")) {
      return "Tôi có thể giúp bạn tìm nhà hàng phù hợp! Bạn muốn tìm loại nhà hàng nào? Ví dụ: lẩu, buffet, hải sản, món Việt, món Hàn, món Nhật...";
    }

    // Specific cuisine types
    if (input.includes("lẩu")) {
      return "Tuyệt vời! Tôi có nhiều gợi ý nhà hàng lẩu ngon:\n\n🔥 **Lẩu Thái Tom Yum** - Vị chua cay đặc trưng\n🥩 **Lẩu nướng Hàn Quốc** - Kết hợp nướng và lẩu\n🦐 **Lẩu hải sản** - Tươi ngon từ biển\n\nBạn muốn tìm ở khu vực nào?";
    }

    if (input.includes("buffet")) {
      return "Buffet là lựa chọn tuyệt vời! Các loại buffet phổ biến:\n\n🍖 **Buffet nướng** (200-400k)\n🦀 **Buffet hải sản** (400-800k)\n🍣 **Buffet Nhật Bản** (500-1000k)\n🌿 **Buffet chay** (150-300k)\n\nBạn quan tâm loại nào?";
    }

    if (input.includes("hải sản")) {
      return "Hải sản tươi ngon! Tôi gợi ý:\n\n🦞 **Nhà hàng hải sản cao cấp** - Tôm hùm, cua hoàng đế\n🐟 **Quán hải sản bình dân** - Tươi ngon, giá rẻ\n🍤 **Buffet hải sản** - Đa dạng món\n\nBạn có ngân sách bao nhiêu?";
    }

    // Reservation help
    if (input.includes("đặt bàn")) {
      return "Hướng dẫn đặt bàn DinerChill:\n\n1️⃣ **Chọn nhà hàng** yêu thích\n2️⃣ **Chọn ngày giờ** phù hợp\n3️⃣ **Chọn số lượng khách**\n4️⃣ **Chọn bàn** trên sơ đồ\n5️⃣ **Thanh toán** đặt cọc\n6️⃣ **Nhận xác nhận** qua email\n\nBạn đã có nhà hàng cụ thể chưa?";
    }

    // Price inquiries
    if (
      input.includes("giá") ||
      input.includes("tiền") ||
      input.includes("chi phí")
    ) {
      return "Phân khúc giá nhà hàng:\n\n💰 **Giá rẻ** (50-150k/người)\n- Cơm tấm, phở, bún bò\n\n💵 **Trung bình** (150-300k/người)\n- Lẩu, nướng, món Á\n\n💎 **Cao cấp** (300-500k/người)\n- Buffet, hải sản, không gian đẹp\n\n👑 **Sang trọng** (500k+/người)\n- Fine dining, dịch vụ 5 sao\n\nBạn muốn tìm mức giá nào?";
    }

    // Location-based
    if (
      input.includes("gần") ||
      input.includes("khu vực") ||
      input.includes("địa điểm")
    ) {
      return "Cho tôi biết bạn ở đâu để gợi ý nhà hàng gần nhất:\n\n📍 **TP.HCM**: Quận 1, 3, 7, Thủ Đức...\n📍 **Hà Nội**: Ba Đình, Hoàn Kiếm, Cầu Giấy...\n📍 **Đà Nẵng**: Hải Châu, Thanh Khê...\n\nHoặc bạn có thể bật định vị để tìm nhà hàng gần nhất!";
    }

    // Special occasions
    if (
      input.includes("tiệc") ||
      input.includes("sinh nhật") ||
      input.includes("kỷ niệm")
    ) {
      return "Tổ chức tiệc đặc biệt:\n\n🎂 **Sinh nhật**: Không gian ấm cúng, bánh kem\n💕 **Kỷ niệm**: Nhà hàng lãng mạn, view đẹp\n🎉 **Tiệc công ty**: Phòng riêng, menu đa dạng\n👰 **Tiệc cưới**: Sảnh lớn, dịch vụ chuyên nghiệp\n\nBạn có bao nhiêu khách?";
    }

    // Premium recommendations
    if (
      input.includes("5 sao") ||
      input.includes("sang trọng") ||
      input.includes("cao cấp")
    ) {
      return "Nhà hàng cao cấp đáng thử:\n\n⭐ **Fine Dining**\n- Không gian sang trọng\n- Chef chuyên nghiệp\n- Dịch vụ đẳng cấp\n\n🌟 **Đặc sắc**\n- View thành phố/sông\n- Menu fusion độc đáo\n- Wine pairing\n\nDịp đặc biệt nào vậy bạn?";
    }

    // Greetings
    if (
      input.includes("xin chào") ||
      input.includes("hello") ||
      input.includes("hi")
    ) {
      return "Xin chào! Tôi là **DinerChill AI** - trợ lý tư vấn nhà hàng thông minh! 🤖\n\nTôi có thể giúp bạn:\n🍽️ Tìm nhà hàng theo sở thích\n📍 Gợi ý địa điểm gần bạn\n💰 Tư vấn theo ngân sách\n📅 Hướng dẫn đặt bàn\n🎉 Lên kế hoạch cho dịp đặc biệt\n\nBạn muốn tìm gì hôm nay?";
    }

    // Thanks
    if (input.includes("cảm ơn") || input.includes("thanks")) {
      return "Rất vui được hỗ trợ bạn! 😊\n\nNếu cần thêm gợi ý về nhà hàng, đặt bàn, hoặc bất kỳ thắc mắc nào khác, cứ nhắn tin cho tôi nhé!\n\nChúc bạn có những bữa ăn ngon miệng! 🍽️✨";
    }

    // Food types
    if (input.includes("món việt") || input.includes("việt nam")) {
      return "Món Việt đặc sắc:\n\n🍜 **Phở, bún bò Huế** - Hương vị truyền thống\n🐟 **Cá kho tộ, thịt kho** - Đậm đà\n🥗 **Gỏi cuốn, bánh mì** - Nhẹ nhàng\n🍖 **Thịt nướng** - Kiểu miền Nam\n\nBạn thích món mặn hay thanh đạm?";
    }

    if (input.includes("hàn quốc") || input.includes("korea")) {
      return "Ẩm thực Hàn Quốc:\n\n🔥 **BBQ nướng** - Bulgogi, galbi\n🍲 **Lẩu kimchi** - Chua cay đặc trưng\n🍜 **Mì cold naengmyeon** - Thanh mát\n🥘 **Bibimbap** - Cơm trộn đầy đủ\n\nBạn có thể ăn cay không?";
    }

    if (input.includes("nhật bản") || input.includes("japan")) {
      return "Tinh hoa ẩm thực Nhật:\n\n🍣 **Sushi, sashimi** - Tươi ngon\n🍜 **Ramen** - Đậm đà\n🍱 **Bento** - Đa dạng\n🍤 **Tempura** - Giòn rụm\n🥩 **Wagyu** - Thịt bò cao cấp\n\nBạn muốn thử món nào?";
    }

    // Default response with more personality
    return 'Hmm, tôi chưa hiểu rõ ý bạn 🤔\n\nTôi chuyên về:\n\n🍽️ **Gợi ý nhà hàng** theo sở thích\n📍 **Tìm kiếm địa điểm** ăn uống\n💰 **Tư vấn giá cả** phù hợp\n📋 **Hướng dẫn đặt bàn** chi tiết\n🎯 **Lên kế hoạch** cho dịp đặc biệt\n\nBạn có thể hỏi cụ thể hơn không? Ví dụ: "Tìm nhà hàng lẩu giá rẻ" hoặc "Hướng dẫn đặt bàn"';
  }

  // Save conversation (for future analytics)
  async saveConversation(conversation) {
    try {
      // This could save to backend for analytics
      localStorage.setItem("lastConversation", JSON.stringify(conversation));
      return true;
    } catch (error) {
      console.error("Failed to save conversation:", error);
      return false;
    }
  }

  // Get saved conversations
  getSavedConversations() {
    try {
      const saved = localStorage.getItem("lastConversation");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to get saved conversations:", error);
      return [];
    }
  }
}

// Create a named instance before exporting
const chatServiceInstance = new ChatService();
export default chatServiceInstance;
