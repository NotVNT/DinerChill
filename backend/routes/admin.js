const express = require("express");
const router = express.Router();
const {
  Restaurant,
  RestaurantImage,
  Category,
  Reservation,
  User,
  Table,
  Promotion,
  PaymentInformation,
  Amenity,
} = require("../models");
const { authenticateAdmin } = require("../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");

// Helper function to normalize path for web URLs
function normalizeFilePath(filePath) {
  // Convert Windows backslashes to forward slashes for web URLs
  return filePath.replace(/\\/g, "/");
}

// Setup storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure uploads directory exists
    const uploadDir = "./uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename =
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname;
    cb(null, uniqueFilename);
  },
});

// Create upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Get all restaurants with include images
router.get("/restaurants", authenticateAdmin, async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      include: [
        { model: RestaurantImage, as: "images" },
        {
          model: Category,
          as: "categories",
          attributes: ["id", "name", "description"], // Only include columns that exist in database
        },
        { model: Amenity, as: "amenities" },
      ],
    });

    // Normalize paths for web URLs
    for (const restaurant of restaurants) {
      if (restaurant.images && restaurant.images.length > 0) {
        for (const image of restaurant.images) {
          if (image.image_path) {
            image.image_path = normalizeFilePath(image.image_path);
          }
        }
      }
    }

    res.json(restaurants);
  } catch (error) {
    console.error("Error getting restaurants:", error);
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi lấy danh sách nhà hàng" });
  }
});

// Thêm nhà hàng mới với upload nhiều hình ảnh
router.post(
  "/restaurants",
  authenticateAdmin,
  upload.array("restaurantImages", 10),
  async (req, res) => {
    try {
      const {
        name,
        address,
        description,
        openingTime,
        closingTime,
        phone,
        email,
        priceRange,
        capacity,
        status,
        categoryIds,
        amenityIds,
      } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({ message: "Tên nhà hàng là bắt buộc" });
      }

      // Tạo nhà hàng mới trong database với giá trị mặc định "Chưa cập nhật"
      const newRestaurant = await Restaurant.create({
        name,
        cuisineType: "Chưa phân loại", // Default value, will be replaced by categories
        address: address || "Chưa cập nhật",
        description: description || "Chưa cập nhật",
        openingTime: openingTime || "10:00",
        closingTime: closingTime || "22:00",
        phone: phone || "",
        email: email || "",
        priceRange: priceRange || "200.000đ - 500.000đ",
        capacity: capacity ? parseInt(capacity) : null,
        status: status || "active",
      });

      // Associate restaurant with categories if provided
      if (categoryIds) {
        try {
          let categoryIdsArray = [];
          if (typeof categoryIds === "string") {
            categoryIdsArray = JSON.parse(categoryIds);
          } else if (Array.isArray(categoryIds)) {
            categoryIdsArray = categoryIds;
          }

          if (categoryIdsArray.length > 0) {
            await newRestaurant.setCategories(categoryIdsArray);
            console.log(
              `Associated restaurant ${newRestaurant.id} with categories:`,
              categoryIdsArray
            );
          }
        } catch (categoryError) {
          console.error("Error associating categories:", categoryError);
        }
      }

      // Associate restaurant with amenities if provided
      if (amenityIds) {
        try {
          let amenityIdsArray = [];
          if (typeof amenityIds === "string") {
            amenityIdsArray = JSON.parse(amenityIds);
          } else if (Array.isArray(amenityIds)) {
            amenityIdsArray = amenityIds;
          }

          if (amenityIdsArray.length > 0) {
            await newRestaurant.setAmenities(amenityIdsArray);
            console.log(
              `Associated restaurant ${newRestaurant.id} with amenities:`,
              amenityIdsArray
            );
          }
        } catch (amenityError) {
          console.error("Error associating amenities:", amenityError);
        }
      }

      // Lưu hình ảnh vào uploads và tạo bản ghi trong database
      if (req.files && req.files.length > 0) {
        try {
          // Lưu thông tin hình ảnh vào database
          const imagePromises = req.files.map((file) => {
            return RestaurantImage.create({
              restaurant_id: newRestaurant.id,
              image_path: normalizeFilePath(file.path),
            });
          });

          await Promise.all(imagePromises);
        } catch (uploadError) {
          console.error("Error saving images:", uploadError);
          // Note: We continue with restaurant creation even if image saving fails
        }
      }

      // Fetch restaurant with images and categories
      const restaurantWithDetails = await Restaurant.findByPk(
        newRestaurant.id,
        {
          include: [
            { model: RestaurantImage, as: "images" },
            {
              model: Category,
              as: "categories",
              attributes: ["id", "name", "description"], // Only include columns that exist in database
            },
            { model: Amenity, as: "amenities" },
          ],
        }
      );

      console.log("Restaurant created:", newRestaurant.id);
      res.status(201).json(restaurantWithDetails);
    } catch (error) {
      console.error("Lỗi khi tạo nhà hàng:", error);
      res
        .status(500)
        .json({ message: "Lỗi server khi tạo nhà hàng: " + error.message });
    }
  }
);

