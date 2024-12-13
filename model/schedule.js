const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  device: { type: String, required: true },
  action: { type: String, enum: ['ON', 'OFF'], required: true },
  scheduleTime: { type: Date, required: true }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
