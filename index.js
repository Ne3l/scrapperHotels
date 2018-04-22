const puppeteer = require('puppeteer');
const { tripadvisor, expedia, booking } = require('./scrappers');
const async = require('async');
const { browser, formatOutputCSV } = require('./utils');
const fs = require('fs');

const hoteles = [
  'PARADOR DE LAS CAÑADAS DEL TEIDE',
  'PARADOR DE ARCOS DE LA FRONTERA',
  'PARADOR DE BIELSA MONTE PERDIDO',
  'PARADOR DE CAZORLA EL ADELANTADO',
  'PARADOR DE CERVERA DE PISUERGA',
  'PARADOR DE FERROL',
  'PARADOR DE FUENTE DE - RIO DEVA',
  'PARADOR DE GREDOS',
  'PARADOR DE MANZANARES'
];

(async () => {
  // const hoteles = fs
  //   .readFileSync('hoteles.csv', { encoding: 'utf8' })
  //   .split(',');

  await browser.startBrowser();

  async.mapLimit(
    hoteles,
    1,
    async hotel => {
      return {
        hotel,
        // tripadvisor: await tripadvisor.getData(hotel),
        // expedia: await expedia.getData(hotel),
        booking: await booking.getData(hotel)
      };
    },
    async (err, results) => {
      if (err) throw err;
      // results is now an array of the response bodies
      console.log(results);
      const stringOutput = results
        .map(e => {
          return `${e.hotel},${formatOutputCSV(
            e.booking.precio
          )},${formatOutputCSV(e.booking.numReviews)}`;
        })
        .join('\n');

      fs.writeFileSync('output.csv', stringOutput);

      await browser.closeBrowser();
    }
  );
})();
