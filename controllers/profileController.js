const { User, UserProfile, BankDetails, Code } = require("../models");
const { sendEmail } = require("../services/emailService");
const { sendCode } = require("../services/smsService");
const { Op } = require("sequelize");

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
      toSend: false,
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
    isConfirmed: false,
    toSend: false,
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
  const profile = await UserProfile.findOne({ where: { userId } });
  await profile.update({
    isConfirmed: false,
    toSend: false,
  });
  res.json({
    message: "Фото документа загружено.",
    documentPhoto: fullPhotoPath,
  });
};

// Добавление банковских реквизитов
exports.addBankDetails = async (req, res) => {
  const userId = req.user.id;
  const { cardNumber, accountNumber, corrAccount, bic } = req.body;
  let bankDetails = await BankDetails.findOne({ where: { userId } });
  if (!bankDetails) {
    bankDetails = await BankDetails.create({
      userId,
      cardNumber,
      accountNumber,
      corrAccount,
      bic,
    });
  } else {
    await BankDetails.update({
      userId,
      cardNumber,
      accountNumber,
      corrAccount,
      bic,
    });
  }
  const profile = await UserProfile.findOne({ where: { userId } });
  await profile.update({
    isConfirmed: false,
    toSend: false,
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

exports.verifyAction = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber)
    return res.status(400).json({ message: "Номер телефона не был отправлен" });
  await sendCode(phoneNumber);
  res.status(200).json({
    message: "Код отправлен Вам на телефон",
  });
};

exports.checkVerifyAction = async (req, res) => {
  const { phoneNumber, code } = req.body;
  const userId = req.user.id;
  const savedCode = await Code.findOne({ where: { phoneNumber, code } });
  if (!savedCode || new Date() > savedCode.expiresAt) {
    await Code.destroy({ where: { phoneNumber, code } });
    return res
      .status(400)
      .json({ message: "Неправильный или просроченный код." });
  }

  res.status(200).json({
    message: "Действие успешко подтверждено.",
  });
};
exports.getNotConfirmedFilledUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const userFields = [
      "name",
      "surname",
      "patronymic",
      "birthDate",
      "address",
      "passportSeries",
      "passportNumber",
      "passportIssuedBy",
      "passportCode",
      "passportIssuedDate",
      "documentPhoto",
      "email",
      "phoneNumber",
      "userId",
    ]; // Полевые данные пользователя

    const queryConditions = userFields.map((field) => ({
      [field]: { [Op.ne]: null },
    }));

    // Получение пользователей, которые еще не подтверждены
    const users = await UserProfile.findAll({
      where: {
        [Op.or]: [
          {
            [Op.and]: [
              ...queryConditions,
              { isConfirmed: false }, // Проверка на подтверждение
              { toSend: true }, // Проверка на подтверждение
            ],
          },
          { admin: true }, // Проверка на администратора
        ],
      },
    });

    // Исключение текущего пользователя из списка
    const usersWithoutCurrent = users.filter(
      (user) => user.userId !== currentUserId
    );

    // Получение банковских реквизитов для найденных пользователей
    const userIds = usersWithoutCurrent.map((user) => user.userId);
    const bankDetails = await BankDetails.findAll({
      where: {
        userId: userIds,
      },
    });

    // Создание массива с данными пользователей и их банковскими реквизитами
    const result = usersWithoutCurrent.map((user) => {
      const userBankDetails =
        bankDetails.find((bank) => bank.userId === user.userId) || {};
      return {
        ...user.get(), // Получаем обычный объект пользователя
        bankDetails: {
          cardNumber: userBankDetails.cardNumber || "Не указано",
          accountNumber: userBankDetails.accountNumber || "Не указано",
          corrAccount: userBankDetails.corrAccount || "Не указано",
          bic: userBankDetails.bic || "Не указано",
        },
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    res
      .status(500)
      .json({ message: "Ошибка при получении пользователей", error });
  }
};

// Подтверждение профиля
exports.confirmProfile = async (req, res) => {
  try {
    const { userId } = req.body; // ID пользователя, чей профиль нужно подтвердить
    const currentUserId = req.user.id; // ID текущего пользователя (админа)

    // Поиск текущего пользователя (администратора)
    const adminUser = await UserProfile.findOne({
      where: { id: currentUserId },
    });

    // Проверка, что текущий пользователь является администратором
    if (!adminUser || !adminUser.admin) {
      return res.status(400).json({
        message: "У вас нет прав на изменение статуса пользователя",
      });
    }

    // Подтверждение профиля пользователя
    const confirmedUser = await UserProfile.update(
      { isConfirmed: true },
      { where: { userId }, returning: true }
    );

    // Отправка уведомления на почту
    const userEmail = confirmedUser[1][0].email; // Получаем email пользователя после обновления
    console.log(userEmail);
    await sendEmail(
      userEmail,
      "Подтверждение профиля на IntellectPravo",
      "Ваш профиль на IntellectPravo был успешно подтвержден. Теперь вы можете размещать и покупать произведения онлайн."
    );

    res.status(200).json({ message: "Профиль подтвержден." });
  } catch (error) {
    res.status(500).json({ message: "Ошибка подтверждения профиля", error });
  }
};

// Отказ в подтверждении профиля
exports.disConfirmProfile = async (req, res) => {
  try {
    const { userId } = req.body; // ID пользователя, чей профиль нужно отклонить
    const currentUserId = req.user.id; // ID текущего пользователя (админа)

    // Поиск текущего пользователя (администратора)
    const adminUser = await UserProfile.findOne({
      where: { id: currentUserId },
    });

    // Проверка, что текущий пользователь является администратором
    if (!adminUser || !adminUser.admin) {
      return res.status(400).json({
        message: "У вас нет прав на изменение статуса пользователя",
      });
    }

    // Отклонение профиля пользователя (сброс подтверждения)
    const disConfirmedUser = await UserProfile.update(
      { isConfirmed: false },
      { where: { userId }, returning: true }
    );

    // Отправка уведомления на почту
    const userEmail = disConfirmedUser[1][0].email; // Получаем email пользователя после обновления
    await sendEmail(
      userEmail,
      "Отклонение профиля на IntellectPravo",
      "Ваш профиль на IntellectPravo был отклонен администратором. Пожалуйста, исправьте введенные данные и отправьте их повторно для подтверждения."
    );

    res.status(200).json({ message: "Профиль отклонен." });
  } catch (error) {
    res.status(500).json({ message: "Ошибка отклонения профиля", error });
  }
};

exports.addAdmin = async (req, res) => {
  try {
    const { userId } = req.body; // ID пользователя, чей профиль нужно отклонить
    const currentUserId = req.user.id; // ID текущего пользователя (админа)

    // Поиск текущего пользователя (администратора)
    const adminUser = await UserProfile.findOne({
      where: { id: currentUserId },
    });

    // Проверка, что текущий пользователь является администратором
    if (!adminUser || !adminUser.admin) {
      return res.status(400).json({
        message: "У вас нет прав на изменение статуса пользователя",
      });
    }

    // Отклонение профиля пользователя (сброс подтверждения)
    await UserProfile.update(
      { admin: true },
      { where: { userId }, returning: true }
    );

    res.json({ message: "Админ добавлен." });
  } catch (error) {
    res.status(500).json({ message: "Ошибка добавления админа", error });
  }
};
exports.removeAdmin = async (req, res) => {
  try {
    const { userId } = req.body; // ID пользователя, чей профиль нужно отклонить
    const currentUserId = req.user.id; // ID текущего пользователя (админа)

    // Поиск текущего пользователя (администратора)
    const adminUser = await UserProfile.findOne({
      where: { id: currentUserId },
    });

    // Проверка, что текущий пользователь является администратором
    if (!adminUser || !adminUser.admin) {
      return res.status(400).json({
        message: "У вас нет прав на изменение статуса пользователя",
      });
    }

    // Отклонение профиля пользователя (сброс подтверждения)
    await UserProfile.update(
      { admin: false },
      { where: { userId }, returning: true }
    );

    res.json({ message: "Админ удален из админов." });
  } catch (error) {
    res.status(500).json({ message: "Ошибка изменения статуса админа", error });
  }
};

exports.submitProfileToConfirm = async (req, res) => {
  try {
    const userId = req.user.id;

    // Отклонение профиля пользователя (сброс подтверждения)
    await UserProfile.update(
      { toSend: true },
      { where: { userId }, returning: true }
    );

    res.json({ message: "Профиль отправлен администратору на проверку" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка отправления аккаунта на проверку", error });
  }
};
