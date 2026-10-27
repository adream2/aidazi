/**
 * integrations.js — 按 site-config.js 的配置按需注入统计与广告脚本
 *
 * 设计原则：
 * 1. 配置为空时零请求、零 DOM 变化（默认状态不引入任何第三方脚本）
 * 2. 只做静态资源注入，不依赖后端，Cloudflare Workers / Pages 通用
 * 3. 广告位在未配置时整块隐藏，不占布局
 */
(function (root) {
  var doc = root.document;
  var CFG = root.DAZI_CONFIG || {};
  var A = CFG.analytics || {};
  var ADS = CFG.adsense || {};

  function head(html) {
    var d = doc.createElement('div');
    d.innerHTML = html;
    var node = d.firstChild;
    doc.head.appendChild(node);
    return node;
  }

  function script(src, attrs) {
    var s = doc.createElement('script');
    s.async = true;
    s.src = src;
    if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    doc.head.appendChild(s);
    return s;
  }

  /* ---------- 统计 ---------- */
  function initAnalytics() {
    // Google Analytics 4
    if (A.googleAnalyticsId) {
      script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(A.googleAnalyticsId));
      root.dataLayer = root.dataLayer || [];
      root.gtag = function () { root.dataLayer.push(arguments); };
      root.gtag('js', new Date());
      root.gtag('config', A.googleAnalyticsId, { anonymize_ip: true });
    }

    // Bing UET
    if (A.bingUetTagId) {
      root.uetq = root.uetq || [];
      script('https://bat.bing.com/bat.js', { 'data-uet-tag': A.bingUetTagId });
      // UET 官方初始化：设置 ti 并上报 pageLoad
      var beacon = doc.createElement('script');
      beacon.textContent =
        'window.uetq=window.uetq||[];window.uetq.push("config",{ti:' +
        JSON.stringify(A.bingUetTagId) + '});window.uetq.push("event","page_view",{});';
      doc.head.appendChild(beacon);
    }

    // 百度统计
    if (A.baiduTongjiId) {
      root._hmt = root._hmt || [];
      script('https://hm.baidu.com/hm.js?' + encodeURIComponent(A.baiduTongjiId));
    }

    // Cloudflare Web Analytics
    if (A.cloudflareToken) {
      script('https://static.cloudflareinsights.com/beacon.min.js',
        { defer: '', 'data-cf-beacon': JSON.stringify({ token: A.cloudflareToken }) });
    }
  }

  /* ---------- 广告 ---------- */
  function renderSlot(name) {
    var slotId = (ADS.slots || {})[name];
    var host = doc.querySelector('[data-ad="' + name + '"]');
    if (!host) return;
    if (!ADS.client || !slotId) {           // 未配置：整块隐藏，不占位
      host.hidden = true;
      return;
    }
    host.hidden = false;
    host.innerHTML =
      '<ins class="adsbygoogle" style="display:block"' +
      ' data-ad-client="' + ADS.client + '"' +
      ' data-ad-slot="' + slotId + '"' +
      ' data-ad-format="auto" data-full-width-responsive="true"></ins>';
    try { (root.adsbygoogle = root.adsbygoogle || []).push({}); } catch (e) { /* 广告被拦截时静默 */ }
  }

  function initAds() {
    if (!ADS.client) return;                // 没填发布商 ID，一条广告脚本都不加载
    script('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' +
      encodeURIComponent(ADS.client), { crossorigin: 'anonymous' });
    ['inPractice', 'beforeGuide'].forEach(renderSlot);
  }

  /* ---------- 隐私提示 ---------- */
  function initPrivacyNote() {
    var hasThirdParty = !!(A.googleAnalyticsId || A.bingUetTagId || A.baiduTongjiId ||
      A.cloudflareToken || ADS.client);
    var note = doc.querySelector('[data-privacy-note]');
    if (!note) return;
    if (!CFG.showPrivacyNote && !hasThirdParty) { note.hidden = true; return; }
    note.hidden = false;
  }

  function init() {
    initAnalytics();
    initAds();
    initPrivacyNote();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  root.DAZI_INTEGRATIONS = { config: CFG, init: init };
})(typeof window !== 'undefined' ? window : globalThis);
