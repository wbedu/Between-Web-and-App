const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');

const resources = [];

const output_filename = process.argv[3];

const stream = fs.createWriteStream(output_filename, { flags: 'a' });
stream.write('pageURL\trequestURL\tmethod\theaders\tpostData\n');

const setupRequestInterception = async (page) => {
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const requestData = {
      pageUrl: page.url(),
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData() || null,
    };
    if (!request.url().startsWith('data:')) { // Ignore data URLs
      resources.push(requestData);
      stream.write(`${page.url()}\t${request.url()}\t${JSON.stringify(requestData.method)}\t${JSON.stringify(requestData.headers)}\t${JSON.stringify(requestData.postData)}\n`);
    }
    request.continue();
  });
};

let app_executable = process.argv[2];
app_executable = app_executable.replace(' ', '\\ ');

// Open application with remote debugging port:
console.log(app_executable);
exec(`open ${app_executable} --args --remote-debugging-port=8315`);

const checkPort = async () => {
  try {
    await axios.get('http://localhost:8315/json/version');
    return true;
  } catch (error) {
    return false;
  }
};

const waitForPort = async () => {
  while (true) {
    const isAvailable = await checkPort();
    if (isAvailable) {
      console.log('Debugger is available.');
      break;
    } else {
      console.log('Waiting for debugger to launch...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

const getWebSocketURL = async () => {
  await waitForPort();

  const response = await axios.get('http://localhost:8315/json/version');

  const { webSocketDebuggerUrl } = response.data;
  if (!webSocketDebuggerUrl) {
    console.error('Something went wrong');
    process.exit(1);
  }
  return webSocketDebuggerUrl;
};

(async () => {
  const webSocketDebuggerUrl = await getWebSocketURL();

  const browser = await puppeteer.connect({
    browserWSEndpoint: webSocketDebuggerUrl,
  });

  browser.on('targetcreated', async (target) => {
    console.log(`New target of type: "${target.type()}"`);
    if (target.type() === 'page') {
      const newPage = await target.page();
      await setupRequestInterception(newPage);
    }
  });

  const pages = await browser.pages();

  // console.log(pages);

  pages.forEach(async (page) => {
    console.log(page);
    // await page.setViewport({ width: 1366, height: 768});
    await setupRequestInterception(page);
  });
  // const currentPage = pages[0];
  // // await currentPage.setViewport({ width: 1366, height: 768});

  // await setupRequestInterception(currentPage);

  // await currentPage.goto("https://example.com");
})();
