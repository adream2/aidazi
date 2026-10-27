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

  /* ---------- 其他 ---------- */
  // 是否显示「本站使用统计/广告」提示（开启统计或广告时建议设为 true）
  showPrivacyNote: false
};
