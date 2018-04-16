const puppeteer = require('puppeteer');

class Browser {
  constructor() {
    this.browser = null;
    this.count = 0;
  }

  async startBrowser() {
    this.browser = await puppeteer.launch({ headless: false, slowMo: 30 });
    return this.browser;
  }

  async newPage() {
    this.count = this.count + 1;
    return await this.browser.newPage();
  }

  async close(page) {
    this.count = this.count - 1;
    await page.close();
    if (this.count == 0) {
      await this.closeBrowser;
    }
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
