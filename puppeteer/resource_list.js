const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');

const resources = [];

const setupRequestInterception = async (page) => {
    await page.setRequestInterception(true);
    
    page.on('request', request => {
        const requestData = {
            pageUrl: page.url(),
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            postData: request.postData() || null,
        }; 
        if (!request.url().startsWith('data:')) { // Ignore data URLs
            // console.log(requestData);
            resources.push(requestData);
        }
        request.continue();
    });
};

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage(); 
  await page.setViewport({ width: 1366, height: 768});


  await setupRequestInterception(page);
  const url = process.argv[2];
  const output_filename = process.argv[3];

  if(url) {
    await page.goto(url);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Press Enter to close:', async () => {
    const csvContent = `pageURL\trequestURL\tmethod\theaders\tpostData\n${resources.map(resource => `${resource.pageUrl}\t${resource.url}\t${JSON.stringify(resource.method)}\t${JSON.stringify(resource.headers)}\t${JSON.stringify(resource.postData)}`).join('\n')}`;
    fs.writeFileSync(output_filename, csvContent, 'utf-8');
    console.log('Resources written to resources.tsv');

    await browser.close();
    rl.close();
  });

})();
