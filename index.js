const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/connectDB.cjs');
const authenticateToken = require('./middleware/authenticateToken');
const cookieParser = require('cookie-parser');

const deviceRoutes = require('./routes/device');
const scheduleRoutes = require('./routes/schedule');
const historyRoutes = require('./routes/history');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const app = express();
const PORT = 3000;

// Kết nối tới MongoDB
connectDB();

// Cấu hình view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cookieParser()); // Đảm bảo cookieParser được sử dụng trước khi sử dụng bất kỳ route nào cần xác thực
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware để đặt res.locals.user cho tất cả các view
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/', dataRoutes); // Áp dụng dataRoutes mà không cần xác thực ở đây

// Các route bảo mật
app.use('/', authenticateToken, deviceRoutes); // Bảo vệ các route của device
app.use('/', authenticateToken, scheduleRoutes); // Bảo vệ các route của schedule
app.use('/', authenticateToken, historyRoutes); // Bảo vệ các route của history

// Bảo vệ trang chủ với xác thực
app.get('/', authenticateToken, (req, res) => {
  res.render('index', { temperature: 0, humidity: 0 });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
