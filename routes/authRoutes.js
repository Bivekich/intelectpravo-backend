const express = require("express");
const {
  login,
  loginByPass,
  register,
  verifyCode,
} = require("../controllers/authController");
const router = express.Router();

router.post("/login", login);
router.post("/loginByPass", loginByPass);
router.post("/register", register);
router.post("/verify", verifyCode);

module.exports = router;