// Cập nhật nhà hàng với upload nhiều hình ảnh
router.put(
  "/restaurants/:id",
  authenticateAdmin,
  upload.array("restaurantImages", 10),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        address,
        description,
        openingTime,
        closingTime,
        phone,
        email,
        priceRange,
        capacity,
        deleteImageIds,
        status,
        existingImages,
        closureReason,
        categoryIds,
        amenityIds,
      } = req.body;

      console.log("Update restaurant request received:", {
        id,
        existingImages,
        status,
        closureReason,
        categoryIds,
        amenityIds,
      });

      // Tìm nhà hàng theo id
      const restaurant = await Restaurant.findByPk(id);

      if (!restaurant) {
        return res.status(404).json({ message: "Không tìm thấy nhà hàng" });
      }

      // Update categories if provided
      if (categoryIds) {
        try {
          let categoryIdsArray = [];
          if (typeof categoryIds === "string") {
            categoryIdsArray = JSON.parse(categoryIds);
          } else if (Array.isArray(categoryIds)) {
            categoryIdsArray = categoryIds;
          }

          await restaurant.setCategories(categoryIdsArray);
          console.log(
            `Updated categories for restaurant ${id}:`,
            categoryIdsArray
          );
        } catch (categoryError) {
          console.error("Error updating categories:", categoryError);
        }
      }

      // Update amenities if provided
      if (amenityIds) {
        try {
          let amenityIdsArray = [];
          if (typeof amenityIds === "string") {
            amenityIdsArray = JSON.parse(amenityIds);
          } else if (Array.isArray(amenityIds)) {
            amenityIdsArray = amenityIds;
          }

          await restaurant.setAmenities(amenityIdsArray);
          console.log(
            `Updated amenities for restaurant ${id}:`,
            amenityIdsArray
          );
        } catch (amenityError) {
          console.error("Error updating amenities:", amenityError);
        }
      }

      // Get all current images for this restaurant
      const currentImages = await RestaurantImage.findAll({
        where: { restaurant_id: id },
      });

      console.log(
        `Found ${currentImages.length} existing images for restaurant ${id}`
      );

      // If existingImages is provided, determine which images to keep
      if (existingImages) {
        try {
          let imagesToKeep = [];

          if (typeof existingImages === "string") {
            imagesToKeep = JSON.parse(existingImages);
          } else if (Array.isArray(existingImages)) {
            imagesToKeep = existingImages;
          }

          console.log("Images to keep:", imagesToKeep);

          // Delete images that are not in the "keep" list
          if (Array.isArray(imagesToKeep)) {
            for (const image of currentImages) {
              if (!imagesToKeep.includes(image.id.toString())) {
                console.log(`Deleting image: ${image.id}`);

                // Delete the physical file
                if (fs.existsSync(image.image_path)) {
                  fs.unlinkSync(image.image_path);
                }

                // Delete the database record
                await image.destroy();
              }
            }
          }
        } catch (error) {
          console.error("Error processing existing images:", error);
        }
      }

      // Xóa hình ảnh đã chọn nếu có
      if (deleteImageIds && deleteImageIds.length > 0) {
        try {
          let idsToDelete = [];

          if (typeof deleteImageIds === "string") {
            idsToDelete = deleteImageIds
              .split(",")
              .map((id) => parseInt(id.trim()));
          } else if (Array.isArray(deleteImageIds)) {
            idsToDelete = deleteImageIds.map((id) => parseInt(id));
          }

          if (idsToDelete.length > 0) {
            // Find images to delete first
            const imagesToDelete = await RestaurantImage.findAll({
              where: {
                id: idsToDelete,
                restaurant_id: id,
              },
            });

            // Delete physical files
            for (const image of imagesToDelete) {
              if (fs.existsSync(image.image_path)) {
                fs.unlinkSync(image.image_path);
              }
            }

            // Delete database records
            await RestaurantImage.destroy({
              where: {
                id: idsToDelete,
                restaurant_id: id,
              },
            });
          }
        } catch (deleteError) {
          console.error("Error deleting images:", deleteError);
        }
      }

      // Lưu hình ảnh mới vào uploads và database
      if (req.files && req.files.length > 0) {
        try {
          // Lưu thông tin hình ảnh vào database
          const imagePromises = req.files.map((file) => {
            return RestaurantImage.create({
              restaurant_id: id,
              image_path: normalizeFilePath(file.path),
            });
          });

          await Promise.all(imagePromises);
        } catch (uploadError) {
          console.error("Error saving images:", uploadError);
        }
      }

      // Cập nhật thông tin nhà hàng
      await restaurant.update({
        name: name || restaurant.name,
        cuisineType: restaurant.cuisineType,
        address: address || restaurant.address,
        description:
          description !== undefined ? description : restaurant.description,
        openingTime: openingTime || restaurant.openingTime,
        closingTime: closingTime || restaurant.closingTime,
        phone: phone || restaurant.phone,
        email: email || restaurant.email,
        priceRange: priceRange || restaurant.priceRange,
        capacity: capacity ? parseInt(capacity) : restaurant.capacity,
        status: status || restaurant.status,
        closureReason: status === "maintenance" ? closureReason || "" : "",
      });

      // Lấy dữ liệu nhà hàng đã cập nhật, kèm theo images và categories
      const updatedRestaurant = await Restaurant.findByPk(id, {
        include: [
          { model: RestaurantImage, as: "images" },
          {
            model: Category,
            as: "categories",
            attributes: ["id", "name", "description"], // Only include columns that exist in database
          },
          { model: Amenity, as: "amenities" },
        ],
      });

      res.json(updatedRestaurant);
    } catch (error) {
      console.error("Lỗi khi cập nhật nhà hàng:", error);
      res.status(500).json({
        message: "Lỗi server khi cập nhật nhà hàng: " + error.message,
      });
    }
  }
);

