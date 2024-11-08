// routes/device.js
const express = require('express');
const router = express.Router();
const data = require('../model/data');
const Schedule = require('../model/schedule');
const authenticateToken = require('../middleware/authenticateToken');

let temperature = 0;
let humidity = 0;
let deviceStatus = { DEVICE1: 'OFF', DEVICE2: 'OFF', DEVICE3: 'OFF' };
router.get('/', authenticateToken,  (req, res) => {
    res.render('index',{ temperature, humidity });
  });
// ESP32 data update
router.post('/updateData', async (req, res) => {
    temperature = parseFloat(req.body.temperature);
    humidity = parseFloat(req.body.humidity);
  
    // Lưu dữ liệu vào lịch sử
    const timestamp = new Date();
    historyData.push({ temperature, humidity, timestamp });
  
    const dataEntry = new data({ temperature, humidity, timestamp });
    try {
      await dataEntry.save();
      console.log("Data saved to Mongo:", dataEntry);
    } catch (err) {
      console.error("Error saving data to Mongo:", err);
    }
    console.log(`Received data - Temperature: ${temperature}, Humidity: ${humidity}`);
    res.send('Data received');
  });
  

// Device status API for ESP32
router.get('/getDeviceStatus', authenticateToken,(req, res) => res.json(deviceStatus));

// Control devices from mobile router
router.post('/setDeviceStatus', (req, res) => {
    const { device, status } = req.body;
  
    // Cập nhật trạng thái thiết bị
    if (deviceStatus.hasOwnProperty(device)) {
      deviceStatus[device] = status;
      console.log(`Set ${device} to ${status}`);
      res.send(`Device ${device} set to ${status}`);
    } else {
      res.status(400).send('Invalid device');
    }
  });
  
  router.post('/updateData', (req, res) => {
      temperature = parseFloat(req.body.temperature);
      humidity = parseFloat(req.body.humidity);
    
      const timestamp = new Date();
      historyData.push({ temperature, humidity, timestamp });
    
      console.log(`Received data - Temperature: ${temperature}, Humidity: ${humidity}`);
      res.send('Data received');
    });

module.exports = router;
