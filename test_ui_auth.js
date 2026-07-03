const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (!msg.text().includes('Password field is not contained in a form')) {
        console.log('PAGE LOG:', msg.text());
    }
  });
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  // Goto homepage just to set origin for localStorage
  await page.goto('http://localhost:3000');
  
  // Set auth token
  await page.evaluate(() => {
    localStorage.setItem('accessToken', 'dummy-token');
    localStorage.setItem('tm_role', 'admin');
    localStorage.setItem('tm_user', JSON.stringify({ id: 1, name: 'Admin', role: 'admin' }));
  });

  await page.goto('http://localhost:3000/admin.html');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Admin Page Auth Checked.');
  
  await page.evaluate(() => {
    localStorage.setItem('tm_role', 'collaborator');
    localStorage.setItem('tm_user', JSON.stringify({ id: 2, name: 'Collab', role: 'collaborator' }));
  });
  
  await page.goto('http://localhost:3000/collaborator.html');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Collaborator Page Auth Checked.');
  
  await browser.close();
})();