// Xóa nhà hàng
router.delete("/restaurants/:id", authenticateAdmin, async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const restaurant = await Restaurant.findByPk(restaurantId, {
      include: [{ model: RestaurantImage, as: "images" }],
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Không tìm thấy nhà hàng" });
    }

    // Restaurant will be deleted along with its images due to CASCADE constraint
    await restaurant.destroy();
    res.json({ message: "Đã xóa nhà hàng thành công" });
  } catch (err) {
    console.error("Error deleting restaurant:", err);
    res.status(500).json({ message: "Đã xảy ra lỗi khi xóa nhà hàng" });
  }
});

// Categories Management Routes
// Get all categories
router.get("/categories", authenticateAdmin, async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: {
        exclude: ["imagePath", "fileName"], // Exclude new columns until migration is applied
      },
    });

    // Just return the categories without transformation until migration is applied
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Không thể lấy danh sách danh mục" });
  }
});

// Add a new category
router.post(
  "/categories",
  authenticateAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({ message: "Tên danh mục là bắt buộc" });
      }

      let imagePath = null;
      let fileName = null;

      // If image file is uploaded, save it
      if (req.file) {
        imagePath = req.file.path;
        fileName = req.file.filename;
      }

      // Create new category
      const newCategory = await Category.create({
        name,
        description: description || "",
        imagePath,
        fileName,
      });

      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Không thể tạo danh mục mới" });
    }
  }
);

// Update a category
router.put(
  "/categories/:id",
  authenticateAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const categoryId = req.params.id;
      const { name, description } = req.body;

      // Find the category
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Không tìm thấy danh mục" });
      }

      let imagePath = category.imagePath;
      let fileName = category.fileName;

      // If image file is uploaded, process it
      if (req.file) {
        // Delete old file if it exists
        if (category.imagePath && fs.existsSync(category.imagePath)) {
          fs.unlinkSync(category.imagePath);
        }

        // Update with new file info
        imagePath = req.file.path;
        fileName = req.file.filename;
      }

      // Update the category
      await category.update({
        name: name || category.name,
        description:
          description !== undefined ? description : category.description,
        imagePath,
        fileName,
      });

      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Không thể cập nhật danh mục" });
    }
  }
);

