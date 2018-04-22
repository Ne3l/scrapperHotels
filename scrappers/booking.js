const puppeteer = require('puppeteer');
const { browser, cleanPreposiciones } = require('../utils');

const SELECTORS = {
  INPUT_HOTEL: '#ss',
  SUGGESTED_HOTEL:
    '#frm ul.c-autocomplete__list.sb-autocomplete__list.sb-autocomplete__list-with_photos.-visible > li:nth-child(1)',

  SELECT_ADULTS: '#group_adults',
  INPUT_DATE_FROM_DAY: '#frm input[name="checkin_monthday"]',
  INPUT_DATE_FROM_MONTH: '#frm input[name="checkin_month"]',
  INPUT_DATE_FROM_YEAR: '#frm input[name="checkin_year"]',
  INPUT_DATE_TO_DAY: '#frm input[name="checkout_monthday"]',
  INPUT_DATE_TO_MONTH: '#frm input[name="checkout_month"]',
  INPUT_DATE_TO_YEAR: '#frm input[name="checkout_year"]',
  BUTTON_SEARCH:
    '#frm > div.sb-searchbox__row.u-clearfix.-submit.sb-searchbox__footer.-last > div.sb-searchbox-submit-col.-submit-button > button',

  PRICE: 'article[data-automation="pinnedHotel"] .actualPrice',
  NUMBER_REVIEWS:
    'article[data-automation="pinnedHotel"] .hotelSearchResultReviewTotal'
};

const getData = async hotel => {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.resourceType() === 'image') request.abort();
    else request.continue();
  });

  await page.goto('https://www.booking.com');

  let puntuacion;
  let precio;

  try {
    const input = await page.$(SELECTORS.INPUT_HOTEL);

    await page.click(SELECTORS.BUTTON_SEARCH);

    await input.click();
    await input.type(cleanPreposiciones(hotel));

    await page.waitForSelector(SELECTORS.SUGGESTED_HOTEL);
    await page.click(SELECTORS.SUGGESTED_HOTEL);

    await page.evaluate(
      sel => (document.querySelector(sel).value = '01'),
      SELECTORS.INPUT_DATE_FROM_DAY
    );

    await page.evaluate(
      sel => (document.querySelector(sel).value = '10'),
      SELECTORS.INPUT_DATE_FROM_MONTH
    );

    await page.evaluate(
      sel => (document.querySelector(sel).value = '2018'),
      SELECTORS.INPUT_DATE_FROM_YEAR
    );

    await page.evaluate(
      sel => (document.querySelector(sel).value = '02'),
      SELECTORS.INPUT_DATE_TO_DAY
    );

    await page.evaluate(
      sel => (document.querySelector(sel).value = '10'),
      SELECTORS.INPUT_DATE_TO_MONTH
    );

    await page.evaluate(sel => {
      return (document.querySelector(sel).value = '2018');
    }, SELECTORS.INPUT_DATE_TO_YEAR);

    await page.evaluate(
      sel => (document.querySelector(sel).value = '1'),
      SELECTORS.SELECT_ADULTS
    );

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click(SELECTORS.BUTTON_SEARCH)
    ]);

    await page.waitForSelector('.overallRating');

    puntuacion = await page.evaluate(sel => {
      return document.querySelector('.overallRating').innerText;
    });

    await page.waitForSelector('.meta_inner .price');

    precio = await page.evaluate(sel => {
      return parseInt(
        Array.from(document.querySelectorAll('.meta_inner .price'))
          .filter(e => e.innerText)
          .sort(
            (a, b) => parseInt(a.innerText, 10) - parseInt(b.innerText, 10)
          )[0].innerText,
        10
      );
    });
  } catch (e) {
    console.log(e);
    await page.screenshot({ path: `./errors/${hotel}.png` });
  } finally {
    await browser.closePage(page);
  }

  return {
    puntuacion,
    precio
  };
};

module.exports = {
  getData
};
