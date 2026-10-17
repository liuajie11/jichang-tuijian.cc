const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const pages = fs.readdirSync(root).filter((name) => name.endsWith('.html'));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const issues = [];

  for (const file of pages) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('console', (message) => {
      if (message.type() === 'error') issues.push(`${file}: console: ${message.text()}`);
    });
    page.on('pageerror', (error) => issues.push(`${file}: pageerror: ${error.message}`));
    await page.goto(`file:///${path.join(root, file).replace(/\\/g, '/')}`);
    const metrics = await page.evaluate(() => ({
      title: document.title,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      navLinks: document.querySelectorAll('.site-nav a').length,
    }));
    if (!metrics.title) issues.push(`${file}: missing title`);
    if (metrics.bodyWidth > metrics.viewportWidth + 1) issues.push(`${file}: horizontal overflow ${metrics.bodyWidth}px`);
    if (file !== '404.html' && metrics.navLinks !== 10) issues.push(`${file}: expected 10 navigation links, found ${metrics.navLinks}`);
    await page.close();
  }

  const previewDir = path.join(root, 'preview');
  fs.mkdirSync(previewDir, { recursive: true });

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await desktop.goto(`file:///${path.join(root, 'index.html').replace(/\\/g, '/')}`);
  await desktop.screenshot({ path: path.join(previewDir, 'home-desktop.png'), fullPage: true });
  await desktop.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto(`file:///${path.join(root, 'index.html').replace(/\\/g, '/')}`);
  await mobile.screenshot({ path: path.join(previewDir, 'home-mobile.png'), fullPage: true });
  await mobile.close();

  const category = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await category.goto(`file:///${path.join(root, 'recommend.html').replace(/\\/g, '/')}`);
  await category.screenshot({ path: path.join(previewDir, 'category-desktop.png'), fullPage: true });
  await category.close();

  await browser.close();
  console.log(JSON.stringify({ pagesChecked: pages.length, issues, previews: ['preview/home-desktop.png', 'preview/home-mobile.png', 'preview/category-desktop.png'] }, null, 2));
  if (issues.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
