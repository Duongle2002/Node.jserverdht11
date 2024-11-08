const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token || req.headers['authorization']?.split(' ')[1];

  if (!token) return res.redirect('/auth/login');

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.redirect('/auth/login');
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