// Delete a category
router.delete("/categories/:id", authenticateAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Find the category
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    // Delete the image file if it exists
    if (category.imagePath && fs.existsSync(category.imagePath)) {
      fs.unlinkSync(category.imagePath);
    }

    // Delete the category
    await category.destroy();

    res.json({ message: "Đã xóa danh mục thành công" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Không thể xóa danh mục" });
  }
});

// Get all reservations with included User data
router.get("/reservations", authenticateAdmin, async (req, res) => {
  try {
    console.log("Admin API: Getting reservations with associations");
    const reservations = await Reservation.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        { model: Restaurant, as: "restaurant", attributes: ["id", "name"] },
        {
          model: Table,
          as: "table",
          attributes: ["id", "tableNumber", "tableCode"],
          required: false,
        },
      ],
      order: [
        ["date", "DESC"],
        ["time", "ASC"],
      ],
    });
    console.log(`Admin API: Found ${reservations.length} reservations`);
    res.json(reservations);
  } catch (error) {
    console.error("Admin API: Error getting reservations:", error);
    console.error("Admin API: Error details:", error.message);
    console.error("Admin API: Error stack:", error.stack);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy danh sách đặt bàn",
      error: error.message,
    });
  }
});

// Update reservation
router.put("/reservations/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin đặt bàn" });
    }

    // Cập nhật thông tin đặt bàn
    await reservation.update(req.body);

    // Trả về thông tin đặt bàn đã cập nhật kèm theo thông tin liên quan
    const updatedReservation = await Reservation.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        { model: Restaurant, as: "restaurant", attributes: ["id", "name"] },
        {
          model: Table,
          as: "table",
          attributes: ["id", "tableNumber", "tableCode"],
          required: false,
        },
      ],
    });

    res.json(updatedReservation);
  } catch (error) {
    console.error("Error updating reservation:", error);
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi cập nhật thông tin đặt bàn" });
  }
});

// Delete reservation
router.delete("/reservations/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin đặt bàn" });
    }

    // Xóa đặt bàn
    await reservation.destroy();

    res.json({ message: "Đã xóa đặt bàn thành công" });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi xóa đặt bàn" });
  }
});

// Tables Management Routes
router.get("/tables", authenticateAdmin, async (req, res) => {
  try {
    const { restaurantId } = req.query;

    // Thêm điều kiện where để lọc theo restaurantId
    const whereCondition = restaurantId ? { restaurantId } : {};

    const tables = await Table.findAll({
      where: whereCondition,
      include: [
        {
          model: Restaurant,
          as: "restaurant",
          attributes: ["id", "name"],
        },
      ],
    });

    res.json(tables);
  } catch (error) {
    console.error("Error getting tables:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách bàn" });
  }
});

// Tạo bàn mới
router.post("/tables", authenticateAdmin, async (req, res) => {
  try {
    // Kiểm tra xem số bàn đã tồn tại trong nhà hàng chưa
    const existingTable = await Table.findOne({
      where: {
        restaurantId: req.body.restaurantId,
        tableNumber: req.body.tableNumber,
      },
    });

    if (existingTable) {
      return res.status(400).json({
        message: "Số bàn này đã tồn tại trong nhà hàng",
      });
    }

    // Nếu không trùng, tạo bàn mới
    const tableData = {
      ...req.body,
      tableCode: generateTableCode(),
    };

    const table = await Table.create(tableData);
    const tableWithRestaurant = await Table.findByPk(table.id, {
      include: [
        {
          model: Restaurant,
          as: "restaurant",
          attributes: ["id", "name"],
        },
      ],
    });
    res.status(201).json(tableWithRestaurant);
  } catch (error) {
    console.error("Error creating table:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Số bàn này đã tồn tại trong nhà hàng",
      });
    }
    res.status(500).json({ message: "Đã xảy ra lỗi khi tạo bàn mới" });
  }
});

