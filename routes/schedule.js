// routes/schedule.js
const express = require('express');
const router = express.Router();
const Schedule = require('../model/schedule');
const authenticateToken = require('../middleware/authenticateToken');

// Assuming deviceStatus is a globally declared object or stored in memory/database
let deviceStatus = { DEVICE1: 'OFF', DEVICE2: 'OFF', DEVICE3: 'OFF' };

// Create new device schedule
router.post('/scheduleDevice', async (req, res) => {
  const { device, action, scheduleTime } = req.body;
  try {
    const scheduleEntry = new Schedule({ device, action, scheduleTime });
    await scheduleEntry.save();
    res.json({ message: `Scheduled ${device} to ${action} at ${scheduleTime}` });
  } catch (err) {
    // console.error("Error scheduling device:", err);
    res.status(500).send('Error scheduling device');
  }
});

// Periodically check and apply scheduled tasks
setInterval(async () => {
  const currentTime = new Date();

  try {
    const schedules = await Schedule.find({ scheduleTime: { $lte: currentTime } });

    // Execute the schedules and update deviceStatus
    schedules.forEach(async schedule => {
      if (deviceStatus.hasOwnProperty(schedule.device)) {
        deviceStatus[schedule.device] = schedule.action;
        // console.log(`Device ${schedule.device} set to ${schedule.action} as per schedule`);

        // Optionally remove the executed schedule from the database
        await Schedule.deleteOne({ _id: schedule._id });
      }
    });
  } catch (err) {
    // console.error("Error executing scheduled tasks:", err);
  }
}, 60000);  // Check every 60 seconds

// View scheduled tasks
router.get('/schedule', authenticateToken, async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.render('schedule', { schedules });
  } catch (err) {
    // console.error("Error retrieving schedules:", err);
    res.status(500).send('Error retrieving schedules');
  }
});

module.exports = router;
