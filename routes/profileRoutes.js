const express = require('express');
const {
  getBasicProfile,
  updateProfile,
  uploadDocumentPhoto,
  confirmProfile,
  addBankDetails,
} = require('../controllers/profileController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload'); // Middleware для загрузки файлов
const router = express.Router();

// Получение базового профиля (с проверкой JWT)
router.get('/basic', authenticateToken, getBasicProfile);

// Обновление профиля для подтверждения
router.post('/update', authenticateToken, updateProfile);

// Загрузка фото документа
router.post(
  '/upload-photo',
  authenticateToken,
  upload.single('documentPhoto'),
  uploadDocumentPhoto,
);

// Подтверждение профиля
router.post('/confirm', authenticateToken, confirmProfile);

// Ввод банковских реквизитов
router.post('/bank-details', authenticateToken, addBankDetails);

module.exports = router;
