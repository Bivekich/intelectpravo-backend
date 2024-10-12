const { Code } = require("../models");
const axios = require("axios");
require("dotenv").config();

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
      `Intelectpravo ваш код подтверждения: ${code}`
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
      }
    );

    console.log("SMS отправлено:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Ошибка при отправке SMS:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

exports.sendCode = async (phoneNumber) => {
  // Generate a verification code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 10);

  // Save the code in the database with an expiration time
  await Code.create({
    phoneNumber: phoneNumber,
    code,
    expiresAt: expirationTime,
  });

  // Send the code via email (You might want to adjust this to send via SMS instead)
  await sendSMSWithCode(normalizePhoneNumber(phoneNumber), code);
};
