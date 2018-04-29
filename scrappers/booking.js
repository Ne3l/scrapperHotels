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

  PRICE:
    '#hotellist_inner > div.sr_item.sr_item_new.sr_item_default.sr_property_block.sr_flex_layout.sr_item--highlighted.with_dates.sr_item__menu > div.sr_item_content.sr_item_content_slider_wrapper > div.sr_rooms_table_block.clearfix > div > table > tbody > tr > td.roomPrice.sr_discount > div > strong',
  NUMBER_REVIEWS:
    '#hotellist_inner > div.sr_item.sr_item_new.sr_item_default.sr_property_block.sr_item_bs.sr_flex_layout.sr_item__menu > div.sr_item_content.sr_item_content_slider_wrapper > div.sr_property_block_main_row > div.sr_item_review_block > div > div > a:nth-child(1) > span.review-score-widget.review-score-widget__fabulous.review-score-widget__auto.review-score-widget__right.review-score-widget__20.js_sr_primary_review_widget.sr_main_score_badge.review-score-widget__highlight-review-count.sr_main_score_badge_force_blue > span.review-score-widget__body > span.review-score-widget__subtext',

  CLOSE_CALENDAR_ICON: '.c2-calendar-close-button-icon'
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

  let numReviews;
  let price;

  try {
    const input = await page.$(SELECTORS.INPUT_HOTEL);

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

    await page.click(SELECTORS.CLOSE_CALENDAR_ICON);

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

    price = await page.evaluate(
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
    numReviews,
    price
  };
};

module.exports = {
  getData
};
