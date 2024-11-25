// routes/schedule.js
const express = require('express');
const router = express.Router();
const Schedule = require('../model/schedule');
const authenticateToken = require('../middleware/authenticateToken');

// Assuming deviceStatus is a globally declared object or stored in memory/database
let deviceStatus = { DEVICE1: 'OFF', DEVICE2: 'OFF', DEVICE3: 'OFF',DEVICE4: 'OFF', DEVICE5: 'OFF', DEVICE6: 'OFF' ,DEVICE7: 'OFF', DEVICE8: 'OFF', DEVICE9: 'OFF', DEVICE10: 'OFF'  };


// // Create new device schedule
// router.post('/scheduleDevice', async (req, res) => {
//   const { device, action, scheduleTime } = req.body;
//   try {
//     const scheduleEntry = new Schedule({ device, action, scheduleTime });
//     await scheduleEntry.save();
//     res.json({ message: `Scheduled ${device} to ${action} at ${scheduleTime}` });
//   } catch (err) {
//     // console.error("Error scheduling device:", err);
//     res.status(500).send('Error scheduling device');
//   }
// });
//
// // Periodically check and apply scheduled tasks
// setInterval(async () => {
//   const currentTime = new Date();
//
//   try {
//     const schedules = await Schedule.find({ scheduleTime: { $lte: currentTime } });
//
//     // Execute the schedules and update deviceStatus
//     schedules.forEach(async schedule => {
//       if (!deviceStatus.hasOwnProperty(schedule.device)) {
//         return;
//       }
//       deviceStatus[schedule.device] = schedule.action;
//       await Schedule.deleteOne({_id: schedule._id});
//     });
//   } catch (err) {
//     // console.error("Error executing scheduled tasks:", err);
//   }
// }, 60000);  // Check every 60 seconds
//
// // View scheduled tasks
// router.get('/schedule', authenticateToken, async (req, res) => {
//   try {
//     const schedules = await Schedule.find();
//     res.render('schedule', { schedules });
//   } catch (err) {
//     // console.error("Error retrieving schedules:", err);
//     res.status(500).send('Error retrieving schedules');
//   }
// });




router.post('/scheduleDevice', async (req, res) => {
  const { device, action, scheduleTime } = req.body;

  try {
    const scheduleEntry = new Schedule({ device, action, scheduleTime });
    await scheduleEntry.save();
    console.log("Scheduled device:", scheduleEntry);
    res.send(`Scheduled ${device} to ${action} at ${scheduleTime}`);
  } catch (err) {
    console.error("Error scheduling device:", err);
    res.status(500).send("Error scheduling device");
  }
});
setInterval(async () => {
  const currentTime = new Date();

  try {
    const schedules = await Schedule.find({ scheduleTime: { $lte: currentTime } });

    schedules.forEach(schedule => {
      if (deviceStatus.hasOwnProperty(schedule.device)) {
        deviceStatus[schedule.device] = schedule.action;
        console.log(`Device ${schedule.device} set to ${schedule.action} as per schedule`);
      }
    });

    // Xóa các lịch hẹn đã thực hiện xong
    // await Schedule.deleteMany({ scheduleTime: { $lte: currentTime } });
  } catch (err) {
    console.error("Error executing scheduled tasks:", err);
  }
}, 60000); // Chạy mỗi phút
// Route để xem danh sách lịch hẹn và tạo lịch hẹn mới
router.get('/schedule', async (req, res) => {
  try {
    const schedules = await Schedule.find(); // Lấy danh sách lịch hẹn từ database
    res.render('schedule', { schedules }); // Truyền danh sách lịch hẹn vào giao diện
  } catch (err) {
    console.error("Lỗi khi lấy lịch hẹn:", err);
    res.status(500).send("Lỗi khi lấy lịch hẹn");
  }
});

// Route để tạo lịch hẹn mới từ biểu mẫu
router.post('/scheduleDevice', async (req, res) => {
  const { device, action, scheduleTime } = req.body;

  try {
    const scheduleEntry = new Schedule({ device, action, scheduleTime });
    await scheduleEntry.save();
    console.log("Scheduled device:", scheduleEntry);

    // Trả về thông điệp thành công
    res.json({ message: `Scheduled ${device} to ${action} at ${scheduleTime}` });
  } catch (err) {
    console.error("Lỗi khi tạo lịch hẹn:", err);
    res.status(500).json({ message: "Lỗi khi tạo lịch hẹn" }); // Trả về thông điệp lỗi
  }
});



module.exports = router;
