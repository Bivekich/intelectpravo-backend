const { Sale } = require('../models');
const { generateContract } = require('../services/contractService');

exports.createOrUpdateSale = async (req, res) => {
  const {
    title,
    description,
    price,
    accountNumber,
    saleType,
    isExclusive,
    licenseTerm,
  } = req.body;
  const userId = req.user.id;
  let sale = await Sale.findOne({ where: { userId, status: 'draft' } });
  if (!sale) {
    sale = await Sale.create({
      userId,
      title,
      description,
      price,
      accountNumber,
      saleType,
      isExclusive: saleType === 'license' ? isExclusive : null,
      licenseTerm: saleType === 'license' ? licenseTerm : null,
      status: 'draft',
    });
  } else {
    sale = await Sale.update(
      {
        title,
        description,
        price,
        accountNumber,
        saleType,
        isExclusive: saleType === 'license' ? isExclusive : null,
        licenseTerm: saleType === 'license' ? licenseTerm : null,
      },
      { where: { userId, status: 'draft' } },
    );
  }
  res.status(200).json({ message: 'Черновик сохранен', sale });
};

exports.confirmSale = async (req, res) => {
  const userId = req.user.id;
  const sale = await Sale.findOne({ where: { userId, status: 'draft' } });
  if (!sale) {
    return res.status(404).json({ message: 'Черновик продажи не найден' });
  }
  const contractUrl = await generateContract(sale);
  await Sale.update(
    { status: 'confirmed', contractUrl },
    { where: { userId, status: 'draft' } },
  );

  res.status(200).json({
    message: 'Продажа подтверждена. Договор сгенерирован.',
    sale,
    contractUrl,
  });
};

exports.getSales = async (req, res) => {
  const userId = req.user.id;
  const sales = await Sale.findAll({ where: { userId } });

  res.status(200).json(sales);
};
