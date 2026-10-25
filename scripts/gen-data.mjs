/**
 * gen-data.mjs — 生成练习用核心数据（五笔编码 / 拼音 / 笔画）
 *
 * 数据来源（均为公开数据，脚本内置拉取说明，产物已提交，无需在部署时运行）：
 *   1. 常用字频率表（前1500字，按词频排序）
 *      github.com/skekon806/98wubi-practice  →  data/encode1.js / encode2.js / encode3.js
 *   2. 五笔86版全码 + 拆解
 *      github.com/skekon806/98wubi-practice  →  data/dict_86.js（GB2312 6859字，极点码表）
 *   3. 拼音（带调）/ 86版简码 / 大陆笔顺数字码（1横2竖3撇4捺5折）
 *      github.com/vvk/wubi                    →  src/wubi_pinyin_unicode_data（70322条）
 *
 * 用法：
 *   node scripts/gen-data.mjs <vvk数据文件> <dict_86.js> <encode1.js> [encode2.js ...]
 *
 * 产物：public/assets/js/data/core-data.js（浏览器全局 window.DAZI_CORE）
 *   py:      { 无调拼音: "候选字串(按词频排序)" }
 *   wubi:    [ [字, 最简码, 全码], ... ]   （按词频排序，取前 N 个）
 *   strokes: [ [字, 笔画键序列], ... ]     （≤12 画的常用字，按词频排序）
 */
import fs from 'node:fs';

const [,, vvkPath, dictPath, ...encodePaths] = process.argv;
if (!vvkPath || !dictPath || encodePaths.length === 0) {
  console.error('用法: node scripts/gen-data.mjs <vvk数据> <dict_86.js> <encode1.js> [...]');
  process.exit(1);
}

const WUBI_TOP_N = 1200;  // 五笔练习字量
const STROKE_TOP_N = 200; // （保留占位，实际由 STROKE_EXTRA 控制补充量）
const STROKE_EXTRA = 140; // 7-10 画常用字补充量
const STROKE_MAX = 10;    // 笔画练习最大画数（笔画输入以简单常用字为主）

/* ---------- 1. 词频表 ---------- */
const freq = [];
for (const p of encodePaths) {
  const m = fs.readFileSync(p, 'utf8').match(/=\s*"([^"]+)"/);
  if (m) freq.push(...m[1]);
}
const freqChars = [...new Set(freq)].filter((c) => /^[\u4e00-\u9fff]$/.test(c));
console.log(`词频表: ${freqChars.length} 字`);

/* 频率表之后的补充常用字（现代汉语常用字表次常用部分 + 网络口语高频），
   用于丰富拼音候选，避免打常用词时缺字 */
