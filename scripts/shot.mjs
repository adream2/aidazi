/**
 * shot.mjs — 视觉验证脚本（可选工具）：node scripts/shot.mjs
 * 需要临时安装 playwright（默认不随 npm install 安装，避免拖慢依赖）：
 *   npm i -D playwright && npx playwright install chromium
 * 对本地服务截图：浅色/深色 × 各模式，输出到 shots/，并报告页面运行时错误
 * 用法：先启动服务（node scripts/serve.mjs 8899），再运行本脚本
 * 注：本机有 Edge 时也可用 CDP 浏览器技能直接驱动，无需本脚本
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE || 'http://localhost:8899';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'shots');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

async function shot(name, fn) {
  await fn();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true });
  console.log('  ✓ shots/' + name + '.png');
}

await page.goto(BASE, { waitUntil: 'networkidle' });
console.log('截图：' + BASE);

await shot('01-light-english', async () => {});
await shot('02-light-wubi', async () => {
  await page.click('#modeTabs .mode-tab:nth-child(3)');
});
await shot('03-light-shuangpin', async () => {
  await page.click('#modeTabs .mode-tab:nth-child(4)');
});
await shot('04-light-knowledge', async () => {
  await page.click('a[href="#knowledge"]');
  await page.waitForTimeout(200);
});
await shot('05-light-guide', async () => {
  await page.click('a[href="#guide"]');
});
await shot('06-dark-english', async () => {
  await page.click('#themeToggle');
  await page.click('a[href="#practice"]');
  await page.click('#modeTabs .mode-tab:nth-child(1)');
});

await browser.close();

if (errors.length) {
  console.error('\n页面运行时错误:');
  errors.forEach((e) => console.error('  ' + e));
  process.exit(1);
}
console.log('\n无页面运行时错误 ✓');
