const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/connectDB.cjs');
const authenticateToken = require('./middleware/authenticateToken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

// Connect to MongoDB
connectDB();

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware để đặt res.locals.user cho tất cả các view
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
app.use(cookieParser());
const deviceRoutes = require('./routes/device');
const scheduleRoutes = require('./routes/schedule');
const historyRoutes = require('./routes/history');
// Routes
app.use('/auth', authRoutes);
app.use('/device', authenticateToken, deviceRoutes); // Protect device routes
app.use('/schedule', authenticateToken, scheduleRoutes); // Protect schedule routes
app.use('/history',authenticateToken, historyRoutes);
// Protect homepage with authentication
app.get('/', authenticateToken, (req, res) => {
  res.render('index', { temperature: 0, humidity: 0 });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
