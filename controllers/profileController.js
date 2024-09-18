const { UserProfile, BankDetails } = require('../models');

// Получение базового профиля (ФИО и номер)
exports.getBasicProfile = async (req, res) => {
  const userId = req.user.id;

  // Ищем профиль пользователя
  const profile = await UserProfile.findOne({ where: { userId } });

  if (!profile) {
    // Если профиль не найден, возвращаем сообщение об отсутствии профиля
    return res.status(200).json({
      message: 'Профиль не найден. Пожалуйста, заполните данные.',
      profile: {}, // Возвращаем пустой объект
    });
  }

  // Если профиль найден, возвращаем его данные
  res.json(profile);
};

// Обновление профиля с данными для подтверждения
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
  } = req.body;

  // Пытаемся найти профиль
  let profile = await UserProfile.findOne({ where: { userId } });

  if (!profile) {
    // Если профиль не найден, создаем новый профиль
    profile = await UserProfile.create({
      userId,
      fullName,
      birthDate,
      address,
      passportSeries,
      passportNumber,
      passportIssuedBy,
      passportIssuedDate,
      isConfirmed: false, // Профиль не подтвержден сразу
    });

    return res.status(201).json({
      message: 'Профиль создан и данные сохранены.',
      profile,
    });
  }

  // Если профиль найден, обновляем его данные
  profile = await UserProfile.update(
    {
      fullName,
      birthDate,
      address,
      passportSeries,
      passportNumber,
      passportIssuedBy,
      passportIssuedDate,
    },
    {
      where: { userId },
    },
  );

  res.json({ message: 'Профиль обновлен.', profile });
};

// Загрузка фото документа
exports.uploadDocumentPhoto = async (req, res) => {
  const userId = req.user.id;

  // Загрузка файла с использованием middleware (например, Multer)
  const photoPath = req.file.path;

  // Сохранение пути к фото в профиле
  await UserProfile.update({ documentPhoto: photoPath }, { where: { userId } });

  res.json({ message: 'Фото документа загружено.' });
};

// Подтверждение профиля
exports.confirmProfile = async (req, res) => {
  const userId = req.user.id;

  // Подтверждение профиля
  await UserProfile.update({ isConfirmed: true }, { where: { userId } });

  res.json({ message: 'Профиль подтвержден.' });
};

// Ввод банковских реквизитов
exports.addBankDetails = async (req, res) => {
  const userId = req.user.id;
  const { cardNumber, accountNumber, corrAccount, bic } = req.body;

  // Сохранение банковских реквизитов
  const bankDetails = await BankDetails.create({
    userId,
    cardNumber,
    accountNumber,
    corrAccount,
    bic,
  });

  res.json({ message: 'Банковские реквизиты добавлены.', bankDetails });
};
