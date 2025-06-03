const express = require("express");
const router = express.Router();
const db = require("../models");
const { authenticate } = require("../middleware/auth");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { Op } = require("sequelize");

// Helper function to normalize path for web URLs
function normalizeFilePath(filePath) {
  // Convert Windows backslashes to forward slashes for web URLs
  return filePath.replace(/\\/g, "/");
}

// Setup storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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

// Create upload middleware for handling multipart form data
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
});

// Get all restaurants
router.get("/", async (req, res) => {
  try {
    const { amenityId } = req.query;
    
    let queryOptions = {
      include: [
        {
          model: db.RestaurantImage,
          as: "images",
        },
        {
          model: db.Amenity,
          as: "amenities",
          through: { attributes: [] },
        },
        {
          model: db.Category,
          as: "categories",
          through: { attributes: [] },
        },
      ],
    };
    
    // Filter by amenity if provided
    if (amenityId) {
      // Add a where condition to only include restaurants with the specified amenity
      queryOptions = {
        ...queryOptions,
        include: [
          {
            model: db.RestaurantImage,
            as: "images",
          },
          {
            model: db.Amenity,
            as: "amenities",
            through: { attributes: [] },
            where: { id: amenityId }
          },
          {
            model: db.Category,
            as: "categories",
            through: { attributes: [] },
          },
        ],
      };
    }

    const restaurants = await db.Restaurant.findAll(queryOptions);

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
    console.error("Error fetching restaurants:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch restaurants", error: error.message });
  }
});

// Get a specific restaurant
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await db.Restaurant.findByPk(req.params.id, {
      include: [
        {
          model: db.RestaurantImage,
          as: "images",
        },
        {
          model: db.Promotion,
          as: "promotions",
          attributes: [
            "id",
            "name",
            "description",
            "discountType",
            "discountValue",
            "code",
            "startDate",
            "endDate",
            "isActive",
            "minOrderValue",
            "maxDiscountValue",
          ],
          through: { attributes: [] },
          where: {
            isActive: true,
            endDate: {
              [Op.gte]: new Date(),
            },
          },
          required: false,
        },
        {
          model: db.Amenity,
          as: "amenities",
          through: { attributes: [] },
        },
        {
          model: db.Category,
          as: "categories",
          through: { attributes: [] },
        },
      ],
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Normalize paths for web URLs
    if (restaurant.images && restaurant.images.length > 0) {
      for (const image of restaurant.images) {
        if (image.image_path) {
          image.image_path = normalizeFilePath(image.image_path);
        }
      }
    }

    res.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch restaurant", error: error.message });
  }
});

// Create a new restaurant with image upload
router.post("/", authenticate, upload.single("image"), async (req, res) => {
  try {
    const { name, address, description } = req.body;
    let amenityIds = [];

    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({
        message: "Name and address are required fields",
      });
    }

    // Parse amenityIds if provided
    if (req.body.amenityIds) {
      try {
        amenityIds = JSON.parse(req.body.amenityIds);
      } catch (parseError) {
        console.error("Failed to parse amenityIds:", parseError);
      }
    }

    // Create the restaurant
    const restaurant = await db.Restaurant.create({
      name,
      address,
      description,
      owner_id: req.user.id,
    });

    // Save image to database if file was provided
    if (req.file) {
      try {
        const imagePath = normalizeFilePath(req.file.path);
        // Store image information in restaurant_image table
        await db.RestaurantImage.create({
          restaurant_id: restaurant.id,
          image_path: imagePath,
        });
      } catch (imageError) {
        console.error("Failed to save image information:", imageError);
        return res.status(500).json({
          message: "Failed to save image information",
          error: imageError.message,
        });
      }
    }

    // Associate amenities if any were provided
    if (amenityIds && amenityIds.length > 0) {
      try {
        await restaurant.setAmenities(amenityIds);
      } catch (amenityError) {
        console.error("Failed to associate amenities:", amenityError);
        // Continue with the response as this is not a critical error
      }
    }

    res.status(201).json(restaurant);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res
      .status(500)
      .json({ message: "Failed to create restaurant", error: error.message });
  }
});

// Update restaurant
router.put("/:id", authenticate, upload.single("image"), async (req, res) => {
  try {
    const { name, address, description } = req.body;
    let amenityIds = [];
    
    const restaurant = await db.Restaurant.findByPk(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Parse amenityIds if provided
    if (req.body.amenityIds) {
      try {
        amenityIds = JSON.parse(req.body.amenityIds);
      } catch (parseError) {
        console.error("Failed to parse amenityIds:", parseError);
      }
    }

    // Handle image update if provided
    if (req.file) {
      try {
        // Find existing restaurant image
        const existingImage = await db.RestaurantImage.findOne({
          where: { restaurant_id: restaurant.id },
        });

        // If there's an existing image, delete the file and update the record
        if (existingImage) {
          // Delete the old file if it exists
          if (fs.existsSync(existingImage.image_path)) {
            fs.unlinkSync(existingImage.image_path);
          }

          // Update the existing image record
          await existingImage.update({
            image_path: normalizeFilePath(req.file.path),
          });
        } else {
          // Create a new image record
          await db.RestaurantImage.create({
            restaurant_id: restaurant.id,
            image_path: normalizeFilePath(req.file.path),
          });
        }
      } catch (imageError) {
        console.error("Failed to update image:", imageError);
        return res.status(500).json({
          message: "Failed to update image",
          error: imageError.message,
        });
      }
    }

    // Update other fields
    if (name) restaurant.name = name;
    if (address) restaurant.address = address;
    if (description !== undefined) restaurant.description = description;

    await restaurant.save();

    // Update amenities if provided
    if (amenityIds && Array.isArray(amenityIds)) {
      try {
        await restaurant.setAmenities(amenityIds);
      } catch (amenityError) {
        console.error("Failed to update amenities:", amenityError);
        // Continue with the response as this is not a critical error
      }
    }

    // Fetch the updated restaurant with all associations
    const updatedRestaurant = await db.Restaurant.findByPk(restaurant.id, {
      include: [
        {
          model: db.RestaurantImage,
          as: "images",
        },
        {
          model: db.Amenity,
          as: "amenities",
          through: { attributes: [] },
        },
        {
          model: db.Category,
          as: "categories",
          through: { attributes: [] },
        },
      ],
    });

    res.json(updatedRestaurant);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res
      .status(500)
      .json({ message: "Failed to update restaurant", error: error.message });
  }
});

// Delete restaurant
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const restaurant = await db.Restaurant.findByPk(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Find and delete associated image
    const image = await db.RestaurantImage.findOne({
      where: { restaurant_id: restaurant.id },
    });

    if (image) {
      // Delete the physical file
      if (fs.existsSync(image.image_path)) {
        fs.unlinkSync(image.image_path);
      }

      // Delete the database record
      await image.destroy();
    }

    // Delete associated amenities (junction table entries will be automatically removed)
    await restaurant.setAmenities([]);
    
    // Delete the restaurant
    await restaurant.destroy();
    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    res
      .status(500)
      .json({ message: "Failed to delete restaurant", error: error.message });
  }
});

module.exports = router;
