/**
 * engine.js — 打字引擎（纯逻辑，无 DOM 依赖，可在 Node 下单测）
 * 两种会话：
 *   createDirectSession(units)        直打模式：依次敲 unit.keys（英文/五笔/双拼/笔画）
 *   createPinyinSession(phrases, dict) 拼音模式：输入音节 → 候选框选字
 */
(function (root) {
  function now() { return Date.now(); }

  function newStats() {
    return { keys: 0, correct: 0, errors: 0, chars: 0, startedAt: 0, finishedAt: 0, completed: 0 };
  }

  function elapsed(s) {
    if (!s.stats.startedAt) return 0;
    return (s.stats.finishedAt || now()) - s.stats.startedAt;
  }

  /** 速度：字/分钟（中文模式） */
  function cpm(s) {
    var ms = elapsed(s);
    if (!ms || !s.stats.chars) return 0;
    return s.stats.chars / (ms / 60000);
  }

  /** 速度：词/分钟（英文模式，5 字符 = 1 词） */
  function wpm(s) {
    var ms = elapsed(s);
    if (!ms || !s.stats.keys) return 0;
    return s.stats.keys / 5 / (ms / 60000);
  }

  function accuracy(s) {
    if (!s.stats.keys) return 100;
    return s.stats.correct / s.stats.keys * 100;
  }

  /* ---------------- 直打模式 ---------------- */
  function createDirectSession(units) {
    return {
      kind: 'direct',
      units: units,
      ui: 0,
      up: 0,
      done: false,
      wrongAt: 0,
      unitErrors: units.map(function () { return 0; }),
      stats: newStats(),
      current: function () { return this.units[this.ui]; },
      expectedKey: function () {
        var u = this.units[this.ui];
        return u ? u.keys[this.up] : null;
      },
      progress: function () { return this.stats.completed / this.units.length; },
      key: function (k) {
        if (this.done) return null;
        var u = this.units[this.ui];
        if (!u) return null;
        if (!this.stats.startedAt) this.stats.startedAt = now();
        this.stats.keys++;
        var expect = u.keys[this.up];
        if (k === expect) {
          this.stats.correct++;
          this.up++;
          var unitDone = false;
          if (this.up >= u.keys.length) {
            this.up = 0;
            this.ui++;
            this.stats.completed++;
            this.stats.chars++; // 每完成一个 unit 计 1 字（英文按词计）
            unitDone = true;
            if (this.ui >= this.units.length) {
              this.done = true;
              this.stats.finishedAt = now();
            }
          }
          return { ok: true, unitDone: unitDone };
        }
        this.stats.errors++;
        this.unitErrors[this.ui] = (this.unitErrors[this.ui] || 0) + 1;
        this.wrongAt = now();
        return { ok: false, expect: expect };
      },
      backspace: function () {
        if (this.done) return false;
        if (this.up > 0) { this.up--; return true; }
        return false;
      }
    };
  }

  /* ---------------- 拼音模式 ---------------- */
  function createPinyinSession(phrases, dict) {
    return {
      kind: 'pinyin',
      phrases: phrases,
      dict: dict || {},
      pi: 0,
      buffer: '',
      committed: [],
      candidates: [],
      done: false,
      wrongAt: 0,
      lastMsg: '',
      stats: newStats(),
      current: function () { return this.phrases[this.pi]; },
      fullPinyin: function () {
        var p = this.phrases[this.pi];
        return p ? p.syl.join('') : '';
      },
      lookup: function () {
        var list = this.dict[this.buffer];
        if (!list) return [];
        var arr = Array.isArray(list) ? list : String(list).split('');
        return arr.slice(0, 9);
      },
      isComplete: function () { return this.buffer === this.fullPinyin(); },
      progress: function () { return this.stats.completed / this.phrases.length; },
      letter: function (ch) {
        if (this.done) return null;
        var p = this.phrases[this.pi];
        if (!p) return null;
        if (!this.stats.startedAt) this.stats.startedAt = now();
        this.stats.keys++;
        var full = p.syl.join('');
        var isRight = full.indexOf(this.buffer + ch) === 0;
        if (isRight) this.stats.correct++;
        else { this.stats.errors++; this.wrongAt = now(); }
        this.buffer += ch;
        this.candidates = this.lookup();
        this.lastMsg = '';
        return { ok: isRight, candidates: this.candidates };
      },
      backspace: function () {
        if (this.done || !this.buffer) return false;
        this.buffer = this.buffer.slice(0, -1);
        this.candidates = this.lookup();
        return true;
      },
      select: function (idx) {
        if (this.done) return null;
        var p = this.phrases[this.pi];
        if (!p) return null;
        var cand = this.candidates[idx];
        if (!cand) return null;
        this.stats.keys++;
        if (this.isComplete() && cand === p.w) {
          this.stats.correct++;
          this.stats.chars += p.w.length;
          this.committed.push(p.w);
          this.buffer = '';
          this.candidates = [];
          this.pi++;
          this.stats.completed++;
          if (this.pi >= this.phrases.length) {
            this.done = true;
            this.stats.finishedAt = now();
          }
          return { ok: true, word: p.w };
        }
        this.stats.errors++;
        this.wrongAt = now();
        this.buffer = '';
        this.candidates = [];
        if (!this.isComplete()) this.lastMsg = '词还没输完，请继续输入拼音';
        else this.lastMsg = '选错了，应该是「' + p.w + '」';
        return { ok: false, reason: this.lastMsg };
      }
    };
  }

  var api = {
    createDirectSession: createDirectSession,
    createPinyinSession: createPinyinSession,
    cpm: cpm,
    wpm: wpm,
    accuracy: accuracy,
    elapsed: elapsed
  };
  root.DAZI_ENGINE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
