const express = require('express');
const {
  getBasicProfile,
  updateProfile,
  uploadDocumentPhoto,
  confirmProfile,
  addBankDetails,
} = require('../controllers/profileController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/basic', authenticateToken, getBasicProfile);
router.post('/update', authenticateToken, updateProfile);
router.post(
  '/upload-photo',
  authenticateToken,
  upload.single('documentPhoto'),
  uploadDocumentPhoto,
);
router.post('/confirm', authenticateToken, confirmProfile);
router.post('/bank-details', authenticateToken, addBankDetails);

module.exports = router;
