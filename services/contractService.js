const fs = require('fs');
const path = require('path');

exports.generateContract = async (sale) => {
  const contractContent = `
    Договор продажи произведения: ${sale.title}
    Описание: ${sale.description}
    Цена: ${sale.price}
    Номер счета: ${sale.accountNumber}
    Тип продажи: ${sale.saleType === 'license' ? 'Лицензия' : 'Права'}
    ${
      sale.saleType === 'license'
        ? `Срок действия лицензии: ${sale.licenseTerm} лет`
        : ''
    }
  `;
  const contractPath = path.join(
    __dirname,
    `../contracts/contract_${sale.id}.txt`,
  );
  fs.writeFileSync(contractPath, contractContent);
  return contractPath;
};
