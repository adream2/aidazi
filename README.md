# 爱打字

在线打字练习站：**拼音 / 五笔 86 / 双拼 / 笔画 / 英文** 五种模式，附字根口诀、双拼键位对照、指法诀窍与键盘图鉴。纯静态站点——无后端、无构建步骤、零运行时依赖，一条命令部署到 **Cloudflare Workers**、**Docker** 或任意静态主机。

- 线上地址：<https://aidazi.lxzt.fun/>（Cloudflare Workers 托管 `public/` 目录）
- 源码仓库：<https://github.com/adream2/aidazi>
- 由 [ZT折腾簿](https://www.ztsite.com) 维护

## 功能

| 模式 | 练什么 | 说明 |
| --- | --- | --- |
| 英文 | 单词 / 名言 / 代码 | 经典练习，显示 WPM；虚拟键盘始终显示并高亮下一键 |
| 拼音 | 整词输入 + 候选选字 | 模拟真实输入法：边输边联想（词优先、单字随后），输完整拼音后选字上屏 |
| 五笔 | 86 版编码 | 默认按最简码输入（与真实输入法一致），可切换全码练习；1200 常用字 |
| 双拼 | 五套方案 | 小鹤 / 微软 / 搜狗 / 智能ABC / 自然码，虚拟键盘实时显示键位映射并高亮下一键 |
| 笔画 | 横竖撇捺折 | 手机笔画输入法练习，565 个常用字按画数分级 |

- 全屏专注模式：一键全屏（`Ctrl/⌘ + Enter`），隐藏页面其他部分并放大练习区与字号，`Esc` 退出
- 实时统计：速度、准确率、用时、进度；按模式+难度记录本地最佳（localStorage）
- 成绩卡：错误字 Top 清单、新纪录提示
- 知识库：86 版字根口诀与字根表、拆分五原则、末笔识别码、简码体系、常用字编码速查（可搜索）、五套双拼方案对照、拼音/笔画诀窍、指法分区图与练习阶段
- 键盘图鉴：8 种配列（100%/96%/TKL/75%/65%/60%/40%/分体）、轴体、键帽、结构、术语、保养，**每类均配自绘 SVG 图**
  - 配列俯视图按 1u = 19.05mm 标准键位单位等比绘制，键位与字符完整（100% 严格 104 键），并用虚线框标出 F 区 / 主键区 / 导航区 / 方向键 / 数字区 / 编辑键列
  - MX 轴体剖面（真实比例 + 逐件标注 + 总行程/触发行程）、键帽高度剖面、船壳与 Gasket 结构剖面对比、触发压力-行程曲线
- **PWA**：可安装到桌面/主屏，Service Worker 预缓存核心资源，断网也能打开（离线使用）
- 键盘选购指南：按预算档位、使用场景给建议，附避坑清单
- 浅色「纸墨」主题 + 深色模式，中文优先排版
- 编码数据全部来自公开码表并由脚本可复现生成（见下文）
- SEO / GEO 已就绪：结构化数据（WebSite + WebApplication + Organization + FAQPage）、Open Graph / Twitter Card、canonical、robots.txt、sitemap.xml、llms.txt，页面含「关于」事实清单与「常见问题」区块

## 快速开始

```bash
# 本地预览（任选其一）
node scripts/serve.mjs        # → http://localhost:8080
python3 -m http.server -d public 8080
# 或者直接双击 public/index.html（无模块依赖，file:// 也能跑）
```

## 部署

### 1. Cloudflare Workers（当前线上方案）

静态资源通过 `wrangler.toml` 的 `[assets]` 绑定发布，无需编写 Worker 脚本；自定义域在 `routes` 里声明（`custom_domain = true`，域名需在同一 Cloudflare 账户下）：

```bash
npm install
npx wrangler login
npm run deploy        # wrangler deploy，自动绑定 aidazi.lxzt.fun
```

线上地址：<https://aidazi.lxzt.fun/>。本地调试：`npm run dev`（wrangler dev）。

> 改域名时：`wrangler.toml` 的 `routes`、`index.html` 里的 canonical / og:* / JSON-LD、`robots.txt`、`sitemap.xml`、`llms.txt` 一并替换。

### 2. Docker

```bash
docker compose up -d          # → http://localhost:8080
# 或手动：
docker build -t ai-da-zi .
docker run -d -p 8080:80 ai-da-zi
```

基于 `nginx:alpine`，gzip + 静态资源缓存 + 单页回退，镜像约 20MB。

### 3. GitHub Pages（镜像 / 备选）

推送到 `main` 会自动部署到 <https://adream2.github.io/aidazi/>（`.github/workflows/deploy-pages.yml`，Pages 源需选 **GitHub Actions**）。页面里的 canonical 指向 `aidazi.lxzt.fun`，因此两个地址并存也不会被判为重复内容。

### 4. 其他静态托管

把 `public/` 目录上传到任何静态托管即可：Nginx / OSS / COS / Vercel / Netlify / Cloudflare Pages。

## 项目结构

```
├── public/                     # 站点本体（部署就传这个目录）
│   ├── index.html
│   └── assets/
│       ├── css/style.css
│       └── js/
│           ├── data/core-data.js   # 生成产物：拼音/五笔/笔顺数据
│           ├── data/content.js     # 手工内容：双拼方案/口诀/词库/键盘知识
│           ├── engine.js           # 打字引擎（纯逻辑，可单测）
│           ├── keyboard.js         # 虚拟键盘组件
│           ├── modes.js            # 五种练习模式定义
│           ├── app.js              # 主应用（渲染/输入/统计）
│           └── knowledge-view.js   # 知识库/图鉴/部署渲染
├── scripts/
│   ├── gen-data.mjs           # 数据生成脚本（公开码表 → core-data.js）
│   ├── gen-head.mjs           # 头部注入生成（site-config.js 的 head 段 → index.html）
│   ├── gen-icons.mjs          # 图标生成（favicon.svg → ICO / PNG / PWA）
│   └── serve.mjs              # 零依赖本地静态服务器
├── test/                      # 31 项引擎测试 + 28 项 DOM 冒烟测试
├── wrangler.toml              # Cloudflare Workers 配置
├── Dockerfile / docker-compose.yml / nginx.conf
├── package.json
└── .github/workflows/         # GitHub Pages 自动部署
```

## 数据来源与再生成

`public/assets/js/data/core-data.js` 由 `scripts/gen-data.mjs` 生成，数据来自三个公开项目：

| 数据 | 来源 |
| --- | --- |
| 五笔 86 版全码（GB2312 6859 字） | [skekon806/98wubi-practice](https://github.com/skekon806/98wubi-practice) `data/dict_86.js` |
| 常用字频率表（前 1500 字） | 同上 `data/encode{1,2,3}.js` |
| 拼音（带调）/ 86 版简码 / 大陆笔顺数字码 | [vvk/wubi](https://github.com/vvk/wubi) `src/wubi_pinyin_unicode_data` |

生成脚本内置多音字补充表与候选字扩展表。重新生成：

```bash
# 先下载上述两个数据源到本地，然后：
node scripts/gen-data.mjs <vvk数据文件> <dict_86.js> <encode1.js> [encode2.js ...]
```

双拼五套方案的键位映射经 flypy.cc 官方文档与各方案公开键位表核对（`content.js` 内有逐方案口诀与规则说明）。

## 图标

站点图标是一枚「键帽 + 光标」的印章：`public/favicon.svg` 是唯一源文件（朱砂红 `#b4433a` 圆角底 + 白色键帽 + 红色光标 + 底排小键），其余尺寸都由它生成：

```bash
npm i -D sharp        # 一次性依赖
npm run gen:icons     # 产出 favicon.ico(16/32/48)、apple-touch-icon.png(180)、icon-192/512.png
```

改图标只需改 `favicon.svg` 后重跑上面的命令。HTML 里同时声明了 `favicon.ico`、`favicon.svg`、`apple-touch-icon` 与 `site.webmanifest`，覆盖浏览器标签页、iOS 主屏与 PWA 安装；结构化数据里的 `Organization.logo` 指向 `icon-512.png`。

## 测试

```bash
npm test                 # = 下面两条
node test/engine.test.cjs    # 引擎逻辑 + 双拼编码 + 词库自洽性（26 项）
node test/dom.test.cjs       # jsdom 全流程冒烟（12 项，需 npm install）
```

视觉验证（可选）：`node scripts/shot.mjs` 会起本地服务截图并报告页面运行时错误，需要临时装 playwright（`npm i -D playwright && npx playwright install chromium`）；本机有 Edge 的也可以直接用浏览器自动化技能驱动，不装任何依赖。

## SEO / GEO

站点按单页结构做了搜索引擎与生成式引擎（AI 搜索）优化：

| 项目 | 位置 |
| --- | --- |
| 标题 / 描述 / 关键词 / robots | `public/index.html` `<head>` |
| canonical、Open Graph、Twitter Card | `public/index.html` `<head>` |
| 结构化数据（WebSite / WebApplication / Organization / FAQPage） | `public/index.html` 内联 JSON-LD |
| 社交分享封面（1200×630） | `public/assets/og-cover.png` |
| 站点图标 | `public/favicon.svg`（源文件）/ `favicon.ico` / `apple-touch-icon.png` / `icon-192,512.png` / `site.webmanifest` |
| 爬虫规则 | `public/robots.txt` |
| 站点地图 | `public/sitemap.xml` |
| AI 引擎说明（GEO） | `public/llms.txt` |
| 实体介绍与事实清单 | 页面 `#about` 区块 |
| FAQ（可见内容与 JSON-LD 一一对应） | 页面 `#faq` 区块 |

**换域名时改这三处**：`index.html` 的 canonical / og:url / og:image / twitter:image / JSON-LD 里的 `@id` 与 `url`、`robots.txt` 与 `sitemap.xml` 里的域名、`llms.txt` 里的地址。测试会校验这些要素存在（`npm test` 中的 SEO/GEO 分组）。

## 统计与广告（可配置）

第三方接入全部由 `public/assets/js/site-config.js` 控制，**默认全部为空 → 一个第三方请求都不发**。填上 ID 保存、重新部署即生效，不需要构建：

```js
window.DAZI_CONFIG = {
  analytics: {
    googleAnalyticsId: '',  // GA4：G-XXXXXXXXXX
    bingUetTagId: '',       // Bing UET：纯数字
    baiduTongjiId: '',      // 百度统计：hm.js?id= 后面那串
    cloudflareToken: ''     // Cloudflare Web Analytics token
  },
  adsense: {
    client: '',             // ca-pub-XXXXXXXXXXXXXXXX
    slots: { inPractice: '', beforeGuide: '' }  // AdSense 广告单元 ID
  },
  showPrivacyNote: false    // 是否显示页内隐私说明
};
```

- 注入逻辑在 `assets/js/integrations.js`：只对**已填写**的服务插入脚本；广告位在未配置时整块 `hidden`，不占布局。
- 两个广告位：练习区下方（`inPractice`）、键盘图鉴上方（`beforeGuide`）。
- 开启统计或广告后，把 `showPrivacyNote` 设为 `true`（或任意 ID 已填时自动）会在「关于」里显示隐私说明，AdSense 审核通常需要这段。
- 纯前端注入，不依赖 Worker 脚本，Cloudflare Workers / Pages / 任意静态托管通用。

## 头部代码注入（搜索引擎验证）

搜索引擎的站点验证爬虫**不执行 JavaScript**，靠 `integrations.js` 在浏览器里动态插 `<meta>` 是抓不到的。所以验证标签必须静态出现在 `index.html` 源码里，由脚本生成：

1. 在 `public/assets/js/site-config.js` 的 `head.verification` 里填验证码：

```js
head: {
  verification: {
    google: '',     // Google Search Console → google-site-verification
    bing: '',       // Bing Webmaster Tools → msvalidate.01
    baidu: '',      // 百度搜索资源平台 → baidu-site-verification
    qihu360: '',    // 360 搜索 → 360-site-verification
    sogou: '',      // 搜狗站长平台 → sogou_site_verification
    yandex: '',     // Yandex Webmaster → yandex-verification
    googleAds: ''   // AdSense 账号 → google-adsense-account（ca-pub-…）
  },
  customHtml: ''    // 任意 head 片段，原样写入（preconnect、第三方校验脚本等）
}
```

2. 运行 `npm run gen:head`，脚本把配置写进 `index.html` 的 `head-inject` 标记区，提交即可生效。

- **只改 `site-config.js`，不要手改注入区**——标记之间的内容每次生成都会被覆盖。
- `npm run deploy` 会自动先跑 `gen:head`；`npm test` 会带 `--check` 校验 HTML 与配置是否一致，不一致直接失败。
- `customHtml` 里不能出现 `<!--` / `-->` 或 `head-inject` 标记，否则会破坏注入区边界（脚本会报错拦下）。
- 如果平台只给 HTML 文件验证（如 Google 的 `googleXXXX.html`、IndexNow 的 key 文件），直接把文件放进 `public/` 根目录即可，部署后访问得到就通过。
- 留空即什么都不注入，`index.html` 里保持一个空块，零额外请求。

## PWA

- `public/sw.js`：安装时预缓存核心资源（HTML/CSS/JS/图标），导航请求网络优先、断网回退缓存，静态资源 stale-while-revalidate。
- `public/site.webmanifest`：`standalone` 显示模式、主题色、192/512 图标（含 maskable）、三条快捷方式。
- 首页在 `load` 后注册 `sw.js`；HTTPS 或 localhost 生效，注册失败不影响站点。
- 改了核心资源想强制刷新缓存时，把 `sw.js` 里的 `VERSION` 加一。

## 已知边界

- 五笔编码为 86 版；98/新世纪版字根有调整，未收录
- 拼音模式候选来自单字库 + 内置词库（约 200 词），不关联任何在线智能输入法
- 英文练习不区分大小写（按小写输入）
- 成绩存在浏览器 localStorage，换设备不同步

## 链接

- 线上：<https://aidazi.lxzt.fun/>
- 仓库：<https://github.com/adream2/aidazi>
- 主站：<https://www.ztsite.com>（ZT折腾簿）

## License

MIT
