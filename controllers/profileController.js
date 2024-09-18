const { UserProfile, BankDetails } = require('../models');

exports.getBasicProfile = async (req, res) => {
  const userId = req.user.id;
  const profile = await UserProfile.findOne({ where: { userId } });
  if (!profile) {
    return res.status(200).json({
      message: 'Профиль не найден. Пожалуйста, заполните данные.',
      profile: {},
    });
  }
  res.json(profile);
};

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
  profile = await UserProfile.update(
    {
      fullName,
      birthDate,
      address,
      passportSeries,
      passportNumber,
      passportIssuedBy,
      passportIssuedDate,
      email,
      phoneNumber,
    },
    {
      where: { userId },
    },
  );
  res.json({ message: 'Профиль обновлен.', profile });
};

exports.uploadDocumentPhoto = async (req, res) => {
  const userId = req.user.id;
  const photoPath = req.file.path;
  await UserProfile.update({ documentPhoto: photoPath }, { where: { userId } });
  res.json({ message: 'Фото документа загружено.' });
};

exports.confirmProfile = async (req, res) => {
  const userId = req.user.id;
  await UserProfile.update({ isConfirmed: true }, { where: { userId } });
  res.json({ message: 'Профиль подтвержден.' });
};

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
