const express = require("express");
const {
  getBasicProfile,
  updateProfile,
  uploadDocumentPhoto,
  confirmProfile,
  addBankDetails,
  getBankDetails,
  changePassword,
  confirmEmail,
  confirmEmailCode,
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
router.post("/bank-details", authenticateToken, addBankDetails);
router.get("/bank-details", authenticateToken, getBankDetails);
router.get("/confirm-email-code", authenticateToken, confirmEmailCode);
router.post("/confirm-email", authenticateToken, confirmEmail);
router.post("/change-password", authenticateToken, changePassword);

module.exports = router;
