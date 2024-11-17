const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.timeweb.ru",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send email
exports.sendEmail = (email, subject, text) => {
  // Send email without waiting for the response
  transporter
    .sendMail({
      from: process.env.EMAIL_USER, // Sender address
      to: email, // List of recipients
      subject: subject, // Subject line
      text: text, // Plain text body
    })
    .then((info) => {
      console.log("Email sent: " + info.response);
    })
    .catch((error) => {
      console.error("Error sending email:", error);
    });

  // Immediately return true (indicating the function has completed)
  return true;
};
