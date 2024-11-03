// connectDB.cjs
const mongoose = require('mongoose');

function connectDB() {
  mongoose
    .connect("mongodb+srv://huuduongle2002:Duongmb8602@cluster0.andq2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("Failed to connect to MongoDB:", error));
}

module.exports = connectDB;  // Export with CommonJS syntax


// Duongmb8602
