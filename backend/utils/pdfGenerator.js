const puppeteer = require('puppeteer');

async function generatePdfFromHtml(html) {
  // Lanzamos un navegador headless
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Cargamos tu HTML
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Generamos el PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' }
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generatePdfFromHtml };
