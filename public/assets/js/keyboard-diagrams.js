/**
 * keyboard-diagrams.js — 键盘图鉴配图（全部为内联 SVG，无位图依赖）
 *
 * 1. 配列俯视图：按 1u = 19.05mm 标准键位单位等比绘制，键位齐全、字符完整，
 *    并用虚线框标出 F 区 / 主键区 / 导航区 / 方向键 / 数字区 / 编辑键列
 * 2. MX 轴体剖面：按真实比例（轴体 14×14mm、键帽 18×18mm）绘制并逐件标注
 * 3. 键帽剖面：按真实 profile 行高与倾角绘制并对比
 * 4. 结构剖面：船壳（顶盖承力）与 Gasket（垫片悬吊）对照
 */
(function (root) {
  var U = 19;        // 1u = 19px（真实 19.05mm）
  var GAP = 1.6;     // 键间隙
  var PAD = 8;       // 外壳内边距

  /* ==================== 真实配列键位定义 ==================== */
  // 主键区（ANSI 标准 61 键，真实错位）
  var MAIN_ROWS = [
    [{ x: 0, c: '`' }, { x: 1, c: '1' }, { x: 2, c: '2' }, { x: 3, c: '3' }, { x: 4, c: '4' },
     { x: 5, c: '5' }, { x: 6, c: '6' }, { x: 7, c: '7' }, { x: 8, c: '8' }, { x: 9, c: '9' },
     { x: 10, c: '0' }, { x: 11, c: '-' }, { x: 12, c: '=' }, { x: 13, w: 2, c: '⌫' }],
    [{ x: 0, w: 1.5, c: 'Tab' }, { x: 1.5, c: 'Q' }, { x: 2.5, c: 'W' }, { x: 3.5, c: 'E' },
     { x: 4.5, c: 'R' }, { x: 5.5, c: 'T' }, { x: 6.5, c: 'Y' }, { x: 7.5, c: 'U' },
     { x: 8.5, c: 'I' }, { x: 9.5, c: 'O' }, { x: 10.5, c: 'P' }, { x: 11.5, c: '[' },
     { x: 12.5, c: ']' }, { x: 13.5, w: 1.5, c: '\\' }],
    [{ x: 0, w: 1.75, c: 'Caps' }, { x: 1.75, c: 'A' }, { x: 2.75, c: 'S' }, { x: 3.75, c: 'D' },
     { x: 4.75, c: 'F' }, { x: 5.75, c: 'G' }, { x: 6.75, c: 'H' }, { x: 7.75, c: 'J' },
     { x: 8.75, c: 'K' }, { x: 9.75, c: 'L' }, { x: 10.75, c: ';' }, { x: 11.75, c: '\'' },
     { x: 12.75, w: 2.25, c: 'Enter' }],
    [{ x: 0, w: 2.25, c: 'Shift' }, { x: 2.25, c: 'Z' }, { x: 3.25, c: 'X' }, { x: 4.25, c: 'C' },
     { x: 5.25, c: 'V' }, { x: 6.25, c: 'B' }, { x: 7.25, c: 'N' }, { x: 8.25, c: 'M' },
     { x: 9.25, c: ',' }, { x: 10.25, c: '.' }, { x: 11.25, c: '/' }, { x: 12.25, w: 2.75, c: 'Shift' }],
    [{ x: 0, w: 1.25, c: 'Ctrl' }, { x: 1.25, w: 1.25, c: 'Win' }, { x: 2.5, w: 1.25, c: 'Alt' },
     { x: 3.75, w: 6.25, c: '' }, { x: 10, w: 1.25, c: 'Alt' }, { x: 11.25, w: 1.25, c: 'Fn' },
     { x: 12.5, w: 1.25, c: 'Menu' }, { x: 13.75, w: 1.25, c: 'Ctrl' }]
  ];
  var F_ROW = [{ x: 0, c: 'Esc' }, { x: 2, c: 'F1' }, { x: 3, c: 'F2' }, { x: 4, c: 'F3' }, { x: 5, c: 'F4' },
    { x: 6.5, c: 'F5' }, { x: 7.5, c: 'F6' }, { x: 8.5, c: 'F7' }, { x: 9.5, c: 'F8' },
    { x: 11, c: 'F9' }, { x: 12, c: 'F10' }, { x: 13, c: 'F11' }, { x: 14, c: 'F12' }];
  var NAV_TOP = [{ c: 'PrtSc' }, { c: 'ScrLk' }, { c: 'Pause' }];
  var NAV_ROWS = [
    [{ c: 'Ins' }, { c: 'Home' }, { c: 'PgUp' }],
    [{ c: 'Del' }, { c: 'End' }, { c: 'PgDn' }]
  ];
  var ARROWS = [[{ c: '↑' }], [{ c: '←' }, { c: '↓' }, { c: '→' }]];
  var NUMPAD = [
    [{ c: 'Num' }, { c: '/' }, { c: '*' }, { c: '-' }],
    [{ c: '7' }, { c: '8' }, { c: '9' }, { c: '+', h: 2 }],
    [{ c: '4' }, { c: '5' }, { c: '6' }],
    [{ c: '1' }, { c: '2' }, { c: '3' }, { c: '⏎', h: 2 }],
    [{ c: '0', w: 2 }, { c: '.' }]
  ];
  var SIDE_COL = [{ c: 'Home' }, { c: 'PgUp' }, { c: 'Del' }, { c: 'PgDn' }];

  /* ==================== 绘制基础 ==================== */
  function label(x, y, text, cls, anchor) {
    return '<text x="' + x + '" y="' + y + '" class="' + (cls || 'dg-label') + '"' +
      (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + text + '</text>';
  }

  function keycap(x, y, w, h, text, opts) {
    opts = opts || {};
    var kw = w * U - GAP;
    var kh = (h || 1) * U - GAP;
    var out = '<rect x="' + x + '" y="' + y + '" width="' + kw + '" height="' + kh + '" rx="3" class="kb-base"/>';
    var i = opts.wide ? 4.5 : 8;
    out += '<path d="M' + (x + i) + ' ' + (y + 1.2) + ' H' + (x + kw - i) +
      ' L' + (x + kw - 0.6) + ' ' + (y + kh - 2.6) + ' H' + (x + 0.6) + ' Z" class="kb-cap"/>';
    if (text) {
      var fs = text.length > 2 ? 6 : text.length > 1 ? 7 : 8.5;
      out += '<text x="' + (x + kw / 2) + '" y="' + (y + kh / 2 + fs * 0.35) +
        '" class="kb-key-label' + (opts.dim ? ' dim' : '') + '" font-size="' + fs + '">' + text + '</text>';
    }
    return out;
  }

  function bounds(keys) {
    var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    keys.forEach(function (k) {
      minX = Math.min(minX, k.x); minY = Math.min(minY, k.y);
      maxX = Math.max(maxX, k.x + (k.w || 1)); maxY = Math.max(maxY, k.y + (k.h || 1));
    });
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  /* ==================== 配列俯视图 ==================== */
  /**
   * spec: {
   *   f: 含 F 区, nav: 含导航区, num: 含数字区, side: 含编辑键列,
   *   navTop: 导航区顶部（PrtSc/ScrLk/Pause）, rows: 自定义主键区
   * }
   */
  function layoutDiagram(spec) {
    spec = spec || {};
    var mainRows = spec.rows || MAIN_ROWS;
    var parts = [];
    var zones = [];   // {name, x, y, w, h}

    // ---- F 区 ----
    if (spec.f) {
      var fkeys = F_ROW.map(function (k) { return { x: k.x, y: -1.6, c: k.c }; });
      fkeys.forEach(function (k) { parts.push(keycap(PAD + k.x * U, PAD + (k.y + 1.6) * U, 1, 1, k.c)); });
      var fb = bounds(fkeys);
      zones.push({ name: 'F 区', x: fb.x, y: fb.y, w: fb.w, h: fb.h });
    }

    // ---- 主键区 ----
    var mainKeys = [];
    mainRows.forEach(function (row, ri) {
      row.forEach(function (k) { mainKeys.push({ x: k.x, y: ri, w: k.w || 1, c: k.c }); });
    });
    var mainTop = spec.f ? 1.6 : 0;
    mainKeys.forEach(function (k) {
      parts.push(keycap(PAD + k.x * U, PAD + (k.y + mainTop) * U, k.w, 1, k.c, { wide: k.w > 1.5 }));
    });
    var mb = bounds(mainKeys);
    zones.push({ name: '主键区', x: mb.x, y: mb.y, w: mb.w, h: mb.h });

    var mainW = 15;
    var navX = mainW + 0.6;

    // ---- 导航区 ----
    if (spec.nav) {
      var navKeys = [];
      if (spec.navTop) {
        NAV_TOP.forEach(function (k, i) {
          var kk = { x: navX + i, y: -1.6, c: k.c };
          navKeys.push(kk);
          parts.push(keycap(PAD + kk.x * U, PAD + (kk.y + 1.6) * U, 1, 1, kk.c, { dim: true }));
        });
      }
      NAV_ROWS.forEach(function (row, ri) {
        row.forEach(function (k, ci) {
          var kk = { x: navX + ci, y: ri, c: k.c };
          navKeys.push(kk);
          parts.push(keycap(PAD + kk.x * U, PAD + (kk.y + mainTop) * U, 1, 1, kk.c, { dim: true }));
        });
      });
      var nb = bounds(navKeys);
      zones.push({ name: '导航区', x: nb.x, y: nb.y, w: nb.w, h: nb.h });

      // 方向键区（TKL/100% 在导航区下方，对齐最底两行）
      if (!spec.side) {
        var akeys = [];
        ARROWS.forEach(function (row, ri) {
          row.forEach(function (k, ci) {
            var kk = { x: navX + ci, y: 3 + ri, c: k.c };
            akeys.push(kk);
            parts.push(keycap(PAD + kk.x * U, PAD + (kk.y + mainTop) * U, 1, 1, kk.c, { dim: true }));
          });
        });
        var ab = bounds(akeys);
        zones.push({ name: '方向键', x: ab.x, y: ab.y, w: ab.w, h: ab.h });
      }
    }

    // ---- 编辑键列（75%）----
    if (spec.side) {
      var skeys = [];
      SIDE_COL.forEach(function (k, ri) {
        var kk = { x: navX, y: ri, c: k.c };
        skeys.push(kk);
        parts.push(keycap(PAD + (navX + kk.x) * U, PAD + (kk.y + mainTop) * U, 1, 1, kk.c, { dim: true }));
      });
      var sb = bounds(skeys);
      zones.push({ name: '编辑键列', x: sb.x, y: sb.y, w: sb.w, h: sb.h });
    }

    // ---- 数字区 ----
    if (spec.num) {
      var numX = navX + (spec.nav ? 3.6 : 0.6);
      var nkeys = [];
      NUMPAD.forEach(function (row, ri) {
        row.forEach(function (k, ci) {
          var kk = { x: numX + ci, y: ri, w: k.w || 1, h: k.h || 1, c: k.c };
          nkeys.push(kk);
          parts.push(keycap(PAD + kk.x * U, PAD + (kk.y + mainTop) * U, kk.w, kk.h, kk.c, { dim: true, wide: kk.w > 1.5 }));
        });
      });
      var numb = bounds(nkeys);
      zones.push({ name: '数字区', x: numb.x, y: numb.y, w: numb.w, h: numb.h });
    }

    // ---- 外壳与区域标注 ----
    var bodyW = mainW + 0.6;
    if (spec.nav) bodyW += 3.6;
    if (spec.num) bodyW += 4.6;
    if (spec.side) bodyW += 1.6;
    var totalW = PAD * 2 + bodyW * U + ((spec.nav || spec.num || spec.side) ? 54 : 0);
    var totalH = PAD * 2 + (mainTop + mainRows.length + 0.6) * U;

    var shell = '<rect x="1.2" y="1.2" width="' + (totalW - 2.4) + '" height="' + (totalH - 2.4) + '" rx="9" class="kb-shell"/>';

    // 区域虚线框 + 名称（带底衬，F 区标签置顶，其余置框内右上角）
    var zoneSvg = '';
    zones.forEach(function (z) {
      var zx = PAD + z.x * U - 4, zy = PAD + (z.y + mainTop) * U - 4;
      var zw = z.w * U + 8, zh = z.h * U + 8;
      zoneSvg += '<rect x="' + zx + '" y="' + zy + '" width="' + zw + '" height="' + zh +
        '" rx="6" class="kb-zone"/>';
      var tw = z.name.length * 11 + 8;
      var tx, ty;
      if (z.name === 'F 区') { tx = zx + 2; ty = zy - 3; }
      else if (z.name === '主键区') { tx = zx + 2; ty = zy + zh + 12; }
      else { tx = zx + zw + 5; ty = zy + 12; }
      zoneSvg += '<rect x="' + tx + '" y="' + (ty - 11) + '" width="' + tw + '" height="15" rx="3" class="kb-zone-tag"/>';
      zoneSvg += label(tx + 4, ty, z.name, 'kb-zone-label');
    });

    return '<svg class="dg dg-layout" viewBox="0 0 ' + totalW + ' ' + (totalH + 36) +
      '" role="img" aria-label="键盘配列俯视图"><g transform="translate(0,18)">' +
      shell + parts.join('') + zoneSvg + '</g></svg>';
  }

  /* ==================== 分体式（ErgoDox 风格） ==================== */
  function splitDiagram() {
    var parts = [];
    var left = [
      [{ c: 'Esc' }, { c: '1' }, { c: '2' }, { c: '3' }, { c: '4' }, { c: '5' }],
      [{ c: '`' }, { c: 'Q' }, { c: 'W' }, { c: 'E' }, { c: 'R' }, { c: 'T' }],
      [{ c: 'Tab', w: 1.5 }, { c: 'A' }, { c: 'S' }, { c: 'D' }, { c: 'F' }, { c: 'G' }],
      [{ c: 'Shift', w: 1.75 }, { c: 'Z' }, { c: 'X' }, { c: 'C' }, { c: 'V' }, { c: 'B' }],
      [{ c: 'Ctrl', w: 1.25 }, { c: 'Win', w: 1.25 }, { c: 'Alt', w: 1.25 }, { c: '', w: 2.25 }]
    ];
    var right = [
      [{ c: '6' }, { c: '7' }, { c: '8' }, { c: '9' }, { c: '0' }, { c: '-' }],
      [{ c: 'Y' }, { c: 'U' }, { c: 'I' }, { c: 'O' }, { c: 'P' }, { c: '[' }],
      [{ c: 'H' }, { c: 'J' }, { c: 'K' }, { c: 'L' }, { c: ';' }, { c: "'" }],
      [{ c: 'N' }, { c: 'M' }, { c: ',' }, { c: '.' }, { c: '/' }, { c: 'Shift', w: 1.5 }],
      [{ c: '', w: 1.5 }, { c: 'Alt', w: 1.25 }, { c: 'Win', w: 1.25 }, { c: 'Ctrl', w: 1.25 }]
    ];
    function half(rows, ox) {
      var s = '';
      rows.forEach(function (row, ri) {
        var x = 0;
        row.forEach(function (k) {
          s += keycap(ox + x * U, PAD + ri * U, k.w || 1, 1, k.c);
          x += (k.w || 1);
        });
      });
      return s;
    }
    var halfW = 6 * U;
    parts.push('<rect x="1.2" y="1.2" width="' + (halfW + PAD + 6) + '" height="' + (5 * U + PAD + 4) + '" rx="9" class="kb-shell"/>');
    parts.push('<rect x="' + (halfW + PAD + 14) + '" y="1.2" width="' + (halfW + PAD + 6) + '" height="' + (5 * U + PAD + 4) + '" rx="9" class="kb-shell"/>');
    parts.push(half(left, PAD));
    parts.push(half(right, halfW + PAD + 20));
    var totalW = halfW * 2 + PAD * 2 + 26;
    var totalH = 5 * U + PAD * 2 + 4;
    parts.push(label(PAD, totalH - 3, '左手 6 列', 'kb-zone-label'));
    parts.push(label(halfW + PAD + 20, totalH - 3, '右手 6 列', 'kb-zone-label'));
    return '<svg class="dg dg-layout" viewBox="0 0 ' + totalW + ' ' + totalH +
      '" role="img" aria-label="分体式键盘布局俯视图">' + parts.join('') + '</svg>';
  }

  /* ==================== MX 轴体剖面（真实比例） ==================== */
  function switchDiagram(stemColor, type) {
    var s = '';
    var stem = stemColor;
    var clickBar = type === 'click';
    var bump = type === 'tactile';

    // 键帽（剖面）
    s += '<path d="M46 6 H124 L118 26 H52 Z" class="dg-cap-face"/>';
    s += '<path d="M52 26 H118 V30 H52 Z" class="dg-cap-side"/>';
    s += label(126, 14, '键帽', 'dg-anno');
    // 上盖
    s += '<path d="M56 30 H114 V62 H56 Z M96 38 A8 8 0 0 0 80 38 A8 8 0 0 0 96 38 Z" class="dg-housing" fill-rule="evenodd"/>';
    s += label(4, 40, '上盖', 'dg-anno');
    // 轴心（十字柱 + 滑轨）
    s += '<rect x="82" y="20" width="10" height="46" rx="2" class="dg-stem" style="fill:' + stem + '"/>';
    s += '<rect x="72" y="34" width="30" height="9" rx="2" class="dg-stem" style="fill:' + stem + '"/>';
    s += '<rect x="74" y="43" width="26" height="7" rx="2" class="dg-stem" style="fill:' + stem + '"/>';
    s += label(126, 34, '轴心', 'dg-anno');
    // 弹簧
    s += '<path d="M87 66 l-7 6 l14 0 l-14 6 l14 0 l-14 6 l14 0 l-7 5" class="dg-spring"/>';
    s += label(126, 80, '弹簧', 'dg-anno');
    // 镀金触点
    s += '<rect x="66" y="62" width="3" height="34" rx="1.5" class="dg-leaf"/>';
    s += '<rect x="106" y="62" width="3" height="34" rx="1.5" class="dg-leaf"/>';
    s += '<path d="M85 96 l4 4 l4 -4" class="dg-contact"/>';
    s += label(4, 106, '金属触点', 'dg-anno');
    // 咔嗒拨片 / 段落凸点
    if (clickBar) {
      s += '<rect x="106" y="80" width="18" height="4" rx="2" class="dg-clickbar"/>';
      s += label(128, 84, '咔嗒拨片', 'dg-anno');
    }
    if (bump) {
      s += '<path d="M70 44 q5 5 0 8" class="dg-bump"/>';
      s += label(128, 50, '段落凸点', 'dg-anno');
    }
    // 底壳
    s += '<path d="M52 96 H122 V126 H52 Z" class="dg-housing"/>';
    s += label(126, 116, '底壳', 'dg-anno');
    // PCB 针脚
    s += '<rect x="70" y="126" width="4" height="14" rx="1.5" class="dg-pin"/>';
    s += '<rect x="100" y="126" width="4" height="14" rx="1.5" class="dg-pin"/>';
    s += label(4, 144, 'PCB 针脚', 'dg-anno');
    s += '<rect x="44" y="140" width="96" height="7" rx="2" class="dg-pcb"/>';
    s += label(146, 146, 'PCB', 'dg-anno');

    // 行程标注：总行程竖排在左，触发行程放底部，避免压住结构
    s += '<line x1="18" y1="26" x2="18" y2="30" class="dg-dim"/>';
    s += '<line x1="18" y1="30" x2="18" y2="96" class="dg-dim dash"/>';
    s += '<text x="14" y="58" class="dg-tick end" transform="rotate(-90 14 58)">总行程 4.0mm</text>';
    s += '<line x1="26" y1="62" x2="26" y2="66" class="dg-dim"/>';
    s += '<line x1="26" y1="64" x2="34" y2="128" class="dg-dim dash"/>';
    s += '<text x="36" y="122" class="dg-tick start">触发行程 2.0mm 处触发</text>';

    return '<svg class="dg dg-switch" viewBox="0 0 210 152" role="img" aria-label="机械键盘轴体剖面图">' + s + '</svg>';
  }

  /* ==================== 键帽剖面（真实 profile） ==================== */
  function keycapProfileDiagram() {
    var profiles = [
      { name: '原厂 / Cherry', h: 9.4, top: 0, cls: 'dg-cap-a', note: 'R1 最高，逐行降低' },
      { name: 'OEM', h: 11.5, top: 2, cls: 'dg-cap-b', note: '整体更高，倾角更缓' },
      { name: 'SA 高球', h: 16, top: 6, cls: 'dg-cap-c', note: '球面高，包裹指腹' },
      { name: '矮轴 / XDA', h: 7, top: -3, cls: 'dg-cap-d', note: '统一行高，圆柱顶' }
    ];
    var s = '', base = 128, gap = 104, i;
    for (i = 0; i < profiles.length; i++) {
      var p = profiles[i];
      var x = 16 + i * gap;
      var topY = base - p.h * 4.4 - p.top;
      var topW = 36;
      // 轴体
      s += '<rect x="' + (x + 14) + '" y="' + (base - 16) + '" width="24" height="16" rx="3" class="dg-housing"/>';
      s += '<rect x="' + (x + 22) + '" y="' + (base - 22) + '" width="8" height="8" rx="2" class="dg-stem" style="fill:#8a857a"/>';
      // 键帽：顶面凹弧 + 侧壁倾角
      s += '<path d="M' + x + ' ' + (topY + 10) +
        ' q' + (topW / 2) + ' -9 ' + topW + ' 0' +
        ' L' + (x + topW + 6) + ' ' + (base - 20) + ' L' + (x - 6) + ' ' + (base - 20) + ' Z" class="' + p.cls + '"/>';
      s += '<path d="M' + (x - 6) + ' ' + (base - 20) + ' L' + (x + topW + 6) + ' ' + (base - 20) +
        ' L' + (x + topW + 4) + ' ' + (base - 16) + ' L' + (x - 4) + ' ' + (base - 16) + ' Z" class="' + p.cls + ' side"/>';
      // 高度标注
      s += '<line x1="' + (x + topW + 14) + '" y1="' + (topY + 4) + '" x2="' + (x + topW + 14) + '" y2="' + (base - 18) + '" class="dg-dim"/>';
      s += '<line x1="' + (x + topW + 11) + '" y1="' + (topY + 4) + '" x2="' + (x + topW + 17) + '" y2="' + (topY + 4) + '" class="dg-dim"/>';
      s += '<line x1="' + (x + topW + 11) + '" y1="' + (base - 18) + '" x2="' + (x + topW + 17) + '" y2="' + (base - 18) + '" class="dg-dim"/>';
      s += label(x + topW + 20, (topY + 4 + base - 18) / 2 + 4, '≈' + p.h + 'mm', 'dg-tick start');
      s += label(x - 4, base + 18, p.name, 'dg-label');
      s += label(x - 4, base + 30, p.note, 'dg-label dim');
    }
    s += label(16, base + 48, '键帽越高，手腕需要抬得越高；矮轴接近笔记本手感，长时间打字更轻松', 'dg-label dim');
    return '<svg class="dg dg-chart" viewBox="0 0 440 190" role="img" aria-label="键帽高度剖面对比">' + s + '</svg>';
  }

  /* ==================== 结构剖面：船壳 vs Gasket ==================== */
  function structureDiagram(kind) {
    var s = '';
    if (kind === 'gasket') {
      s += '<rect x="12" y="14" width="196" height="92" rx="9" class="dg-case"/>';
      s += '<rect x="26" y="30" width="168" height="16" rx="3" class="dg-case-top"/>';
      s += '<rect x="30" y="46" width="160" height="34" rx="4" class="dg-plate"/>';
      s += '<rect x="24" y="40" width="9" height="46" rx="3" class="dg-gasket"/>';
      s += '<rect x="187" y="40" width="9" height="46" rx="3" class="dg-gasket"/>';
      s += '<rect x="40" y="80" width="140" height="11" rx="3" class="dg-foam"/>';
      s += '<rect x="58" y="91" width="104" height="9" rx="3" class="dg-foam"/>';
      s += '<rect x="46" y="22" width="26" height="10" rx="2" class="dg-cap-mini"/>';
      s += '<rect x="82" y="22" width="26" height="10" rx="2" class="dg-cap-mini"/>';
      s += '<rect x="118" y="22" width="26" height="10" rx="2" class="dg-cap-mini"/>';
      s += label(214, 52, '定位板（浮动）', 'dg-anno');
      s += label(214, 72, 'Gasket 垫片', 'dg-anno');
      s += label(214, 92, '夹心棉 / 底棉', 'dg-anno');
      s += label(20, 26, '外壳', 'dg-anno');
    } else {
      s += '<rect x="12" y="14" width="196" height="92" rx="9" class="dg-case"/>';
      s += '<rect x="26" y="24" width="168" height="52" rx="4" class="dg-plate"/>';
      s += '<circle cx="40" cy="34" r="3.2" class="dg-screw"/><circle cx="180" cy="34" r="3.2" class="dg-screw"/>';
      s += '<rect x="40" y="80" width="140" height="11" rx="3" class="dg-foam"/>';
      s += '<rect x="58" y="91" width="104" height="9" rx="3" class="dg-foam"/>';
      s += '<rect x="46" y="14" width="26" height="10" rx="2" class="dg-cap-mini"/>';
      s += '<rect x="82" y="14" width="26" height="10" rx="2" class="dg-cap-mini"/>';
      s += '<rect x="118" y="14" width="26" height="10" rx="2" class="dg-cap-mini"/>';
      s += label(214, 42, '顶盖承力', 'dg-anno');
      s += label(214, 62, '定位板螺钉固定', 'dg-anno');
      s += label(214, 88, '底棉', 'dg-anno');
      s += label(20, 26, '外壳', 'dg-anno');
    }
    return '<svg class="dg dg-chart" viewBox="0 0 268 114" role="img" aria-label="键盘结构剖面示意图">' + s + '</svg>';
  }

  /* ==================== 手感曲线（数据图） ==================== */
  function forceCurve() {
    var s = '';
    var x0 = 46, y0 = 16, w = 330, h = 150;
    for (var i = 0; i <= 4; i++) {
      var gx = x0 + (w * i / 4);
      s += '<line x1="' + gx + '" y1="' + y0 + '" x2="' + gx + '" y2="' + (y0 + h) + '" class="dg-grid"/>';
      s += label(gx, y0 + h + 14, (i).toFixed(1), 'dg-tick');
    }
    for (var j = 0; j <= 4; j++) {
      var gy = y0 + h - (h * j / 4);
      s += '<line x1="' + x0 + '" y1="' + gy + '" x2="' + (x0 + w) + '" y2="' + gy + '" class="dg-grid"/>';
      s += label(x0 - 8, gy + 4, (j * 15).toString(), 'dg-tick end');
    }
    s += '<line x1="' + x0 + '" y1="' + (y0 + h) + '" x2="' + (x0 + w + 8) + '" y2="' + (y0 + h) + '" class="dg-axis"/>';
    s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + (y0 + h + 8) + '" class="dg-axis"/>';
    s += label(x0 + w / 2, y0 + h + 40, '按键行程 mm', 'dg-axis-label');
    s += '<text x="14" y="' + (y0 + h / 2) + '" class="dg-axis-label" transform="rotate(-90 14 ' + (y0 + h / 2) + ')">触发压力 g</text>';

    function pt(t, f) { return [x0 + w * t / 4, y0 + h - h * f / 60]; }
    var linear = [pt(0, 45), pt(1, 45), pt(2, 45), pt(3, 45), pt(4, 45)];
    var tactile = [pt(0, 42), pt(0.9, 45), pt(1.6, 50), pt(1.9, 57), pt(2.2, 52), pt(3, 48), pt(4, 45)];
    var clicky = [pt(0, 40), pt(0.8, 44), pt(1.4, 48), pt(1.9, 62), pt(2.15, 45), pt(3, 45), pt(4, 45)];
    function path(pts) {
      return 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
    }
    s += '<path d="' + path(linear) + '" class="dg-curve linear"/>';
    s += '<path d="' + path(tactile) + '" class="dg-curve tactile"/>';
    s += '<path d="' + path(clicky) + '" class="dg-curve clicky"/>';
    var y50 = y0 + h - h * 50 / 60;
    s += '<line x1="' + x0 + '" y1="' + y50 + '" x2="' + (x0 + w) + '" y2="' + y50 + '" class="dg-baseline"/>';
    s += label(x0 + 5, y50 - 4, '50g 触发压力', 'dg-tick start');
    s += label(x0 + w * 0.5, y0 + h + 24, '触发行程 ≈2.0mm 处触发', 'dg-tick');
    s += label(x0 + w * 0.24, y0 + 14, '咔嗒（青轴）：冲顶再回落', 'dg-anno');
    s += label(x0 + w * 0.60, y0 + 58, '线性（红/黑轴）：直上直下', 'dg-anno');
    s += label(x0 + w * 0.14, y0 + 92, '段落（茶轴）：中途一个小凸起', 'dg-anno');
    return '<svg class="dg dg-chart" viewBox="0 0 420 220" role="img" aria-label="轴体触发压力与行程曲线">' + s + '</svg>';
  }

  root.DAZI_DIAGRAMS = {
    layout: layoutDiagram,
    split: splitDiagram,
    switch: switchDiagram,
    keycapProfile: keycapProfileDiagram,
    structure: structureDiagram,
    forceCurve: forceCurve
  };
})(typeof window !== 'undefined' ? window : globalThis);
