const puppeteer = require('puppeteer');
const utils = require('../utils');

const SELECTOR_INPUT = 'input.typeahead_input';
const SELECTOR_DATES = '.prw_datepickers_trip_search_dates';

const SELECTOR_AUTOCOMPLETE =
  '#BODY_BLOCK_JQUERY_REFLOW > div.ui_overlay.ui_modal.dt.no_x.no_padding.typeahead_overlay.prw_rup.prw_search_typeahead > div.body_text > div > ul > li.item.selected';

const SELECTOR_TITLE_DATE = '.dsdc-month-title';

const getData = async hotel => {
  const page = await utils.browser.newPage();
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
    const input = await page.$(SELECTOR_INPUT);
    await input.click();
    await input.type(utils.cleanPreposiciones(hotel));

    await page.waitForSelector(SELECTOR_AUTOCOMPLETE);
    await page.click(SELECTOR_AUTOCOMPLETE);

    const fechasContainer = await page.$(SELECTOR_DATES);
    await fechasContainer.click();

    let monthTitle = await page.evaluate(sel => {
      return document.querySelectorAll(sel)[0].innerText;
    }, SELECTOR_TITLE_DATE);

    while (monthTitle !== 'oct. de 2018') {
      monthTitle = await page.evaluate(sel => {
        return document.querySelectorAll(sel)[1].innerText;
      }, SELECTOR_TITLE_DATE);
      await page.click('.dsdc-next.single-chevron-right-circle');
    }

    await page.click('span[data-date="2018-9-1"]');
    await page.click('span[data-date="2018-9-2"]');

    await page.click('.prw_ibex_trip_search_rooms_guests');

    await page.click('.adults-picker .ui_icon.minus-circle');

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('#SUBMIT_HOTELS')
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
    await utils.browser.closePage(page);
  } catch (e) {
    console.log(e);
    await page.screenshot({ path: `./errors/${hotel}.png` });
  }

  return {
    puntuacion,
    precio
  };
};

module.exports = {
  getData
};
