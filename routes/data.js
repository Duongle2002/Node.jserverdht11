const express = require('express');
const router = express.Router();
const Data = require('../model/data');
const Schedule = require("../model/schedule");

// Mảng lưu trạng thái thiết bị và lịch sử
let historyData = [];
let deviceStatus = {
    DEVICE1: 'OFF', DEVICE2: 'OFF', DEVICE3: 'OFF', DEVICE4: 'OFF',
    DEVICE5: 'OFF', DEVICE6: 'OFF', DEVICE7: 'OFF', DEVICE8: 'OFF',
    DEVICE9: 'OFF', DEVICE10: 'OFF'
};

// ----------------------------- API cho ESP32 -----------------------------

// Nhận dữ liệu từ ESP32
router.post('/updateData', async (req, res) => {
    const { temperature, humidity } = req.body;

    if (isNaN(temperature) || isNaN(humidity)) {
        return res.status(400).send('Invalid data received');
    }

    const timestamp = new Date();
    historyData.push({ temperature, humidity, timestamp });

    const dataEntry = new Data({ temperature, humidity, timestamp });
    try {
        await dataEntry.save();
        res.status(200).send('Data received and saved');
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).send('Failed to save data');
    }
});

// Trả về trạng thái thiết bị
router.get('/getDeviceStatus', (req, res) => {
    res.json(deviceStatus);
});

// Cập nhật trạng thái thiết bị
router.post('/setDeviceStatus', (req, res) => {
    const { device, status } = req.body;

    if (deviceStatus.hasOwnProperty(device) && (status === 'ON' || status === 'OFF')) {
        deviceStatus[device] = status;
        res.send(`Device ${device} set to ${status}`);
    } else {
        res.status(400).send('Invalid device or status');
    }
});

// Lấy dữ liệu cảm biến mới nhất
router.get('/api/sensorData', async (req, res) => {
    try {
        const latestData = await Data.findOne().sort({ timestamp: -1 });
        if (latestData) {
            const { temperature, humidity } = latestData;
            res.json({ temperature, humidity });
        } else {
            res.json({ temperature: 'N/A', humidity: 'N/A' });
        }
    } catch (error) {
        console.error("Error fetching sensor data:", error);
        res.status(500).send('Error fetching sensor data');
    }
});

// Lấy lịch sử dữ liệu
router.get('/api/history', async (req, res) => {
    try {
        const historyData = await Data.find().sort({ timestamp: -1 });
        res.json(historyData);
    } catch (err) {
        console.error("Error retrieving history data:", err);
        res.status(500).send("Error retrieving history data");
    }
});

// ----------------------------- API Lịch Hẹn -----------------------------

// Tạo lịch hẹn cho thiết bị
router.post('/scheduleDevice', async (req, res) => {
    const { device, action, scheduleTime } = req.body;

    if (!device || !action || !scheduleTime) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const scheduleEntry = new Schedule({ device, action, scheduleTime });
        await scheduleEntry.save();
        console.log("Scheduled device:", scheduleEntry);
        res.json({ message: `Scheduled ${device} to ${action} at ${scheduleTime}` });
    } catch (err) {
        console.error("Error creating schedule:", err);
        res.status(500).json({ message: "Error creating schedule" });
    }
});

// Lấy danh sách lịch hẹn
router.get('/schedules', async (req, res) => {
    try {
        const schedules = await Schedule.find();
        res.json(schedules);
    } catch (err) {
        console.error("Error retrieving schedules:", err);
        res.status(500).send("Error retrieving schedules");
    }
});
router.get('/schedule', async (req, res) => {
    try {
        const schedules = await Schedule.find(); // Lấy danh sách lịch hẹn từ database
        res.render('schedule', { schedules }); // Truyền danh sách lịch hẹn vào giao diện
    } catch (err) {
        console.error("Lỗi khi lấy lịch hẹn:", err);
        res.status(500).send("Lỗi khi lấy lịch hẹn");
    }
});

// ----------------------------- Xử lý tự động thiết bị -----------------------------

// Xử lý thiết bị theo lịch hẹn mỗi 30 giây
setInterval(async () => {
    const currentTime = new Date();
    try {
        const schedules = await Schedule.find({ scheduleTime: { $lte: currentTime } });
        for (const schedule of schedules) {
            if (deviceStatus.hasOwnProperty(schedule.device)) {
                deviceStatus[schedule.device] = schedule.action;
                console.log(`Device ${schedule.device} set to ${schedule.action}`);
            }
        }
        // Xóa lịch hẹn đã thực thi
        await Schedule.deleteMany({ scheduleTime: { $lte: currentTime } });
    } catch (error) {
        console.error("Error processing schedules:", error);
    }
}, 30000);

module.exports = router;
