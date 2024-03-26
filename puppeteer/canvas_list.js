const puppeteer = require('puppeteer');

async function monitorCanvasUsage(page) {
  await page.exposeFunction('logCanvasMethod', (methodName, args) => {
    console.log(`Canvas method '${methodName}' called with arguments:`, args);
  });

  await page.evaluate(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    
    HTMLCanvasElement.prototype.getContext = function (contextType, ...args) {
      window.logCanvasMethod('getContext', { contextType, args });
      return originalGetContext.apply(this, arguments);
    };
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://github.com/');

  await monitorCanvasUsage(page);

//   await page.waitFor('body'); 
})();
