const { Code, UserProfile } = require("../models");
const { Op } = require("sequelize");
const axios = require("axios");
const { sendEmail } = require("./emailService");
require("dotenv").config();

const generateCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const createVerificationCode = (code) => {
  const secret = 1234; // Секретное число
  const randomFactor = secret * secret; // Случайное число от 0 до 99
  const encoded = (parseInt(code) * 2 + secret + randomFactor).toString(); // Применяем операции
  return encoded.slice(-4); // Возвращаем последние 4 символа
};

const normalizePhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  let cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");

  // If the number starts with '8', replace it with '7'
  if (cleanedPhoneNumber.startsWith("8")) {
    cleanedPhoneNumber = "7" + cleanedPhoneNumber.slice(1);
  }

  // If the number starts with a country code like '+7', make sure it's '7'
  if (cleanedPhoneNumber.startsWith("7")) {
    return cleanedPhoneNumber;
  }

  // If the number doesn't start with a country code, assume it's a local number (901...)
  if (cleanedPhoneNumber.length === 10) {
    return "7" + cleanedPhoneNumber; // Add '7' at the beginning
  }

  return cleanedPhoneNumber; // Return the cleaned phone number
};

const sendSMSWithCode = async (number, code) => {
  try {
    // Encode the text for the GET request
    const text = encodeURIComponent(
      `Intelectpravo ваш код подтверждения: ${code}`,
    );

    const response = await axios.get(
      `https://gate.smsaero.ru/v2/sms/send`, // Base URL without credentials
      {
        params: {
          number: number,
          text: text,
          sign: `SMS Aero`,
        },
        auth: {
          username: process.env.SMS_AERO_EMAIL,
          password: process.env.SMS_AERO_API_KEY,
        },
      },
    );

    console.log("SMS отправлено:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Ошибка при отправке SMS:",
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
};
exports.sendCode = async (phoneNumber, resend = false) => {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 10);

  if (resend) {
    await Code.destroy({
      where: {
        phoneNumber: phoneNumber,
      },
    });
  }

  const existingCode = await Code.findOne({
    where: {
      phoneNumber: phoneNumber,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
  });

  if (existingCode) {
    if (!resend) {
      return {
        message:
          "A code has already been sent to this phone number. Please try again later.",
      };
    }
  }

  const code = generateCode();
  const encodedCode = createVerificationCode(code);

  await Code.create({
    phoneNumber: phoneNumber,
    code: code, // Сохраняем закодированный код
    expiresAt: expirationTime,
  });

  const user = await UserProfile.findOne({ where: { phoneNumber } });

  const email = user.email;

  await sendSMSWithCode(normalizePhoneNumber(phoneNumber), code);
  sendEmail(
    email,
    `Intelectpravo ваш код подтверждения`,
    `Intelectpravo ваш код подтверждения: ${encodedCode}`,
  ); // Отправляем код на email

  console.log("\n\n");
  console.log(`Intelectpravo ваш код подтверждения: ${encodedCode}`);
  console.log("\n\n");

  return { message: "Verification code sent successfully." };
};
