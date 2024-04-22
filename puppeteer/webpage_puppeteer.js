/* eslint-disable no-restricted-globals,guard-for-in,no-restricted-syntax */
// the above disable eslint which in a normal production/dev environment would remain enabled.

const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');
const { FilterSet, Engine } = require('adblock-rs');
const { readFileSync } = require('fs');
const path = require('path');

const resources = [];
const functionCalls = [];

const createFilterEngine = () => {
  const easylistFilters = readFileSync(
    'easyprivacy.txt',
    { encoding: 'utf-8' },
  ).split('\n');
  const filterSet = new FilterSet();
  filterSet.addFilters(easylistFilters);
  return new Engine(filterSet, true);
};

const logFingerPrint = async (page) => {
  page.exposeFunction('logPropertyAttempt', (name) => {
    functionCalls.push(name);
  });

  // eslint-disable-next no-restricted-syntax
  page.evaluateOnNewDocument(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.getContext = (args) => {
      const [contextType] = args;
      if (contextType === 'webgl' || contextType === 'experimental-webgl') {
        window.logPropertyAttempt('HTMLCanvasElement.getContext:webgl');
      } else {
        window.logPropertyAttempt('HTMLCanvasElement.getContext');
      }
      return originalGetContext.apply(this, args);
    };
    HTMLCanvasElement.prototype.toDataURL = (...args) => {
      console.log('Canvas fingerprinting attempt detected: toDataURL');
      window.logPropertyAttempt('HTMLCanvasElement.toDataURL');
      return originalToDataURL.apply(this, args);
    };

    // navigator
    for (const prop in navigator) {
      const originalProp = navigator[prop];
      if (typeof originalProp === 'function') {
        navigator[prop] = (...args) => {
          window.logPropertyAttempt(`navigator.${prop}`);
          return originalProp.apply(navigator, args);
        };
      } else {
        Object.defineProperty(navigator, prop, {
          get() {
            window.logPropertyAttempt(`navigator.${prop}`);
            return originalProp;
          },
        });
      }
    }

    // screen
    for (const prop in screen) {
      const originalProp = screen[prop];
      if (typeof originalProp === 'function') {
        screen[prop] = (...args) => {
          window.logPropertyAttempt(`screen.${prop}`);
          return originalProp.apply(screen, args);
        };
      } else {
        Object.defineProperty(screen, prop, {
          get() {
            window.logPropertyAttempt(`screen.${prop}`);
            return originalProp;
          },
        });
      }
    }

    // AudioContext
    for (const prop in AudioContext.prototype) {
      const originalProp = AudioContext.prototype[prop];
      if (typeof originalProp === 'function') {
        AudioContext.prototype[prop] = (...args) => {
          window.logPropertyAttempt(`AudioContext.prototype.${prop}`);
          return originalProp.apply(AudioContext.prototype, args);
        };
      } else {
        Object.defineProperty(AudioContext.prototype, prop, {
          get() {
            window.logPropertyAttempt(`AudioContext.prototype.${prop}`);
            return originalProp;
          },
        });
      }
    }
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
      // dropping post data since we will not be doing any furthur analysis on it
      // also risks of exposing pii when publish data
      // postData: formatPostData(request.postData()) || null,
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
      path.join(outputDir, 'functionCalls.json'),
      JSON.stringify([...new Set(functionCalls)], null, 2),
    ),
  ]).then(
    () => process.exit(0),
  );
};

(async () => {
  const filterEngine = createFilterEngine();
  const browser = await puppeteer.launch({ headless: false });
  const [defaultPage] = await browser.pages();

  browser.on('targetcreated', async (target) => {
    if (target.type() === 'page') {
      const newPage = await target.page();
      newPage.setViewport({ width: 1366, height: 768 });
      setupRequestInterception(newPage, filterEngine);
      logFingerPrint(newPage);
    }
  });

  const firstTab = await browser.newPage();
  defaultPage.close();

  const url = process.argv[2];
  const outputDir = process.argv[3] || 'Data';

  if (url) {
    await firstTab.goto(url);
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
