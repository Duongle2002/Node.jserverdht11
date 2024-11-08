// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const bcrypt = require('bcrypt');

// Render register and login pages
router.get('/register', (req, res) => res.render('auth/register', { title: 'Register' }));
router.get('/login', (req, res) => res.render('auth/login', { title: 'Login' }));

// User registration
router.post('/register', async (req, res) => {
    try {
      // Tạo người dùng mới với email và mật khẩu đã mã hóa
      const user = new User({
        username: req.body.username,
        email: req.body.email,  // Đảm bảo có email
        password: req.body.password,  // Không cần mã hóa ở đây
      });
  
      // Lưu người dùng vào cơ sở dữ liệu
      await user.save();
  
      // Chuyển hướng đến trang đăng nhập
      res.redirect('/auth/login');
    } catch (err) {
      console.error('Chi tiết lỗi khi đăng ký tài khoản:', err.message);
      res.status(500).send('Lỗi khi đăng ký tài khoản.');
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log('Username:', username);
      console.log('Password:', password);
  
      const user = await User.findOne({ username });
      if (!user) return res.status(400).send('Invalid username or password');
  
      // Kiểm tra mật khẩu
      const isPasswordValid = await user.isValidPassword(password);
      if (!isPasswordValid) {
        console.log('Password invalid');
        return res.status(400).send('Invalid username or password');
      }
  
      console.log('Password valid');
      const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
      console.log('JWT Token:', token);
  
      // Lưu token vào cookie (hoặc có thể lưu vào session nếu cần)
      res.cookie('auth_token', token, { httpOnly: true, maxAge: 3600000 }); // Cookie sẽ hết hạn sau 1 giờ
  
      // Chuyển hướng đến trang index.ejs
      res.redirect('/');
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).send('Login error');
    }
});

module.exports = router;
