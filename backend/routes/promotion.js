const express = require("express");
const router = express.Router();
const { Promotion, Restaurant } = require("../models");

// Get all promotions
router.get("/", async (req, res) => {
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
    });
    res.json(promotions);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get promotion by ID
router.get("/:id", async (req, res) => {
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
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.json(promotion);
  } catch (error) {
    console.error("Error fetching promotion:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
