const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Restaurant, Category, Promotion, Amenity, Table } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();

// Khởi tạo Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper functions to fetch data from database
const getRestaurantData = async (query = {}) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: {
        status: 'active',
        ...query
      },
      include: [
        { model: Category, as: 'categories' },
        { model: Amenity, as: 'amenities' },
        { model: Promotion, as: 'promotions', where: { isActive: true }, required: false },
        { model: Table, as: 'tables', where: { isActive: true }, required: false }
      ],
      limit: 10
    });
    return restaurants;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return [];
  }
};

const getTableAvailability = async (restaurantId = null) => {
  try {
    const whereCondition = { isActive: true };
    if (restaurantId) {
      whereCondition.restaurantId = restaurantId;
    }
    
    const tables = await Table.findAll({
      where: whereCondition,
      include: [
        { model: Restaurant, as: 'restaurant', where: { status: 'active' } }
      ],
      limit: 20
    });
    return tables;
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
};

const getActivePromotions = async () => {
  try {
    const promotions = await Promotion.findAll({
      where: {
        isActive: true,
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() }
      },
      include: [{ model: Restaurant, as: 'restaurants' }]
    });
    return promotions;
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return [];
  }
};

const getAmenities = async () => {
  try {
    const amenities = await Amenity.findAll({
      include: [{ model: Restaurant, as: 'restaurants', where: { status: 'active' }, required: false }]
    });
    return amenities;
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return [];
  }
};

// Hàm lấy thông tin chi tiết về tiện ích của một nhà hàng cụ thể
const getRestaurantAmenities = async (restaurantId = null) => {
  try {
    const restaurant = await Restaurant.findByPk(restaurantId, {
      include: [
        { model: Amenity, as: 'amenities' }
      ]
    });
    
    if (!restaurant) return null;
    return restaurant.amenities || [];
  } catch (error) {
    console.error('Error fetching restaurant amenities:', error);
    return [];
  }
};

