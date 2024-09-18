const express = require('express');
const {
  login,
  register,
  verifyCode,
} = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/verify', verifyCode);

module.exports = router;
