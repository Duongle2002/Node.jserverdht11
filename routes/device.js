const express = require('express');
const router = express.Router();
const Data = require('../model/data');
const authenticateToken = require('../middleware/authenticateToken');

let temperature = 0;
let humidity = 0;
let deviceStatus = { DEVICE1: 'OFF', DEVICE2: 'OFF', DEVICE3: 'OFF' };
let historyData = []; // Initialize historyData array

// Main route to render index with temperature and humidity
router.get('/', authenticateToken, (req, res) => {
    res.render('index', { temperature, humidity });
});

// ESP32 data update
router.post('/updateData', async (req, res) => {
    temperature = parseFloat(req.body.temperature);
    humidity = parseFloat(req.body.humidity);

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

// Device status API for ESP32 (with authentication)
router.get('/getDeviceStatus', authenticateToken, (req, res) => {
    res.json(deviceStatus);
});

// Control devices from mobile router (with authentication)
router.post('/setDeviceStatus', authenticateToken, (req, res) => {
    const { device, status } = req.body;

    // Validate device and status
    if (deviceStatus.hasOwnProperty(device) && (status === 'ON' || status === 'OFF')) {
        deviceStatus[device] = status;
        console.log(`Set ${device} to ${status}`);
        res.send(`Device ${device} set to ${status}`);
    } else {
        res.status(400).send('Invalid device or status');
    }
});

module.exports = router;
