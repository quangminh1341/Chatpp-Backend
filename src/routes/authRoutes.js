const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Định nghĩa route cho việc đăng ký
// POST /api/auth/register
router.post('/register', authController.register);

// Định nghĩa route cho việc đăng nhập
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
