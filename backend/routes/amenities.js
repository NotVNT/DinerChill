const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../middleware/auth");
const { Amenity } = require("../models");

// Public route to get all amenities - this should be accessible without authentication
router.get("/", async (req, res) => {
  try {
    const amenities = await Amenity.findAll({
      order: [["id", "ASC"]],
    });
    res.json(amenities);
  } catch (error) {
    console.error("Error fetching amenities:", error);
    res.status(500).json({ message: "Không thể lấy danh sách tiện ích" });
  }
});

// Keep the existing /public route for compatibility
router.get("/", async (req, res) => {
  try {
    const amenities = await Amenity.findAll({
      order: [["id", "ASC"]],
    });
    res.json(amenities);
  } catch (error) {
    console.error("Error fetching amenities:", error);
    res.status(500).json({ message: "Không thể lấy danh sách tiện ích" });
  }
});

// Admin routes (protected with authentication)
router.get("/admin", authenticateAdmin, async (req, res) => {
  try {
    const amenities = await Amenity.findAll({
      order: [["id", "ASC"]],
    });
    res.json(amenities);
  } catch (error) {
    console.error("Error fetching amenities:", error);
    res.status(500).json({ message: "Không thể lấy danh sách tiện ích" });
  }
});

// Create a new amenity
router.post("/", authenticateAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Tên tiện ích là bắt buộc" });
    }

    // Check if amenity with same name already exists
    const existingAmenity = await Amenity.findOne({ where: { name } });
    if (existingAmenity) {
      return res
        .status(400)
        .json({ message: "Tiện ích với tên này đã tồn tại" });
    }

    // Create new amenity
    const newAmenity = await Amenity.create({ name });
    res.status(201).json(newAmenity);
  } catch (error) {
    console.error("Error creating amenity:", error);
    res.status(500).json({ message: "Không thể tạo tiện ích mới" });
  }
});

// Update an amenity
router.put("/:id", authenticateAdmin, async (req, res) => {
  try {
    const amenityId = req.params.id;
    const { name } = req.body;

    // Find the amenity
    const amenity = await Amenity.findByPk(amenityId);
    if (!amenity) {
      return res.status(404).json({ message: "Không tìm thấy tiện ích" });
    }

    // Check if new name already exists for another amenity
    if (name !== amenity.name) {
      const existingAmenity = await Amenity.findOne({
        where: {
          name,
          id: { [require("sequelize").Op.not]: amenityId },
        },
      });

      if (existingAmenity) {
        return res
          .status(400)
          .json({ message: "Tiện ích với tên này đã tồn tại" });
      }
    }

    // Update the amenity
    await amenity.update({ name });
    res.json(amenity);
  } catch (error) {
    console.error("Error updating amenity:", error);
    res.status(500).json({ message: "Không thể cập nhật tiện ích" });
  }
});

// Delete an amenity
router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const amenityId = req.params.id;

    // Find the amenity
    const amenity = await Amenity.findByPk(amenityId);
    if (!amenity) {
      return res.status(404).json({ message: "Không tìm thấy tiện ích" });
    }

    // Delete the amenity
    await amenity.destroy();
    res.json({ message: "Đã xóa tiện ích thành công" });
  } catch (error) {
    console.error("Error deleting amenity:", error);
    res.status(500).json({ message: "Không thể xóa tiện ích" });
  }
});

module.exports = router;