// Cập nhật bàn
router.put("/tables/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const table = await Table.findByPk(id);

    if (!table) {
      return res.status(404).json({ message: "Không tìm thấy bàn" });
    }

    // Kiểm tra xem số bàn mới có trùng với bàn khác trong cùng nhà hàng không
    if (req.body.tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({
        where: {
          restaurantId: req.body.restaurantId || table.restaurantId,
          tableNumber: req.body.tableNumber,
          id: { [Op.ne]: id }, // Loại trừ bàn hiện tại
        },
      });

      if (existingTable) {
        return res.status(400).json({
          message: "Số bàn này đã tồn tại trong nhà hàng",
        });
      }
    }

    await table.update(req.body);

    const updatedTable = await Table.findByPk(id, {
      include: [
        {
          model: Restaurant,
          as: "restaurant",
          attributes: ["id", "name"],
        },
      ],
    });

    res.json(updatedTable);
  } catch (error) {
    console.error("Error updating table:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Số bàn này đã tồn tại trong nhà hàng",
      });
    }
    res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật bàn" });
  }
});

router.delete("/tables/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const table = await Table.findByPk(id);

    if (!table) {
      return res.status(404).json({ message: "Không tìm thấy bàn" });
    }

    await table.destroy();
    res.json({ message: "Đã xóa bàn thành công" });
  } catch (error) {
    console.error("Error deleting table:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi xóa bàn" });
  }
});

const generateTableCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ00000789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Get all promotions
router.get("/promotions", authenticateAdmin, async (req, res) => {
  try {
    const promotions = await Promotion.findAll({
      include: [
        {
          model: Restaurant,
          as: "restaurants",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(promotions);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    res.status(500).json({ message: "Không thể tải danh sách khuyến mãi" });
  }
});

// Create a new promotion
router.post("/promotions", authenticateAdmin, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      minimumOrderAmount,
      maximumDiscount,
      usageLimit,
      isActive,
      restaurantId,
    } = req.body;

    // Create promotion
    const promotion = await Promotion.create({
      name: code,
      code,
      description,
      discountType: discountType === "percentage" ? "percent" : "fixed",
      discountValue,
      startDate,
      endDate,
      minOrderValue: minimumOrderAmount || 0,
      maxDiscountValue: maximumDiscount || null,
      usageLimit: usageLimit || null,
      isActive,
      usageCount: 0,
    });

    // If restaurantId is provided, associate with a specific restaurant
    // Otherwise, associate with all restaurants
    if (restaurantId) {
      const restaurant = await Restaurant.findByPk(restaurantId);
      if (restaurant) {
        await promotion.setRestaurants([restaurant]);
      }
    } else {
      // Apply to all restaurants - get all active restaurants
      const allRestaurants = await Restaurant.findAll({
        where: { status: "active" },
      });

      if (allRestaurants.length > 0) {
        await promotion.setRestaurants(allRestaurants);
      }
    }

    // Fetch the created promotion with restaurant associations
    const promotionWithRestaurants = await Promotion.findByPk(promotion.id, {
      include: [
        {
          model: Restaurant,
          as: "restaurants",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    res.status(201).json(promotionWithRestaurants);
  } catch (error) {
    console.error("Error creating promotion:", error);
    res.status(500).json({ message: "Không thể thêm khuyến mãi" });
  }
});

// Get a specific promotion
router.get("/promotions/:id", authenticateAdmin, async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id, {
      include: [
        {
          model: Restaurant,
          as: "restaurants",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });
    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    }
    res.json(promotion);
  } catch (error) {
    console.error("Error fetching promotion:", error);
    res.status(500).json({ message: "Không thể tải thông tin khuyến mãi" });
  }
});

// Update a promotion
router.put("/promotions/:id", authenticateAdmin, async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      minimumOrderAmount,
      maximumDiscount,
      usageLimit,
      isActive,
      restaurantId,
    } = req.body;

    // Update promotion
    await promotion.update({
      name: code,
      code,
      description,
      discountType: discountType === "percentage" ? "percent" : "fixed",
      discountValue,
      startDate,
      endDate,
      minOrderValue: minimumOrderAmount || 0,
      maxDiscountValue: maximumDiscount || null,
      usageLimit: usageLimit || null,
      isActive,
    });

    // Update restaurant associations
    if (restaurantId) {
      // Associate with specific restaurant
      const restaurant = await Restaurant.findByPk(restaurantId);
      if (restaurant) {
        await promotion.setRestaurants([restaurant]);
      }
    } else {
      // Apply to all restaurants
      const allRestaurants = await Restaurant.findAll({
        where: { status: "active" },
      });

      if (allRestaurants.length > 0) {
        await promotion.setRestaurants(allRestaurants);
      } else {
        // If no active restaurants, clear associations
        await promotion.setRestaurants([]);
      }
    }

    // Fetch the updated promotion with restaurant associations
    const promotionWithRestaurants = await Promotion.findByPk(promotion.id, {
      include: [
        {
          model: Restaurant,
          as: "restaurants",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    res.json(promotionWithRestaurants);
  } catch (error) {
    console.error("Error updating promotion:", error);
    res.status(500).json({ message: "Không thể cập nhật khuyến mãi" });
  }
});

// Toggle promotion status
router.patch("/promotions/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    }

    const { isActive } = req.body;
    await promotion.update({ isActive });

    res.json(promotion);
  } catch (error) {
    console.error("Error toggling promotion status:", error);
    res
      .status(500)
      .json({ message: "Không thể thay đổi trạng thái khuyến mãi" });
  }
});

// Delete a promotion
router.delete("/promotions/:id", authenticateAdmin, async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    }

    await promotion.destroy();
    res.json({ message: "Đã xóa khuyến mãi thành công" });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    res.status(500).json({ message: "Không thể xóa khuyến mãi" });
  }
});

