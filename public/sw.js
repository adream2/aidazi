/**
 * sw.js — Service Worker：离线可用 + 后台静默更新
 *
 * 策略：
 * - 安装时预缓存核心静态资源（首屏即可离线打开）
 * - 导航请求网络优先（拿到最新 HTML），断网回退缓存
 * - 其余同源静态资源 stale-while-revalidate（先用缓存、后台刷新）
 * - 跨域请求（统计/广告）一律不拦截
 *
 * 改动资源后如需强制刷新缓存版本，把 VERSION 加一。
 */
const VERSION = 'aidazi-v1';
const CACHE = VERSION;

const PRECACHE = [
  './',
  'index.html',
  'assets/css/style.css',
  'assets/js/data/core-data.js',
  'assets/js/data/content.js',
  'assets/js/engine.js',
  'assets/js/keyboard.js',
  'assets/js/keyboard-diagrams.js',
  'assets/js/modes.js',
  'assets/js/app.js',
  'assets/js/knowledge-view.js',
  'assets/js/site-config.js',
  'assets/js/integrations.js',
  'favicon.ico',
  'favicon.svg',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'site.webmanifest',
  'assets/og-cover.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE).catch(() => {
        // 单个资源失败不阻断安装（例如某个图标 404）
        return Promise.all(PRECACHE.map((u) => c.add(u).catch(() => null)));
      }))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // 第三方（统计/广告）不接管

  // 页面导航：网络优先，离线回退缓存
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
    );
    return;
  }

  // JS/CSS/manifest：网络优先（修复与更新第一时间生效），断网回退缓存
  if (/\.(js|css|webmanifest|json)(\?|$)/.test(url.pathname)) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || Response.error()))
    );
    return;
  }

  // 图片等不变资源：缓存优先 + 后台更新
  e.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
