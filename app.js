const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const saleRoutes = require("./routes/saleRoutes");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/contracts", express.static(path.join(__dirname, "contracts")));
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/sale", saleRoutes);

sequelize.sync().then(() => {
  app.listen(3030, () => {
    console.log("Сервер запущен на порту 3030");
  });
});
