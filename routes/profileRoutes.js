const express = require("express");
const {
  getBasicProfile,
  updateProfile,
  uploadDocumentPhoto,
  confirmProfile,
  addBankDetails,
  getBankDetails,
  changePassword,
  verifyAction,
  checkVerifyAction,
  getNotConfirmedFilledUsers,
  disConfirmProfile,
  addAdmin,
  removeAdmin,
  submitProfileToConfirm,
} = require("../controllers/profileController");
const authenticateToken = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.get("/basic", authenticateToken, getBasicProfile);
router.post("/update", authenticateToken, updateProfile);
router.post(
  "/upload-photo",
  authenticateToken,
  upload.single("documentPhoto"),
  uploadDocumentPhoto
);
router.post("/confirm", authenticateToken, confirmProfile);
router.post("/disconfirm", authenticateToken, disConfirmProfile);
router.post("/bank-details", authenticateToken, addBankDetails);
router.get("/bank-details", authenticateToken, getBankDetails);
router.post("/change-password", authenticateToken, changePassword);
router.post("/verify-action", authenticateToken, verifyAction);
router.post("/check-verify", authenticateToken, checkVerifyAction);
router.post("/addAdmin", authenticateToken, addAdmin);
router.post("/removeAdmin", authenticateToken, removeAdmin);
router.get(
  "/getNotConfirmedFilledUsers",
  authenticateToken,
  getNotConfirmedFilledUsers
);
router.post("/submit", authenticateToken, submitProfileToConfirm);

module.exports = router;
