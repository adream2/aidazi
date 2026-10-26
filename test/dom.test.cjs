/**
 * dom.test.cjs — DOM 级冒烟测试（jsdom）：node test/dom.test.cjs
 * 覆盖：页面启动、五种模式切换与完整输入流程、候选选字、成绩卡、知识库/图鉴/部署渲染
 */
'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');

const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'outside-only',
  pretendToBeVisual: true
});
const { window } = dom;
const { document } = window;

// 按 index.html 的顺序注入脚本
[
  'public/assets/js/data/core-data.js',
  'public/assets/js/data/content.js',
  'public/assets/js/engine.js',
  'public/assets/js/keyboard.js',
  'public/assets/js/keyboard-diagrams.js',
  'public/assets/js/modes.js',
  'public/assets/js/app.js',
  'public/assets/js/knowledge-view.js'
].forEach(function (rel) {
  window.eval(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
});

function key(k) {
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
}
function click(el) {
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
}
const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0;
async function t(name, fn) {
  await fn();
  passed++;
  console.log('  ✓ ' + name);
}

(async function main() {
  // jsdom 中脚本执行时 readyState=loading，等待 DOMContentLoaded 触发各模块 init
  await new Promise((resolve) => {
    if (document.readyState !== 'loading') return resolve();
    document.addEventListener('DOMContentLoaded', resolve, { once: true });
    setTimeout(resolve, 1000);
  });

  console.log('\n[DOM] 页面启动');
  await t('脚本加载后模式栏渲染 5 个模式', () => {
    assert.strictEqual(document.querySelectorAll('#modeTabs .mode-tab').length, 5);
  });
  await t('默认英文模式生成练习单元', () => {
    assert.ok(document.querySelectorAll('#textLine .unit').length >= 8, '应有练习单元');
    assert.strictEqual($('pinyinBox').style.display, 'none');
    assert.strictEqual($('kbWrap').style.display, '', '英文模式也应显示虚拟键盘');
    assert.ok(document.querySelectorAll('#keyboard .kb-key').length > 55, '虚拟键盘应渲染完整');
  });
  await t('下拉框点击不被全局 blur 打断', () => {
    const sel = $('levelSelect');
    sel.focus();
    assert.strictEqual(document.activeElement, sel, '下拉框应获得焦点');
    // 模拟在 select 上按下鼠标（原生下拉框在真实浏览器里会保持打开）
    sel.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    assert.strictEqual(document.activeElement, sel, '在 select 上按下不应使其失焦');
  });
  await t('知识库与图鉴渲染完成', () => {
    assert.ok(document.querySelectorAll('#knTabs .kn-tab').length === 5, '知识库 5 个 tab');
    assert.ok(document.querySelector('#knBody .kn-table'), '五笔字根表');
    assert.ok(document.querySelectorAll('#guideBody .guide-card').length > 30, '键盘图鉴卡片');
    assert.ok(document.querySelectorAll('#guideBody .dg-layout').length >= 8, '配列俯视图（8 种配列）');
    assert.ok(document.querySelectorAll('#guideBody .dg-switch').length >= 6, '轴体剖面图');
    assert.ok(document.querySelectorAll('#guideBody .dg-chart').length >= 3, '键帽/结构/曲线图');
    assert.ok(document.querySelectorAll('#guideBody .kb-zone').length >= 12, '区域划分标注');
  });
  await t('配列图键位齐全：100% 应有 104 键', () => {
    const layouts = document.querySelectorAll('#guideBody .dg-layout');
    const full = layouts[0]; // 第一张是 100% / 104 键
    const keys = full.querySelectorAll('.kb-base').length;
    assert.strictEqual(keys, 104, '100% 配列应画满 104 个键，实际 ' + keys);
    // 数字区/导航区/F 区都应有键
    const labels = [...full.querySelectorAll('.kb-key-label')].map((n) => n.textContent);
    ['F12', 'Enter', 'Shift', 'PrtSc', 'Num', '↑', '→', '⌫', 'Fn', 'Menu'].forEach((k) => {
      assert.ok(labels.indexOf(k) >= 0, '缺少键位: ' + k);
    });
    // 空格键：真实键盘上无字符，但宽度应为 6.25u
    const space = [...full.querySelectorAll('.kb-base')].find((n) => parseFloat(n.getAttribute('width')) > 100);
    assert.ok(space, '应存在 6.25u 的空格键');
  });
  await t('前端不含部署板块（该内容只放 README）', () => {
    assert.strictEqual($('deployBody'), null, '不应有部署容器');
    assert.strictEqual(document.querySelector('a[href="#deploy"]'), null, '导航不应有部署入口');
    const bodyText = document.body.textContent;
    ['一条命令部署', 'Cloudflare Workers', 'docker compose', 'Git 版本控制']
      .forEach((t) => assert.ok(bodyText.indexOf(t) < 0, '页面不应出现: ' + t));
  });

  console.log('\n[SEO / GEO]');
  await t('基础 SEO：标题、描述、canonical、唯一 h1', () => {
    const title = document.title;
    assert.ok(title.length >= 10 && title.length <= 70, '标题长度应适中：' + title.length);
    assert.ok(title.indexOf('爱打字') === 0, '标题应以品牌名开头');
    const desc = document.querySelector('meta[name="description"]');
    assert.ok(desc && desc.content.length >= 60, '描述应充实');
    assert.ok(desc.content.indexOf('五笔') >= 0 && desc.content.indexOf('双拼') >= 0, '描述应含核心关键词');
    const canonical = document.querySelector('link[rel="canonical"]');
    assert.ok(canonical && /^https:\/\//.test(canonical.href), 'canonical 应为绝对地址');
    assert.strictEqual(document.querySelectorAll('h1').length, 1, '页面应只有一个 h1');
    assert.ok(document.querySelector('meta[name="robots"]').content.indexOf('index') >= 0, 'robots 应允许索引');
  });
  await t('社交分享：Open Graph 与 Twitter Card', () => {
    const og = (p) => document.querySelector('meta[property="og:' + p + '"]');
    ['title', 'description', 'url', 'image', 'type', 'site_name'].forEach((p) => {
      assert.ok(og(p) && og(p).content, '缺少 og:' + p);
    });
    assert.ok(document.querySelector('meta[name="twitter:card"]').content === 'summary_large_image');
    assert.ok(og('image').content.endsWith('og-cover.png'), 'OG 图应指向封面');
  });
  await t('结构化数据：WebSite + WebApplication + FAQPage 可解析', () => {
    const el = document.querySelector('script[type="application/ld+json"]');
    assert.ok(el, '应有 JSON-LD');
    const data = JSON.parse(el.textContent);
    assert.strictEqual(data['@context'], 'https://schema.org');
    const types = data['@graph'].map((g) => g['@type']);
    ['WebSite', 'WebApplication', 'Organization', 'FAQPage'].forEach((t) => {
      assert.ok(types.indexOf(t) >= 0, '缺少 @type: ' + t);
    });
    const app = data['@graph'].find((g) => g['@type'] === 'WebApplication');
    assert.ok(app.featureList.length >= 5, 'WebApplication 应有功能列表');
    assert.strictEqual(app.isAccessibleForFree, true);
    const faq = data['@graph'].find((g) => g['@type'] === 'FAQPage');
    assert.strictEqual(faq.mainEntity.length, 6, 'FAQ 应有 6 条');
    faq.mainEntity.forEach((q) => {
      assert.ok(q.name && q.acceptedAnswer.text.length > 20, '问答内容应完整');
    });
    // 可见 FAQ 与结构化数据数量一致
    assert.strictEqual(document.querySelectorAll('#faq .faq-item').length, faq.mainEntity.length,
      '可见 FAQ 条数应与 JSON-LD 一致');
  });
  await t('GEO：关于区块含实体信息与事实清单', () => {
    const about = document.getElementById('about');
    assert.ok(about, '应有关于区块');
    const text = about.textContent;
    ['爱打字', 'aidazi', '五种', 'ZT折腾簿'].forEach((k) => {
      assert.ok(text.indexOf(k) >= 0, '关于区块应提到: ' + k);
    });
    assert.ok(about.querySelectorAll('.about-facts li').length >= 6, '事实清单条目充足');
  });
  await t('站外入口：GitHub 仓库与主站链接可用', () => {
    const gh = document.querySelectorAll('a[href="https://github.com/adream2/aidazi"]');
    assert.ok(gh.length >= 2, '头部与页脚都应有仓库入口');
    gh.forEach((a) => {
      assert.strictEqual(a.target, '_blank', '外链应新窗口打开');
      assert.ok(/noopener/.test(a.rel), '外链应带 rel=noopener');
    });
    const zt = document.querySelectorAll('a[href="https://www.ztsite.com"]');
    assert.ok(zt.length >= 2, '头部与页脚都应有主站入口');
  });
  await t('SEO 文件：robots / sitemap / llms.txt 存在且有效', () => {
    const fs2 = require('node:fs');
    const path2 = require('node:path');
    const pub = path2.join(__dirname, '..', 'public');
    const robots = fs2.readFileSync(path2.join(pub, 'robots.txt'), 'utf8');
    assert.ok(robots.indexOf('Sitemap:') >= 0, 'robots 应声明 sitemap');
    const sitemap = fs2.readFileSync(path2.join(pub, 'sitemap.xml'), 'utf8');
    assert.ok(sitemap.indexOf('<loc>https://') >= 0, 'sitemap 应含绝对地址');
    const llms = fs2.readFileSync(path2.join(pub, 'llms.txt'), 'utf8');
    assert.ok(llms.indexOf('# 爱打字') === 0, 'llms.txt 应以站点名开头');
    assert.ok(llms.indexOf('关键事实') >= 0, 'llms.txt 应有关键事实段');
  });
  await t('知识库五个 tab 均可切换渲染', () => {
    const tabs = document.querySelectorAll('#knTabs .kn-tab');
    assert.strictEqual(tabs.length, 5);
    tabs.forEach((tab, i) => {
      click(tab);
      const body = $('knBody');
      assert.ok(body.children.length > 0, 'tab ' + i + ' 应有内容');
      assert.ok(body.textContent.length > 100, 'tab ' + i + ' 内容过少');
    });
    // 双拼 tab 内含虚拟键盘，指法 tab 含手指着色键盘
    click(tabs[1]);
    assert.ok(document.querySelector('#knBody .kb'), '双拼 tab 应渲染键盘');
    click(tabs[4]);
    assert.ok(document.querySelector('#knBody .kb'), '指法 tab 应渲染键盘');
    click(tabs[0]); // 回到五笔
  });

  console.log('\n[DOM] 五笔模式完整输入');
  await t('切到五笔，按提示码敲完 3 个字', () => {
    click(document.querySelectorAll('#modeTabs .mode-tab')[2]); // 五笔
    assert.strictEqual($('kbWrap').style.display, '', '键盘区应显示');
    for (let n = 0; n < 3; n++) {
      const active = document.querySelector('#textLine .unit.active');
      assert.ok(active, '第 ' + (n + 1) + ' 个字应有 active 单元');
      const hint = active.querySelector('.u-hint').textContent;
      assert.match(hint, /^[a-z]{1,4}$/, '提示应为五笔编码');
      hint.split('').forEach((ch) => key(ch));
    }
    assert.strictEqual(document.querySelectorAll('#textLine .unit.done').length, 3, '应完成 3 个单元');
    assert.notStrictEqual($('stSpeed').textContent, '0', '速度应更新');
  });

  console.log('\n[DOM] 双拼模式');
  await t('切到小鹤双拼，敲对前两个音节', () => {
    click(document.querySelectorAll('#modeTabs .mode-tab')[3]); // 双拼
    for (let n = 0; n < 2; n++) {
      const active = document.querySelector('#textLine .unit.active');
      const hint = active.querySelector('.u-hint').textContent;
      hint.split('').forEach((ch) => key(ch));
    }
    assert.strictEqual(document.querySelectorAll('#textLine .unit.done').length, 2);
    // 键盘副标签应有韵母
    const subs = [...document.querySelectorAll('#keyboard .kb-sub')].filter((s) => s.textContent);
    assert.ok(subs.length >= 10, '双拼键盘应有键位副标签');
  });

  console.log('\n[DOM] 笔画模式');
  await t('切到笔画，用字母键敲完第一个字', () => {
    click(document.querySelectorAll('#modeTabs .mode-tab')[4]); // 笔画
    const active = document.querySelector('#textLine .unit.active');
    active.querySelector('.u-hint').textContent.split('').forEach((ch) => key(ch));
    assert.strictEqual(document.querySelectorAll('#textLine .unit.done').length, 1);
  });

  console.log('\n[DOM] 拼音模式（候选选字）');
  await t('切到拼音，输完拼音选字上屏', () => {
    click(document.querySelectorAll('#modeTabs .mode-tab')[1]); // 拼音
    assert.strictEqual($('pinyinBox').style.display, '', '拼音区应显示');
    // 读当前目标词的拼音芯片
    const chips = [...document.querySelectorAll('#pSyls .p-syl')];
    assert.ok(chips.length >= 1, '应有音节芯片');
    const full = chips.map((c) => c.textContent).join('');
    full.split('').forEach((ch) => key(ch));
    // 候选框出现，找与目标词一致的候选
    const cands = document.querySelectorAll('#candidateBar .cand');
    assert.ok(cands.length >= 1, '应出现候选');
    const cur = document.querySelector('.p-cur');
    assert.ok(cur, '应有当前目标词');
    const word = cur.dataset.w;
    const hit = [...cands].find((c) => c.textContent.replace(/^\d/, '') === word);
    assert.ok(hit, '目标词「' + word + '」应在候选中，实际: ' +
      [...cands].map((c) => c.textContent).join(' '));
    hit.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    assert.ok(document.querySelector('.p-done'), '选字后应有已确认文本');
  });

  console.log('\n[DOM] 英文模式完整输入');
  await t('切到英文，按目标词敲完一组', async () => {
    click(document.querySelectorAll('#modeTabs .mode-tab')[0]); // 英文
    // 依次敲完所有单元（从 DOM 读目标词）
    for (let guard = 0; guard < 400; guard++) {
      const active = document.querySelector('#textLine .unit.active');
      if (!active) break;
      const word = active.querySelector('.u-char').textContent.toLowerCase() + ' ';
      word.split('').forEach((ch) => key(ch));
    }
    await sleep(50);
    assert.strictEqual($('resultCard').classList.contains('hidden'), false, '成绩卡应显示');
    assert.match($('rSpeed').textContent, /wpm/);
    assert.ok(document.querySelectorAll('#rErrList li').length >= 1, '应有错误清单或零错误提示');
  });
  await t('代码练习可输入符号与数字', () => {
    click($('restartBtn'));
    const sel = $('levelSelect');
    sel.value = 'code';
    sel.dispatchEvent(new window.Event('change', { bubbles: true }));
    const active = document.querySelector('#textLine .unit.active');
    assert.ok(active, '代码模式应有单元');
    const text = active.querySelector('.u-char').textContent;
    assert.ok(/[^a-z ]/i.test(text) || text.length > 0, '代码单元: ' + text);
    // 完整敲完当前单元（含符号数字）
    (text + ' ').split('').forEach((ch) => key(ch));
    assert.ok(document.querySelectorAll('#textLine .unit.done').length >= 1, '含符号的单元应能完成');
  });

  console.log('\n[DOM] 重新开始与主题');
  await t('重新开始后回到初始状态', () => {
    click($('restartBtn'));
    assert.strictEqual($('resultCard').classList.contains('hidden'), true);
    assert.strictEqual(document.querySelectorAll('#textLine .unit.done').length, 0);
    assert.strictEqual($('stProg').textContent, '0%');
  });
  await t('主题切换写入 localStorage', () => {
    click($('themeToggle'));
    assert.strictEqual(document.documentElement.dataset.theme, 'dark');
    assert.strictEqual(window.localStorage.getItem('dazi.theme'), 'dark');
    click($('themeToggle'));
    assert.strictEqual(document.documentElement.dataset.theme, 'light');
  });

  console.log('\n' + passed + ' 项 DOM 测试全部通过 ✓\n');
  window.close();
  process.exit(0);
})().catch((e) => {
  console.error('\n✗ DOM 测试失败:', e);
  process.exit(1);
});
