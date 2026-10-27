/**
 * modes.js — 五种练习模式：英文 / 拼音 / 五笔 / 双拼 / 笔画
 * 每个模式提供 create(level, count, opts) -> units/phrases，以及 UI 元信息
 */
(function (root) {
  var C = root.DAZI_CONTENT;
  var CORE = root.DAZI_CORE;

  function pick(arr, n) {
    var a = arr.slice(), out = [];
    while (out.length < n && a.length) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
    return out;
  }

  /* 字符 -> 无调拼音 反查表（由音节表构建，取第一个读音） */
  var charPy = {};
  Object.keys(CORE.py).forEach(function (syl) {
    CORE.py[syl].split('').forEach(function (ch) {
      if (!charPy[ch]) charPy[ch] = syl;
    });
  });

  /** 词 -> 音节数组；查不到返回 null */
  function wordSyllables(w) {
    if (C.pinyinWords[w]) return C.pinyinWords[w];
    if (w.length === 1 && charPy[w]) return [charPy[w]];
    if (w.length > 1) {
      // 逐字兜底（多字词未录入时按单字拼）
      var syls = [];
      for (var i = 0; i < w.length; i++) {
        if (!charPy[w[i]]) return null;
        syls.push(charPy[w[i]]);
      }
      return syls;
    }
    return null;
  }

  /** 造句辅助：从句子池展开可用词 */
  function sentenceWords() {
    var pool = [];
    C.pinyinSentences.forEach(function (sent) {
      sent.forEach(function (w) { if (wordSyllables(w)) pool.push(w); });
    });
    return pool;
  }

  /* ==================== 模式定义 ==================== */
  var modes = {
    /* ---------- 英文 ---------- */
    english: {
      id: 'english',
      name: '英文打字',
      tag: 'English',
      kind: 'direct',
      speedLabel: 'WPM',
      caseSensitive: false,
      levelOptions: [
        { id: 'words', name: '随机单词' },
        { id: 'quotes', name: '名言警句' },
        { id: 'code', name: '代码练习' }
      ],
      defaultLevel: 'words',
      intro: '最经典的打字练习。全小写输入即可，每个词打完自动进入下一个（含词尾空格）。',
      create: function (level, count) {
        var words;
        if (level === 'quotes') {
          var q = pick(C.english.quotes, 1)[0];
          words = q.split(/\s+/);
        } else if (level === 'code') {
          var lines = pick(C.english.code, Math.max(1, Math.round(count / 4)));
          words = [];
          lines.forEach(function (l) { words = words.concat(l.split(/\s+/)); });
        } else {
          words = pick(C.english.words, count);
        }
        return words.filter(Boolean).map(function (w) {
          return { display: w, keys: w.toLowerCase() + ' ', hint: '' };
        });
      }
    },

    /* ---------- 拼音 ---------- */
    pinyin: {
      id: 'pinyin',
      name: '拼音打字',
      tag: 'Pinyin',
      kind: 'pinyin',
      speedLabel: '字/分',
      levelOptions: [
        { id: 'easy', name: '常用词' },
        { id: 'normal', name: '词+单字' },
        { id: 'hard', name: '整句输入' }
      ],
      defaultLevel: 'normal',
      intro: '模拟真实拼音输入法：输入拼音 → 候选框选字。练的是「见字打词」的整句手感，选错会提示正确候选。',
      create: function (level, count) {
        var pool, words = [];
        if (level === 'hard') {
          // 整句输入：随机取两句，按词序展开
          pick(C.pinyinSentences, 2).forEach(function (sent) {
            sent.forEach(function (w) { words.push(w); });
          });
        } else if (level === 'easy') {
          // 入门：最常用的 50 个词
          pool = Object.keys(C.pinyinWords).slice(0, 50);
          words = pick(pool, count);
        } else {
          pool = Object.keys(C.pinyinWords).concat(C.singleChars.filter(function (ch) { return charPy[ch]; }));
          words = pick(pool, count);
        }
        return words.map(function (w) {
          return { w: w, syl: wordSyllables(w) };
        }).filter(function (p) { return p.syl && p.syl.length; });
      }
    },

    /* ---------- 五笔 ---------- */
    wubi: {
      id: 'wubi',
      name: '五笔字型',
      tag: 'Wubi 86',
      kind: 'direct',
      speedLabel: '字/分',
      extraOptions: [{ id: 'full', name: '全码练习（四码）' }],
      levelOptions: [
        { id: 'easy', name: '高频 300 字' },
        { id: 'normal', name: '高频 800 字' },
        { id: 'hard', name: '全部 1200 字' }
      ],
      defaultLevel: 'normal',
      intro: '86 版五笔：按最简码输入（与真实输入法一致），可切换全码练习字根拆解。编码来自公开码表，个别字以你的输入法为准。',
      pool: function (level) {
        var n = level === 'easy' ? 300 : level === 'normal' ? 800 : CORE.wubi.length;
        return CORE.wubi.slice(0, n);
      },
      create: function (level, count, opts) {
        var full = !!(opts && opts.full);
        return pick(this.pool(level), count).map(function (e) {
          return {
            char: e[0],
            keys: full ? e[2] : e[1],
            hint: full ? e[2] : e[1],
            display: e[0],
            full: e[2]
          };
        });
      }
    },

    /* ---------- 双拼 ---------- */
    shuangpin: {
      id: 'shuangpin',
      name: '双拼方案',
      tag: 'Shuangpin',
      kind: 'direct',
      speedLabel: '字/分',
      schemeSelect: true,
      levelOptions: [
        { id: 'easy', name: '入门 8 音节' },
        { id: 'normal', name: '进阶 16 音节' },
        { id: 'hard', name: '熟练 28 音节' }
      ],
      defaultLevel: 'normal',
      intro: '两键一个音节：第一键声母、第二键韵母。下方键盘会实时显示该方案的键位映射，练熟方案再谈速度。',
      create: function (level, count, opts) {
        var scheme = C.schemes[(opts && opts.scheme) || 'xiaohe'];
        var n = level === 'easy' ? 8 : level === 'normal' ? 16 : 28;
        var syls = Object.keys(CORE.py).filter(function (s) {
          var code = C.encodeSyllable(s, scheme);
          return code && code.length === 2; // 统一两键，过滤自然码的一键零声母音节
        });
        return pick(syls, n).map(function (s) {
          return {
            py: s,
            keys: C.encodeSyllable(s, scheme),
            hint: C.encodeSyllable(s, scheme),
            display: s,
            char: CORE.py[s][0]
          };
        });
      }
    },

    /* ---------- 笔画 ---------- */
    strokes: {
      id: 'strokes',
      name: '笔画输入',
      tag: 'BiHua',
      kind: 'direct',
      speedLabel: '字/分',
      levelOptions: [
        { id: 'easy', name: '≤4 画' },
        { id: 'normal', name: '≤7 画' },
        { id: 'hard', name: '≤10 画' }
      ],
      defaultLevel: 'normal',
      intro: '手机笔画输入法：横=1(h) 竖=2(s) 撇=3(p) 捺=4(n) 折=5(z)，按规范笔顺依次敲击。',
      pool: function (level) {
        var max = level === 'easy' ? 4 : level === 'normal' ? 7 : 10;
        return CORE.strokes.filter(function (e) { return e[1].length <= max; });
      },
      create: function (level, count) {
        return pick(this.pool(level), count).map(function (e) {
          return { char: e[0], keys: e[1], hint: e[1], display: e[0] };
        });
      }
    }
  };

  /** 合并候选字典：单字（core-data）+ 词库（content），词排在前面；值为数组 */
  function buildPinyinDict() {
    var dict = {};
    Object.keys(CORE.py).forEach(function (k) {
      dict[k] = CORE.py[k].split('');
    });
    Object.keys(C.pinyinWords).forEach(function (w) {
      var syls = C.pinyinWords[w].join('');
      dict[syls] = dict[syls] || [];
      if (dict[syls].indexOf(w) < 0) dict[syls].unshift(w);
    });
    return dict;
  }

  /** 为一次练习生成候选字典：保证每个目标词的完整拼音下，该词一定在候选首位 */
  function pinyinDictFor(phrases) {
    var dict = buildPinyinDict();
    (phrases || []).forEach(function (p) {
      if (!p || !p.syl || !p.syl.length) return;
      var key = p.syl.join('');
      dict[key] = dict[key] || [];
      var arr = dict[key];
      var at = arr.indexOf(p.w);
      if (at < 0) arr.unshift(p.w);
      else if (at > 0) { arr.splice(at, 1); arr.unshift(p.w); }  // 已存在也强制置顶，保证目标必被选中
    });
    return dict;
  }

  root.DAZI_MODES = {
    modes: modes,
    wordSyllables: wordSyllables,
    charPy: charPy,
    buildPinyinDict: buildPinyinDict,
    pinyinDictFor: pinyinDictFor
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.DAZI_MODES;
})(typeof window !== 'undefined' ? window : globalThis);