// Payment Management Routes
router.get("/payments", authenticateAdmin, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    // Build query conditions
    const whereConditions = {};
    if (status && status !== "all") {
      whereConditions.status = status;
    }

    // Add date range filter
    if (startDate || endDate) {
      whereConditions.createdAt = {};
      if (startDate) {
        whereConditions.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day for the end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereConditions.createdAt[Op.lte] = endDateTime;
      }
    }

    // Query payments with associations
    const payments = await PaymentInformation.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Reservation,
          as: "reservation",
          include: [
            {
              model: Restaurant,
              as: "restaurant",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Transform data to match frontend expectations
    const formattedPayments = payments.map((payment) => {
      const paymentData = payment.toJSON();
      return {
        id: paymentData.id,
        transactionId:
          paymentData.transactionId ||
          paymentData.id.toString().padStart(6, "0"),
        userName: paymentData.user ? paymentData.user.name : "N/A",
        userEmail: paymentData.user ? paymentData.user.email : "N/A",
        restaurantName:
          paymentData.reservation && paymentData.reservation.restaurant
            ? paymentData.reservation.restaurant.name
            : "N/A",
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        status: paymentData.status,
        paymentDate: paymentData.paymentDate,
        paymentDetails: paymentData.paymentDetails,
        notes: paymentData.notes,
        createdAt: paymentData.createdAt,
        updatedAt: paymentData.updatedAt,
      };
    });

    res.json(formattedPayments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Không thể lấy danh sách thanh toán" });
  }
});

// Get specific payment details
router.get("/payments/:id", authenticateAdmin, async (req, res) => {
  try {
    const payment = await PaymentInformation.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Reservation,
          as: "reservation",
          include: [
            {
              model: Restaurant,
              as: "restaurant",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!payment) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin thanh toán" });
    }

    const paymentData = payment.toJSON();
    const formattedPayment = {
      id: paymentData.id,
      transactionId:
        paymentData.transactionId || paymentData.id.toString().padStart(6, "0"),
      userName: paymentData.user ? paymentData.user.name : "N/A",
      userEmail: paymentData.user ? paymentData.user.email : "N/A",
      restaurantName:
        paymentData.reservation && paymentData.reservation.restaurant
          ? paymentData.reservation.restaurant.name
          : "N/A",
      amount: paymentData.amount,
      currency: paymentData.currency,
      paymentMethod: paymentData.paymentMethod,
      status: paymentData.status,
      paymentDate: paymentData.paymentDate,
      paymentDetails: paymentData.paymentDetails,
      notes: paymentData.notes,
      createdAt: paymentData.createdAt,
      updatedAt: paymentData.updatedAt,
    };

    res.json(formattedPayment);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ message: "Không thể lấy thông tin thanh toán" });
  }
});

// Update payment status
router.patch("/payments/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending", "completed", "failed", "refunded"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    // Find payment
    const payment = await PaymentInformation.findByPk(id);
    if (!payment) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin thanh toán" });
    }

    // Update status
    await payment.update({
      status,
      // If status is completed, update paymentDate
      ...(status === "completed" && !payment.paymentDate
        ? { paymentDate: new Date() }
        : {}),
    });

    res.json({ message: "Đã cập nhật trạng thái thanh toán", payment });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res
      .status(500)
      .json({ message: "Không thể cập nhật trạng thái thanh toán" });
  }
});

module.exports = router;
