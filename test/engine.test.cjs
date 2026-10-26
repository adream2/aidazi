/**
 * engine.test.cjs — 引擎与数据冒烟测试：node test/engine.test.cjs
 * 覆盖：直打/拼音状态机、五方案双拼编码、模式取词、词库自洽性
 */
'use strict';
const assert = require('node:assert');

// 让浏览器脚本在 Node 下挂到 globalThis
global.window = globalThis;

const CORE = require('../public/assets/js/data/core-data.js');
const C = require('../public/assets/js/data/content.js');
const E = require('../public/assets/js/engine.js');
const M = require('../public/assets/js/modes.js');

let passed = 0;
function t(name, fn) {
  fn();
  passed++;
  console.log('  ✓ ' + name);
}

console.log('\n[1] 直打模式状态机');
t('正确输入完成一个 unit', () => {
  const s = E.createDirectSession([{ display: 'hi', keys: 'hi ', hint: '' }]);
  assert.strictEqual(s.key('h').ok, true);
  assert.strictEqual(s.key('i').ok, true);
  assert.strictEqual(s.key(' ').ok, true);
  assert.strictEqual(s.done, true);
  assert.strictEqual(s.stats.chars, 1);
  assert.strictEqual(s.stats.errors, 0);
});
t('错误按键计错且不前进', () => {
  const s = E.createDirectSession([{ display: 'ab', keys: 'ab', hint: '' }]);
  const r = s.key('x');
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.expect, 'a');
  assert.strictEqual(s.up, 0);
  assert.strictEqual(s.stats.errors, 1);
  assert.strictEqual(s.key('a').ok, true);
  assert.strictEqual(s.up, 1);
});
t('退格可回退一个字符', () => {
  const s = E.createDirectSession([{ display: 'abc', keys: 'abc', hint: '' }]);
  s.key('a'); s.key('b');
  assert.strictEqual(s.backspace(), true);
  assert.strictEqual(s.up, 1);
  assert.strictEqual(s.backspace(), true);
  assert.strictEqual(s.up, 0);
  assert.strictEqual(s.backspace(), false);
});
t('全部完成置 done 并记录完成时间', () => {
  const s = E.createDirectSession([{ display: 'a', keys: 'a', hint: '' }, { display: 'b', keys: 'b', hint: '' }]);
  s.key('a'); assert.strictEqual(s.done, false);
  s.key('b'); assert.strictEqual(s.done, true);
  assert.ok(s.stats.finishedAt > 0);
  assert.strictEqual(s.progress(), 1);
});

console.log('\n[2] 拼音模式状态机');
const dict = M.buildPinyinDict();
t('输完拼音选对候选 -> 推进', () => {
  const s = E.createPinyinSession([{ w: '你好', syl: ['ni', 'hao'] }], dict);
  'nihao'.split('').forEach((ch) => s.letter(ch));
  assert.strictEqual(s.isComplete(), true);
  const cands = s.candidates;
  assert.ok(cands.includes('你好'), 'nihao 应有候选「你好」，实际: ' + JSON.stringify(cands));
  const r = s.select(cands.indexOf('你好'));
  assert.strictEqual(r.ok, true);
  assert.strictEqual(s.done, true);
  assert.deepStrictEqual(s.committed, ['你好']);
});
t('选错候选计错并清空缓冲', () => {
  // 「是」同音字多，方便构造错选
  const s = E.createPinyinSession([{ w: '是', syl: ['shi'] }], dict);
  'shi'.split('').forEach((ch) => s.letter(ch));
  assert.ok(s.candidates.length > 1, 'shi 应有多个候选');
  const wrongIdx = s.candidates.findIndex((c) => c !== '是');
  assert.ok(wrongIdx >= 0);
  const r = s.select(wrongIdx);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(s.stats.errors, 1);
  assert.strictEqual(s.buffer, '');
  assert.strictEqual(s.pi, 0);
});
t('词未输完时选字判错', () => {
  const s = E.createPinyinSession([{ w: '你好', syl: ['ni', 'hao'] }], dict);
  'ni'.split('').forEach((ch) => s.letter(ch));
  const r = s.select(0);
  assert.strictEqual(r.ok, false);
  assert.match(r.reason, /请先输完/);
});
t('前缀候选：输入部分拼音也能联想出候选', () => {
  const s = E.createPinyinSession([{ w: '你好', syl: ['ni', 'hao'] }], dict);
  s.letter('n');
  assert.ok(s.candidates.length > 0, '输入 n 应有联想候选');
  assert.ok(s.candidates.some((c) => c === '你好'), '联想候选应包含目标词');
});
t('错误字母计错但可退格', () => {
  const s = E.createPinyinSession([{ w: '你好', syl: ['ni', 'hao'] }], dict);
  const r = s.letter('x');
  assert.strictEqual(r.ok, false);
  assert.strictEqual(s.backspace(), true);
  assert.strictEqual(s.buffer, '');
});
t('多词连续上屏', () => {
  const phrases = [{ w: '中国', syl: ['zhong', 'guo'] }, { w: '世界', syl: ['shi', 'jie'] }];
  const s = E.createPinyinSession(phrases, dict);
  'zhongguo'.split('').forEach((ch) => s.letter(ch));
  s.select(s.candidates.indexOf('中国'));
  assert.strictEqual(s.pi, 1);
  'shijie'.split('').forEach((ch) => s.letter(ch));
  s.select(s.candidates.indexOf('世界'));
  assert.strictEqual(s.done, true);
  assert.strictEqual(s.stats.chars, 4);
});

