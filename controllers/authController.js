const { User, Code } = require('../models');
const { sendEmailWithCode } = require('../services/emailService');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res
      .status(404)
      .json({ message: 'Пользователь не найден. Зарегистрируйтесь.' });
  }
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 10);
  await Code.create({ email, code, expiresAt: expirationTime });
  await sendEmailWithCode(email, code);
  res.status(200).json({ message: 'Код отправлен на вашу почту' });
};

exports.register = async (req, res) => {
  const { email, fullName } = req.body;
  let user = await User.findOne({ where: { email } });
  if (user) {
    return res
      .status(400)
      .json({ message: 'Пользователь уже существует. Авторизуйтесь.' });
  }
  user = await User.create({ email, fullName });
  res.status(200).json({ message: 'Пользователь успешно зарегистрирован' });
};

exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  const savedCode = await Code.findOne({ where: { email, code } });
  if (!savedCode || new Date() > savedCode.expiresAt) {
    return res
      .status(400)
      .json({ message: 'Неправильный или просроченный код.' });
  }
  await User.update({ isVerified: true }, { where: { email } });
  await Code.destroy({ where: { email, code } });
  const user = await User.findOne({ where: { email } });
  const token = jwt.sign(
    { id: user.id, email: user.email, fullName: user.fullName },
    process.env.JWT_SECRET,
    { expiresIn: '24h' },
  );
  res.status(200).json({
    message: 'Электронная почта успешно подтверждена.',
    token,
  });
};
