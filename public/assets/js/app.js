/**
 * app.js — 主应用：模式切换 / 渲染 / 输入处理 / 统计 / 成绩
 */
(function (root) {
  var C = root.DAZI_CONTENT;
  var CORE = root.DAZI_CORE;
  var E = root.DAZI_ENGINE;
  var M = root.DAZI_MODES;

  var $ = function (id) { return document.getElementById(id); };

  var state = {
    modeId: 'english',
    level: 'normal',
    scheme: 'xiaohe',
    full: false,
    hint: true,
    session: null,
    timer: null,
    best: {}
  };

  /* ---------- 最佳成绩 ---------- */
  function bestKey() {
    var m = M.modes[state.modeId];
    var k = 'dazi.best.' + state.modeId + '.' + state.level;
    if (m.schemeSelect) k += '.' + state.scheme;
    if (state.modeId === 'wubi' && state.full) k += '.full';
    return k;
  }
  function loadBest() {
    try {
      var raw = localStorage.getItem(bestKey());
      state.best = raw ? JSON.parse(raw) : {};
    } catch (e) { state.best = {}; }
  }
  function saveBest(speed, acc) {
    var prev = state.best || {};
    if (!prev.speed || speed > prev.speed) {
      state.best = { speed: Math.round(speed), acc: Math.round(acc), at: Date.now() };
      try { localStorage.setItem(bestKey(), JSON.stringify(state.best)); } catch (e) {}
      return true;
    }
    return false;
  }

  /* ---------- 选项区 ---------- */
  function renderModeTabs() {
    var wrap = $('modeTabs');
    wrap.innerHTML = '';
    Object.keys(M.modes).forEach(function (id) {
      var m = M.modes[id];
      var b = document.createElement('button');
      b.className = 'mode-tab' + (id === state.modeId ? ' active' : '');
      b.innerHTML = '<b>' + m.name + '</b><span>' + m.tag + '</span>';
      b.onclick = function () { switchMode(id); };
      wrap.appendChild(b);
    });
  }

  function renderOptions() {
    var m = M.modes[state.modeId];
    // 难度
    var lg = $('levelGroup');
    lg.innerHTML = '<label>难度</label>';
    var sel = document.createElement('select');
    sel.id = 'levelSelect';
    m.levelOptions.forEach(function (o) {
      var op = document.createElement('option');
      op.value = o.id; op.textContent = o.name;
      if (o.id === state.level || (!m.levelOptions.some(function (x) { return x.id === state.level; }) && o.id === m.defaultLevel)) op.selected = true;
      sel.appendChild(op);
    });
    sel.onchange = function () { state.level = sel.value; restart(); };
    lg.appendChild(sel);
    // 方案（双拼）
    var sg = $('schemeGroup');
    sg.style.display = m.schemeSelect ? '' : 'none';
    if (m.schemeSelect) {
      sg.innerHTML = '<label>方案</label>';
      var ss = document.createElement('select');
      Object.keys(C.schemes).forEach(function (id) {
        var op = document.createElement('option');
        op.value = id; op.textContent = C.schemes[id].name;
        if (id === state.scheme) op.selected = true;
        ss.appendChild(op);
      });
      ss.onchange = function () { state.scheme = ss.value; restart(); };
      sg.appendChild(ss);
    }
    // 附加项（五笔全码）
    var eg = $('extraGroup');
    eg.style.display = m.extraOptions ? '' : 'none';
    if (m.extraOptions) {
      eg.innerHTML = '';
      var cb = document.createElement('label');
      cb.className = 'check';
      cb.innerHTML = '<input type="checkbox" id="fullCheck"' + (state.full ? ' checked' : '') + '><span>全码练习</span>';
      eg.appendChild(cb);
      cb.querySelector('input').onchange = function (e) { state.full = e.target.checked; restart(); };
    }
    $('hintCheck').checked = state.hint;
    $('modeIntro').textContent = m.intro;
  }

  /* ---------- 键盘副标签 ---------- */
  function schemeKeyLabels(scheme) {
    var labels = {};
    Object.keys(scheme.finalMap).forEach(function (fin) {
      var k = scheme.finalMap[fin];
      labels[k] = labels[k] || [];
      if (labels[k].indexOf(fin) < 0) labels[k].push(fin);
    });
    Object.keys(scheme.initialSpecial).forEach(function (ini) {
      var k = scheme.initialSpecial[ini];
      labels[k] = labels[k] || [];
      if (labels[k].indexOf(ini) < 0) labels[k].push(ini);
    });
    var out = {};
    Object.keys(labels).forEach(function (k) { out[k] = labels[k].join('/'); });
    return out;
  }

  var WUBI_JIANMA_SUB = { g: '一', f: '地', d: '在', s: '要', a: '工', h: '上', j: '是', k: '中', l: '国', m: '同', t: '和', r: '的', e: '有', w: '人', q: '我', y: '主', u: '产', i: '不', o: '为', p: '这', n: '民', b: '了', v: '发', c: '以', x: '经' };
  var STROKE_SUB = { h: '1横', s: '2竖', p: '3撇', n: '4捺', z: '5折', '1': '横', '2': '竖', '3': '撇', '4': '捺', '5': '折' };

  var kb = null;
  function setupKeyboard() {
    if (!kb) kb = root.Keyboard.create($('keyboard'));
    var m = M.modes[state.modeId];
    if (state.modeId === 'shuangpin') {
      var labels = schemeKeyLabels(C.schemes[state.scheme]);
      kb.setSublabel(function (k) { return labels[k] || ''; });
    } else if (state.modeId === 'wubi') {
      kb.setSublabel(function (k) { return WUBI_JIANMA_SUB[k] || ''; });
    } else if (state.modeId === 'strokes') {
      kb.setSublabel(function (k) { return STROKE_SUB[k] || ''; });
    } else {
      kb.setSublabel(function () { return ''; });
    }
    kb.highlight([]);
  }

  /* ---------- 会话 ---------- */
  function unitCount() {
    return state.level === 'easy' ? 8 : state.level === 'normal' ? 16 : 28;
  }

  function buildSession() {
    var m = M.modes[state.modeId];
    var opts = { scheme: state.scheme, full: state.full };
    var units = m.create(state.level, unitCount(), opts);
    if (m.kind === 'pinyin') {
      state.session = E.createPinyinSession(units, M.pinyinDictFor(units));
    } else {
      state.session = E.createDirectSession(units);
    }
  }

  function restart() {
    loadBest();
    renderOptions();
    setupKeyboard();
    buildSession();
    renderAll();
    $('resultCard').classList.add('hidden');
    stopTimer();
    updateStats();
    updateBest();
  }

  function switchMode(id) {
    state.modeId = id;
    var m = M.modes[id];
    state.level = m.defaultLevel;
    renderModeTabs();
    restart();
  }

  /* ---------- 渲染 ---------- */
  function renderAll() {
    var s = state.session;
    var m = M.modes[state.modeId];
    var isPy = m.kind === 'pinyin';
    $('pinyinBox').style.display = isPy ? '' : 'none';
    $('pSyls').style.display = isPy ? '' : 'none';
    $('kbWrap').style.display = ''; // 键盘始终可见（英文模式也高亮下一键）
    $('startHint').style.display = s.stats.startedAt ? 'none' : '';
    if (isPy) renderPinyin(); else renderDirect();
    updateKeyboard();
  }

  function renderDirect() {
    var s = state.session;
    var line = $('textLine');
    line.innerHTML = '';
    s.units.forEach(function (u, i) {
      var span = document.createElement('span');
      span.className = 'unit';
      span.dataset.i = i;
      if (i < s.ui) span.classList.add('done');
      if (i === s.ui) span.classList.add('active');
      var ch = document.createElement('span');
      ch.className = 'u-char';
      ch.textContent = u.display;
      span.appendChild(ch);
      if (u.hint && state.hint) {
        var hint = document.createElement('span');
        hint.className = 'u-hint';
        hint.textContent = u.hint;
        span.appendChild(hint);
      }
      line.appendChild(span);
    });
    scrollActive();
  }

  function renderPinyin() {
    var s = state.session;
    var box = $('pinyinBox');
    var p = s.current();
    var html = '';
    s.committed.forEach(function (w) { html += '<span class="p-done">' + esc(w) + '</span>'; });
    if (p) {
      // 拼音标注跟随「显示提示」：关闭后界面只留汉字，不出现拼音字母
      html += '<span class="p-cur" data-w="' + esc(p.w) + '">' + esc(p.w) +
        (state.hint ? '<span class="p-py">' + esc(p.syl.join(' ')) + '</span>' : '') + '</span>';
    }
    html += '<span class="p-input"><span class="p-buffer">' + esc(s.buffer) + '</span><span class="p-caret"></span></span>';
    box.innerHTML = html;
    // 音节进度芯片
    var sylsEl = $('pSyls');
    sylsEl.innerHTML = '';
    if (p) {
      var typed = s.buffer, acc = '', done = 0;
      for (var i = 0; i < p.syl.length; i++) {
        acc += p.syl[i];
        if (typed.length >= acc.length && typed.slice(0, acc.length) === acc) done = i + 1;
        else break;
      }
      p.syl.forEach(function (syl, i) {
        var chip = document.createElement('span');
        chip.className = 'p-syl' + (i < done ? ' done' : i === done ? ' now' : '');
        chip.textContent = state.hint ? syl : '••';
        sylsEl.appendChild(chip);
      });
    }
    renderCandidates(s.candidates);
    $('modeMsg').textContent = s.lastMsg || '';
    scrollActive();
  }

  function renderCandidates(list) {
    var bar = $('candidateBar');
    bar.innerHTML = '';
    if (!list || !list.length) { bar.style.display = 'none'; return; }
    bar.style.display = '';
    list.forEach(function (c, i) {
      var b = document.createElement('button');
      b.className = 'cand';
      b.innerHTML = '<i>' + (i + 1) + '</i>' + esc(c);
      b.onmousedown = function (e) { e.preventDefault(); doSelect(i); };
      bar.appendChild(b);
    });
    var hint = document.createElement('span');
    hint.className = 'cand-hint';
    hint.textContent = '空格 / 数字键选字';
    bar.appendChild(hint);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function scrollActive() {
    var el = document.querySelector('#textLine .unit.active');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function updateKeyboard() {
    var s = state.session;
    if (!kb) return;
    if (s.kind === 'direct') {
      kb.highlight([s.expectedKey()]);
    } else if (s.kind === 'pinyin') {
      kb.highlight(s.buffer.split(''));
    }
  }

  /* ---------- 输入 ---------- */
  function isTyping() { return !!state.session && !state.session.done; }

  function onKey(e) {
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    var k = e.key;
    // 全局快捷键
    if (k === 'Escape') {
      // 全屏时 Esc 交给浏览器退出全屏，不重置进度
      if (document.fullscreenElement) return;
      if (document.body.classList.contains('focus-mode')) { exitFocus(); return; }
      restart();
      return;
    }
    // Ctrl / ⌘ + Enter 切换全屏练习
    if ((e.ctrlKey || e.metaKey) && k === 'Enter') { e.preventDefault(); toggleFullscreen(); return; }
    if (!state.session) return;
    var s = state.session;

    if (s.done) {
      if (k === 'Enter') { restart(); }
      return;
    }

    if (k === 'Backspace') {
      e.preventDefault();
      if (s.backspace()) { renderAll(); updateStats(); }
      return;
    }

    if (s.kind === 'pinyin') {
      if (/^[a-z]$/.test(k)) {
        e.preventDefault();
        s.letter(k);
        renderPinyin(); updateKeyboard(); updateStats();
      } else if (k === ' ') {
        e.preventDefault();
        if (s.candidates.length) doSelect(0);
      } else if (/^[1-9]$/.test(k)) {
        e.preventDefault();
        doSelect(parseInt(k, 10) - 1);
      }
      return;
    }

    // 直打模式
    var m = M.modes[state.modeId];
    var key = k.length === 1 ? k.toLowerCase() : k;
    if (m.id === 'strokes' && /^[1-5]$/.test(key)) {
      key = { '1': 'h', '2': 's', '3': 'p', '4': 'n', '5': 'z' }[key];
    }
    // 英文模式接受全部可打印 ASCII（代码练习含符号与数字），其余模式仅字母/空格
    var acceptable = m.id === 'english' ? /^[\x20-\x7e]$/.test(key) : /^[a-z ]$/.test(key);
    if (acceptable) {
      e.preventDefault();
      var r = s.key(key);
      if (r) {
        if (!r.ok) flashError();
        renderDirect(); updateKeyboard(); updateStats();
        if (s.done) finish();
      }
    }
  }

  function doSelect(i) {
    var s = state.session;
    if (!s || s.done) return;
    var r = s.select(i);
    if (!r) return;
    if (!r.ok) flashError();
    renderPinyin(); updateStats();
    if (s.done) finish();
  }

  function flashError() {
    var stage = $('stage');
    stage.classList.remove('shake');
    void stage.offsetWidth;
    stage.classList.add('shake');
  }

  /* ---------- 统计 ---------- */
  function fmtTime(ms) { return (ms / 1000).toFixed(1) + 's'; }

  function updateStats() {
    var s = state.session;
    if (!s) return;
    var speed = state.modeId === 'english' ? E.wpm(s) : E.cpm(s);
    $('stSpeed').textContent = state.modeId === 'english' ? speed.toFixed(0) : Math.round(speed);
    $('stAcc').textContent = Math.round(E.accuracy(s)) + '%';
    $('stTime').textContent = fmtTime(E.elapsed(s));
    $('stProg').textContent = Math.round(s.progress() * 100) + '%';
    $('startHint').style.display = s.stats.startedAt ? 'none' : '';
  }

  function updateBest() {
    var b = state.best || {};
    var unit = state.modeId === 'english' ? ' wpm' : ' 字/分';
    $('stBest').textContent = b.speed ? b.speed + unit : '--';
  }

  function startTimer() {
    if (state.timer) return;
    state.timer = setInterval(function () {
      if (state.session && !state.session.done && state.session.stats.startedAt) updateStats();
    }, 100);
  }
  function stopTimer() { if (state.timer) { clearInterval(state.timer); state.timer = null; } }

  /* ---------- 完成 ---------- */
  function finish() {
    stopTimer();
    updateStats();
    var s = state.session;
    var m = M.modes[state.modeId];
    var speed = state.modeId === 'english' ? E.wpm(s) : E.cpm(s);
    var acc = E.accuracy(s);
    var isNew = saveBest(speed, acc);
    updateBest();

    $('rSpeed').textContent = state.modeId === 'english' ? speed.toFixed(0) + ' wpm' : Math.round(speed) + ' 字/分';
    $('rAcc').textContent = Math.round(acc) + '%';
    $('rTime').textContent = fmtTime(E.elapsed(s));
    $('rErrors').textContent = s.stats.errors + ' 次';
    $('rNew').style.display = isNew ? '' : 'none';
    // 错误字 top5
    var list = $('rErrList');
    list.innerHTML = '';
    if (s.kind === 'direct') {
      var errs = [];
      s.units.forEach(function (u, i) {
        if (s.unitErrors[i] > 0) errs.push({ u: u, n: s.unitErrors[i] });
      });
      errs.sort(function (a, b) { return b.n - a.n; });
      if (!errs.length) {
        list.innerHTML = '<li class="err-clean">全程零错误，漂亮！</li>';
      } else {
        errs.slice(0, 6).forEach(function (e) {
          var li = document.createElement('li');
          li.innerHTML = '<b>' + esc(e.u.display) + '</b><code>' + esc(e.u.hint || e.u.keys) + '</code><span>错 ' + e.n + ' 次</span>';
          list.appendChild(li);
        });
      }
    } else {
      list.innerHTML = '<li class="err-clean">拼音模式错误主要来自选字，注意先输完整个词再选。</li>';
    }
    $('resultCard').classList.remove('hidden');
    if ($('resultCard').scrollIntoView) $('resultCard').scrollIntoView({ block: 'nearest' });
  }

  /* ---------- 主题 ---------- */
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('dazi.theme'); } catch (e) {}
    var dark = saved ? saved === 'dark' : false;
    applyTheme(dark);
    $('themeToggle').onclick = function () {
      var isDark = document.documentElement.dataset.theme === 'dark';
      applyTheme(!isDark);
      try { localStorage.setItem('dazi.theme', !isDark ? 'dark' : 'light'); } catch (e) {}
    };
  }
  function applyTheme(dark) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    $('themeToggle').textContent = dark ? '☀ 浅色' : '☾ 深色';
  }

  /* ---------- 全屏 / 专注模式 ---------- */
  var focusFallback = false;   // 浏览器拒绝 fullscreen 时的 CSS 兜底

  function isFocus() {
    return !!document.fullscreenElement || focusFallback;
  }

  function setFocusUI(on) {
    document.body.classList.toggle('focus-mode', on);
    var btn = $('fsBtn');
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      $('fsLabel').textContent = on ? '退出全屏' : '全屏';
      btn.title = on ? '退出全屏（Esc）' : '全屏练习（Ctrl/⌘ + Enter）';
    }
  }

  function enterFocus() {
    var el = $('practice');
    if (el.requestFullscreen) {
      el.requestFullscreen().then(function () {
        focusFallback = false;
        setFocusUI(true);
      }).catch(function () {
        // 无用户手势或浏览器不支持时，用 CSS 专注模式兜底
        focusFallback = true;
        setFocusUI(true);
      });
    } else {
      focusFallback = true;
      setFocusUI(true);
    }
  }

  function exitFocus() {
    focusFallback = false;
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(function () {});
    }
    setFocusUI(false);
  }

  function toggleFullscreen() {
    if (isFocus()) exitFocus(); else enterFocus();
  }

  function initFullscreen() {
    var btn = $('fsBtn');
    if (btn) btn.onclick = function () { toggleFullscreen(); };
    document.addEventListener('fullscreenchange', function () {
      setFocusUI(!!document.fullscreenElement);
    });
    // 有的浏览器不支持 #practice 全屏，直接退回到普通模式
    document.addEventListener('fullscreenerror', function () {
      focusFallback = true;
      setFocusUI(true);
    });
  }

  /* ---------- 启动 ---------- */
  function init() {
    initTheme();
    renderModeTabs();
    restart();
    initFullscreen();
    document.addEventListener('keydown', onKey);
    $('restartBtn').onclick = function () { restart(); };
    $('againBtn').onclick = function () { restart(); };
    $('hintCheck').onchange = function (e) { state.hint = e.target.checked; renderAll(); };
    // 点击空白处收起焦点（让键盘事件继续可用），但不要打断下拉框/输入框的操作
    document.addEventListener('mousedown', function (e) {
      var t = e.target;
      if (t && t.closest && t.closest('select, option, input, textarea, button, a, label')) return;
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    });
    startTimer();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  root.DAZI_APP = { restart: restart, switchMode: switchMode };
})(typeof window !== 'undefined' ? window : globalThis);
