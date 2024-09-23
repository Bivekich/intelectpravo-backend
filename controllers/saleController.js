const { Sale, BankDetails, UserProfile } = require("../models");
const { generateContract } = require("../services/contractService");
const { Op } = require("sequelize");
const BASE_URL = process.env.BASE_URL; // Ensure BASE_URL is defined

exports.createOrUpdateSale = async (req, res) => {
  const { title, description, price, saleType, isExclusive, licenseTerm } =
    req.body;
  const fileUrl = req.file.path;
  const userId = req.user.id;
  const account = await BankDetails.findOne({ where: { userId } });
  const accountNumber = account.accountNumber;
  let sale = await Sale.findOne({ where: { userId: userId, status: "draft" } });

  if (!sale) {
    sale = await Sale.create({
      userId,
      title,
      description,
      fileUrl,
      price,
      accountNumber,
      saleType,
      isExclusive: saleType === "license" ? isExclusive : null,
      licenseTerm: saleType === "license" ? licenseTerm : null,
      status: "confirmed",
    });
  } else {
    sale = await Sale.update(
      {
        title,
        description,
        fileUrl,
        price,
        accountNumber,
        saleType,
        isExclusive: saleType === "license" ? isExclusive : null,
        licenseTerm: saleType === "license" ? licenseTerm : null,
      },
      { where: { userId, status: "confirmed" } }
    );
  }
  res.status(200).json({ message: "Черновик сохранен", sale });
};

exports.getSales = async (req, res) => {
  try {
    const userId = req.user.id; // Получаем userId из токена
    const { limit = 10, offset = 0, search = "" } = req.query; // Параметры пагинации из строки запроса

    // Получаем продажи с фильтрацией по названию и пагинацией
    const sales = await Sale.findAll({
      where: {
        title: {
          [Op.like]: `%${search}%`, // Подстрочный поиск по названию
        },
        userId, // Фильтр по userId
      },
      limit: parseInt(limit), // Лимит результатов
      offset: parseInt(offset), // Пропуск первых 'offset' результатов
      order: [["id", "DESC"]], // Сортировка по id в порядке убывания
    });

    // Подсчет общего количества продаж с учетом фильтрации
    const filteredSalesCount = await Sale.count({
      where: {
        title: {
          [Op.like]: `%${search}%`, // Тот же фильтр по названию
        },
        userId, // Фильтр по userId
      },
    });

    // Модифицируем данные продаж (например, добавляем полный путь к файлу)
    const modifiedSales = sales.map((sale) => {
      const saleData = sale.get({ plain: true }); // Преобразуем в обычный объект
      if (saleData.fileUrl) {
        saleData.fileUrl = `${BASE_URL}/${saleData.fileUrl}`; // Добавляем BASE_URL к fileUrl
      }
      // Определяем, принадлежит ли продажа пользователю или была куплена им
      saleData.isMy =
        saleData.userId === userId || saleData.userBought === userId;

      return saleData; // Возвращаем модифицированный объект продажи
    });

    // Отправляем ответ с модифицированными продажами и общим количеством
    res.status(200).json({
      sales: modifiedSales,
      count: filteredSalesCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching sales." });
  }
};
exports.buyUserSales = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sid } = req.query; // Получаем sid из строки запроса

    // Логирование для проверки значения sid
    console.log("Sale ID (sid) received:", sid);

    // Проверяем, передан ли параметр sid
    if (!sid) {
      return res
        .status(400)
        .json({ error: "Sale ID is required", sid: req.query.sid });
    }

    // Находим запись продажи
    const sale = await Sale.findOne({ where: { id: sid } });

    // Проверяем, существует ли запись
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    const owner = await UserProfile.findOne({ where: { id: sale.userId } });
    const buyer = await UserProfile.findOne({ where: { id: userId } });
    const owner_bank_details = await BankDetails.findOne({
      where: { userId: sale.userId },
    });
    const buyer_bank_details = await BankDetails.findOne({
      where: { userId: userId },
    });

    // Генерируем URL контракта
    const contractUrl = await generateContract(
      sale,
      owner,
      buyer,
      owner_bank_details,
      buyer_bank_details
    );

    // Обновляем запись продажи с id покупателя и URL контракта
    sale.update(
      { contractUrl: `${BASE_URL}/${contractUrl}` },
      { where: { id: sid } }
    );

    // Возвращаем успешный ответ
    res
      .status(200)
      .json({ message: "Договор успешно сгенерирован", sale: sale });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the sale" });
  }
};
exports.markPaid = async (req, res) => {
  const userId = req.user.id;
  const { sid } = req.query; // Получаем sid из строки запроса

  const sale = await Sale.findOne({
    where: { id: sid, userBought: { [Op.ne]: null } },
  });
  if (sale) {
    sale.update({ userBought: userId }, { where: { id: sid } });
  }

  res.status(200).json({ message: "Файл успешно передан", sale: sale });
};
exports.getUserSales = async (req, res) => {
  const userId = req.user.id;
  const sales = await Sale.findAll({
    where: { userId: userId, userBought: null },
  });

  res.status(200).json(sales);
};
exports.getUserBoughts = async (req, res) => {
  const userId = req.user.id;
  const sales = await Sale.findAll({ where: { userBought: userId } });

  res.status(200).json(sales);
};
exports.getUserSelled = async (req, res) => {
  const userId = req.user.id;
  const sales = await Sale.findAll({
    where: {
      userId: userId, // Filter by userId
      userBought: { [Op.ne]: null }, // Check if userBought is not null
    },
  });

  res.status(200).json(sales);
};
