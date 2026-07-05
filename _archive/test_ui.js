const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    // Ignore some common warnings
    if (!msg.text().includes('Password field is not contained in a form')) {
        console.log('PAGE LOG:', msg.text());
    }
  });
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:3000/admin.html');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Admin Page Checked.');
  
  await page.goto('http://localhost:3000/collaborator.html');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Collaborator Page Checked.');
  
  await browser.close();
})();
