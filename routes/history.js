const express = require('express');
const router = express.Router();
const data = require('../model/data');
const authenticateToken = require('../middleware/authenticateToken');
const Data = require("../model/data");

// Route render history page
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const historyData = await data.find().sort({ timestamp: -1 }); // Lấy tất cả dữ liệu từ MongoDB, sắp xếp theo timestamp giảm dần
    res.render('history', { historyData }); // Truyền historyData vào view
  } catch (err) {
    // console.error("Error retrieving history data:", err);
    res.status(500).send("Error retrieving history data");
  }
});


router.get('/api',  async (req, res) => {
  try {
    // Tìm dữ liệu mới nhất trong cơ sở dữ liệu
    const latestData = await Data.findOne().sort({ timestamp: -1 });

    // Kiểm tra xem có dữ liệu hay không
    if (latestData) {
      const { temperature, humidity } = latestData;
      res.json( { temperature, humidity });
    } else {
      // Nếu không có dữ liệu, đặt giá trị mặc định
      res.json({ temperature: 'N/A', humidity: 'N/A' });
    }
  } catch (error) {
    // console.error('Lỗi khi lấy dữ liệu từ cơ sở dữ liệu:', error);
    res.status(500).send('Lỗi khi lấy dữ liệu');
  }
});


module.exports = router; // Đảm bảo bạn export router