const EXTRA_CHARS = `啊阿埃挨哎唉哀矮艾碍爱鞍俺按岸暗熬傲奥八巴拔爸吧百摆败拜班般搬板版办半伴扮棒包胞宝饱保报抱暴卑杯悲碑北备背倍被笨逼鼻比彼笔币必毕闭辟壁避臂边编鞭扁便变遍辨辩标表别宾滨冰兵丙柄病并波播拨玻剥伯泊驳捕补不布步部擦猜才材财裁采彩菜参餐残蚕惨灿苍舱仓操槽草册侧测策层叉插茶查岔差拆柴馋缠产铲昌长常偿厂场尝肠敞畅唱抄超巢朝潮吵炒车扯彻撤尘臣沉陈晨衬撑成呈承诚城乘惩程池驰迟持尺齿斥赤翅充冲虫崇抽仇绸愁稠筹丑臭出初除厨础储楚处触川穿传船喘窗床创吹炊垂锤春纯唇蠢词慈辞磁雌此次刺从匆葱聪丛凑粗促催摧存寸措错搭达答呆代贷袋待逮戴丹单担胆旦但诞弹淡蛋当挡党荡刀导岛倒蹈到悼盗道得德的灯登等邓堤滴敌笛底抵地帝递颠典点电店殿叼雕吊钓调掉爹跌叠蝶丁叮盯钉顶订定丢东冬董懂动冻栋洞都斗抖陡豆逗督毒读独堵赌肚度渡端短段断锻堆队对吨蹲盾多夺朵躲饿恶恩儿而耳二发乏伐罚阀法帆翻凡烦繁反返犯泛饭范方芳防妨房肪访纺放飞非啡菲肥废沸肺费分纷芬粉份奋愤粪丰风枫封疯峰锋蜂逢缝凤奉佛否夫肤孵扶拂服浮符幅福抚府斧辅父付妇负附复副富腹覆该改概钙盖溉干杆肝赶敢感刚岗纲缸钢港高糕搞稿告戈哥胳鸽割搁歌阁革格葛隔个各给根跟更耕工弓公功攻供宫恭巩共贡沟钩勾构购够估姑孤辜古谷股骨鼓固故顾瓜刮挂乖拐怪关观官冠馆管贯惯灌罐光广归龟规轨鬼柜贵桂滚棍锅国果裹过哈孩海害含寒喊汉汗旱杭航毫豪好号浩喝合何和河核荷盒贺黑痕很狠恨哼恒横衡轰哄红宏洪虹侯喉猴吼厚候后乎呼忽狐胡壶湖葫糊蝴虎互户护花华滑化画话怀坏欢还环缓幻唤换患荒慌皇黄煌晃灰恢挥辉回汇会绘惠慧昏婚浑魂混活火伙或货获祸惑击饥机鸡积基激及吉级即极急疾集籍辑嫉挤几己计记技际剂季既济继寄加夹佳家嘉甲价驾架假嫁歼坚间艰肩兼监煎拣俭茧捡减剪检简见件建剑健舰渐践鉴键箭江将姜僵讲奖匠降交郊娇浇骄胶教焦蕉嚼角饺脚搅缴叫较阶街节截竭结接揭杰捷姐解介戒届界借今斤金津筋仅紧锦尽劲近进浸晋禁京经茎惊晶睛精鲸井颈景警净竞竟敬境静镜纠究揪九久酒旧救就舅居拘鞠局菊橘举矩句巨具拒俱剧惧据距锯聚捐卷决绝觉掘军君俊开凯慨刊砍看康抗考烤靠科棵颗柯苛壳咳可渴克刻客课肯垦恳坑空孔恐控口扣枯哭苦库裤夸垮挎跨块快宽款狂况旷矿框亏葵愧困扩阔拉拉腊辣来赖兰拦栏蓝篮览懒烂滥狼廊朗浪劳牢老姥涝乐勒雷垒累泪类冷愣厘梨狸离璃黎礼李里理鲤力历厉立丽利励例俐痢连帘莲联廉镰脸练炼恋链良凉梁粮两亮谅辆量辽疗聊僚了料列劣烈猎裂林临邻淋琳磷灵岭领另令溜刘流留硫榴柳六龙笼聋隆垄拢楼漏露卢芦炉鲁陆录鹿滤碌路驴旅屡律虑率绿略轮论罗萝锣箩骡螺络骆妈麻马码蚂骂吗埋买迈麦卖脉蛮馒满曼慢漫忙盲茫猫毛矛茅茂冒贸帽貌么没枚玫梅媒煤霉每美妹昧媚门闷们蒙盟猛梦迷谜米眯秘密蜜眠绵棉免勉面苗描秒妙庙灭蔑民皿敏名明鸣命摸模膜磨蘑魔抹末沫陌莫漠寞墨默谋某母木目牧墓幕慕暮拿哪内那纳娜乃奶男南难囊恼脑闹呢嫩能尼泥拟你逆年念娘酿鸟尿捏涅宁凝牛扭纽浓农弄奴努怒女暖虐挪欧偶趴爬拍排牌派攀盘判盼叛乓旁庞胖抛刨炮袍跑泡呸胚陪培赔佩配喷盆朋棚蓬鹏捧碰批披劈皮疲脾匹痞僻片偏篇骗飘漂票撇拼贫品聘平评凭苹屏瓶坡泼颇迫破魄扑铺葡朴圃浦普谱七妻戚欺漆齐其奇歧骑棋旗乞企岂启起气弃汽砌器掐卡洽千迁谦签前钱钳潜浅遣谴欠枪腔强墙抢悄敲锹乔侨桥瞧巧俏翘切茄且窃亲侵钦琴禽勤擒寝青轻氢倾卿清蜻情晴擎顷请庆穷琼丘秋蚯求球区曲屈驱躯趋渠取去趣圈权全泉拳犬劝券缺却雀确鹊裙群然燃染嚷壤让饶扰绕惹热人仁忍认任刃纫扔仍日荣绒容溶融冗柔揉肉如茹儒辱入软锐瑞润若弱撒洒萨塞赛三伞散桑嗓丧搔骚扫嫂色涩森杀沙纱刹砂傻煞晒山杉衫删闪陕扇善擅膳赡伤商赏上尚捎梢烧稍勺少绍哨舌蛇舍设社射涉摄申伸身深神审婶肾甚渗慎升生声牲省圣胜剩尸失师诗狮施湿十石时识实拾食蚀史使始驶士氏世市示式事侍势试视饰室是适逝释誓收手守首寿受瘦兽售授输蔬枢梳舒疏书殊抒叔熟暑署蜀鼠属术束述树竖恕庶数刷耍摔甩帅拴霜双爽谁水税睡顺瞬说烁朔硕丝司私思斯撕死四寺似祀伺饲肆松怂耸送颂诵搜艘擞苏酥俗诉肃素速宿塑溯酸算虽随髓岁祟遂碎穗孙损笋蓑梭唆缩所索锁他它她塌踏台抬苔太汰态泰贪摊滩瘫坛谈痰潭檀坦叹炭探碳汤唐堂塘糖螳淌躺烫涛掏滔逃桃陶萄淘讨套特疼腾藤梯踢提题蹄体替天添田填甜舔挑条迢跳贴铁帖厅听汀廷亭庭停挺艇通同桐铜童统桶筒痛偷投头透凸秃突图徒涂屠土吐兔团推颓腿退吞屯托拖脱驮驼妥拓唾挖哇蛙娃瓦袜歪外弯湾豌完玩顽挽晚碗婉万汪亡王网往妄忘望危威微为围违唯惟维伟伪尾纬委萎卫未位味畏胃谓喂蔚慰魏温文纹蚊闻吻稳问翁窝我沃卧握乌污呜巫诬屋无吴吾梧蜈五午伍武捂舞勿务戊物误悟晤雾夕西吸希昔析牺息惜悉蟋锡熙嘻膝习席袭媳洗喜戏系细隙虾瞎峡狭匣霞辖暇下夏吓掀先仙纤闲贤咸涎衔嫌显险现县限线宪陷馅羡献腺乡相香厢湘箱详祥翔享响想向巷项象像橡削消宵萧硝销箫潇小晓孝效校笑些歇蝎协邪胁斜谐携鞋写泄泻屑械谢懈蟹心辛欣新薪信兴星猩刑行形型醒杏姓幸性凶兄匈汹胸雄熊休修羞朽秀袖绣锈嗅需须虚嘘徐许序叙畜绪续絮婿蓄宣玄悬旋选癣炫眩绚靴学穴雪血勋熏寻巡询循训讯迅压呀鸦鸭牙芽蚜崖涯雅亚讶咽烟淹盐严言岩炎研蜒颜掩眼演厌宴艳验谚焰雁燕央殃秧扬羊阳杨佯洋仰养氧痒样夭妖腰邀窑谣摇遥肴姚咬舀药要耀爷耶野业叶页夜液一衣医依伊揖仪宜遗移疑乙已以矣蚁椅义亿忆艺议屹亦异抑译易疫益谊逸意溢毅翼因阴音姻吟银引隐印应英婴鹰迎盈营蝇赢影映硬哟拥佣涌永泳勇咏用优忧悠尤由邮犹油游友有又右幼诱于予余鱼娱渔隅愉愚榆与宇羽雨语玉驭芋育郁狱浴预域遇喻御裕誉豫元园员原圆袁援缘源猿远怨院愿曰约月岳阅悦跃越晕云匀允孕运酝韵熨蕴杂灾栽宰载再在咱攒暂赞赃脏葬遭糟早枣澡藻灶皂造噪燥责择则泽贼怎增憎赠扎渣札轧炸闸诈榨摘宅窄债寨沾粘展斩占战站绽章张彰樟涨掌丈帐账胀障招昭找沼召兆照罩遮折哲辙者这浙针珍真斟甄诊枕阵振镇震睁争征挣筝蒸整正证郑政症之支只汁芝枝知织肢脂蜘执直值职植殖止旨址指趾至志制质致智置滞稚中忠终钟肿种仲众重州舟周洲粥轴肘帚咒皱骤朱株珠诸猪蛛竹烛逐主煮嘱住助注驻柱祝著筑铸抓爪砖转赚桩庄装撞壮状追准捉桌琢仔兹咨资姿滋紫字自宗棕踪总纵邹走奏租足卒族阻组祖钻嘴最罪醉尊遵昨左佐做作坐座`;
const extraChars = [...new Set(EXTRA_CHARS)].filter((c) => /^[\u4e00-\u9fff]$/.test(c));
const allChars = [...new Set([...freqChars, ...extraChars])];
console.log(`候选字总量: ${allChars.length}`);

