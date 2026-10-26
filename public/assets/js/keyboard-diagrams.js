/**
 * keyboard-diagrams.js — 键盘图鉴示意图（内联 SVG，不依赖任何外链图片）
 * 每张图都带中文标注与引线说明：配列对比 / 轴体剖面 / 手感曲线 / 键帽剖面 / 结构剖面
 */
(function (root) {
  var U = 8;   // 键位单位宽
  var G = 1;   // 键位间隙
  var H = 8;   // 键位高

  /* ---------- 迷你键盘 ---------- */
  function key(x, y, w, cls) {
    var kw = w * U + (w - 1) * G;
    return '<rect x="' + x + '" y="' + y + '" width="' + kw + '" height="' + H + '" rx="2" class="' + (cls || 'dg-key') + '"/>';
  }
  function rowKeys(x0, y, widths, cls) {
    var out = '', x = x0;
    widths.forEach(function (w) {
      out += key(x, y, w, cls);
      x += w * U + (w - 1) * G + G;
    });
    return out;
  }
  function label(x, y, text, cls) {
    return '<text x="' + x + '" y="' + y + '" class="' + (cls || 'dg-label') + '">' + text + '</text>';
  }

  var MAIN_ROWS = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],   // 数字行
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5], // Q 行
    [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],    // A 行
    [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],          // Z 行
    [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25]  // 底排
  ];
  var F_ROW = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5];

  /**
   * 配列示意图
   * spec: { f:有F区, nav:导航区, num:数字区, arrow:方向键列, split:分体, rows:自定义行 }
   */
  function layoutDiagram(spec) {
    var mainW = 15 * U + 14 * G;   // 主键区宽
    var parts = [], x = 0, y = 0;
    var rows = spec.rows || MAIN_ROWS;

    if (spec.f) {
      parts.push(rowKeys(0, 0, F_ROW));
      y += H + G + 5;
      parts.push(label(0, y - 2, 'F 区', 'dg-label dim'));
    }
    var mainTop = y;
    rows.forEach(function (w, i) {
      parts.push(rowKeys(0, y, w));
      y += H + G;
    });
    parts.push(label(2, mainTop + 22, '主键区', 'dg-label dim'));

    // 导航区 / 数字区 / 方向键
    if (spec.nav) {
      var nx = mainW + 8;
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) parts.push(key(nx + c * (U + G), mainTop + r * (H + G), 1));
      }
      parts.push(label(nx, mainTop + 3 * (H + G) + 6, '导航区', 'dg-label dim'));
    }
    if (spec.arrow) {
      var ax = mainW + 8;
      for (var a = 0; a < 4; a++) parts.push(key(ax, mainTop + a * (H + G), 1));
      parts.push(label(ax - 2, mainTop + 4 * (H + G) + 6, '方向键', 'dg-label dim'));
    }
    if (spec.num) {
      var px = mainW + (spec.nav ? 8 + 3 * (U + G) + 8 : 8);
      for (var pr = 0; pr < 4; pr++) {
        for (var pc = 0; pc < 4; pc++) parts.push(key(px + pc * (U + G), mainTop + pr * (H + G), 1));
      }
      parts.push(label(px, mainTop + 4 * (H + G) + 6, '数字区', 'dg-label dim'));
    }

    var w = spec.num ? px + 4 * (U + G) : mainW + 12;
    // 右侧留出标注文字的余量，避免「导航区/数字区/方向键」被裁切
    return '<svg class="dg dg-layout" viewBox="0 0 ' + (w + 34) + ' ' + (y + 14) + '" role="img" aria-label="键盘配列示意图">' +
      parts.join('') + '</svg>';
  }

  function splitDiagram() {
    var s = '';
    s += '<g transform="translate(2,4) skewY(-4)">' + rowKeys(0, 0, [1, 1, 1, 1, 1, 1.5]) + '</g>';
    s += '<g transform="translate(2,16) skewY(-4)">' + rowKeys(0, 0, [1.5, 1, 1, 1, 1, 1]) + '</g>';
    s += '<g transform="translate(2,28) skewY(-4)">' + rowKeys(0, 0, [1.75, 1, 1, 1, 1, 1]) + '</g>';
    s += '<g transform="translate(2,40) skewY(-4)">' + rowKeys(0, 0, [2.25, 1, 1, 1, 1]) + '</g>';
    s += '<g transform="translate(74,4) skewY(4)">' + rowKeys(0, 0, [1, 1, 1, 1, 1]) + '</g>';
    s += '<g transform="translate(74,16) skewY(4)">' + rowKeys(0, 0, [1, 1, 1, 1]) + '</g>';
    s += '<g transform="translate(74,28) skewY(4)">' + rowKeys(0, 0, [1, 1, 1]) + '</g>';
    s += '<g transform="translate(74,40) skewY(4)">' + rowKeys(0, 0, [1.25, 1.25]) + '</g>';
    s += label(2, 58, '左右分体：肩宽展开，拇指与手腕更放松', 'dg-label dim');
    return '<svg class="dg dg-layout" viewBox="0 0 150 62" role="img" aria-label="分体式键盘示意图">' + s + '</svg>';
  }

  /* ---------- 轴体剖面 ---------- */
  function switchDiagram(stem, tone) {
    var s = '';
    // 键帽
    s += '<rect x="58" y="6" width="104" height="20" rx="6" class="dg-keycap"/>';
    s += label(166, 20, '键帽', 'dg-anno');
    // 上盖（中间开孔）
    s += '<path d="M74 30 H146 A6 6 0 0 1 152 36 V74 A6 6 0 0 1 146 80 H74 A6 6 0 0 1 68 74 V36 A6 6 0 0 1 74 30 Z M124 44 A14 14 0 1 0 96 44 A14 14 0 1 0 124 44 Z" class="dg-housing" fill-rule="evenodd"/>';
    s += label(8, 46, '上盖', 'dg-anno');
    // 轴心
    s += '<rect x="102" y="34" width="16" height="52" rx="3" class="dg-stem" style="fill:' + stem + '"/>';
    s += '<rect x="90" y="48" width="40" height="16" rx="3" class="dg-stem" style="fill:' + stem + '"/>';
    s += label(158, 56, '轴心', 'dg-anno');
    // 弹簧
    s += '<path d="M110 88 l-9 8 l18 0 l-18 8 l18 0 l-18 8 l18 0 l-9 6" class="dg-spring"/>';
    s += label(150, 106, '弹簧', 'dg-anno');
    // 金属触点
    s += '<rect x="78" y="88" width="4" height="30" rx="2" class="dg-leaf"/>';
    s += '<rect x="138" y="88" width="4" height="30" rx="2" class="dg-leaf"/>';
    s += '<rect x="110" y="112" width="24" height="4" rx="2" class="dg-leaf"/>';
    s += label(36, 106, '金属触点', 'dg-anno');
    // 底壳
    s += '<rect x="58" y="118" width="104" height="24" rx="8" class="dg-housing"/>';
    s += label(168, 134, '底壳', 'dg-anno');
    // 段落/咔嗒拨片
    if (tone === 'click' || tone === 'tactile') {
      s += '<rect x="152" y="96" width="16" height="5" rx="2" class="dg-clickbar"/>';
      s += label(172, 100, tone === 'click' ? '咔嗒拨片' : '段落凸点', 'dg-anno');
    }
    return '<svg class="dg dg-switch" viewBox="0 0 210 150" role="img" aria-label="轴体剖面示意图">' + s + '</svg>';
  }

  /* ---------- 手感曲线 ---------- */
  function forceCurve() {
    var s = '';
    var x0 = 46, y0 = 16, w = 330, h = 150;
    // 网格
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

    // 50g 基准线与触发行程标注
    var y50 = y0 + h - h * 50 / 60;
    s += '<line x1="' + x0 + '" y1="' + y50 + '" x2="' + (x0 + w) + '" y2="' + y50 + '" class="dg-baseline"/>';
    s += label(x0 + 5, y50 - 4, '50g 触发压力', 'dg-tick start');
    s += label(x0 + w * 0.5, y0 + h + 24, '触发行程 ≈2.0mm 处触发', 'dg-tick');
    // 三条曲线的说明
    s += label(x0 + w * 0.24, y0 + 14, '咔嗒（青轴）：冲顶再回落', 'dg-anno');
    s += label(x0 + w * 0.60, y0 + 58, '线性（红/黑轴）：直上直下', 'dg-anno');
    s += label(x0 + w * 0.14, y0 + 92, '段落（茶轴）：中途一个小凸起', 'dg-anno');
    return '<svg class="dg dg-chart" viewBox="0 0 420 220" role="img" aria-label="轴体触发压力与行程曲线">' + s + '</svg>';
  }

  /* ---------- 键帽高度剖面 ---------- */
  function keycapProfileDiagram() {
    var profiles = [
      { name: '原厂 / Cherry', h: 9.4, top: 0, color: 'dg-cap-a' },
      { name: 'OEM', h: 11.5, top: 2, color: 'dg-cap-b' },
      { name: 'SA 高球', h: 16, top: 6, color: 'dg-cap-c' },
      { name: '矮轴 / XDA', h: 7, top: -3, color: 'dg-cap-d' }
    ];
    var s = '', base = 150, gap = 100;
    profiles.forEach(function (p, i) {
      var x = 20 + i * gap;
      var topY = base - p.h * 4.2 - p.top;
      // 轴体
      s += '<rect x="' + (x + 18) + '" y="' + (base - 16) + '" width="26" height="16" rx="3" class="dg-housing"/>';
      s += '<rect x="' + (x + 27) + '" y="' + (base - 22) + '" width="8" height="8" rx="2" class="dg-stem" style="fill:#8a857a"/>';
      // 键帽
      s += '<path d="M' + x + ' ' + (topY + 14) + ' L' + (x + 12) + ' ' + topY + ' L' + (x + 50) + ' ' + topY +
        ' L' + (x + 62) + ' ' + (topY + 14) + ' L' + (x + 56) + ' ' + (base - 18) + ' L' + (x + 6) + ' ' + (base - 18) + ' Z" class="' + p.color + '"/>';
      // 高度标注
      s += '<line x1="' + (x + 74) + '" y1="' + topY + '" x2="' + (x + 74) + '" y2="' + (base - 18) + '" class="dg-dim"/>';
      s += '<line x1="' + (x + 70) + '" y1="' + topY + '" x2="' + (x + 78) + '" y2="' + topY + '" class="dg-dim"/>';
      s += '<line x1="' + (x + 70) + '" y1="' + (base - 18) + '" x2="' + (x + 78) + '" y2="' + (base - 18) + '" class="dg-dim"/>';
      s += label(x + 84, (topY + base - 18) / 2 + 4, '≈' + p.h + 'mm', 'dg-tick start');
      s += label(x + 2, base + 16, p.name, 'dg-label');
    });
    s += label(20, base + 34, '键帽高度按行递增，剖面越高越「球」，手腕角度决定舒适度', 'dg-label dim');
    return '<svg class="dg dg-chart" viewBox="0 0 420 190" role="img" aria-label="键帽高度剖面对比">' + s + '</svg>';
  }

  /* ---------- 结构剖面 ---------- */
  function structureDiagram(kind) {
    var s = '';
    if (kind === 'gasket') {
      s += '<rect x="14" y="18" width="190" height="86" rx="8" class="dg-case"/>';
      s += '<rect x="30" y="46" width="158" height="30" rx="4" class="dg-plate"/>';
      s += '<rect x="26" y="38" width="10" height="46" rx="3" class="dg-gasket"/>';
      s += '<rect x="182" y="38" width="10" height="46" rx="3" class="dg-gasket"/>';
      s += '<rect x="40" y="76" width="138" height="12" rx="3" class="dg-foam"/>';
      s += '<rect x="60" y="88" width="100" height="10" rx="3" class="dg-foam"/>';
      s += label(206, 56, '定位板（浮动）', 'dg-anno');
      s += label(206, 76, 'Gasket 垫片', 'dg-anno');
      s += label(206, 96, '底棉 / 夹心棉', 'dg-anno');
      s += label(24, 30, '外壳', 'dg-anno');
    } else {
      s += '<rect x="14" y="18" width="190" height="86" rx="8" class="dg-case"/>';
      s += '<rect x="30" y="30" width="158" height="46" rx="4" class="dg-plate"/>';
      s += '<circle cx="44" cy="40" r="3" class="dg-screw"/><circle cx="174" cy="40" r="3" class="dg-screw"/>';
      s += '<rect x="40" y="76" width="138" height="12" rx="3" class="dg-foam"/>';
      s += label(206, 44, '顶盖承力', 'dg-anno');
      s += label(206, 64, '定位板螺钉固定', 'dg-anno');
      s += label(206, 88, '底棉', 'dg-anno');
      s += label(24, 30, '外壳', 'dg-anno');
    }
    return '<svg class="dg dg-chart" viewBox="0 0 260 116" role="img" aria-label="键盘结构剖面示意图">' + s + '</svg>';
  }

  root.DAZI_DIAGRAMS = {
    layout: layoutDiagram,
    split: splitDiagram,
    switch: switchDiagram,
    forceCurve: forceCurve,
    keycapProfile: keycapProfileDiagram,
    structure: structureDiagram
  };
})(typeof window !== 'undefined' ? window : globalThis);
