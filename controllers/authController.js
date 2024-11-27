// controllers/authController.js
const { User, UserProfile, Code, Session } = require("../models");
const { sendEmail } = require("../services/emailService");
const { sendCode } = require("../services/smsService");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const createVerificationCode = (code) => {
  const secret = 1234; // Секретное число
  const randomFactor = secret * secret; // Случайное число от 0 до 99
  const encoded = (parseInt(code) * 2 + secret + randomFactor).toString(); // Применяем операции
  return encoded.slice(-4); // Возвращаем последние 4 символа
};

exports.login = async (req, res) => {
  const { login } = req.body;

  // Проверка, передан ли login
  if (!login) {
    return res
      .status(400)
      .json({ message: "Логин (email или номер телефона) не указан." });
  }

  // Попробуйте найти пользователя по номеру телефона

  let user = await User.findOne({
    where: { phone: login, isVerified: true },
  });

  if (user) {
    user = await UserProfile.findOne({
      where: { phoneNumber: login },
    });
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
exports.logout = async (req, res) => {
  const { token } = req.body;

  // const token = req.headers.authorization?.split(" ")[1];

  try {
    await Session.destroy({ where: { token } });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
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
    res
      .status(200)
      .json({ message: "Код отправлен на вашу почту", email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Произошла ошибка на сервере." });
  }
};

exports.register = async (req, res) => {
  const { phone, name, email, surname, patronymic, password } = req.body;
  let user = await UserProfile.findOne({ where: { phoneNumber: phone } });
  if (user) {
    let user1 = await User.findOne({
      where: { phone: phone },
    });

    if (!user1.isVerified) {
      await sendCode(phone);

      return res.status(200).json({ message: "Продолжайте регистрацию" });
    }
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

  sendEmail(
    user.email,
    "Уведомление с intelectpravo.ru",
    "Вы зарегистрировались на сайте intelectpravo.ru",
  );
  res.status(200).json({ message: "Пользователь успешно зарегистрирован" });
};

exports.resendCode = async (req, res) => {
  const { phoneNumber } = req.body;

  await sendCode(phoneNumber, true);

  res.status(200).json({ message: "Код подтверждения успешно выслан" });
};

exports.checkSession = async (req, res) => {
  const { token, ipAddress } = req.body;
  const session = await Session.findOne({ where: { token, ipAddress } });
  if (session) {
    res.status(200).json({
      message: "Сессия существует",
    });
  } else {
    res.status(404).json({
      message: "Сессия не существует",
    });
  }
  return session;
};

exports.verifyCode = async (req, res) => {
  const { phoneNumber, code, encodedCode, ipAddress } = req.body;

  const savedCode = await Code.findOne({ where: { phoneNumber, code } });

  console.log("\n\n");
  console.log(
    `Intelectpravo ваш код подтверждения: ${createVerificationCode(code)}`,
  );
  console.log("\n\n");

  if (
    !savedCode ||
    createVerificationCode(code) !== encodedCode ||
    new Date() > savedCode.expiresAt
  ) {
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
  const sessions = await Session.findAll({ where: { userId: user.id } });
  if (sessions.length > 0) {
    // Iterate over the sessions and destroy each one
    await Promise.all(sessions.map((session) => session.destroy()));
    console.log("All sessions destroyed successfully.");
  } else {
    console.log("No sessions found for this user.");
  }
  await Session.create({
    userId: user.id,
    token,
    ipAddress,
  });

  sendEmail(
    user.email,
    "Уведомление с intelectpravo.ru",
    "Вы успешно вошли на intelectpravo.ru",
  );

  res.status(200).json({
    message: "Номер телефона успешно подтвержден.",
    token,
  });
};
