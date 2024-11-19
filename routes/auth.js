// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const bcrypt = require('bcrypt');
const authenticateToken = require("../middleware/authenticateToken");

// Render register and login pages
router.get('/register', (req, res) => res.render('auth/register', { title: 'Register' }));
router.get('/login', (req, res) => res.render('auth/login', { title: 'Login' }));

// User registration
router.post('/register', async (req, res) => {
    try {
      // Tạo người dùng mới với email và mật khẩu đã mã hóa
      const user = new User({
        username: req.body.username,
        email: req.body.email,  // Đảm bảo có emai
        password: req.body.password,  // Không cần mã hóa ở đây
      });
  
      // Lưu người dùng vào cơ sở dữ liệu
      await user.save();
  
      // Chuyển hướng đến trang đăng nhập
      res.redirect('/auth/login');
    } catch (error) {  // Make sure to include 'error' here
      if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        const errorMessage = `Tài khoản ${field} đã tồn tại. Vui lòng chọn một tên khác.`;
        res.render('auth/register', { errorMessage });
      } else {
        res.render('auth/register', { errorMessage: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.' });
      }
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      // console.log('Username:', username);
      // console.log('Password:', password);
  
      const user = await User.findOne({ username });
      if (!user) return res.status(400).send('Invalid username or password');
  
      // Kiểm tra mật khẩu
      const isPasswordValid = await user.isValidPassword(password);
      if (!isPasswordValid) {
        // console.log('Password invalid');
        return res.status(400).send('Invalid username or password');
      }
  
      // console.log('Password valid');
      const token = jwt.sign({
        userId: user._id,
        username: user.username,
        email: user.email,
        userDisplayName: user.userDisplayName,
        role: user.role,
        birthday: user.birthday,
        gender: user.gender,
        location: user.location
      }, 'your_jwt_secret', { expiresIn: '1h' });
      // console.log('JWT Token:', token);
  
      // Lưu token vào cookie (hoặc có thể lưu vào session nếu cần)
      res.cookie('auth_token', token, { httpOnly: true, maxAge: 3600000 }); // Cookie sẽ hết hạn sau 1 giờ
  
      // Chuyển hướng đến trang index.ejs
      res.redirect('/');
    } catch (err) {
      // console.error('Login error:', err);
      res.status(500).send('Login error');
    }
});


router.get('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.redirect('/auth/login');
})

// Route đăng ký (API cho Flutter)
router.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kiểm tra nếu người dùng đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại.' });
    }

    // Tạo và lưu người dùng mới
    const hashedPassword = await bcrypt.hash(password, 10); // Mã hóa mật khẩu
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Đăng ký thành công.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.' });
  }
});

// Route đăng nhập (API cho Flutter)
router.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid username or password' });

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid username or password' });

    // Tạo JWT Token
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    // Trả về token trong phản hồi
    res.status(200).json({ message: 'Đăng nhập thành công.', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.' });
  }
});

// Route logout (API cho Flutter)
router.post('/api/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.status(200).json({ message: 'Đăng xuất thành công.' });
});

// User profile update for web (with token verification)
// Handle the profile update (POST request)
router.post('/profile/update', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // The user info from the JWT token
    const { userDisplayName, email, birthday, gender, location } = req.body;

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Update the user's profile details
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      userDisplayName,
      email,
      birthday,
      gender,
      location,
    }, { new: true }); // Return the updated user

    // Redirect to the profile page or show a success message
    res.redirect('/auth/profile'); // Or you can render a confirmation message
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

router.get('/profile/update', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // The user info from the JWT token

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Render the profile update page and pass the current user's data to the template
    res.render('auth/updateProfile', {
      user,
      title: 'Update Profile',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error rendering profile update page' });
  }
});
// API Route for updating user profile (for Flutter app)
router.post('/api/profile/update', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body; // The user's ID should be included in the request body
    const { userDisplayName, email, birthday, gender, location } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the user by ID and update their information
    const updatedUser = await User.findByIdAndUpdate(userId, {
      userDisplayName,
      email,
      birthday,
      gender,
      location,
    }, { new: true }); // Return the updated user

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});


module.exports = router;
