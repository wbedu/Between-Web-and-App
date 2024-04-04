const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');
const { FilterSet, Engine } = require('adblock-rs');
const { readFileSync } = require('fs');
const { url } = require('inspector');

const resources = [];
const easylistFilters = readFileSync(
  'easyprivacy.txt',
  { encoding: 'utf-8' },
).split('\n');

const filterSet = new FilterSet();
filterSet.addFilters(easylistFilters);
const filterEngine = new Engine(filterSet, true);

async function monitorCanvasUsage(page) {
  await page.exposeFunction('logCanvasMethod', (methodName, args) => {
    console.log(`Canvas method '${methodName}' called with arguments:`, args);
  });

  await page.evaluate(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.getContext = (contextType, ...args) => {
      window.logCanvasMethod('getContext', { contextType, args });
      return originalGetContext.apply(this, ...args);
    };
  });
}

const setupRequestInterception = async (page) => {
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const data = {
      pageUrl: page.url(),
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData() || null,
    };

    try {
      if (!data.url.startsWith('data:')) {
        const { matched } = filterEngine.check(data.url, data.pageUrl, 'fetch', true);
        if (matched) {
          resources.push(data);
        }
        console.info(`${matched ? 'blocked' : 'allowed'} ${data.url}`)
      }
    } catch (e) {
      console.error(e);
    }
    request.continue();
  });
};

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const [defaultPage] = await browser.pages();
  setupRequestInterception(defaultPage);
  monitorCanvasUsage(defaultPage);

  browser.on('targetcreated', async (target) => {
    if (target.type() === 'page') {
      const newPage = await target.page();
      newPage.setViewport({ width: 1366, height: 768 });
      setupRequestInterception(newPage);
      monitorCanvasUsage(newPage);
    }
  });

  const url = process.argv[2];
  const outputFilename = process.argv[3] || 'output.json';

  if (url) {
    await defaultPage.goto(url);
  } else {
    browser.close();
    console.error(new Error('url was not provided'));
    process.abort();
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Press Enter to close:', async () => {
    browser.close();
    const fileContent = JSON.stringify(resources);
    console.log(`writting resources to ${outputFilename}`);
    fs.writeFileSync(outputFilename, fileContent, 'utf-8');
    process.exit(0);
  });
})();
