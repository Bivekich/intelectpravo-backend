const express = require("express");
const {
  login,
  loginByPass,
  register,
  verifyCode,
  logout,
  checkSession,
  resendCode,
} = require("../controllers/authController");
const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/resendCode", resendCode);
router.post("/checkSession", checkSession);
router.post("/loginByPass", loginByPass);
router.post("/register", register);
router.post("/verify", verifyCode);

module.exports = router;