console.log('\n[3] 双拼编码（五方案）');
const xh = C.schemes.xiaohe, wr = C.schemes.weiruan, sg = C.schemes.sogou, abc = C.schemes.abc, zr = C.schemes.ziranma;
t('小鹤：声母原位 + 韵母键', () => {
  assert.strictEqual(C.encodeSyllable('ni', xh), 'ni');
  assert.strictEqual(C.encodeSyllable('hao', xh), 'hc');
  assert.strictEqual(C.encodeSyllable('shi', xh), 'ui');   // sh=U, i=I
  assert.strictEqual(C.encodeSyllable('zhong', xh), 'vs'); // zh=V, ong=S
  assert.strictEqual(C.encodeSyllable('xue', xh), 'xt');   // ue=T
});
t('小鹤：零声母规则', () => {
  assert.strictEqual(C.encodeSyllable('a', xh), 'aa');
  assert.strictEqual(C.encodeSyllable('ai', xh), 'ai');
  assert.strictEqual(C.encodeSyllable('ang', xh), 'ah');
  assert.strictEqual(C.encodeSyllable('er', xh), 'er');
});
t('微软：与搜狗一致，零声母用 O', () => {
  assert.strictEqual(C.encodeSyllable('shi', wr), 'ui');
  assert.strictEqual(C.encodeSyllable('ai', wr), 'ol');
  assert.strictEqual(C.encodeSyllable('an', wr), 'oj');
  assert.strictEqual(C.encodeSyllable('ang', wr), 'oh');
  assert.strictEqual(C.encodeSyllable('er', wr), 'or');
  assert.strictEqual(C.encodeSyllable('hao', sg), 'hk');   // ao=K
  assert.strictEqual(C.encodeSyllable('shi', sg), 'ui');
});
t('智能ABC：zh/ch/sh 在左手', () => {
  assert.strictEqual(C.encodeSyllable('zhi', abc), 'ai');  // zh=A, i=I
  assert.strictEqual(C.encodeSyllable('chi', abc), 'ei');  // ch=E
  assert.strictEqual(C.encodeSyllable('shi', abc), 'vi');  // sh=V
  assert.strictEqual(C.encodeSyllable('hao', abc), 'hk');
});
t('自然码：零声母直接打韵母键', () => {
  assert.strictEqual(C.encodeSyllable('ang', zr), 'h');
  assert.strictEqual(C.encodeSyllable('hao', zr), 'hk');
  assert.strictEqual(C.encodeSyllable('shi', zr), 'ui');
});
t('所有音节在所有方案下均可编码（除黑名单）', () => {
  const syls = Object.keys(CORE.py);
  assert.ok(syls.length > 300, '音节数量应 > 300，实际 ' + syls.length);
  Object.values(C.schemes).forEach((sc) => {
    syls.forEach((syl) => {
      const code = C.encodeSyllable(syl, sc);
      assert.ok(code && /^[a-z;]{1,2}$/.test(code), `${sc.name} 无法编码 ${syl}`);
    });
  });
});

