const express = require('express');
const router = express.Router();
const data = require('../model/data');
const authenticateToken = require('../middleware/authenticateToken');

// Route render history page
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const historyData = await data.find().sort({ timestamp: -1 }); // Lấy tất cả dữ liệu từ MongoDB, sắp xếp theo timestamp giảm dần
    res.render('history', { historyData }); // Truyền historyData vào view
  } catch (err) {
    console.error("Error retrieving history data:", err);
    res.status(500).send("Error retrieving history data");
  }
});

// API route to get history data as JSON
router.get('/api/history', authenticateToken, async (req, res) => {
  try {
    const historyData = await data.find().sort({ timestamp: -1 }); // Sắp xếp dữ liệu theo timestamp giảm dần
    res.json(historyData); // Trả về dữ liệu dưới dạng JSON
  } catch (err) {
    console.error("Error retrieving history data:", err);
    res.status(500).send("Error retrieving history data");
  }
});

module.exports = router; // Đảm bảo bạn export router
