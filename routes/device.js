const express = require('express');
const router = express.Router();
const Data = require('../model/data'); // Model chứa dữ liệu
const authenticateToken = require('../middleware/authenticateToken');

// Route chính để hiển thị index với nhiệt độ và độ ẩm
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Tìm dữ liệu mới nhất trong cơ sở dữ liệu
        const latestData = await Data.findOne().sort({ timestamp: -1 });

        // Kiểm tra xem có dữ liệu hay không
        if (latestData) {
            const { temperature, humidity } = latestData;
            res.render('index', { temperature, humidity });
        } else {
            // Nếu không có dữ liệu, đặt giá trị mặc định
            res.render('index', { temperature: 'N/A', humidity: 'N/A' });
        }
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ cơ sở dữ liệu:', error);
        res.status(500).send('Lỗi khi lấy dữ liệu');
    }
});

module.exports = router;
