// controllers/authController.js
const { User, UserProfile, Code } = require("../models");
const { sendEmailWithCode } = require("../services/emailService");
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

  // Попробуйте найти пользователя по email
  let user = await User.findOne({ where: { email: login } });
  if (!user) {
    // Если не найден, попробуйте найти по номеру телефона
    user = await UserProfile.findOne({ where: { phoneNumber: login } });
  }
  if (!user) {
    return res
      .status(404)
      .json({ message: "Пользователь не найден. Зарегистрируйтесь." });
  }

  const email = user.email; // Предполагается, что у пользователя есть email
  res
    .status(200)
    .json({ message: "Профиль найден. Введите пароль", email: email });
};
exports.loginByPass = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Try to find the user by email
    const user = await User.findOne({ where: { email } });

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

    // Generate a verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 10);

    // Save the code in the database with an expiration time
    await Code.create({ email, code, expiresAt: expirationTime });

    // Send the code via email
    await sendEmailWithCode(email, code);

    res.status(200).json({ message: "Код отправлен на вашу почту" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Произошла ошибка на сервере." });
  }
};

exports.register = async (req, res) => {
  const { email, name, surname, patronymic, password } = req.body;
  let user = await User.findOne({ where: { email } });
  if (user) {
    return res
      .status(400)
      .json({ message: "Пользователь уже существует. Авторизуйтесь." });
  }
  user = await User.create({ email, name, surname, patronymic, password });
  await UserProfile.create({
    userId: user.id,
    email: user.email,
    name: user.name,
    surname: user.surname,
    patronymic: user.patronymic,
    birthDate: null,
    address: null,
    passportSeries: null,
    passportNumber: null,
    passportIssuedBy: null,
    passportIssuedDate: null,
    isConfirmed: false,
    password: user.password,
  });

  res.status(200).json({ message: "Пользователь успешно зарегистрирован" });
};

exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  const savedCode = await Code.findOne({ where: { email, code } });
  if (!savedCode || new Date() > savedCode.expiresAt) {
    return res
      .status(400)
      .json({ message: "Неправильный или просроченный код." });
  }
  await User.update({ isVerified: true }, { where: { email } });
  await Code.destroy({ where: { email, code } });
  const user = await User.findOne({ where: { email } });
  const token = jwt.sign(
    { id: user.id, email: user.email, fullName: user.fullName },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
  res.status(200).json({
    message: "Электронная почта успешно подтверждена.",
    token,
  });
};
