const express = require('express');
const router = express.Router();
const Schedule = require('../model/schedule');
const authenticateToken = require('../middleware/authenticateToken');

let deviceStatus = {
  DEVICE1: 'OFF', DEVICE2: 'OFF', DEVICE3: 'OFF',
  DEVICE4: 'OFF', DEVICE5: 'OFF', DEVICE6: 'OFF',
  DEVICE7: 'OFF', DEVICE8: 'OFF', DEVICE9: 'OFF',
  DEVICE10: 'OFF'
};



router.get('/schedule', authenticateToken, async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.render('schedule', { schedules });
  } catch (err) {
    console.error("Error retrieving schedules:", err);
    res.status(500).send("Error retrieving schedules");
  }
});

module.exports = router;
