#!/usr/bin/env node
/**
 * gen-head.mjs — 把 site-config.js 里的 head 配置静态写入 index.html
 *
 * 为什么必须是静态写入：
 *   搜索引擎的站点验证爬虫**不执行 JavaScript**，靠 integrations.js 在浏览器里
 *   动态插 <meta> 是抓不到的。所以验证标签必须在 HTML 源码里，由本脚本生成。
 *
 * 用法：
 *   node scripts/gen-head.mjs           生成/更新注入区
 *   node scripts/gen-head.mjs --check   只校验是否与配置一致（不一致 exit 1，用于 CI）
 *
 * 注入区由 index.html 里的 head-inject 标记界定，标记之间的一切内容都会被覆盖，
 * 请只改 site-config.js，不要手改注入区。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CFG_FILE = path.join(ROOT, 'public/assets/js/site-config.js');
const HTML_FILE = path.join(ROOT, 'public/index.html');

const START = '<!-- head-inject:start -->';
const END = '<!-- head-inject:end -->';

/** 已知的搜索引擎 / 平台站点验证 meta：配置键 → meta name */
const PROVIDERS = [
  { key: 'google', name: 'google-site-verification', label: 'Google Search Console' },
  { key: 'bing', name: 'msvalidate.01', label: 'Bing Webmaster Tools' },
  { key: 'baidu', name: 'baidu-site-verification', label: '百度搜索资源平台' },
  { key: 'qihu360', name: '360-site-verification', label: '360 搜索站长平台' },
  { key: 'sogou', name: 'sogou_site_verification', label: '搜狗站长平台' },
  { key: 'yandex', name: 'yandex-verification', label: 'Yandex Webmaster' },
  { key: 'googleAds', name: 'google-adsense-account', label: 'Google AdSense 账号（ca-pub-…）' }
];

/** 读取 site-config.js（在沙箱里执行取 window.DAZI_CONFIG） */
function loadConfig() {
  const src = fs.readFileSync(CFG_FILE, 'utf8');
  const sandbox = { window: {} };
  // eslint-disable-next-line no-new-func
  new Function('window', src)(sandbox.window);
  return sandbox.window.DAZI_CONFIG || {};
}

function esc(v) {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** 生成注入区内部的 HTML（不含标记行） */
function buildBlock(cfg) {
  const head = cfg.head || {};
  const vf = head.verification || {};
  const lines = [];

  PROVIDERS.forEach((p) => {
    const v = (vf[p.key] || '').trim();
    if (!v) return;
    if (v.indexOf('<!--') >= 0 || v.indexOf('-->') >= 0) {
      throw new Error(`${p.label} 的验证码含有 HTML 注释符号，请检查：${v}`);
    }
    lines.push(`<meta name="${p.name}" content="${esc(v)}">`);
  });

  const custom = (head.customHtml || '').trim();
  if (custom) {
    if (custom.indexOf(START) >= 0 || custom.indexOf(END) >= 0) {
      throw new Error('head.customHtml 不能包含 head-inject 标记，否则会破坏注入区边界');
    }
    if (custom.indexOf('<!--') >= 0 || custom.indexOf('-->') >= 0) {
      throw new Error('head.customHtml 不能包含 HTML 注释标记（<!-- 或 --> ），会破坏注入区边界');
    }
    lines.push(...custom.split(/\r?\n/));
  }

  return lines;
}

function indent(lines, pad) {
  return lines.map((l) => (l ? pad + l : l));
}

function main() {
  const check = process.argv.includes('--check');
  const cfg = loadConfig();

  if (!fs.existsSync(HTML_FILE)) {
    console.error('✗ 找不到 ' + HTML_FILE);
    process.exit(1);
  }

  const raw = fs.readFileSync(HTML_FILE, 'utf8');
  const eol = raw.indexOf('\r\n') >= 0 ? '\r\n' : '\n';

  const i = raw.indexOf(START);
  const j = raw.indexOf(END);
  if (i < 0 || j < 0 || j < i) {
    console.error('✗ index.html 中找不到 head-inject 标记，请先手工加回：');
    console.error('    ' + START + ' ... ' + END);
    process.exit(1);
  }

  const inner = indent(buildBlock(cfg), '  ');
  const body = inner.length ? eol + inner.join(eol) + eol : eol;
  // 保留 END 标记前的行首缩进
  const endIndent = raw.slice(raw.lastIndexOf('\n', j) + 1, j);
  const next = raw.slice(0, i + START.length) + body + endIndent + raw.slice(j);

  if (next === raw) {
    console.log(check ? '✓ head 注入区与配置一致' : '✓ head 注入区无变化');
    return;
  }

  if (check) {
    console.error('✗ index.html 的 head 注入区与 site-config.js 不一致');
    console.error('  运行 npm run gen:head 重新生成后再提交');
    process.exit(1);
  }

  fs.writeFileSync(HTML_FILE, next);
  const n = inner.length;
  console.log(`✓ 已写入 index.html：${n} 行 head 注入内容` +
    (n ? '' : '（当前配置为空，注入区保持空块）'));
}

try {
  main();
} catch (e) {
  console.error('✗ ' + (e && e.message ? e.message : e));
  process.exit(1);
}
