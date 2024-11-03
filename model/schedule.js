const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  device: String,
  action: String, // "ON" hoặc "OFF"
  scheduleTime: Date // Thời gian bật hoặc tắt thiết bị
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
