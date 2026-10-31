/**
 * site-config.js — 站点第三方接入配置（手工编辑，无需构建）
 *
 * 用法：填上对应 ID 保存即可，留空则不加载任何第三方脚本（默认全空，零请求）。
 * 部署到 Cloudflare Workers / GitHub Pages 时，这个文件随 public/ 一起上传，改完重新部署即生效。
 *
 * 隐私提示：开启统计或广告后，建议同步更新页面「关于」里的隐私说明（已在 about 段落预留）。
 */
window.DAZI_CONFIG = {
  /* ---------- 统计 ---------- */
  analytics: {
    // Google Analytics 4 衡量 ID，形如 G-XXXXXXXXXX
    googleAnalyticsId: '',
    // Bing Webmaster（UET）标签 ID，纯数字，形如 12345678
    bingUetTagId: '',
    // 百度统计站点 ID，即 hm.js?id= 后面那串
    baiduTongjiId: '',
    // Cloudflare Web Analytics 站点 token（Beacon token）
    cloudflareToken: ''
  },

  /* ---------- 广告 ---------- */
  adsense: {
    // AdSense 发布商 ID，形如 ca-pub-XXXXXXXXXXXXXXXX
    client: '',
    // 广告位 ID（在 AdSense 后台创建「展示广告单元」后获得，纯数字）
    slots: {
      inPractice: '',   // 练习区下方
      beforeGuide: ''   // 键盘图鉴上方
    }
  },

  /* ---------- 头部注入 ----------
   * 搜索引擎的站点验证爬虫不执行 JavaScript，靠 JS 动态插 meta 抓不到，
   * 所以这里的配置由 `npm run gen:head` 静态写进 public/index.html。
   * 流程：填好验证码 → npm run gen:head → 提交/部署。
   */
  head: {
    // 站点验证 meta：填入各平台后台给出的 content 值，留空则忽略
    verification: {
      google: '',      // Google Search Console → google-site-verification
      bing: '',        // Bing Webmaster Tools → msvalidate.01
      baidu: '',       // 百度搜索资源平台 → baidu-site-verification
      qihu360: '',     // 360 搜索站长平台 → 360-site-verification
      sogou: '',       // 搜狗站长平台 → sogou_site_verification
      yandex: '',      // Yandex Webmaster → yandex-verification
      googleAds: ''    // AdSense 账号验证 → google-adsense-account（ca-pub-…）
    },
    // 任意自定义 head 代码，原样写入 index.html（preconnect、第三方校验脚本等）
    // 注意：不要写 </head> 或 --> ，会破坏注入区
    customHtml: ''
  },

  /* ---------- 其他 ---------- */
  // 是否显示「本站使用统计/广告」提示（开启统计或广告时建议设为 true）
  showPrivacyNote: false
};
