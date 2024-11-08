const express = require('express');
const router = express.Router();
const Data = require('../model/data');
const authenticateToken = require('../middleware/authenticateToken');

let temperature = 0;
let humidity = 0;

// Main route to render index with temperature and humidity
router.get('/', authenticateToken, (req, res) => {
    res.render('index', { temperature, humidity });
});


module.exports = router;
