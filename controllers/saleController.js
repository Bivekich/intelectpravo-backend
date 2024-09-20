const { Sale, BankDetails } = require("../models");
const { generateContract } = require("../services/contractService");

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

exports.confirmSale = async (req, res) => {
  const userId = req.user.id;
  const sale = await Sale.findOne({ where: { userId, status: "draft" } });
  if (!sale) {
    return res.status(404).json({ message: "Черновик продажи не найден" });
  }
  const contractUrl = await generateContract(sale);
  await Sale.update(
    { status: "confirmed", contractUrl },
    { where: { userId, status: "draft" } }
  );

  res.status(200).json({
    message: "Продажа подтверждена. Договор сгенерирован.",
    sale,
    contractUrl,
  });
};
exports.getUserSales = async (req, res) => {
  const userId = req.user.id;
  const sales = await Sale.findAll();

  res.status(200).json(sales);
};
exports.getSales = async (req, res) => {
  const userId = req.user.id;
  const sales = await Sale.findAll({ where: { userId: userId } });

  res.status(200).json(sales);
};
