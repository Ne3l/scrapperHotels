const puppeteer = require('puppeteer');
const { browser, cleanPreposiciones } = require('../utils');

const SELECTORS = {
  INPUT_HOTEL: 'input.typeahead_input',
  SUGGESTED_HOTEL:
    '#BODY_BLOCK_JQUERY_REFLOW > div.ui_overlay.ui_modal.dt.no_x.no_padding.typeahead_overlay.prw_rup.prw_search_typeahead > div.body_text > div > ul > li.item.selected',
  DATES: '.prw_datepickers_trip_search_dates',
  NEXT_MONTH: '.dsdc-next.single-chevron-right-circle',
  TITLE_DATE: '.dsdc-month-title',
  ADULTS: '.prw_ibex_trip_search_rooms_guests',
  ADULTS_MINUS: '.adults-picker .ui_icon.minus-circle',
  BUTTON_SEARCH: '#SUBMIT_HOTELS',
  PRICES: '.meta_inner .price',
  RATING: '.overallRating'
};

const getData = async hotel => {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.resourceType() === 'image') request.abort();
    else request.continue();
  });

  await page.goto('https://www.tripadvisor.es/');

  let puntuacion;
  let precio;

  try {
    const input = await page.$(SELECTORS.SELECTOR_INPUT);
    await input.click();
    await input.type(cleanPreposiciones(hotel));

    await page.waitForSelector(SELECTORS.SUGGESTED_HOTEL);
    await page.click(SELECTORS.SUGGESTED_HOTEL);

    const fechasContainer = await page.$(SELECTOR_DATES);
    await fechasContainer.click();

    let monthTitle = await page.evaluate(sel => {
      return document.querySelectorAll(sel)[0].innerText;
    }, SELECTORS.TITLE_DATE);

    while (monthTitle !== 'oct. de 2018') {
      monthTitle = await page.evaluate(sel => {
        return document.querySelectorAll(sel)[1].innerText;
      }, SELECTORS.TITLE_DATE);
      await page.click(SELECTORS.NEXT_MONTH);
    }

    await page.click('span[data-date="2018-9-1"]');
    await page.click('span[data-date="2018-9-2"]');

    await page.click(SELECTORS.ADULTS);

    await page.click(SELECTORS.ADULTS_MINUS);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click(SELECTORS.BUTTON_SEARCH)
    ]);

    await page.waitForSelector(SELECTORS.RATING);

    puntuacion = await page.evaluate(sel => {
      return document.querySelector(sel).innerText;
    }, SELECTORS.RATING);

    await page.waitForSelector(SELECTORS.PRICES);

    precio = await page.evaluate(sel => {
      return parseInt(
        Array.from(document.querySelectorAll(sel))
          .filter(e => e.innerText)
          .sort(
            (a, b) => parseInt(a.innerText, 10) - parseInt(b.innerText, 10)
          )[0].innerText,
        10
      );
    }, SELECTORS.PRICES);
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
