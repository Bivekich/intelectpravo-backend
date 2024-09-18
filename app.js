const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/auth', authRoutes);

sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
  });
});
