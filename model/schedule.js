const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  device: String,
  action: String, // "ON" hoặc "OFF"
  scheduleTime: Date, // Thời gian bật hoặc tắt thiết bị
  name: String,
  bgColor: String,
  subTitle: String,
  icon: String,
  isSwitch: Boolean,
  isIcon: Boolean,

});

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
