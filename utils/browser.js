const puppeteer = require('puppeteer');

class Browser {
  async startBrowser() {
    this.browser = await puppeteer.launch({
      // devtools: true,
      headless: false,
      slowMo: 30
    });
    return this.browser;
  }

  async newPage() {
    return await this.browser.newPage();
  }

  async closePage(page) {
    await page.close();
  }

  async closeBrowser() {
    await this.browser.close();
    this.browser = null;
  }
}

const browser = new Browser();

module.exports = {
  browser
};
