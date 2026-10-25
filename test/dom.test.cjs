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
    assert.strictEqual($('kbWrap').style.display, 'none');
  });
  await t('知识库三个板块渲染完成', () => {
    assert.ok(document.querySelectorAll('#knTabs .kn-tab').length === 5, '知识库 5 个 tab');
    assert.ok(document.querySelector('#knBody .kn-table'), '五笔字根表');
    assert.ok(document.querySelectorAll('#guideBody .guide-card').length > 30, '键盘图鉴卡片');
    assert.ok(document.querySelectorAll('#deployBody .deploy-card').length === 3, '部署卡片');
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
    const target = window.DAZI_APP; // 会话在闭包内，从 DOM 推断
    // 读当前目标词的拼音芯片
    const chips = [...document.querySelectorAll('#pSyls .p-syl')];
    assert.ok(chips.length >= 1, '应有音节芯片');
    const full = chips.map((c) => c.textContent).join('');
    full.split('').forEach((ch) => key(ch));
    // 候选框出现，点第一个候选（应为目标词，词库候选词排在前）
    const cands = document.querySelectorAll('#candidateBar .cand');
    assert.ok(cands.length >= 1, '应出现候选');
    // 找到与目标词一致的候选并点击
    const cur = document.querySelector('.p-cur');
    assert.ok(cur, '应有当前目标词');
    let hit = false;
    cands.forEach((c) => { if (c.textContent.replace(/^\d/, '') === cur.textContent) hit = true; });
    assert.ok(hit, '目标词应在候选中: ' + cur.textContent);
    [...cands].find((c) => c.textContent.replace(/^\d/, '') === cur.textContent)
      .dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    assert.ok(document.querySelector('.p-done'), '选字后应有已确认文本');
  });

  console.log('\n[DOM] 完成与成绩');
  await t('英文模式刷完一组，成绩卡出现', async () => {
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
