const express = require('express');
const router = express.Router();
const Data = require('../model/data');

// Khai báo mảng historyData để lưu trữ lịch sử
let historyData = [];
let deviceStatus = { DEVICE1: 'OFF', DEVICE2: 'OFF', DEVICE3: 'OFF',DEVICE4: 'OFF', DEVICE5: 'OFF', DEVICE6: 'OFF' ,DEVICE7: 'OFF', DEVICE8: 'OFF', DEVICE9: 'OFF', DEVICE10: 'OFF'  };

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
    historyData.push({ temperature, humidity, timestamp });

    // Save data to MongoDB
    const dataEntry = new Data({ temperature, humidity, timestamp });
    try {
        await dataEntry.save();
        // console.log('Data saved:', dataEntry);
        res.status(200).send('Data received and saved');
    } catch (err) {
        // console.error('Error saving data:', err);
        res.status(500).send('Failed to save data');
    }

    // console.log(`Received data - Temperature: ${temperature}, Humidity: ${humidity}`);
});

// API to get device status
router.get('/getDeviceStatus', (req, res) => {
    res.json(deviceStatus);
});

// API to set device status
router.post('/setDeviceStatus', (req, res) => {
    const { device, status } = req.body;

    // Validate device and status
    if (deviceStatus.hasOwnProperty(device) && (status === 'ON' || status === 'OFF')) {
        deviceStatus[device] = status;
        // console.log(`Set ${device} to ${status}`);
        res.send(`Device ${device} set to ${status}`);
    } else {
        res.status(400).send('Invalid device or status');
    }
});
router.get('/api/sensorData', async (req, res) => {
    try {
        const  latestData = await Data.findOne().sort({ timestamp: -1 });
        if (latestData) {
            const { temperature, humidity } = latestData;
            res.json( { temperature, humidity });
        }else {
            res.json({ temperature: 'N/A', humidity: 'N/A' });
        }
    }catch (error) {
        res.status(500).send('Lỗi khi lấy dữ liệu')
    }
})



module.exports = router;
