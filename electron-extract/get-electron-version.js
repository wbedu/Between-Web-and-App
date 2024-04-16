const puppeteer = require('puppeteer');
const { exec, execSync} = require('child_process');
const fs = require('fs');
const axios = require('axios');

const setupRequestInterception = async (page) => {
  await page.setRequestInterception(true);

  page.on('request', (request) => {
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
    //   const newPage = await target.page();
      if (newPage) {
        const userAgent = await newPage.evaluate(() => navigator.userAgent);
        // console.log(`User Agent: ${userAgent}`);
        const electronVersion = userAgent.match(/Electron\/([\d.]+)/) ? userAgent.match(/Electron\/([\d.]+)/)[1] : 'Electron version not found';
        console.log(`Electron Version: ${electronVersion}`);
      }
    }
  });

  const pages = await browser.pages();

  pages.forEach(async (page) => {
    // console.log(page);
    const userAgent = await page.evaluate(() => navigator.userAgent);
    // console.log(`User Agent: ${userAgent}`);
    const electronVersion = userAgent.match(/Electron\/([\d.]+)/) ? userAgent.match(/Electron\/([\d.]+)/)[1] : 'Electron version not found';
    console.log(`Electron Version: ${electronVersion}`);
  });

})();
