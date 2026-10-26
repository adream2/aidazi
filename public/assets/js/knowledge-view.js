/**
 * knowledge-view.js — 知识库 / 键盘图鉴 / 部署说明 三个板块的渲染
 */
(function (root) {
  var C = root.DAZI_CONTENT;
  var CORE = root.DAZI_CORE;
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  /* ==================== 知识库 ==================== */
  var KN_TABS = [
    { id: 'wubi', name: '五笔字型' },
    { id: 'shuangpin', name: '双拼方案' },
    { id: 'pinyin', name: '拼音诀窍' },
    { id: 'strokes', name: '笔画输入' },
    { id: 'fingering', name: '指法与练习' }
  ];

  function knWubi() {
    var w = C.wubi, box = el('div', 'kn-cols');
    // 左：字根口诀
    var left = el('div', 'kn-col');
    left.appendChild(el('h3', null, '字根口诀（86 版）'));
    left.appendChild(el('p', 'kn-sub', '五笔把 125 种字根按首笔分为 5 区 25 键，先背口诀再练码。'));
    var zones = {};
    w.roots.forEach(function (r) { (zones[r.zone] = zones[r.zone] || []).push(r); });
    Object.keys(zones).forEach(function (z) {
      left.appendChild(el('h4', 'kn-zone', z));
      var tbl = el('table', 'kn-table');
      zones[z].forEach(function (r) {
        tbl.appendChild(el('tr', null,
          '<td><kbd class="keycap keycap-' + r.key.toLowerCase() + '">' + r.key + '</kbd></td>' +
          '<td class="kn-mnemonic">' + esc(r.mnemonic) + '</td>' +
          '<td class="kn-roots">' + esc(r.roots) + '</td>'));
      });
      left.appendChild(tbl);
    });
    // 拆分原则
    left.appendChild(el('h4', 'kn-zone', '拆分五原则'));
    w.rules.forEach(function (r) {
      left.appendChild(el('div', 'kn-rule', '<b>' + esc(r.title) + '</b><span>' + esc(r.text) + '</span>'));
    });
    left.appendChild(el('div', 'kn-callout', '<b>' + esc(w.identify.title) + '</b><p>' + esc(w.identify.text) + '</p>'));
    box.appendChild(left);
    // 右：简码 + 速查
    var right = el('div', 'kn-col');
    right.appendChild(el('h3', null, '简码体系'));
    w.jianma.forEach(function (j) {
      right.appendChild(el('div', 'kn-rule', '<b>' + esc(j.title) + '</b><span>' + esc(j.text) + '</span>'));
    });
    // 一级简码键盘示意
    right.appendChild(el('h4', 'kn-zone', '一级简码速记'));
    var jm = el('div', 'kn-jm');
    w.jianma1.forEach(function (p) {
      jm.appendChild(el('span', 'jm-item', '<i>' + p[1] + '</i>' + p[0]));
    });
    right.appendChild(jm);
    right.appendChild(el('h4', 'kn-zone', '练习诀窍'));
    var ul = el('ul', 'kn-tips');
    w.tips.forEach(function (t) { ul.appendChild(el('li', null, esc(t))); });
    right.appendChild(ul);
    // 编码速查
    right.appendChild(el('h4', 'kn-zone', '常用字编码速查（86 版）'));
    var search = el('input', 'kn-search');
    search.type = 'text';
    search.placeholder = '输入汉字或编码，如：你 / wq';
    var tblWrap = el('div', 'kn-lookup');
    var tbl = el('table', 'kn-table kn-table-dense');
    function renderLookup(q) {
      tbl.innerHTML = '';
      var list = CORE.wubi.filter(function (e) {
        return !q || e[0].indexOf(q) >= 0 || e[1].indexOf(q) === 0 || e[2].indexOf(q) === 0;
      }).slice(0, 60);
      list.forEach(function (e) {
        tbl.appendChild(el('tr', null,
          '<td class="lk-char">' + esc(e[0]) + '</td>' +
          '<td><code>' + esc(e[1]) + '</code></td>' +
          '<td><code class="lk-full">' + esc(e[2]) + '</code></td>'));
      });
      if (!list.length) tbl.appendChild(el('tr', null, '<td colspan="3" class="lk-empty">没有匹配的字，换个关键词试试</td>'));
    }
    search.oninput = function () { renderLookup(search.value.trim()); };
    renderLookup('');
    right.appendChild(search);
    tblWrap.appendChild(tbl);
    right.appendChild(tblWrap);
    box.appendChild(right);
    return box;
  }

  function knShuangpin() {
    var box = el('div');
    box.appendChild(el('p', 'kn-sub', '双拼 = 每个汉字用两键：第一键声母，第二键韵母。全拼 3-6 键的音节全部压缩到 2 键，击键数减半，熟练后速度上限远高于全拼。'));
    var schemeBar = el('div', 'kn-scheme-bar');
    var body = el('div', 'kn-scheme-body');
    function render(id) {
      var s = C.schemes[id];
      body.innerHTML = '';
      var head = el('div', 'kn-scheme-head');
      head.appendChild(el('h3', null, esc(s.name)));
      head.appendChild(el('p', null, esc(s.intro)));
      head.appendChild(el('p', 'kn-mnemonic-line', '口诀：' + esc(s.mnemonic)));
      body.appendChild(head);
      // 键位表
      var tbl = el('table', 'kn-table');
      var finals = s.finalMap;
      var row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
      var row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'];
      var row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
      [row1, row2, row3].forEach(function (row) {
        var tr = el('tr');
        row.forEach(function (k) {
          var fin = Object.keys(finals).filter(function (f) { return finals[f] === k; });
          var ini = Object.keys(s.initialSpecial).filter(function (i) { return s.initialSpecial[i] === k; });
          var label = fin.concat(ini).join(' / ') || '—';
          tr.appendChild(el('td', null, '<kbd class="keycap">' + k.toUpperCase() + '</kbd><span>' + esc(label) + '</span>'));
        });
        tbl.appendChild(tr);
      });
      body.appendChild(tbl);
      // 键盘示意
      var kbWrap = el('div', 'kn-kb');
      var kbEl = el('div');
      kbWrap.appendChild(kbEl);
      body.appendChild(kbWrap);
      var kb = root.Keyboard.create(kbEl);
      kb.setSublabel(function (key) {
        var fin = Object.keys(finals).filter(function (f) { return finals[f] === key; });
        var ini = Object.keys(s.initialSpecial).filter(function (i) { return s.initialSpecial[i] === key; });
        return fin.concat(ini).join('/');
      });
      // 规则
      var rules = el('ul', 'kn-tips');
      [
        '零声母规则：' + (s.zero === 'O' ? '用 O 代替声母，再接韵母键（爱=ol、安=oj、昂=oh）' : s.zero === 'final' ? '直接打韵母键（昂=h）' : '以韵母首字母为零声母：单字母韵母双打（啊=aa），双字母全拼（爱=ai），三字母=首字母+韵母键（昂=ah）'),
        'ü 写作 v：女=nv、略=lve；j/q/x 后的 ü 按 u 处理（居=jv）',
        'zh/ch/sh 是双声母，占一个键：' + Object.keys(s.initialSpecial).map(function (i) { return i + '=' + s.initialSpecial[i].toUpperCase(); }).join(' '),
        '先记韵母键位（27 个复韵母），声母大部分原位，一周就能形成肌肉记忆',
        '学习路线：1 小时背键位 → 1 周适应 → 1 个月恢复全拼速度 → 之后超越全拼'
      ].forEach(function (t) { rules.appendChild(el('li', null, esc(t))); });
      body.appendChild(rules);
    }
    Object.keys(C.schemes).forEach(function (id, i) {
      var b = el('button', 'chip' + (i === 0 ? ' active' : ''), C.schemes[id].name);
      b.onclick = function () {
        schemeBar.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        render(id);
      };
      schemeBar.appendChild(b);
    });
    box.appendChild(schemeBar);
    box.appendChild(body);
    render('xiaohe');
    return box;
  }

  function knPinyin() {
    var box = el('div');
    box.appendChild(el('p', 'kn-sub', '全拼是大多数人的入门方案，上限低但门槛也低。想提速，要么转双拼，要么把「整句输入」练到极致。'));
    var ul = el('ul', 'kn-tips');
    C.pinyinTips.forEach(function (t) { ul.appendChild(el('li', null, esc(t))); });
    box.appendChild(ul);
    var tbl = el('table', 'kn-table');
    [['单字', 'nihao → 你好', '首选词直接空格上屏'],
    ['整句', 'jintiantianqihenhao', '一口气输完再回头改，比逐字选快 30%+'],
    ['分隔符', "xi'an → 西安", "撇号强制分词，避免「先」的误判"],
    ['不会读', '忄+亡 → 忙', '拆字打法：偏旁读音 + 剩余部分'],
    ['生僻字', '↔', 'U 模式 / 手写 / 语音顶上']].forEach(function (r) {
      tbl.appendChild(el('tr', null, '<td><b>' + esc(r[0]) + '</b></td><td><code>' + esc(r[1]) + '</code></td><td>' + esc(r[2]) + '</td>'));
    });
    box.appendChild(el('h4', 'kn-zone', '提速技巧'));
    box.appendChild(tbl);
    return box;
  }

  function knStrokes() {
    var s = C.strokes, box = el('div');
    box.appendChild(el('p', 'kn-sub', '笔画输入法把汉字拆成 5 种基本笔画依次敲击，是手机端最可靠的兜底方案，也是五笔之外唯一「形码」入门路径。'));
    var tbl = el('table', 'kn-table');
    tbl.appendChild(el('tr', null, '<th>笔画</th><th>按键</th><th>包含</th>'));
    s.keys.forEach(function (k) {
      tbl.appendChild(el('tr', null,
        '<td class="st-name">' + esc(k.name) + '</td>' +
        '<td><kbd class="keycap">' + k.key + '</kbd> <code>' + k.letter + '</code></td>' +
        '<td>' + esc(k.includes) + '</td>'));
    });
    box.appendChild(tbl);
    box.appendChild(el('h4', 'kn-zone', '笔顺规则'));
    var ul = el('ul', 'kn-tips');
    s.rules.forEach(function (t) { ul.appendChild(el('li', null, esc(t))); });
    box.appendChild(ul);
    box.appendChild(el('h4', 'kn-zone', '示例'));
    var ex = el('div', 'st-examples');
    [['一', 'h'], ['十', 'hs'], ['人', 'pn'], ['大', 'hpn'], ['木', 'hspn'], ['水', 'szpn'], ['口', 'szh']].forEach(function (p) {
      ex.appendChild(el('span', 'st-example', '<b>' + p[0] + '</b><code>' + p[1] + '</code>'));
    });
    box.appendChild(ex);
    box.appendChild(el('h4', 'kn-zone', '诀窍'));
    var ul2 = el('ul', 'kn-tips');
    s.tips.forEach(function (t) { ul2.appendChild(el('li', null, esc(t))); });
    box.appendChild(ul2);
    return box;
  }

  function knFingering() {
    var f = C.fingering, box = el('div');
    box.appendChild(el('p', 'kn-sub', '所有输入法的底层都是指法。基准键 ' + esc(f.home) + '，全程盲打，眼睛只看屏幕。'));
    // 手指分工键盘
    var kbEl = el('div', 'kn-kb');
    box.appendChild(kbEl);
    var kb = root.Keyboard.create(kbEl);
    var fingerMap = {};
    f.fingers.forEach(function (fg) {
      fg.keys.split(/\s+/).forEach(function (k) { fingerMap[k.toLowerCase()] = fg.color; });
    });
    kb.setFingerColors(fingerMap);
    var legend = el('div', 'kn-legend');
    f.fingers.forEach(function (fg) {
      legend.appendChild(el('span', 'lg-item', '<i style="background:' + fg.color + '"></i>' + esc(fg.name)));
    });
    box.appendChild(legend);
    // 阶段
    box.appendChild(el('h4', 'kn-zone', '练习阶段'));
    var cols = el('div', 'kn-stage-grid');
    f.stages.forEach(function (s) {
      cols.appendChild(el('div', 'kn-stage', '<b>' + esc(s.title) + '</b><span>' + esc(s.text) + '</span>'));
    });
    box.appendChild(cols);
    box.appendChild(el('h4', 'kn-zone', '坐姿与健康'));
    var ul = el('ul', 'kn-tips');
    f.posture.forEach(function (t) { ul.appendChild(el('li', null, esc(t))); });
    box.appendChild(ul);
    box.appendChild(el('h4', 'kn-zone', '提速诀窍'));
    var ul2 = el('ul', 'kn-tips');
    f.tips.forEach(function (t) { ul2.appendChild(el('li', null, esc(t))); });
    box.appendChild(ul2);
    return box;
  }

  function renderKnowledge() {
    var tabs = $('knTabs'), body = $('knBody');
    tabs.innerHTML = ''; body.innerHTML = '';
    var builders = { wubi: knWubi, shuangpin: knShuangpin, pinyin: knPinyin, strokes: knStrokes, fingering: knFingering };
    KN_TABS.forEach(function (t, i) {
      var b = el('button', 'kn-tab' + (i === 0 ? ' active' : ''), t.name);
      b.onclick = function () {
        tabs.querySelectorAll('.kn-tab').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        body.innerHTML = '';
        body.appendChild(builders[t.id]());
      };
      tabs.appendChild(b);
    });
    body.appendChild(builders.wubi());
  }

  /* ==================== 键盘图鉴 ==================== */
  function diagramFor(item) {
    var D = root.DAZI_DIAGRAMS;
    if (!D || !item || !item.dg) return '';
    if (item.dg.type === 'layout') return D.layout(item.dg.spec);
    if (item.dg.type === 'split') return D.split();
    if (item.dg.type === 'switch') return D.switch(item.dg.stem, item.dg.tone);
    return '';
  }

  function renderGuide() {
    var g = C.keyboardGuide, wrap = $('guideBody');
    wrap.innerHTML = '';
    var D = root.DAZI_DIAGRAMS;

    /* ---- 配列规格：真实比例俯视图（每种配列独占一整行，保证键位看得清）---- */
    var s1 = el('section', 'guide-sec');
    s1.appendChild(el('h3', null, '键盘配列规格'));
    s1.appendChild(el('p', 'sec-sub', '按 1u = 19.05mm 标准键位单位等比绘制的俯视图，键位与字符完整，虚线框标出各功能区。'));
    var list1 = el('div', 'layout-list');
    g.layouts.forEach(function (it) {
      var row = el('div', 'layout-row');
      var holder = el('div');
      holder.innerHTML = diagramFor(it);
      var meta = el('div', 'layout-meta');
      meta.innerHTML = '<b>' + esc(it.name) + '</b>' +
        '<div class="g-meta">' + esc(it.keys || '') + (it.size ? ' · ' + esc(it.size) : '') + '</div>' +
        '<div class="g-zones">区域：' + esc(it.zones || '') + '</div>' +
        '<p>' + esc(it.desc) + '</p>';
      row.appendChild(holder);
      row.appendChild(meta);
      list1.appendChild(row);
    });
    s1.appendChild(list1);
    wrap.appendChild(s1);

    /* ---- 轴体类型：剖面图 + 部件说明 ---- */
    var s2 = el('section', 'guide-sec');
    s2.appendChild(el('h3', null, '轴体类型'));
    s2.appendChild(el('p', 'sec-sub', 'MX 轴体剖面（按真实比例绘制）。不同轴体的差别主要在轴心颜色与内部结构，声音与手感随之变化。'));
    var grid2 = el('div', 'guide-grid guide-grid-2');
    g.switches.forEach(function (it) {
      var card = el('div', 'guide-card guide-card-img');
      var swatch = '<i class="swatch" style="background:' + (it.dg && it.dg.stem) + '"></i>';
      card.innerHTML = '<b>' + swatch + esc(it.name) + '</b>' +
        '<div class="g-meta">' + [it.type, it.force, it.travel].filter(Boolean).map(esc).join(' · ') + '</div>' +
        '<div class="dg-holder"></div><p>' + esc(it.desc) + '</p>';
      card.querySelector('.dg-holder').innerHTML = diagramFor(it);
      grid2.appendChild(card);
    });
    s2.appendChild(grid2);
    // 部件说明
    var parts = el('div', 'kn-callout');
    parts.innerHTML = '<b>MX 轴体由上到下</b><ul class="kn-tips">' +
      ['<b>键帽</b>：套在轴心十字柱上的塑料帽，材质常见 ABS / PBT',
       '<b>上盖</b>：轴体上半部分塑料外壳，内部有滑轨与卡扣',
       '<b>轴心</b>：十字柱，颜色即轴体分类（青/茶/红/黑/银）；咔嗒轴多一个发声拨片，段落轴轴心侧面有凸点',
       '<b>弹簧</b>：提供回弹力，长弹簧 = 轻压力，长短决定触发克数',
       '<b>金属触点</b>：镀金十字触点，接触瞬间触发按键',
       '<b>底壳</b>：固定轴体，两侧金属针脚插进 PCB 镀金孔'].map(function (t) {
        return '<li>' + t + '</li>';
      }).join('') + '</ul>';
    s2.appendChild(parts);
    // 手感曲线（数据图）
    var curve = el('div', 'guide-card guide-card-wide');
    curve.innerHTML = '<b>触发压力 × 按键行程</b><p>' + esc(g.diagrams.forceCurve.desc) + '</p>';
    curve.insertAdjacentHTML('beforeend', D.forceCurve());
    s2.appendChild(curve);
    wrap.appendChild(s2);

    /* ---- 键帽材质与高度 ---- */
    var s3 = el('section', 'guide-sec');
    s3.appendChild(el('h3', null, '键帽材质与高度'));
    var card3 = el('div', 'guide-card guide-card-wide');
    card3.innerHTML = '<b>不同高度的键帽（从左到右由矮到高）</b>' +
      '<p>键帽越高，手腕要抬得越高；矮轴接近笔记本手感。常见高度：矮轴 ≈7mm、原厂/Cherry ≈9.4mm、OEM ≈11.5mm、SA 高球 ≈16mm。</p>' +
      '<div class="dg-holder"></div>';
    card3.querySelector('.dg-holder').innerHTML = D.keycapProfile();
    s3.appendChild(card3);
    var grid3 = el('div', 'guide-grid');
    g.keycaps.forEach(function (it) {
      var card = el('div', 'guide-card');
      card.innerHTML = '<b>' + esc(it.name) + '</b><p>' + esc(it.desc) + '</p>';
      grid3.appendChild(card);
    });
    s3.appendChild(grid3);
    wrap.appendChild(s3);

    /* ---- 结构 ---- */
    var s4 = el('section', 'guide-sec');
    s4.appendChild(el('h3', null, '结构与连接'));
    var grid4 = el('div', 'guide-grid guide-grid-2');
    var c41 = el('div', 'guide-card');
    c41.innerHTML = '<b>船壳 / 托盘</b><p>顶盖直接承力，定位板用螺钉固定，回弹干脆、声音清脆。</p><div class="dg-holder"></div>';
    c41.querySelector('.dg-holder').innerHTML = D.structure('tray');
    grid4.appendChild(c41);
    var c42 = el('div', 'guide-card');
    c42.innerHTML = '<b>Gasket 垫片悬挂</b><p>内胆与外壳之间垫硅胶垫片，敲击软弹、声音更沉，现在的主流结构。</p><div class="dg-holder"></div>';
    c42.querySelector('.dg-holder').innerHTML = D.structure('gasket');
    grid4.appendChild(c42);
    s4.appendChild(grid4);
    var grid4b = el('div', 'guide-grid');
    g.structure.forEach(function (it) {
      var card = el('div', 'guide-card');
      card.innerHTML = '<b>' + esc(it.name) + '</b><p>' + esc(it.desc) + '</p>';
      grid4b.appendChild(card);
    });
    s4.appendChild(grid4b);
    wrap.appendChild(s4);

    /* ---- 布局与键位文化 ---- */
    var s5 = el('section', 'guide-sec');
    s5.appendChild(el('h3', null, '布局与键位文化'));
    var grid5 = el('div', 'guide-grid');
    g.layout.forEach(function (it) {
      var card = el('div', 'guide-card');
      card.innerHTML = '<b>' + esc(it.name) + '</b><p>' + esc(it.desc) + '</p>';
      grid5.appendChild(card);
    });
    s5.appendChild(grid5);
    wrap.appendChild(s5);

    /* ---- 术语表 ---- */
    var s6 = el('section', 'guide-sec');
    s6.appendChild(el('h3', null, '术语表'));
    var grid6 = el('div', 'guide-grid');
    g.glossary.forEach(function (it) {
      var card = el('div', 'guide-card');
      card.innerHTML = '<b>' + esc(it.name) + '</b><p>' + esc(it.desc) + '</p>';
      grid6.appendChild(card);
    });
    s6.appendChild(grid6);
    wrap.appendChild(s6);

    /* ---- 保养 ---- */
    var care = el('section', 'guide-sec');
    care.appendChild(el('h3', null, '保养与避坑'));
    var ul = el('ul', 'kn-tips');
    g.care.forEach(function (t) { ul.appendChild(el('li', null, esc(t))); });
    care.appendChild(ul);
    wrap.appendChild(care);
  }

  function init() {
    renderKnowledge();
    renderGuide();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
