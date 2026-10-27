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
│   └── serve.mjs              # 零依赖本地静态服务器
├── test/                      # 26 项引擎测试 + 10 项 DOM 冒烟测试
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
| 爬虫规则 | `public/robots.txt` |
| 站点地图 | `public/sitemap.xml` |
| AI 引擎说明（GEO） | `public/llms.txt` |
| 实体介绍与事实清单 | 页面 `#about` 区块 |
| FAQ（可见内容与 JSON-LD 一一对应） | 页面 `#faq` 区块 |

**换域名时改这三处**：`index.html` 的 canonical / og:url / og:image / twitter:image / JSON-LD 里的 `@id` 与 `url`、`robots.txt` 与 `sitemap.xml` 里的域名、`llms.txt` 里的地址。测试会校验这些要素存在（`npm test` 中的 SEO/GEO 分组）。

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