// Hàm tạo prompt hệ thống với dữ liệu thực tế
async function createEnhancedPrompt(userMessage) {
  try {
    // Fetch relevant data based on user message
    let restaurantData = '';
    let tableData = '';
    let promotionData = '';
    let amenityData = '';
    let simplifiedExplanation = '';

    // Check if user wants a simplified explanation
    const needsSimplification = userMessage.toLowerCase().includes('giải thích') || 
                               userMessage.toLowerCase().includes('đơn giản') || 
                               userMessage.toLowerCase().includes('không hiểu');

    // Extract restaurant name or ID if mentioned
    let restaurantIdentifier = null;
    const restaurantNameMatch = userMessage.match(/nhà hàng\s+([^?.,]+)/i);
    if (restaurantNameMatch && restaurantNameMatch[1]) {
      restaurantIdentifier = restaurantNameMatch[1].trim();
    }

    // Search for table information
    if (userMessage.includes('bàn') || userMessage.includes('chỗ ngồi') || userMessage.includes('table')) {
      const tables = await getTableAvailability();
      
      // Check if user asking about table count for a specific restaurant
      if (restaurantIdentifier && (userMessage.includes('bao nhiêu bàn') || userMessage.includes('có mấy bàn') || userMessage.includes('số lượng bàn'))) {
        // Find tables for the specific restaurant
        const restaurants = await getRestaurantData();
        const targetRestaurant = restaurants.find(r => 
          r.name.toLowerCase().includes(restaurantIdentifier.toLowerCase())
        );
        
        if (targetRestaurant) {
          const restaurantTables = tables.filter(t => t.restaurant.id === targetRestaurant.id);
          const availableTables = restaurantTables.filter(t => t.status === 'available');
          
          tableData = `\nThông tin bàn của nhà hàng ${targetRestaurant.name}:\n`;
          tableData += `- Tổng số bàn: ${restaurantTables.length}\n`;
          tableData += `- Bàn trống: ${availableTables.length}\n`;
          tableData += `- Bàn đã đặt: ${restaurantTables.length - availableTables.length}\n`;
          
          if (restaurantTables.length > 0) {
            const capacities = restaurantTables.map(t => t.capacity);
            tableData += `- Sức chứa: ${Math.min(...capacities)}-${Math.max(...capacities)} người/bàn\n`;
          }
          
          if (needsSimplification) {
            simplifiedExplanation = `\nGiải thích đơn giản: Nhà hàng ${targetRestaurant.name} có tổng cộng ${restaurantTables.length} bàn, trong đó có ${availableTables.length} bàn còn trống và ${restaurantTables.length - availableTables.length} bàn đã được đặt trước hoặc đang có khách.`;
          }
        }
      } 
      // Check if user asking about table count for all restaurants
      else if (userMessage.includes('bao nhiêu bàn') || userMessage.includes('có mấy bàn') || userMessage.includes('số lượng bàn')) {
        // Group tables by restaurant
        const tablesByRestaurant = {};
        tables.forEach(table => {
          const restaurantName = table.restaurant.name;
          if (!tablesByRestaurant[restaurantName]) {
            tablesByRestaurant[restaurantName] = {
              total: 0,
              available: 0,
              occupied: 0,
              capacities: []
            };
          }
          tablesByRestaurant[restaurantName].total += 1;
          if (table.status === 'available') tablesByRestaurant[restaurantName].available += 1;
          if (table.status === 'occupied' || table.status === 'reserved') tablesByRestaurant[restaurantName].occupied += 1;
          tablesByRestaurant[restaurantName].capacities.push(table.capacity);
        });
        
        if (Object.keys(tablesByRestaurant).length > 0) {
          tableData = `\nThông tin số lượng bàn theo nhà hàng:\n${Object.entries(tablesByRestaurant).map(([name, info]) => 
            `- ${name}: ${info.total} bàn (${info.available} trống, ${info.occupied} đã đặt)\n  Sức chứa: ${Math.min(...info.capacities)}-${Math.max(...info.capacities)} người/bàn`
          ).join('\n')}`;
          
          if (needsSimplification) {
            const totalRestaurants = Object.keys(tablesByRestaurant).length;
            const totalTables = Object.values(tablesByRestaurant).reduce((sum, info) => sum + info.total, 0);
            const availableTables = Object.values(tablesByRestaurant).reduce((sum, info) => sum + info.available, 0);
            
            simplifiedExplanation = `\nGiải thích đơn giản: Chúng tôi có ${totalRestaurants} nhà hàng với tổng cộng ${totalTables} bàn. Hiện tại có ${availableTables} bàn còn trống và sẵn sàng phục vụ quý khách.`;
          }
        }
      } 
      // Check if user asking about available tables
      else if (userMessage.includes('trống') || userMessage.includes('available') || userMessage.includes('còn chỗ')) {
        const availableTables = tables.filter(t => t.status === 'available');
        if (availableTables.length > 0) {
          tableData = `\nBàn trống hiện có:\n${availableTables.slice(0, 10).map(t => 
            `- ${t.restaurant.name}: Bàn ${t.tableNumber} (${t.capacity} chỗ) - ${t.description || 'Bàn thường'}`
          ).join('\n')}`;
          
          if (needsSimplification) {
            const tablesByRestaurant = {};
            availableTables.forEach(table => {
              if (!tablesByRestaurant[table.restaurant.name]) {
                tablesByRestaurant[table.restaurant.name] = 0;
              }
              tablesByRestaurant[table.restaurant.name]++;
            });
            
            const restaurantList = Object.entries(tablesByRestaurant)
              .map(([name, count]) => `${name} (${count} bàn)`)
              .join(', ');
              
            simplifiedExplanation = `\nGiải thích đơn giản: Hiện tại có ${availableTables.length} bàn trống tại các nhà hàng: ${restaurantList}. Bạn có thể đặt bàn ngay bây giờ.`;
          }
        }
      }
      // General table information
      else {
        const availableTables = tables.filter(t => t.status === 'available');
        const totalTables = tables.length;
        if (tables.length > 0) {
          tableData = `\nThông tin bàn:\n- Tổng số bàn: ${totalTables}\n- Bàn trống: ${availableTables.length}\n- Bàn đã đặt: ${totalTables - availableTables.length}\n\nMột số bàn trống:\n${availableTables.slice(0, 5).map(t => 
            `- ${t.restaurant.name}: Bàn ${t.tableNumber} (${t.capacity} chỗ)`
          ).join('\n')}`;
          
          if (needsSimplification) {
            simplifiedExplanation = `\nGiải thích đơn giản: Chúng tôi có tổng cộng ${totalTables} bàn trong tất cả các nhà hàng. Hiện tại có ${availableTables.length} bàn còn trống và sẵn sàng phục vụ.`;
          }
        }
      }
    }

    // Search for amenities information
    if (userMessage.includes('tiện ích') || userMessage.includes('dịch vụ') || userMessage.includes('amenity')) {
      // Check if asking about amenities for a specific restaurant
      if (restaurantIdentifier) {
        const restaurants = await getRestaurantData();
        const targetRestaurant = restaurants.find(r => 
          r.name.toLowerCase().includes(restaurantIdentifier.toLowerCase())
        );
        
        if (targetRestaurant && targetRestaurant.amenities && targetRestaurant.amenities.length > 0) {
          amenityData = `\nTiện ích của nhà hàng ${targetRestaurant.name}:\n${targetRestaurant.amenities.map(a => 
            `- ${a.name}`
          ).join('\n')}`;
          
          if (needsSimplification) {
            const amenityNames = targetRestaurant.amenities.map(a => a.name).join(', ');
            simplifiedExplanation = `\nGiải thích đơn giản: Nhà hàng ${targetRestaurant.name} cung cấp các tiện ích sau: ${amenityNames}. Những tiện ích này giúp bạn có trải nghiệm thoải mái khi đến dùng bữa.`;
          }
        } else {
          amenityData = `\nKhông tìm thấy thông tin tiện ích cho nhà hàng ${restaurantIdentifier}.`;
        }
      } else {
        // General amenities information
        const amenities = await getAmenities();
        if (amenities.length > 0) {
          // Group amenities by popularity (number of restaurants offering them)
          const amenitiesByPopularity = amenities.map(a => ({
            name: a.name,
            count: a.restaurants ? a.restaurants.length : 0
          })).sort((a, b) => b.count - a.count);
          
          amenityData = `\nTiện ích có sẵn tại các nhà hàng:\n${amenitiesByPopularity.map(a => 
            `- ${a.name} (${a.count} nhà hàng)`
          ).join('\n')}`;
          
          if (needsSimplification) {
            const topAmenities = amenitiesByPopularity.slice(0, 5).map(a => a.name).join(', ');
            simplifiedExplanation = `\nGiải thích đơn giản: Các nhà hàng của chúng tôi cung cấp nhiều tiện ích khác nhau. Phổ biến nhất là: ${topAmenities}. Những tiện ích này giúp bạn có trải nghiệm thoải mái khi đến dùng bữa.`;
          }
        }
      }
    }

    // Search for specific restaurants by type
    if (userMessage.includes('lẩu') || userMessage.includes('hotpot')) {
      const restaurants = await getRestaurantData();
      const lauRestaurants = restaurants.filter(r => 
        r.categories?.some(cat => cat.name.toLowerCase().includes('lẩu')) ||
        r.name.toLowerCase().includes('lẩu') ||
        r.description?.toLowerCase().includes('lẩu')
      );
      if (lauRestaurants.length > 0) {
        restaurantData = `\nNhà hàng lẩu có sẵn:\n${lauRestaurants.map(r => 
          `- ${r.name}: ${r.address}, ${r.priceRange || 'Giá liên hệ'}, Điện thoại: ${r.phone || 'Liên hệ qua app'}`
        ).join('\n')}`;
      }
    }

    if (userMessage.includes('buffet')) {
      const restaurants = await getRestaurantData();
      const buffetRestaurants = restaurants.filter(r => 
        r.categories?.some(cat => cat.name.toLowerCase().includes('buffet')) ||
        r.name.toLowerCase().includes('buffet') ||
        r.description?.toLowerCase().includes('buffet')
      );
      if (buffetRestaurants.length > 0) {
        restaurantData = `\nNhà hàng buffet có sẵn:\n${buffetRestaurants.map(r => 
          `- ${r.name}: ${r.address}, ${r.priceRange || 'Giá liên hệ'}, Điện thoại: ${r.phone || 'Liên hệ qua app'}`
        ).join('\n')}`;
      }
    }

    // Search for party/event venues
    if (userMessage.includes('tiệc') || userMessage.includes('sinh nhật') || userMessage.includes('sự kiện')) {
      const restaurants = await getRestaurantData();
      const eventRestaurants = restaurants.filter(r => 
        r.categories?.some(cat => cat.name.toLowerCase().includes('tiệc') || cat.name.toLowerCase().includes('event')) ||
        r.name.toLowerCase().includes('tiệc') ||
        r.description?.toLowerCase().includes('tiệc') ||
        r.capacity >= 20
      );
      if (eventRestaurants.length > 0) {
        restaurantData = `\nNhà hàng phù hợp cho tiệc:\n${eventRestaurants.map(r => 
          `- ${r.name}: ${r.address}, Sức chứa: ${r.capacity || 'Liên hệ'}, ${r.priceRange || 'Giá liên hệ'}, Điện thoại: ${r.phone || 'Liên hệ qua app'}`
        ).join('\n')}`;
      }
    }

    // Search for promotions
    if (userMessage.includes('khuyến mãi') || userMessage.includes('giảm giá') || userMessage.includes('ưu đãi')) {
      const promotions = await getActivePromotions();
      if (promotions.length > 0) {
        promotionData = `\nKhuyến mãi hiện tại:\n${promotions.map(p => 
          `- ${p.name}: ${p.description} (${p.discountType === 'percent' ? p.discountValue + '%' : p.discountValue + 'k'} giảm giá)`
        ).join('\n')}`;
      }
    }

    // General restaurant search
    if ((userMessage.includes('tìm') || userMessage.includes('nhà hàng')) && !restaurantData) {
      const restaurants = await getRestaurantData();
      if (restaurants.length > 0) {
        restaurantData = `\nMột số nhà hàng nổi bật:\n${restaurants.slice(0, 5).map(r => 
          `- ${r.name}: ${r.address}, ${r.priceRange || 'Giá liên hệ'}, Điện thoại: ${r.phone || 'Liên hệ qua app'}`
        ).join('\n')}`;
      }
    }

    return `Bạn là trợ lý AI chuyên nghiệp của ứng dụng đặt bàn DinerChill. Tuân thủ các quy tắc sau:

1. CHỈ trả lời các câu hỏi liên quan đến nhà hàng, đặt bàn, ẩm thực, và dịch vụ của DinerChill.
2. Từ chối lịch sự các câu hỏi không liên quan đến nhà hàng hoặc ứng dụng (như chính trị, thời tiết, thể thao, v.v.).
3. Trả lời NGẮN GỌN, SÚC TÍCH và DỄ HIỂU. Tránh dùng từ ngữ phức tạp.
4. Luôn sử dụng dữ liệu thực tế từ hệ thống khi trả lời về nhà hàng, bàn, hoặc tiện ích.
5. Khi người dùng yêu cầu giải thích, sử dụng ngôn ngữ đơn giản, dễ hiểu.
6. Không đưa ra thông tin sai lệch. Nếu không có dữ liệu, hãy thừa nhận và đề nghị hỗ trợ theo cách khác.

Dịch vụ của DinerChill bao gồm:
- Tìm kiếm và đặt bàn tại nhà hàng
- Thông tin về tiện ích, khuyến mãi của nhà hàng
- Tư vấn món ăn và loại hình ẩm thực
- Hỗ trợ đặt tiệc và sự kiện
- Kiểm tra tình trạng bàn trống

Dữ liệu thực tế từ hệ thống:${restaurantData}${tableData}${promotionData}${amenityData}${simplifiedExplanation}

Trả lời bằng tiếng Việt, thân thiện nhưng chuyên nghiệp. Ưu tiên cung cấp thông tin chính xác và hữu ích. Nếu người dùng hỏi về chủ đề không liên quan, lịch sự từ chối và hướng họ quay lại các chủ đề về nhà hàng và đặt bàn.`;

  } catch (error) {
    console.error('Error creating enhanced prompt:', error);
    return `Bạn là trợ lý AI chuyên nghiệp của ứng dụng đặt bàn DinerChill. Hãy trả lời ngắn gọn, súc tích và dễ hiểu bằng tiếng Việt. Chỉ trả lời các câu hỏi liên quan đến nhà hàng, đặt bàn và dịch vụ của DinerChill.`;
  }
}

