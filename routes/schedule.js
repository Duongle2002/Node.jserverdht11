// routes/schedule.js
const express = require('express');
const router = express.Router();
const Schedule = require('../model/schedule');
const authenticateToken = require('../middleware/authenticateToken');

// Create new device schedule
router.post('/scheduleDevice', async (req, res) => {
  const { device, action, scheduleTime } = req.body;
  try {
    const scheduleEntry = new Schedule({ device, action, scheduleTime });
    await scheduleEntry.save();
    res.json({ message: `Scheduled ${device} to ${action} at ${scheduleTime}` });
  } catch (err) {
    res.status(500).send('Error scheduling device');
  }
});

// View scheduled tasks
router.get('/schedule',authenticateToken, async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.render('schedule', { schedules });
  } catch (err) {
    res.status(500).send('Error retrieving schedules');
  }
});

module.exports = router;
