const express = require('express');
const router = express.Router();
const Data = require('../model/data');

// ESP32 data update (Không yêu cầu authenticateToken)
router.post('/', async (req, res) => {
    const temperature = parseFloat(req.body.temperature);
    const humidity = parseFloat(req.body.humidity);

    // Kiểm tra xem có dữ liệu không
    if (isNaN(temperature) || isNaN(humidity)) {
        return res.status(400).send('Invalid data received');
    }

    // Add data to history with a timestamp
    const timestamp = new Date();
    historyData.push({ temperature, humidity, timestamp });

    // Save data to MongoDB
    const dataEntry = new Data({ temperature, humidity, timestamp });
    try {
        await dataEntry.save();
        console.log("Data saved to Mongo:", dataEntry);
        res.status(200).send('Data received and saved');
    } catch (err) {
        console.error("Error saving data to Mongo:", err);
        res.status(500).send('Failed to save data');
    }

    console.log(`Received data - Temperature: ${temperature}, Humidity: ${humidity}`);
});
router.get('/hi' , async (req, res) => {
    console.log("hi")
    res.status(200).send('Data received');
})
module.exports = router;