console.log('\n[4] 模式取词');
t('英文模式生成带空格的词单元', () => {
  const units = M.modes.english.create('words', 16, {});
  assert.strictEqual(units.length, 16);
  units.forEach((u) => assert.match(u.keys, /^[a-z' ]+$/));
});
t('五笔模式编码均为小写字母', () => {
  const units = M.modes.wubi.create('normal', 16, {});
  assert.strictEqual(units.length, 16);
  units.forEach((u) => {
    assert.match(u.keys, /^[a-z]{1,4}$/);
    assert.match(u.hint, /^[a-z]{1,4}$/);
  });
});
t('五笔全码模式为完整编码', () => {
  const units = M.modes.wubi.create('normal', 12, { full: true });
  units.forEach((u) => {
    assert.match(u.keys, /^[a-z]{1,4}$/);
    assert.ok(u.keys.length >= u.hint.length, '全码不应短于简码');
  });
});
t('双拼模式每单元两键', () => {
  Object.keys(C.schemes).forEach((id) => {
    const units = M.modes.shuangpin.create('normal', 16, { scheme: id });
    assert.strictEqual(units.length, 16);
    units.forEach((u) => assert.match(u.keys, /^[a-z;]{2}$/, id + ': ' + u.py));
  });
});
t('笔画模式仅含 hspnz', () => {
  const units = M.modes.strokes.create('normal', 16, {});
  units.forEach((u) => assert.match(u.keys, /^[hspnz]+$/));
});
t('笔画难度池按画数过滤', () => {
  M.modes.strokes.create('easy', 20, {}).forEach((u) => assert.ok(u.keys.length <= 4));
  M.modes.strokes.create('hard', 20, {}).forEach((u) => assert.ok(u.keys.length <= 10));
});
t('拼音模式词库全部可编码且候选存在', () => {
  const pydict = M.buildPinyinDict();
  ['easy', 'normal', 'hard'].forEach((lv) => {
    const phrases = M.modes.pinyin.create(lv, 30, {});
    assert.ok(phrases.length > 0, lv + ' 应有短语');
    phrases.forEach((p) => {
      assert.ok(p.syl && p.syl.length, p.w + ' 缺音节');
      assert.ok(pydict[p.syl.join('')], p.w + ' 的完整拼音 ' + p.syl.join('') + ' 无候选');
    });
  });
});

console.log('\n[5] 词库自洽性');
t('pinyinWords 中每个字的音节都能在字库找到候选', () => {
  const pydict = M.buildPinyinDict();
  let missing = [];
  Object.entries(C.pinyinWords).forEach(([w, syls]) => {
    const full = syls.join('');
    if (!pydict[full]) missing.push(w + '(' + full + ')');
    syls.forEach((s) => { if (!CORE.py[s]) missing.push(w + '/' + s); });
  });
  assert.deepStrictEqual(missing, [], '以下词无候选: ' + missing.join(' '));
});
t('造句单字均有拼音', () => {
  const missing = C.singleChars.filter((ch) => !M.charPy[ch]);
  assert.deepStrictEqual(missing, [], '缺拼音: ' + missing.join(' '));
});
t('句子中的词全部可解析', () => {
  const missing = [];
  C.pinyinSentences.forEach((sent) => sent.forEach((w) => {
    if (!M.wordSyllables(w)) missing.push(w);
  }));
  assert.deepStrictEqual(missing, [], '句子中的词无法解析: ' + missing.join(' '));
});
t('五笔一级简码 25 个与字根表键位一致（A-Y 无 Z）', () => {
  assert.strictEqual(C.wubi.jianma1.length, 25);
  const keys = C.wubi.jianma1.map((p) => p[1]).sort().join('');
  assert.strictEqual(keys, 'ABCDEFGHIJKLMNOPQRSTUVWXY');
});

console.log('\n' + passed + ' 项测试全部通过 ✓\n');
