const { Sale, BankDetails } = require("../models");
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
    const userId = req.user.id; // Get the user's ID from the request
    const { limit, offset } = req.body; // Pagination parameters from the request body

    // Fetch sales with pagination
    const sales = await Sale.findAll({
      where: {}, // Filter sales by user ID
      limit, // Limit the number of results
      offset, // Skip the first 'offset' results
      order: [["id", "DESC"]],
    });

    // Modify fileUrl if it exists
    const modifiedSales = sales.map((sale) => {
      const saleData = sale.get({ plain: true }); // Convert to plain object
      if (saleData.fileUrl) {
        saleData.fileUrl = `${BASE_URL}/${saleData.fileUrl}`; // Append BASE_URL to fileUrl
      }

      return saleData; // Return the modified sale object
    });

    res.status(200).json(modifiedSales); // Send the modified sales as response
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching sales." }); // Error handling
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

    // Генерируем URL контракта
    const contractUrl = await generateContract(sale);

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
