// controllers/authController.js
const { User, UserProfile, Code } = require("../models");
const { sendEmail } = require("../services/emailService");
const { sendCode } = require("../services/smsService");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.login = async (req, res) => {
  const { login } = req.body;

  // Проверка, передан ли login
  if (!login) {
    return res
      .status(400)
      .json({ message: "Логин (email или номер телефона) не указан." });
  }

  // Попробуйте найти пользователя по номеру телефона
  let user = await UserProfile.findOne({ where: { phoneNumber: login } });

  if (!user) {
    user = await UserProfile.findOne({ where: { email: login } });
  }

  if (!user) {
    return res
      .status(404)
      .json({ message: "Пользователь не найден. Зарегистрируйтесь." });
  }

  const phone = user.phoneNumber; // Предполагается, что у пользователя есть email
  res
    .status(200)
    .json({ message: "Профиль найден. Введите пароль", phone: `${phone}` });
};

exports.loginByPass = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    // Try to find the user by phone number
    const user = await UserProfile.findOne({
      where: { phoneNumber: phoneNumber },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Пользователь не найден. Зарегистрируйтесь." });
    }

    // Check if the provided password matches the hashed password in the database
    const isPasswordValid = password == user.password;
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    await sendCode(phoneNumber);
    res.status(200).json({ message: "Код отправлен на вашу почту" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Произошла ошибка на сервере." });
  }
};

exports.register = async (req, res) => {
  const { phone, name, email, surname, patronymic, password } = req.body;
  let user = await UserProfile.findOne({ where: { phoneNumber: phone } });
  if (user) {
    return res
      .status(400)
      .json({ message: "Пользователь уже существует. Авторизуйтесь." });
  }
  // If user does not exist, create a new user
  user = await User.create({
    phone,
    email,
    name,
    surname,
    patronymic,
    password,
  });

  await UserProfile.create({
    userId: user.id,
    email: user.email,
    name: user.name,
    surname: user.surname,
    patronymic: user.patronymic,
    phoneNumber: user.phone, // Save phone number
    birthDate: null,
    address: null,
    passportSeries: null,
    passportNumber: null,
    passportIssuedBy: null,
    passportIssuedDate: null,
    isConfirmed: false,
    toSend: false,
    password: user.password,
  });

  await sendCode(user.phone);

  await sendEmail(
    user.email,
    "Уведомление с intelectpravo.ru",
    "Вы зарегистрировались на сайте intelectpravo.ru",
  );
  res.status(200).json({ message: "Пользователь успешно зарегистрирован" });
};

exports.verifyCode = async (req, res) => {
  const { phoneNumber, code } = req.body;
  const savedCode = await Code.findOne({ where: { phoneNumber, code } });

  if (!savedCode || new Date() > savedCode.expiresAt) {
    return res
      .status(400)
      .json({ message: "Неправильный или просроченный код." });
  }

  await User.update({ isVerified: true }, { where: { phone: phoneNumber } });
  await Code.destroy({ where: { phoneNumber, code } });

  const user = await UserProfile.findOne({ where: { phoneNumber } });
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: `${user.surname} ${user.name}`,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  await sendEmail(
    user.email,
    "Уведомление с intelectpravo.ru",
    "Вы успешно вошли на intelectpravo.ru",
  );

  res.status(200).json({
    message: "Номер телефона успешно подтвержден.",
    token,
  });
};
