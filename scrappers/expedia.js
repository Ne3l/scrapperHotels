const puppeteer = require('puppeteer');
const { browser, cleanPreposiciones } = require('../utils');

const SELECTORS = {
  TAB_HOTEL: '#tab-hotel-tab-hp',
  INPUT_HOTEL: '#hotel-destination-hp-hotel',
  SELECT_ADULTS: '#hotel-1-adults-hp-hotel',
  INPUT_DATE_FROM: '#hotel-checkin-hp-hotel',
  INPUT_DATE_TO: '#hotel-checkout-hp-hotel',
  BUTTON_SEARCH: '#gcw-hotel-form-hp-hotel button.gcw-submit',
  SUGGESTED_HOTEL: '#typeaheadDataPlain .results-item',
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

  await page.goto('https://www.expedia.es/');

  let numReviews;
  let precio;

  try {
    await page.click(SELECTORS.TAB_HOTEL);

    const input = await page.$(SELECTORS.INPUT_HOTEL);
    await input.click();
    await input.type(cleanPreposiciones(hotel));

    await page.waitForSelector(SELECTORS.SUGGESTED_HOTEL, { timeout: 5000 });
    await page.click(SELECTORS.SUGGESTED_HOTEL);

    await page.evaluate(sel => {
      return (document.querySelector(sel).value = '01/10/2018');
    }, SELECTORS.INPUT_DATE_FROM);

    await page.evaluate(sel => {
      return (document.querySelector(sel).value = '02/10/2018');
    }, SELECTORS.INPUT_DATE_TO);

    await page.evaluate(sel => {
      return (document.querySelector(sel).value = '1');
    }, SELECTORS.SELECT_ADULTS);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click(SELECTORS.BUTTON_SEARCH)
    ]);

    precio = await page.evaluate(
      sel => parseInt(document.querySelector(sel).innerText, 10),
      SELECTORS.PRICE
    );

    numReviews = await page.evaluate(
      sel => document.querySelector(sel).innerText.match(/\d+/)[0],
      SELECTORS.NUMBER_REVIEWS
    );
  } catch (e) {
    console.log(e);
    await page.screenshot({ path: `./errors/${hotel}.png` });
  } finally {
    await browser.closePage(page);
  }

  return {
    precio,
    numReviews
  };
};

module.exports = {
  getData
};
