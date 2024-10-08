const { User, UserProfile, BankDetails, Code } = require("../models");
const { sendEmailWithCode } = require("../services/emailService");

// Получение базового профиля
exports.getBasicProfile = async (req, res) => {
  const userId = req.user.id;
  const profile = await UserProfile.findOne({ where: { userId } });
  if (!profile) {
    return res.status(200).json({
      message: "Профиль не найден. Пожалуйста, заполните данные.",
      profile: {},
    });
  }
  if (profile.documentPhoto) {
    profile.documentPhoto = `${process.env.BASE_URL}/${profile.documentPhoto}`;
  }
  if (profile.phoneNumber) {
    profile.phoneNumber = `+${profile.phoneNumber}`;
  }
  res.json(profile);
};

// Обновление профиля
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const {
    name,
    surname,
    patronymic,
    birthDate,
    address,
    passportSeries,
    passportNumber,
    passportIssuedBy,
    passportCode,
    passportIssuedDate,
    email,
    phoneNumber,
  } = req.body;
  let profile = await UserProfile.findOne({ where: { userId } });
  if (!profile) {
    profile = await UserProfile.create({
      userId,
      name,
      surname,
      patronymic,
      birthDate,
      address,
      passportSeries,
      passportNumber,
      passportIssuedBy,
      passportCode,
      passportIssuedDate,
      email,
      phoneNumber,
      isConfirmed: false,
    });
    return res.status(201).json({
      message: "Профиль создан и данные сохранены.",
      profile,
    });
  }
  await profile.update({
    name,
    surname,
    patronymic,
    birthDate,
    address,
    passportSeries,
    passportNumber,
    passportIssuedBy,
    passportCode,
    passportIssuedDate,
    email,
    phoneNumber,
  });
  if (profile.documentPhoto) {
    profile.documentPhoto = `${process.env.BASE_URL}/${profile.documentPhoto}`;
  }
  res.json({ message: "Профиль обновлен.", profile });
};

// Загрузка фото документа
exports.uploadDocumentPhoto = async (req, res) => {
  const userId = req.user.id;
  const photoPath = req.file.path;
  await UserProfile.update({ documentPhoto: photoPath }, { where: { userId } });
  const fullPhotoPath = `${process.env.BASE_URL}/${photoPath}`;
  res.json({
    message: "Фото документа загружено.",
    documentPhoto: fullPhotoPath,
  });
};

// Подтверждение профиля
exports.confirmProfile = async (req, res) => {
  const userId = req.user.id;
  await UserProfile.update({ isConfirmed: true }, { where: { userId } });
  res.json({ message: "Профиль подтвержден." });
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
  res.json({ message: "Банковские реквизиты добавлены.", bankDetails });
};

// Получение банковских реквизитов
exports.getBankDetails = async (req, res) => {
  const userId = req.user.id;
  const bankDetails = await BankDetails.findOne({ where: { userId } });
  if (!bankDetails) {
    return res
      .status(404)
      .json({ message: "Банковские реквизиты не найдены." });
  }
  res.json(bankDetails);
};
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get the user ID from the authenticated user (from the request)
  const userId = req.user.id;

  try {
    // Find the user by ID
    const user = await User.findByPk(userId);
    const userProfile = await UserProfile.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден." });
    }

    // Check if the current password is correct
    const isMatch = currentPassword == user.password;
    if (!isMatch) {
      return res.status(400).json({ message: "Неверный текущий пароль." });
    }

    // Update the user's password
    user.password = newPassword;
    userProfile.password = newPassword;
    await user.save();
    await userProfile.save();

    res.status(200).json({ message: "Пароль успешно изменен." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Произошла ошибка при изменении пароля." });
  }
};

exports.confirmEmailCode = async (req, res) => {
  const { email } = req.query;
  // Generate a verification code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 10);

  // Save the code in the database with an expiration time
  await Code.create({ email, code, expiresAt: expirationTime });

  // Send the code via email
  await sendEmailWithCode(email, code);
  res.status(200).json({ message: "Код подтверждения отправлен на почту" });
};
exports.confirmEmail = async (req, res) => {
  const { email, code } = req.body;
  const userId = req.user.id;
  const savedCode = await Code.findOne({ where: { email, code } });
  if (!savedCode || new Date() > savedCode.expiresAt) {
    return res
      .status(400)
      .json({ message: "Неправильный или просроченный код." });
  }
  await User.update({ email: email }, { where: { id: userId } });
  await UserProfile.update({ email: email }, { where: { id: userId } });

  res.status(200).json({
    message: "Электронная почта успешно подтверждена.",
  });
};
