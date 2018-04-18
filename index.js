const puppeteer = require('puppeteer');
const tripadvisor = require('./scrappers/tripadvisor');
const expedia = require('./scrappers/expedia');
const async = require('async');
const browser = require('./browser').browser;

const hoteles = [
  'PARADOR DE LAS CAÑADAS DEL TEIDE',
  'PARADOR DE ARCOS DE LA FRONTERA',
  'PARADOR DE BIELSA MONTE PERDIDO',
  'PARADOR DE CAZORLA EL ADELANTADO',
  'PARADOR DE CERVERA DE PISUERGA',
  'PARADOR DE FERROL',
  'PARADOR DE FUENTE DE - RIO DEVA',
  'PARADOR DE GREDOS',
  'PARADOR DE MANZANARES',
  'PARADOR DE MELILLA-D. PEDRO DE ESTOPIÑAN',
  'PARADOR DE OLITE - PRINCIPE DE VIANA',
  'PARADOR DE PUEBLA DE SANABRIA',
  'PARADOR DE SANTILLANA DEL MAR',
  'PARADOR DE LA SEU DURGELL',
  'PARADOR DE TERUEL',
  'PARADOR DE VERIN',
  'PARADOR FRAY BERNARDO DE FRESNEDA',
  'PARADOR DE AIGUABLAVA',
  'PARADOR DE ALARCON MARQUES DE VILLENA',
  'PARADOR DE ALBACETE',
  'PARADOR DE ALCAÑIZ LA CONCORDIA',
  'PARADOR DE ALMAGRO',
  'PARADOR DE ANTEQUERA',
  'PARADOR DE ARGÓMANIZ',
  'PARADOR DE ARTÍES DON GASPAR DE PORTOLÁ',
  'PARADOR DE AVILA - RAIMUNDO DE BORGOÑA',
  'PARADOR DE BAIONA CONDE DE GONDOMAR',
  'PARADOR DE BENAVENTE REY FERNANDO II',
  'PARADOR DE BENICARLO'
];

(async () => {
  await browser.startBrowser();

  async.mapLimit(
    hoteles,
    1,
    async hotel => {
      return {
        hotel,
        // tripadvisor: await tripadvisor.getData(hotel),
        expedia: await expedia.getData(hotel)
      };
    },
    async (err, results) => {
      if (err) throw err;
      // results is now an array of the response bodies
      console.log(results);
      await browser.closeBrowser();
    }
  );
})();
