const { UserProfile, BankDetails } = require('../models');
const BASE_URL = 'https://api.intelectpravo.ru';

// Получение базового профиля
exports.getBasicProfile = async (req, res) => {
  const userId = req.user.id;
  const profile = await UserProfile.findOne({ where: { userId } });
  if (!profile) {
    return res.status(200).json({
      message: 'Профиль не найден. Пожалуйста, заполните данные.',
      profile: {},
    });
  }
  if (profile.documentPhoto) {
    profile.documentPhoto = `${BASE_URL}/${profile.documentPhoto}`;
  }
  res.json(profile);
};

// Обновление профиля
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const {
    fullName,
    birthDate,
    address,
    passportSeries,
    passportNumber,
    passportIssuedBy,
    passportIssuedDate,
    email,
    phoneNumber,
  } = req.body;
  let profile = await UserProfile.findOne({ where: { userId } });
  if (!profile) {
    profile = await UserProfile.create({
      userId,
      fullName,
      birthDate,
      address,
      passportSeries,
      passportNumber,
      passportIssuedBy,
      passportIssuedDate,
      email,
      phoneNumber,
      isConfirmed: false,
    });
    return res.status(201).json({
      message: 'Профиль создан и данные сохранены.',
      profile,
    });
  }
  await profile.update({
    fullName,
    birthDate,
    address,
    passportSeries,
    passportNumber,
    passportIssuedBy,
    passportIssuedDate,
    email,
    phoneNumber,
  });
  if (profile.documentPhoto) {
    profile.documentPhoto = `${BASE_URL}/${profile.documentPhoto}`;
  }
  res.json({ message: 'Профиль обновлен.', profile });
};

// Загрузка фото документа
exports.uploadDocumentPhoto = async (req, res) => {
  const userId = req.user.id;
  const photoPath = req.file.path;
  await UserProfile.update({ documentPhoto: photoPath }, { where: { userId } });
  const fullPhotoPath = `${BASE_URL}/${photoPath}`;
  res.json({
    message: 'Фото документа загружено.',
    documentPhoto: fullPhotoPath,
  });
};

// Подтверждение профиля
exports.confirmProfile = async (req, res) => {
  const userId = req.user.id;
  await UserProfile.update({ isConfirmed: true }, { where: { userId } });
  res.json({ message: 'Профиль подтвержден.' });
};

// Добавление банковских реквизитов
exports.addBankDetails = async (req, res) => {
  const userId = req.user.id;
  const { cardNumber, accountNumber, corrAccount, bic } = req.body;
  const bankDetails = await BankDetails.create({
    userId,
    cardNumber,
    accountNumber,
    corrAccount,
    bic,
  });
  res.json({ message: 'Банковские реквизиты добавлены.', bankDetails });
};

// Получение банковских реквизитов
exports.getBankDetails = async (req, res) => {
  const userId = req.user.id;
  const bankDetails = await BankDetails.findOne({ where: { userId } });
  if (!bankDetails) {
    return res
      .status(404)
      .json({ message: 'Банковские реквизиты не найдены.' });
  }
  res.json(bankDetails);
};
