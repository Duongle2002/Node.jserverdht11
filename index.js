const express = require('express');
const Schedule = require('./model/schedule');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;
const connectDB  = require('./config/connectDB.cjs');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const data = require('./model/data'); 
connectDB();
// Dữ liệu giả lập
let temperature = 0;
let humidity = 0;
let deviceStatus = {
  DEVICE1: 'OFF',
  DEVICE2: 'OFF',
  DEVICE3: 'OFF',
};

// Lịch sử nhiệt độ và độ ẩm
const historyData = [];

// Sử dụng bodyParser để phân tích dữ liệu POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API để ESP32 gửi dữ liệu nhiệt độ và độ ẩm
app.post('/updateData', async (req, res) => {
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

// API để lấy trạng thái thiết bị cho ESP32
app.get('/getDeviceStatus', (req, res) => {
  res.json(deviceStatus);
});

// API để điều khiển thiết bị từ ứng dụng di động
app.post('/setDeviceStatus', (req, res) => {
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

app.post('/updateData', (req, res) => {
    temperature = parseFloat(req.body.temperature);
    humidity = parseFloat(req.body.humidity);
  
    const timestamp = new Date();
    historyData.push({ temperature, humidity, timestamp });
  
    console.log(`Received data - Temperature: ${temperature}, Humidity: ${humidity}`);
    res.send('Data received');
  });

// API để lấy lịch sử nhiệt độ và độ ẩm
app.get('/history', async (req, res) => {
    try {
      const historyData = await data.find().sort({ timestamp: -1 }); // Lấy tất cả dữ liệu từ MongoDB, sắp xếp theo timestamp giảm dần
      res.render('history', { historyData }); // Truyền historyData vào view
    } catch (err) {
      console.error("Error retrieving history data:", err);
      res.status(500).send("Error retrieving history data");
    }
  });

app.get('/api/history', (req, res) => {
  res.json(historyData);
})
app.get('/',  (req, res) => {
    res.render('index',{ temperature, humidity });
  });

app.post('/scheduleDevice', async (req, res) => {
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
      await Schedule.deleteMany({ scheduleTime: { $lte: currentTime } });
    } catch (err) {
      console.error("Error executing scheduled tasks:", err);
    }
  }, 60000); // Chạy mỗi phút
  // Route để xem danh sách lịch hẹn và tạo lịch hẹn mới
app.get('/schedule', async (req, res) => {
    try {
      const schedules = await Schedule.find(); // Lấy danh sách lịch hẹn từ database
      res.render('schedule', { schedules }); // Truyền danh sách lịch hẹn vào giao diện
    } catch (err) {
      console.error("Lỗi khi lấy lịch hẹn:", err);
      res.status(500).send("Lỗi khi lấy lịch hẹn");
    }
  });
  
  // Route để tạo lịch hẹn mới từ biểu mẫu
  app.post('/scheduleDevice', async (req, res) => {
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
// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
