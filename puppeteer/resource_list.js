const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');
const { FilterSet, Engine } = require('adblock-rs');
const { readFileSync } = require('fs');
const path = require('path');

const resources = [];
const canvasUse = {};

const createFilterEngine = () => {
  const easylistFilters = readFileSync(
    'easyprivacy.txt',
    { encoding: 'utf-8' },
  ).split('\n');
  const filterSet = new FilterSet();
  filterSet.addFilters(easylistFilters);
  return new Engine(filterSet, true);
};

const monitorCanvasUsage = async (page) => {
  await page.exposeFunction('incrementCanvas', (field) => {
    console.log(field, canvasUse);
    canvasUse[field] += 1;
  });

  await page.evaluateOnNewDocument(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.getContext = (...args) => {
      window.incrementCanvas('getContext');
      return originalGetContext.apply(this, args);
    };
    HTMLCanvasElement.prototype.toDataURL = (...args) => {
      console.log('Canvas fingerprinting attempt detected: toDataURL');
      window.incrementCanvas('toDataURL');
      return originalToDataURL.apply(this, args);
    };
  });
};

const formatPostData = (data) => {
  try {
    const jsonDump = JSON.parse(data);
    // return as json object
    return jsonDump;
  } catch (e) {
    // return unmodified
    return data;
  }
};
const setupRequestInterception = async (page, filterEngine) => {
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const data = {
      pageUrl: page.url(),
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: formatPostData(request.postData()) || null,
    };

    try {
      if (!data.url.startsWith('data:')) {
        const { matched } = filterEngine.check(data.url, data.pageUrl, 'fetch', true);
        if (matched) {
          resources.push(data);
        }
      }
    } catch (e) {
      console.error(e);
    }
    request.continue();
  });
};

const asyncFileWrite = async (filename, data, options = { encoding: 'utf-8' }) => (
  new Promise((resolve, reject) => {
    fs.writeFile(filename, data, options, (error) => (error ? reject(error) : resolve()));
  }));

const writeOutput = (outputDir) => {
  try {
    fs.mkdirSync(outputDir, { recursive: true });
  } catch (e) {
    // pass
  }
  console.log(`writting resources to ${outputDir}`);

  Promise.allSettled([
    asyncFileWrite(
      path.join(outputDir, 'resources.json'),
      JSON.stringify(resources, null, 2),
    ),
    asyncFileWrite(
      path.join(outputDir, 'canvas.json'),
      JSON.stringify(canvasUse, null, 2),
    ),
  ]).then(
    () => process.exit(0),
  );
};

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const [defaultPage] = await browser.pages();
  const filterEngine = createFilterEngine();
  setupRequestInterception(defaultPage, filterEngine);
  monitorCanvasUsage(defaultPage);

  browser.on('targetcreated', async (target) => {
    if (target.type() === 'page') {
      const newPage = await target.page();
      newPage.setViewport({ width: 1366, height: 768 });
      setupRequestInterception(newPage, filterEngine);
      monitorCanvasUsage(newPage);
    }
  });

  const url = process.argv[2];
  const outputDir = process.argv[3] || 'Data';

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
    writeOutput(outputDir);
  });
})();
