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


router.post('/scheduleDevice', async (req, res) => {
  const { device, action, scheduleTime } = req.body;

  try {
    const scheduleEntry = new Schedule({ device, action, scheduleTime });
    await scheduleEntry.save();
    console.log("Scheduled device:", scheduleEntry);
    res.json({ message: `Scheduled ${device} to ${action} at ${scheduleTime}` });
  } catch (err) {
    console.error("Error scheduling device:", err);
    res.status(500).json({ message: "Error scheduling device" });
  }
});


setInterval(async () => {
  const currentTime = new Date();

  try {
    const schedules = await Schedule.find({ scheduleTime: { $lte: currentTime } });

    for (const schedule of schedules) {
      if (deviceStatus.hasOwnProperty(schedule.device)) {
        deviceStatus[schedule.device] = schedule.action;
        console.log(`Device ${schedule.device} set to ${schedule.action} as per schedule`);

        // Remove the executed schedule
        await Schedule.deleteOne({ _id: schedule._id });
      } else {
        console.warn(`Unknown device: ${schedule.device}`);
      }
    }
  } catch (err) {
    console.error("Error executing scheduled tasks:", err);
  }
}, 60000);

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