/* ---------- 2. dict_86 全码 ---------- */
const dictSrc = fs.readFileSync(dictPath, 'utf8');
const sandbox = {};
new Function('window', dictSrc)(sandbox);
const dict86 = sandbox.WUBI_DICT_86 || {};
console.log(`dict_86: ${Object.keys(dict86).length} 条`);

/* ---------- 3. vvk 数据（拼音/简码/笔顺） ---------- */
const vvk = new Map();
for (const line of fs.readFileSync(vvkPath, 'utf8').split('\n')) {
  const t = line.trim();
  if (!t) continue;
  const f = t.split('|');
  if (f.length < 8) continue;
  const ch = f[0];
  if ([...ch].length !== 1 || !/^[\u4e00-\u9fff]$/.test(ch)) continue;
  vvk.set(ch, { py: f[1], w86: f[3], cnStroke: f[6] });
}
console.log(`vvk: ${vvk.size} 条`);

/* ---------- 4. 拼音去调 ---------- */
function stripTone(p) {
  return p
    .replace(/[ǖǘǚǜü]/g, 'v')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/* 多音字手工补充：单字数据只含一个读音，这里补上高频多音字 */
const POLYPHONE = {
  了: ['le', 'liao'], 的: ['de', 'di'], 地: ['de', 'di'], 得: ['de', 'dei'],
  行: ['xing', 'hang'], 长: ['chang', 'zhang'], 重: ['zhong', 'chong'],
  乐: ['le', 'yue'], 还: ['hai', 'huan'], 都: ['dou', 'du'],   觉: ['jue', 'jiao'],
  空: ['kong', 'kòng'], 只: ['zhi'], 少: ['shao', 'shào'],
  好: ['hao', 'hào'], 种: ['zhong', 'zhòng'], 发: ['fa', 'fà'],
  假: ['jia', 'jià'], 便: ['bian', 'pián'], 血: ['xue', 'xiě'],
  校: ['xiao', 'jiào'], 兴: ['xing', 'xìng'], 分: ['fen', 'fèn'],
  干: ['gan', 'gàn'], 传: ['chuan', 'zhuàn'], 华: ['hua', 'huà'],
  石: ['shi', 'dàn'], 落: ['luo', 'là'], 差: ['cha', 'chà'],
  曲: ['qu', 'qǔ'], 数: ['shu', 'shù'], 会: ['hui', 'kuài'],
  便: ['bian', 'pián'], 那: ['na', 'nà'], 哪: ['na', 'něi'],
  结: ['jie', 'jiē'], 与: ['yu', 'yù'], 为: ['wei', 'wèi'],
  朝: ['chao', 'zhāo'], 强: ['qiang', 'qiáng'], 应: ['ying', 'yìng'],
  卷: ['juan', 'juǎn'], 率: ['lü', 'shuài'], 曾: ['ceng', 'zēng'],
};

const pyMap = {}; // 拼音 -> 候选字串
function addPy(ch, py) {
  if (!pyMap[py]) pyMap[py] = ch;
  else if (!pyMap[py].includes(ch)) pyMap[py] += ch;
}

for (const ch of allChars) {
  const r = vvk.get(ch);
  if (r) addPy(ch, stripTone(r.py));
  for (const py of POLYPHONE[ch] || []) addPy(ch, stripTone(py));
}
console.log(`拼音: ${Object.keys(pyMap).length} 个音节`);

/* ---------- 5. 五笔字表 ---------- */
const wubiList = [];
let mismatch = 0;
for (const ch of allChars) {
  const r = vvk.get(ch);
  const full = dict86[ch] ? dict86[ch].c : r ? r.w86.split(',').pop() : null;
  if (!full) continue;
  if (r && r.w86.split(',').pop() !== full) mismatch++;
  const short = r ? r.w86.split(',')[0] : full;
  wubiList.push([ch, short, full]);
}
console.log(`五笔: ${wubiList.length} 字（全码与码表不一致 ${mismatch} 个，已采用码表全码）`);

/* ---------- 6. 笔画字表 ---------- */
/* 策略：先收 6 画以内的前 1500 高频字（保证 木火土王 等基础字都在），
   再按频率补 7-10 画常用字到 STROKE_TOP_N */
const KEY = { 1: 'h', 2: 's', 3: 'p', 4: 'n', 5: 'z' };
function strokeEntry(ch) {
  const r = vvk.get(ch);
  if (!r || !/^[1-5]+$/.test(r.cnStroke)) return null;
  if (r.cnStroke.length > STROKE_MAX) return null;
  return [ch, [...r.cnStroke].map((d) => KEY[d]).join('')];
}
const strokeList = [];
const strokeSeen = new Set();
for (const ch of freqChars) {
  const e = strokeEntry(ch);
  if (e && [...e[0]].length === 1 && vvk.get(ch).cnStroke.length <= 6) {
    strokeList.push(e);
    strokeSeen.add(ch);
  }
}
let strokeExtra = 0;
for (const ch of allChars) {
  if (strokeExtra >= STROKE_EXTRA) break;
  if (strokeSeen.has(ch)) continue;
  const e = strokeEntry(ch);
  if (e) {
    strokeList.push(e);
    strokeSeen.add(ch);
    strokeExtra++;
  }
}
console.log(`笔画: ${strokeList.length} 字`);

/* ---------- 7. 输出 ---------- */
const out = `/**
 * core-data.js — 由 scripts/gen-data.mjs 自动生成，请勿手改（改数据请改脚本后重新生成）
 * 数据来源: skekon806/98wubi-practice(86版码表/字频) + vvk/wubi(拼音/简码/大陆笔顺)
 * py: 无调拼音 → 候选字（按词频排序）；wubi: [字,最简码,全码]；strokes: [字,笔画键序 h横s竖p撇n捺z折]
 */
window.DAZI_CORE = {
py: ${JSON.stringify(pyMap)},
wubi: ${JSON.stringify(wubiList.slice(0, WUBI_TOP_N))},
strokes: ${JSON.stringify(strokeList)}
};
if (typeof module !== 'undefined' && module.exports) module.exports = window.DAZI_CORE;
`;
fs.mkdirSync('public/assets/js/data', { recursive: true });
fs.writeFileSync('public/assets/js/data/core-data.js', out);
console.log(`已写入 public/assets/js/data/core-data.js (${(out.length / 1024).toFixed(1)} KB)`);
