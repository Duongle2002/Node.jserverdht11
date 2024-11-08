const express = require('express');
const router = express.Router();
const Data = require('../model/data');

// Khai báo mảng historyData để lưu trữ lịch sử
let historyData = []; // Thêm dòng này

// ESP32 data update (Không yêu cầu authenticateToken)
router.post('/updateData', async (req, res) => {
    const temperature = parseFloat(req.body.temperature);
    const humidity = parseFloat(req.body.humidity);

    // Kiểm tra xem có dữ liệu không
    if (isNaN(temperature) || isNaN(humidity)) {
        return res.status(400).send('Invalid data received');
    }

    // Add data to history with a timestamp
    const timestamp = new Date();
    historyData.push({ temperature, humidity, timestamp }); // Thêm dữ liệu vào history

    // Save data to MongoDB
    const dataEntry = new Data({ temperature, humidity, timestamp });
    try {
        await dataEntry.save();
        console.log('Data saved:', dataEntry);
        res.status(200).send('Data received and saved');
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).send('Failed to save data');
    }

    console.log(`Received data - Temperature: ${temperature}, Humidity: ${humidity}`);
});

module.exports = router;