// API endpoint để chat với bot
router.post('/chat', async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Tin nhắn không được để trống' });
    }

    // Quick responses for greetings
    if (message.toLowerCase().includes('xin chào') || 
        message.toLowerCase().includes('hello') || 
        message.toLowerCase().includes('hi') || 
        message.toLowerCase().includes('chào')) {
      return res.json({
        message: 'Chào bạn! Tôi có thể giúp bạn tìm nhà hàng, đặt bàn hoặc tìm hiểu về khuyến mãi. Bạn cần hỗ trợ gì? 😊',
        timestamp: new Date().toISOString(),
        sessionId: sessionId || userId || 'anonymous'
      });
    }

    // Detect off-topic questions
    const offTopicKeywords = [
      'chính trị', 'bầu cử', 'tổng thống', 'thủ tướng', 'quốc hội',
      'thời tiết', 'dự báo', 'mưa', 'nắng', 'bão',
      'thể thao', 'bóng đá', 'bóng rổ', 'tennis', 'vô địch',
      'covid', 'dịch bệnh', 'vaccine', 
      'chứng khoán', 'bitcoin', 'tiền điện tử',
      'facebook', 'instagram', 'tiktok', 'mạng xã hội',
      'hack', 'crack', 'mật khẩu', 'tài khoản',
      'viết code', 'lập trình', 'phần mềm'
    ];

    // Check if message contains off-topic keywords
    const isOffTopic = offTopicKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isOffTopic) {
      return res.json({
        message: 'Xin lỗi, tôi chỉ có thể hỗ trợ các câu hỏi liên quan đến nhà hàng, đặt bàn và dịch vụ của DinerChill. Bạn cần tìm nhà hàng nào hoặc muốn biết thêm về dịch vụ đặt bàn của chúng tôi không?',
        timestamp: new Date().toISOString(),
        sessionId: sessionId || userId || 'anonymous'
      });
    }

    // Tạo prompt với dữ liệu thực tế từ database
    const enhancedPrompt = await createEnhancedPrompt(message);
    const prompt = `${enhancedPrompt}\n\nKhách hàng: ${message}\nTrợ lý:`;

    // Gọi Gemini API với Gemini 2.0 model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        maxOutputTokens: 300,  // Limit response length to ensure conciseness
        temperature: 0.7,      // Slightly creative but still factual
        topP: 0.9,             // Focus on more probable tokens
        topK: 40               // Consider a good range of tokens
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    let botReply = response.text();
    
    // Ensure the response is concise - trim if it's too long
    if (botReply.length > 500) {
      // Find a good breaking point (end of sentence)
      const breakPoint = botReply.substring(0, 450).lastIndexOf('.');
      if (breakPoint > 0) {
        botReply = botReply.substring(0, breakPoint + 1);
      } else {
        botReply = botReply.substring(0, 450) + '...';
      }
    }

    res.json({
      message: botReply,
      timestamp: new Date().toISOString(),
      sessionId: sessionId || userId || 'anonymous'
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      error: 'Có lỗi xảy ra khi xử lý tin nhắn',
      message: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.'
    });
  }
});

module.exports = router;