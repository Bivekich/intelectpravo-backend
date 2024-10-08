const axios = require("axios");
require("dotenv").config();

exports.sendSMSWithCode = async (number, code) => {
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
