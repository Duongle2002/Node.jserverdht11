// models/Data.js
const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('data', dataSchema);
