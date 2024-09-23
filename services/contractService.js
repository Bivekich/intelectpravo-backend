const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const NumberToWordsRu = require("number-to-words-ru"); // Необходимо установить: npm install number-to-words-ru

exports.generateContract = async (
  sale,
  owner,
  buyer,
  owner_bank_details,
  buyer_bank_details
) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });
  const page = await browser.newPage();

  const owner_fio = owner.fullName.split(" ");
  const buyer_fio = buyer.fullName.split(" ");

  const contractsDir = "contracts/";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const documentNumber = `${String(sale.id).padStart(8, "0")}_${String(
    owner.id
  ).padStart(8, "0")}_${String(buyer.id).padStart(8, "0")}`;
  const docname = `contracts/contract_${documentNumber}.pdf`;
  const contractPath = path.join(__dirname, `../${docname}`);

  const months = [
    "ЯНВАРЯ",
    "ФЕВРАЛЯ",
    "МАРТА",
    "АПРЕЛЯ",
    "МАЯ",
    "ИЮНЯ",
    "ИЮЛЯ",
    "АВГУСТА",
    "СЕНТЯБРЯ",
    "ОКТЯБРЯ",
    "НОЯБРЯ",
    "ДЕКАБРЯ",
  ];

  const date = new Date();
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  const formattedDate = `${day} ${month} ${year} ГОДА`;

  let fileSizeInBytes;

  const formatBytes = (bytes) => {
    const sizes = ["байт", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 байт";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
  };

  fs.stat(sale.fileUrl, (err, stats) => {
    if (err) {
      console.error(`Ошибка при получении информации о файле: ${err}`);
      return;
    }

    fileSizeInBytes = stats.size;
  });
  function formatCurrency(value) {
    const rubles = Math.floor(value / 100); // Получаем рубли
    const kopecks = value % 100; // Получаем копейки

    // Форматирование чисел с пробелами
    const rublesFormatted = rubles.toLocaleString("ru-RU");

    // Преобразование числа в текст с правильными склонениями
    const rublesInWords = NumberToWordsRu.convert(rubles, {
      currency: "rub",
      declension: "nominative",
    }).toUpperCase();

    // Формирование итоговой строки
    return `${rublesFormatted} (${rublesInWords}) РУБЛЕЙ ${kopecks
      .toString()
      .padStart(2, "0")} КОПЕЕК`;
  }

  // Define your multi-page HTML content
  const htmlContent = `
<html>
  <head>

  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <style>
      * {
        box-sizing: border-box;
        border-spacing: 0px;
        margin: 0;
      }
      li {
        list-style-type: none;
        text-indent: -16.5px;
      }
      body {
        font-family: Arial, sans-serif;
        max-width: 790px;
      }
      .page-break {
        page-break-before: always;
      }
      tr {
        min-height: 20px;
        height: 20px;
      }
      th,
      td {
        margin: 0;
        padding: 2px;
        font-size: 12px;
        text-transform: uppercase;
      }
      table {
        width: 650px;
        margin: auto;
        border-collapse: collapse;
      }
      table,
      th,
      td {
        border: 1px solid black;
      }
      .number {
        width: 48px;
      }
      .title {
        text-align: center !important;
        font-weight: bold;
      }
      .yellow {
        text-align: end;
        background-color: #fff2cc;
      }
      .orange {
        text-align: end;
        background-color: #fbe4d5;
      }
      .green {
        text-align: end;
        background-color: #e2efd9;
      }
      .blue {
        text-align: start;
        background-color: #d9e2f3;
        width: 50%;
      }
      h3 {
        font-size: 13px;
        max-width: 450px;
        text-align: center;
        margin: 20px auto;
      }
      .page_counter {
        width: fit-content;
        margin: 0;
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
      }
      .page {
        position: relative;
        height: 96vh;
      }
      .infotext {
        width: 670px;
        margin: auto;
      }
      .infotext * {
        font-size: 11px;
      }
      h2 {
        margin: 0;
        margin: 10px;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <h3>ДОГОВОР<br />ОТЧУЖДЕНИЯ ИСКЛЮЧИТЕЛЬНОГО ПРАВА НА ПРОИЗВЕДЕНИЕ</h3>
      <table style="border-bottom: 0">
        <tbody>
          <tr>
            <th class="green">ГОРОД</th>
            <td class="blue">Москва</td>
          </tr>
          <tr>
            <th class="green">Номер договора</th>
            <td class="blue">№ ${documentNumber}</td>
          </tr>
          <tr>
            <th class="green">Дата договора</th>
            <td class="blue">${formattedDate}</td>
          </tr>
          <tr></tr>
        </tbody>
      </table>

      <table style="border-top: 0">
        <tbody>
          <tr>
            <th class="yellow number">1.</th>
            <th colspan="2" class="yellow title">Реквизиты сторон договора</th>
          </tr>
          <tr>
            <th class="yellow number">1.1.</th>
            <th colspan="2" class="yellow title">РЕКВИЗИТЫ ПРАВООБЛАДАТЕЛЯ</th>
          </tr>
          <tr>
            <th class="yellow number">1.1.1.</th>
            <th class="yellow">ФАМИЛИЯ</th>
            <td class="blue">${owner_fio[0]}</td>
          </tr>
          <tr>
            <th class="yellow number">1.1.2.</th>
            <th class="yellow">Имя</th>
            <td class="blue">${owner_fio[1]}</td>
          </tr>
          <tr>
            <th class="yellow number">1.1.3.</th>
            <th class="yellow">Отчество</th>
            <td class="blue">${owner_fio[2]}</td>
          </tr>
          <tr>
            <th class="yellow number">1.1.4.</th>
            <th class="yellow">Серия номер паспорта</th>
            <td class="blue">${owner.passportSeries} ${
    owner.passportNumber
  }</td>
          </tr>
          <tr>
            <th class="yellow number">1.1.5.</th>
            <th class="yellow">Дата выдачи</th>
            <td class="blue">${owner.passportIssuedDate}</td>
          </tr>
          <tr>
            <th class="yellow number">1.1.6.</th>
            <th class="yellow">Код подразделения</th>
            <td class="blue">${owner.passportCode}</td>
          </tr>
          <tr>
            <th class="yellow number">1.1.7.</th>
            <th class="yellow">Кем выдан</th>
            <td class="blue">${owner.passportIssuedBy}</td>
          </tr>
          <tr>
            <th class="yellow number">1.1.8.</th>
            <th class="yellow">Адрес регистрации</th>
            <td class="blue">${owner.address}</td>
          </tr>
          <tr>
            <th class="yellow number">1.1.9.</th>
            <th colspan="2" class="yellow title">
              БАНКОВСКИЕ РЕКВИЗИТЫ ПРАВООБЛАДАТЕЛЯ
            </th>
          </tr>
          <tr>
            <th class="yellow number">1.1.9.1.</th>
            <th class="yellow">Рассчетный счёт</th>
            <td class="blue">${owner_bank_details.accountNumber}</td>
          </tr>
          <tr>
            <th class="yellow number">1.1.9.2.</th>
            <th class="yellow">КОРРЕСПОНДЕТСКИЙ СЧЁТ</th>
            <td class="blue">${owner_bank_details.corrAccount}</td>
          </tr>
          <tr>
            <th class="yellow number">1.1.9.3.</th>
            <th class="yellow">БИК БАНКА</th>
            <td class="blue">${owner_bank_details.bic}</td>
          </tr>
          <tr>
            <th class="yellow number">1.1.9.4.</th>
            <th class="yellow">Номер банковской карты</th>
            <td class="blue">${owner_bank_details.cardNumber}</td>
          </tr>
          <tr></tr>
          <tr>
            <th class="yellow number">1.2.</th>
            <th colspan="2" class="yellow title">РЕКВИЗИТЫ ПРиобретателя</th>
          </tr>
          <tr>
            <th class="yellow number">1.2.1.</th>
            <th class="yellow">ФАМИЛИЯ</th>
            <td class="blue">${buyer_fio[0]}</td>
          </tr>
          <tr>
            <th class="yellow number">1.2.2.</th>
            <th class="yellow">Имя</th>
            <td class="blue">${buyer_fio[1]}</td>
          </tr>
          <tr>
            <th class="yellow number">1.2.3.</th>
            <th class="yellow">Отчество</th>
            <td class="blue">${buyer_fio[2]}</td>
          </tr>
          <tr>
            <th class="yellow number">1.2.4.</th>
            <th class="yellow">Серия номер паспорта</th>
            <td class="blue">${buyer.passportSeries} ${
    buyer.passportNumber
  }</td>
          </tr>
          <tr>
            <th class="yellow number">1.2.5.</th>
            <th class="yellow">Дата выдачи</th>
            <td class="blue">${buyer.passportIssuedDate}</td>
          </tr>
          <tr>
            <th class="yellow number">1.2.6.</th>
            <th class="yellow">Код подразделения</th>
            <td class="blue">${buyer.passportCode}</td>
          </tr>
          <tr>
            <th class="yellow number">1.2.7.</th>
            <th class="yellow">Кем выдан</th>
            <td class="blue">${buyer.passportIssuedBy}</td>
          </tr>
          <tr>
            <th class="yellow number">1.2.8.</th>
            <th class="yellow">Адрес регистрации</th>
            <td class="blue">${buyer.address}</td>
          </tr>
          <tr>
            <th class="yellow number">1.2.9.</th>
            <th colspan="2" class="yellow title">
              БАНКОВСКИЕ РЕКВИЗИТЫ ПРиобретателя
            </th>
          </tr>
          <tr>
            <th class="yellow number">1.2.9.1.</th>
            <th class="yellow">Рассчетный счёт</th>
            <td class="blue">${buyer_bank_details.accountNumber}</td>
          </tr>
          <tr>
            <th class="yellow number">1.2.9.2.</th>
            <th class="yellow">КОРРЕСПОНДЕТСКИЙ СЧЁТ</th>
            <td class="blue">${buyer_bank_details.corrAccount}</td>
          </tr>
          <tr>
            <th class="yellow number">1.2.9.3.</th>
            <th class="yellow">БИК БАНКА</th>
            <td class="blue">${buyer_bank_details.bic}</td>
          </tr>
          <tr>
            <th class="yellow number">1.2.9.4.</th>
            <th class="yellow">Номер банковской карты</th>
            <td class="blue">${buyer_bank_details.cardNumber}</td>
          </tr>
          <tr></tr>
        </tbody>
      </table>
      <p class="page_counter">Страница 1 из 3</p>
    </div>
    <div class="page-break"></div>
    <div class="page">
      <table style="margin-top: 30px">
        <tbody>
          <tr>
            <th class="orange number">2.</th>
            <th colspan="2" class="orange title">
              ХАРАКТЕРИСТИКИ ПРОИЗВЕДЕНИЯ, ПРАВА НА КОТОРОЕ ОТЧУЖДАЮТСЯ ПО
              ДОГОВОРУ
            </th>
          </tr>
          <tr>
            <th class="orange number">2.1.</th>
            <th class="orange">НАИМЕНОВАНИЕ ПРОИЗВЕДЕНИЯ</th>
            <td class="blue">${sale.title}</td>
          </tr>
          <tr>
            <th class="orange number">2.2.</th>
            <th class="orange">НАИМЕНОВАНИЕ ФАЙЛА, ФОРМАТ, РАЗМЕР</th>
            <td class="blue">${sale.fileUrl.split("/").at(-1)} ${formatBytes(
    fileSizeInBytes
  )}</td>
          </tr>
          <tr>
            <th class="orange number">2.3.</th>
            <th class="orange">
              СТОИМОСТЬ ПЕРЕДАЧИ ИСКЛЮЧИТЕЛЬНОГ ПРАВА НА ПРОИЗВЕДЕНИЕ:
            </th>
            <td class="blue">${formatCurrency(sale.price * 100)}</td>
          </tr>
          <tr>
            <th class="orange number">2.4.</th>
            <th class="orange">СОДЕРДЖАНИЕ И КРАТКОЕ ОПИСАНИЕ ПРОИЗВЕДЕНИЯ:</th>
            <td class="blue">${sale.description}</td>
          </tr>
          <tr>
            <th class="orange number">2.4.</th>
            <th class="orange">ОСНОВАНИЕ ПРИОБРЕТЕНИЯ ПРАВООБЛАДАТЕЛЕМ:</th>
            <td class="blue">ПРАВООБЛАДАТЕЛЬ ЯВЛЯЕТСЯ АВТОРОМ</td>
          </tr>
        </tbody>
      </table>
      <p class="page_counter">Страница 2 из 3</p>
    </div>
    <div class="page-break"></div>
    <div class="page">
      <div class="infotext" style="margin-top: 30px">
        <p>
          Руководствуясь положениями ст. ст. 1225, 1226, 1228, 1229-1231, 1233,
          1234 ГК РФ, Правообладатель, реквизиты которого указаны в п. 1.1
          Договора, и Приобретатель, реквизиты которого указаны в п. 1.2
          Договора, именуемые в дальнейшем «Стороны», а по отдельности –
          «Сторона», заключили настоящий договор отчуждения исключительного
          права на произведение, именуемый в дальнейшем «Договор», о
          нижеследующем:
        </p>

        <h2>3. Предмет Договора</h2>
        <ul>
          <li>
            3.1 По настоящему Договору Правообладатель в полном объёме и без
            ограничений передаёт (отчуждает) в адрес Приобретателя
            исключительное право на произведение, указанное в п. 2 Договора,
            именуемое в дальнейшем «Произведение», а Приобретатель обязуется
            принять и оплатить исключительное право на Произведение в размере,
            указанном в п. 2.3 Договора, именуемом в дальнейшем «Стоимость
            передачи исключительного права».
          </li>
          <li>
            3.2 Характеристики Произведения (наименование произведения,
            наименование формат и размер файла, содержащего копию произведения,
            содержание и краткое описание произведения, основания приобретения
            исключительного права правообладателем и пр.) исключительное право
            на которое передается Приобретателю по настоящему Договору, указаны
            Сторонами в п. 2 Договора, в Приложении № 1 «Спецификация» к
            настоящему Договору, именуемом в дальнейшем «Спецификация».
          </li>
          <li>
            3.3 Произведение передаётся (отчуждается) по Договору без
            ограничения целей использования (для полного и/ или частичного
            использования его Приобретателем по своему усмотрению в качестве
            нового правообладателя без ограничения по сроку и/или территории
            использования и\или форме использования). Правообладатель
            подтверждает и гарантирует, что после передачи исключительного права
            на Произведение по настоящему Договору Правообладатель не имеет и не
            будет иметь каких-либо претензий и или требований в отношении фактов
            или форм использования Произведения Приобретателем. Так,
            допускаются, включая, но не ограничиваясь, любые формы
            распространения, переработки, искажения, трансляции, публикации,
            доведения до всеобщего сведения Произведения Приобретателем в
            качестве нового правообладателя Произведения.
          </li>
        </ul>

        <h2>4. Подписание Договора</h2>
        <ul>
          <li>
            4.1 Настоящий Договор подписывается в форме электронного документа
            простой электронной подписью Сторон, именуемой в дальнейшем
            «Электронная подпись». Договор, подписанный Электронной подписью
            Стороны, признаётся равнозначным
          </li>
        </ul>

        <h2>5. Гарантии и заверения</h2>
        <ul>
          <li>
            5.1. Правообладатель настоящим даёт Приобретателю своё полное и
            безоговорочное согласие в порядке пп. 1, 2 п. 2 ст. 1300 ГК РФ на
            удаление и/или изменении Приобретателем информации об авторском
            праве, согласие на воспроизведение, распространение, импорт в целях
            распространения, публичное исполнение, сообщение в эфир или по
            кабелю, доведение до всеобщего сведения Произведения, в отношении
            которого Приобретателем удалена и/или изменена информация об
            авторском праве. Правообладатель подтверждает и гарантирует, что им
            получено согласие авторов произведения на в порядке пп. 1, 2 п. 2
            ст. 1300 ГК РФ на удаление и/или изменении информации об авторском
            праве, согласие на воспроизведение, распространение, импорт в целях
            распространения, публичное исполнение, сообщение в эфир или по
            кабелю, доведение до всеобщего сведения Произведения, в отношении
            которого удалена и/или изменена информация об авторском праве.
          </li>
          <li>
            5.2. Правообладатель гарантирует, что является автором Произведения
            и/или в полном объёме обладает исключительным правом на Произведение
            и все его составные части, элементы, включая, но не ограничиваясь,
            образы, замыслы, идеи, действующие лица, описания, изобразительные
            решения и пр. В случае использования в Произведении интеллектуальной
            собственности третьих лиц Правообладатель подтверждает и
            гарантирует, что им заключены с указанными лицами, среди прочего,
            договоры отчуждения исключительных прав (с авторами и соавторами
            и/или владельцами интеллектуальной собственности, используемой в
            Произведения, а равно с исполнителями в отношении исключительных
            прав, возникших на основании смежных) и Правообладатель обязуется по
            запросу Приобретателя представить доказательство их заключения в
            целях подтверждения надлежащего исполнения настоящего Договора. В
            случае предъявления указанными третьими лицами претензий и/или
            требований в адрес Приобретателя в отношении использования
            Произведения и/или каких-либо его составных частей Правообладатель
            обязуется нести ответственность по указанным требованиям, включая
            убытки и компенсации в полном объёме, в том числе в роли ответчика,
            руководствуясь гарантиями, представленными в настоящем пункте
            Договора.
          </li>
          <li>
            5.3. Произведение не должно содержать заимствования, за исключением
            случаев, предусмотренных п. 5.1 Договора, не должно содержать
            сведения, порочащие честь, достоинство и деловую репутацию третьих
            лиц. Произведение не должно иным образом нарушать права и законные
            интересы третьих лиц. В случае предъявления указанными третьими
            лицами претензий и/или требований в адрес Приобретателя в отношении
            содержащихся в Произведении сведений Правообладатель обязуется нести
            ответственность по указанным требованиям, включая убытки и
            компенсации в полном объёме, в том числе в роли ответчика,
            руководствуясь гарантиями, представленными в настоящем пункте
            Договора.
          </li>
          <li>
            5.4. Правообладатель обязуется не предпринимать действий, которые
            могут воспрепятствовать Приобретателю в реализации переданных ему по
            настоящему Договору прав, в том числе обязуется не создавать
            самостоятельно и не давать разрешение третьим лицам на создание
            произведений с использованием элементов Произведения без заключения
            отдельного договора с Приобретателем как с новым правообладателем
            Произведения.
          </li>
          <li>
            5.5. Правообладатель подтверждает и гарантирует, что Произведение
            ранее нигде не публиковалось, не передавалось третьим лицам в
            пользование на основании лицензионного договора, исключительные
            права на Произведение на момент передачи Приобретателю, независимо
            от количества соавторов и объёма интеллектуального заимствования на
            момент передачи Произведения Приобретателю в полном объёме и
            безоговорочно принадлежат Правообладателю в силу закона или на
            основании договора о передаче исключительных прав, заключенного
            Автором с третьими лицами (соавторами) или в отношении каких-либо
            частей и/или элементов Произведения.
          </li>
          <li>
            5.6. Правообладатель обязуется Передать Приобретателю все права на
            все результаты оказанных услуг и права на составные части
            Произведения, полученные в рамках исполнения обязательств по
            настоящему Договору, до момента окончательных расчетов по настоящему
            Договору. Обязательство Приобретателя по оплате отчуждения
            исключительных прав на Произведение, указанное в Спецификации,
            является встречным по смыслу ст. 328 ГК РФ по отношению к
            обязательству Правообладателя по передаче Произведения Приобретателю
            в порядке, установленном настоящим Договором.
          </li>
        </ul>
      </div>
      <p class="page_counter">Страница 3 из 3</p>
    </div>
  </body>
</html>

  `;

  // Set the content of the page
  await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

  // Create the PDF, Puppeteer will automatically paginate if the content overflows
  await page.pdf({ path: contractPath, format: "A4" });

  await browser.close();

  return docname;
};
