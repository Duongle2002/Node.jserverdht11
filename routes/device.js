const express = require('express');
const router = express.Router();
const Data = require('../model/data');
const authenticateToken = require('../middleware/authenticateToken');

let temperature = 0;
let humidity = 0;
let deviceStatus = { DEVICE1: 'OFF', DEVICE2: 'OFF', DEVICE3: 'OFF' };

// Main route to render index with temperature and humidity
router.get('/', authenticateToken, (req, res) => {
    res.render('index', { temperature, humidity });
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
