// Review functionality has been removed
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(404).json({ message: 'Review functionality has been removed' });
});

module.exports = router; 