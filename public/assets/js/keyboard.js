/**
 * keyboard.js — 虚拟键盘组件（87 键 ANSI）
 * 用法：var kb = Keyboard.create(el); kb.setSublabel(fn); kb.highlight(['y','t']);
 */
(function (root) {
  // [主标签, 宽度单位, data-key]
  var ROWS = [
    [['`', 1, '`'], ['1', 1, '1'], ['2', 1, '2'], ['3', 1, '3'], ['4', 1, '4'], ['5', 1, '5'], ['6', 1, '6'], ['7', 1, '7'], ['8', 1, '8'], ['9', 1, '9'], ['0', 1, '0'], ['-', 1, '-'], ['=', 1, '='], ['Backspace', 2, 'Backspace']],
    [['Tab', 1.5, 'Tab'], ['Q', 1, 'q'], ['W', 1, 'w'], ['E', 1, 'e'], ['R', 1, 'r'], ['T', 1, 't'], ['Y', 1, 'y'], ['U', 1, 'u'], ['I', 1, 'i'], ['O', 1, 'o'], ['P', 1, 'p'], ['[', 1, '['], [']', 1, ']'], ['\\', 1.5, '\\']],
    [['Caps', 1.75, 'Caps'], ['A', 1, 'a'], ['S', 1, 's'], ['D', 1, 'd'], ['F', 1, 'f'], ['G', 1, 'g'], ['H', 1, 'h'], ['J', 1, 'j'], ['K', 1, 'k'], ['L', 1, 'l'], [';', 1, ';'], ['\'', 1, '\''], ['Enter', 2.25, 'Enter']],
    [['Shift', 2.25, 'Shift'], ['Z', 1, 'z'], ['X', 1, 'x'], ['C', 1, 'c'], ['V', 1, 'v'], ['B', 1, 'b'], ['N', 1, 'n'], ['M', 1, 'm'], [',', 1, ','], ['.', 1, '.'], ['/', 1, '/'], ['Shift', 2.75, 'Shift']],
    [['Ctrl', 1.25, 'Ctrl'], ['Win', 1.25, 'Win'], ['Alt', 1.25, 'Alt'], ['Space', 6.25, ' '], ['Alt', 1.25, 'Alt'], ['Win', 1.25, 'Win'], ['Menu', 1.25, 'Menu'], ['Ctrl', 1.25, 'Ctrl']]
  ];

  function create(container) {
    container.classList.add('kb');
    var keyEls = {};
    ROWS.forEach(function (row) {
      var rowEl = document.createElement('div');
      rowEl.className = 'kb-row';
      row.forEach(function (k) {
        var el = document.createElement('div');
        el.className = 'kb-key' + (k[0].length > 2 ? ' kb-key-wide' : '');
        el.style.flexGrow = k[1];
        el.style.flexBasis = '0';
        el.dataset.key = k[2];
        var main = document.createElement('span');
        main.className = 'kb-main';
        main.textContent = k[0];
        el.appendChild(main);
        var sub = document.createElement('span');
        sub.className = 'kb-sub';
        el.appendChild(sub);
        rowEl.appendChild(el);
        if (!keyEls[k[2]]) keyEls[k[2]] = el;
      });
      container.appendChild(rowEl);
    });

    var api = {
      el: container,
      /** 设置每个键的副标签（如双拼韵母），fn(keyDataAttr) -> string */
      setSublabel: function (fn) {
        Object.keys(keyEls).forEach(function (k) {
          var text = fn(k) || '';
          keyEls[k].querySelector('.kb-sub').textContent = text;
          keyEls[k].classList.toggle('kb-has-sub', !!text);
        });
      },
      /** 高亮一组键（data-key 值） */
      highlight: function (keys) {
        Object.keys(keyEls).forEach(function (k) { keyEls[k].classList.remove('kb-active'); });
        (keys || []).forEach(function (k) {
          var el = keyEls[k] || keyEls[String(k).toLowerCase()];
          if (el) el.classList.add('kb-active');
        });
      },
      /** 按手指着色（指法图），fingerMap: key -> 颜色 */
      setFingerColors: function (fingerMap) {
        Object.keys(keyEls).forEach(function (k) {
          var c = fingerMap[k];
          if (c) {
            keyEls[k].style.background = c;
            keyEls[k].style.color = '#fff';
            keyEls[k].style.borderColor = 'transparent';
          }
        });
      },
      /** 点亮某个手指的键 */
      highlightFinger: function (fingerKeys) {
        this.highlight(fingerKeys);
      },
      clearFingerColors: function () {
        Object.keys(keyEls).forEach(function (k) {
          keyEls[k].style.background = '';
          keyEls[k].style.color = '';
          keyEls[k].style.borderColor = '';
        });
      }
    };
    return api;
  }

  root.Keyboard = { create: create, ROWS: ROWS };
})(typeof window !== 'undefined' ? window : globalThis);
