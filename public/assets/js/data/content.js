/**
 * content.js — 手工整理的内容数据：双拼方案 / 五笔知识 / 拼音词库 / 英文文本 / 键盘图鉴
 * 编码规则数据来源：flypy.cc 官方文档、各大双拼方案公开键位表、86版五笔字根口诀
 */
window.DAZI_CONTENT = (function () {
  /* ==================== 双拼方案 ==================== */
  // initialSpecial: 特殊声母按键；finalMap: 韵母→按键；zero: 零声母规则
  // zero='first' : 以韵母首字母为零声母（单字母韵母双打、双字母全拼、三字母=首字母+韵母键）
  // zero='O'     : 以 O 为零声母，接韵母所在键（见 zeroMap）
  // zero='final' : 直接打韵母键（自然码）
  var schemes = {
    xiaohe: {
      name: '小鹤双拼',
      intro: '目前社区最流行的双拼方案，键位经过人体工学优化，左右手分布均衡，可搭配「小鹤音形」进阶。',
      initialSpecial: { zh: 'v', ch: 'i', sh: 'u' },
      finalMap: {
        a: 'a', o: 'o', e: 'e', i: 'i', u: 'u', v: 'v',
        ai: 'd', ei: 'w', ao: 'c', ou: 'z', an: 'j', en: 'f', ang: 'h', eng: 'g',
        ia: 'x', ua: 'x', ie: 'p', iao: 'n', iu: 'q', ian: 'm', in: 'b',
        iang: 'l', ing: 'k', iong: 's', ong: 's', uai: 'k', uan: 'r', uang: 'l',
        ue: 't', ve: 't', ui: 'v', un: 'y', uo: 'o'
      },
      zero: 'first',
      mnemonic: '秋闱鹅软月云书痴哦撇，啊松呆坟更航安京亮，走下嘈追宾鸟眠'
    },
    weiruan: {
      name: '微软双拼',
      intro: 'Windows 微软拼音内置方案，源自自然码，企业环境兼容性好，与搜狗双拼键位基本一致。',
      initialSpecial: { zh: 'v', ch: 'i', sh: 'u' },
      finalMap: {
        a: 'a', o: 'o', e: 'e', i: 'i', u: 'u', v: 'v',
        ai: 'l', ei: 'z', ao: 'k', ou: 'b', an: 'j', en: 'f', ang: 'h', eng: 'g',
        ia: 'w', ua: 'w', ie: 'x', iao: 'c', iu: 'q', ian: 'm', in: 'n',
        iang: 'd', ing: ';', iong: 's', ong: 's', uai: 'y', uan: 'r', uang: 'd',
        ue: 't', ve: 't', ui: 'v', un: 'p', uo: 'o'
      },
      zero: 'O',
      zeroMap: { a: 'oa', o: 'oo', e: 'oe', ai: 'ol', ei: 'oz', en: 'of', ou: 'ob', an: 'oj', ang: 'oh', ao: 'ok', er: 'or', eng: 'og' },
      mnemonic: '棉球鞋，更松软，吃航树分，靠您来追贼'
    },
    sogou: {
      name: '搜狗双拼',
      intro: '搜狗拼音默认双拼方案，与微软双拼键位几乎完全相同，iOS 11 起系统自带。',
      initialSpecial: { zh: 'v', ch: 'i', sh: 'u' },
      finalMap: {
        a: 'a', o: 'o', e: 'e', i: 'i', u: 'u', v: 'v',
        ai: 'l', ei: 'z', ao: 'k', ou: 'b', an: 'j', en: 'f', ang: 'h', eng: 'g',
        ia: 'w', ua: 'w', ie: 'x', iao: 'c', iu: 'q', ian: 'm', in: 'n',
        iang: 'd', ing: ';', iong: 's', ong: 's', uai: 'y', uan: 'r', uang: 'd',
        ue: 't', ve: 't', ui: 'v', un: 'p', uo: 'o'
      },
      zero: 'O',
      zeroMap: { a: 'oa', o: 'oo', e: 'oe', ai: 'ol', ei: 'oz', en: 'of', ou: 'ob', an: 'oj', ang: 'oh', ao: 'ok', er: 'or', eng: 'og' },
      mnemonic: '秋娃丫娥远观月，域外舒驰噢卧云昆；阿勇送汪洋分，更航岸靠来；贼缷邀追，怄您眠'
    },
    abc: {
      name: '智能ABC双拼',
      intro: '早期经典方案，zh/ch/sh 集中在左手（A/E/V），左撇子友好；零声母用 O。',
      initialSpecial: { zh: 'a', ch: 'e', sh: 'v' },
      finalMap: {
        a: 'a', o: 'o', e: 'e', i: 'i', u: 'u', v: 'v',
        ai: 'l', ei: 'q', ao: 'k', ou: 'b', an: 'j', en: 'f', ang: 'h', eng: 'g',
        ia: 'd', ua: 'd', ie: 'x', iao: 'z', iu: 'r', ian: 'w', in: 'c',
        iang: 't', ing: 'y', iong: 's', ong: 's', uai: 'c', uan: 'p', uang: 't',
        ue: 'm', ve: 'm', ui: 'm', un: 'n', uo: 'o'
      },
      zero: 'O',
      zeroMap: { a: 'oa', o: 'oo', e: 'oe', ai: 'ol', ei: 'oq', en: 'of', ou: 'ob', an: 'oj', ang: 'oh', ao: 'ok', er: 'or', eng: 'og' },
      mnemonic: 'Q ei W ian E e R iu T iang Y ing / U u I i O uo P uan / A a S ong D ia F en G eng H ang J an K ao L ai / Z iao X ie C in V ü B ou N un M ue'
    },
    ziranma: {
      name: '自然码双拼',
      intro: '双拼方案的鼻祖，微软/搜狗双拼的前身；不设零声母，零声母音节直接打韵母键。',
      initialSpecial: { zh: 'v', ch: 'i', sh: 'u' },
      finalMap: {
        a: 'a', o: 'o', e: 'e', er: 'e', i: 'i', u: 'u', v: 'v',
        ai: 'l', ei: 'z', ao: 'k', ou: 'b', an: 'j', en: 'f', ang: 'h', eng: 'g',
        ia: 'w', ua: 'w', ie: 'x', iao: 'c', iu: 'q', ian: 'm', in: 'n',
        iang: 'd', ing: 'y', iong: 's', ong: 's', uai: 'y', uan: 'r', uang: 'd',
        ue: 't', ve: 't', ui: 'v', un: 'p', uo: 'o'
      },
      zero: 'final',
      mnemonic: 'Q iu W ia E e R uan T ue Y ing U sh I ch O uo P un / A a S ong D iang F en G eng H ang J an K ao L ai / Z ei X ie C iao V zh B ou N in M ian'
    }
  };

  /* y/w 开头音节：按「声母 + 韵母」拆分（yu→y+v 即 ü；üan/üe/ün 与 uan/ue/un 同键） */
  var YW_SPLIT = {
    yi: ['y', 'i'], ya: ['y', 'a'], ye: ['y', 'e'], yao: ['y', 'ao'], you: ['y', 'ou'],
    yan: ['y', 'an'], yang: ['y', 'ang'], yin: ['y', 'in'], ying: ['y', 'ing'], yong: ['y', 'ong'],
    yo: ['y', 'o'], yu: ['y', 'v'], yue: ['y', 'ue'], yuan: ['y', 'uan'], yun: ['y', 'un'],
    wu: ['w', 'u'], wa: ['w', 'a'], wo: ['w', 'uo'], wai: ['w', 'uai'], wei: ['w', 'ei'],
    wen: ['w', 'en'], wang: ['w', 'ang'], wan: ['w', 'an'], weng: ['w', 'eng']
  };
  var INITIALS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w'];
  var SYL_BLACKLIST = { n: 1, m: 1, ng: 1, hm: 1, hng: 1, 'ê': 1, e5: 1 };

  /** 把一个无调拼音音节编码为双拼两键 */
  function encodeSyllable(syl, scheme) {
    if (SYL_BLACKLIST[syl]) return null;
    if (YW_SPLIT[syl]) {
      var p = YW_SPLIT[syl];
      return (scheme.initialSpecial[p[0]] || p[0]) + scheme.finalMap[p[1]];
    }
    var ini = '', fin = syl;
    for (var k = 0; k < INITIALS.length; k++) {
      if (syl.indexOf(INITIALS[k]) === 0) { ini = INITIALS[k]; fin = syl.slice(ini.length); break; }
    }
    if (ini && fin) {
      var ik = scheme.initialSpecial[ini] || ini;
      var fk = scheme.finalMap[fin];
      return fk ? ik + fk : null;
    }
    if (!ini) { // 零声母
      if (scheme.zero === 'O') return scheme.zeroMap[syl] || null;
      if (scheme.zero === 'final') return scheme.finalMap[syl] || null;
      // first：单字母双打 / 双字母全拼 / 三字母=首字母+韵母键（昂=ah）
      if (syl.length === 1) { var k1 = scheme.finalMap[syl]; return k1 ? k1 + k1 : null; }
      if (syl.length === 2) return syl;
      if (syl.length === 3) { var fk2 = scheme.finalMap[syl]; return fk2 ? syl[0] + fk2 : null; }
    }
    return null;
  }

  /* ==================== 五笔知识 ==================== */
  var wubi = {
    roots: [
      { key: 'G', zone: '1区横', mnemonic: '王旁青头戋（兼）五一', roots: '王 一 五 戋' },
      { key: 'F', zone: '1区横', mnemonic: '土士二干十寸雨', roots: '土 士 二 干 十 寸 雨' },
      { key: 'D', zone: '1区横', mnemonic: '大犬三羊古石厂', roots: '大 犬 三 羊（⺶） 古 石 厂' },
      { key: 'S', zone: '1区横', mnemonic: '木丁西', roots: '木 丁 西' },
      { key: 'A', zone: '1区横', mnemonic: '工戈草头右框七', roots: '工 戈 艹 匚 七' },
      { key: 'H', zone: '2区竖', mnemonic: '目具上止卜虎皮', roots: '目 卜 上 止 虍' },
      { key: 'J', zone: '2区竖', mnemonic: '日早两竖与虫依', roots: '日 早 虫 刂' },
      { key: 'K', zone: '2区竖', mnemonic: '口与川，字根稀', roots: '口 川' },
      { key: 'L', zone: '2区竖', mnemonic: '田甲方框四车力', roots: '田 甲 囗 四 车 力' },
      { key: 'M', zone: '2区竖', mnemonic: '山由贝，下框几', roots: '山 由 贝 冂 几' },
      { key: 'T', zone: '3区撇', mnemonic: '禾竹一撇双人立，反文条头共三一', roots: '禾 竹 丿 彳 攵 夂' },
      { key: 'R', zone: '3区撇', mnemonic: '白手看头三二斤', roots: '白 手 扌 斤 三 二' },
      { key: 'E', zone: '3区撇', mnemonic: '月彡（衫）乃用家衣底', roots: '月 彡 乃 用 豕 衣' },
      { key: 'W', zone: '3区撇', mnemonic: '人和八，三四里', roots: '人 八 癸头 祭头' },
      { key: 'Q', zone: '3区撇', mnemonic: '金勺缺点无尾鱼，犬旁留叉儿一点夕，氏无七（妻）', roots: '金 钅 勹 鱼头 犭 儿 夕' },
      { key: 'Y', zone: '4区点', mnemonic: '言文方广在四一，高头一捺谁人去', roots: '言 讠 文 方 广 亠 丶' },
      { key: 'U', zone: '4区点', mnemonic: '立辛两点六门疒', roots: '立 辛 丷 六 门 疒' },
      { key: 'I', zone: '4区点', mnemonic: '水旁兴头小倒立', roots: '水 氵 小 ⺌' },
      { key: 'O', zone: '4区点', mnemonic: '火业头，四点米', roots: '火 灬 业 米' },
      { key: 'P', zone: '4区点', mnemonic: '之字军盖道建底，摘礻（示）衤（衣）', roots: '之 宀 冖 廴 辶 礻 衤' },
      { key: 'N', zone: '5区折', mnemonic: '已半巳满不出己，左框折尸心和羽', roots: '已 巳 己 尸 心 忄 羽 乙' },
      { key: 'B', zone: '5区折', mnemonic: '子耳了也框向上', roots: '子 耳 了 也 卩 凵' },
      { key: 'V', zone: '5区折', mnemonic: '女刀九臼山朝西', roots: '女 刀 九 臼 彐' },
      { key: 'C', zone: '5区折', mnemonic: '又巴马，丢矢矣', roots: '又 巴 马 厶' },
      { key: 'X', zone: '5区折', mnemonic: '慈母无心弓和匕，幼无力', roots: '幺 弓 匕' }
    ],
    jianma1: [['一', 'G'], ['地', 'F'], ['在', 'D'], ['要', 'S'], ['工', 'A'], ['上', 'H'], ['是', 'J'], ['中', 'K'], ['国', 'L'], ['同', 'M'], ['和', 'T'], ['的', 'R'], ['有', 'E'], ['人', 'W'], ['我', 'Q'], ['主', 'Y'], ['产', 'U'], ['不', 'I'], ['为', 'O'], ['这', 'P'], ['民', 'N'], ['了', 'B'], ['发', 'V'], ['以', 'C'], ['经', 'X']],
    rules: [
      { title: '书写顺序', text: '按汉字规范笔顺从左到右、从上到下、从外到内拆分取码，例如「新」= 立 木 斤 → usr。' },
      { title: '取大优先', text: '能取大字根就不取小字根，例如「高」取 亠 口 冂 口，不拆成更小的部件。' },
      { title: '能连不交', text: '字根能连成就不按交叉拆，例如「天」= 一 大（相连），不拆成交叉笔画。' },
      { title: '能散不连', text: '字根能保持松散结构就不按相连处理，影响末笔识别码的判断。' },
      { title: '兼顾直观', text: '少数字为了符合书写直观性灵活处理，例如「国」= 囗 王 丶。' }
    ],
    jianma: [
      { title: '一级简码（25个）', text: '按一次字母 + 空格直接上屏：一G 地F 在D 要S 工A 上H 是J 中K 国L 同M 和T 的R 有E 人W 我Q 主Y 产U 不I 为O 这P 民N 了B 发V 以C 经X。' },
      { title: '二级简码（606个）', text: '取全码前两位 + 空格，覆盖大量常用字，例如「说」= yu + 空格。' },
      { title: '三级简码（约3800个）', text: '取全码前三位 + 空格，再敲空格虽然多一键，但省去了选字。' },
      { title: '全码（四码）', text: '字根超过三个或不足四个时打满四码，不足四码补识别码。' }
    ],
    identify: {
      title: '末笔字型识别码',
      text: '不足四码且不是简码时，用「末笔笔画定区 + 字型定位」补一位：末笔横=1区、竖=2区、撇=3区、捺=4区、折=5区；左右型=第1键、上下型=第2键、杂合型=第3键。例：「江」= 氵工 + 横(G) → iag；「花」= 艹亻匕 + 折(B) → awxb。'
    },
    tips: [
      '先背 25 句字根口诀，再背一级简码，两天就能打常用字',
      '练习时先求准再求快，错码会形成肌肉记忆，很难改',
      '遇到打不出的字，用拼音反查（多数五笔输入法支持 z 键反查）',
      '词输入比单字快得多：两字词取每字前两位编码，例如「练习」= xa + nu → xanu；三字词取前两字首位加第三字前两位',
      '86 版最通用；98/新世纪版字根有调整，换版本等于重学'
    ]
  };

  /* ==================== 拼音词库 ==================== */
  var pinyinWords = {
    '你好': ['ni', 'hao'], '世界': ['shi', 'jie'], '中国': ['zhong', 'guo'],
    '北京': ['bei', 'jing'], '上海': ['shang', 'hai'], '广州': ['guang', 'zhou'],
    '深圳': ['shen', 'zhen'], '杭州': ['hang', 'zhou'], '成都': ['cheng', 'du'],
    '打字': ['da', 'zi'], '练习': ['lian', 'xi'], '学习': ['xue', 'xi'],
    '工作': ['gong', 'zuo'], '生活': ['sheng', 'huo'], '时间': ['shi', 'jian'],
    '今天': ['jin', 'tian'], '明天': ['ming', 'tian'], '昨天': ['zuo', 'tian'],
    '早上': ['zao', 'shang'], '晚上': ['wan', 'shang'], '中午': ['zhong', 'wu'],
    '下午': ['xia', 'wu'], '小时': ['xiao', 'shi'], '分钟': ['fen', 'zhong'],
    '电脑': ['dian', 'nao'], '键盘': ['jian', 'pan'], '鼠标': ['shu', 'biao'],
    '屏幕': ['ping', 'mu'], '手机': ['shou', 'ji'], '电话': ['dian', 'hua'],
    '网络': ['wang', 'luo'], '网站': ['wang', 'zhan'], '程序': ['cheng', 'xu'],
    '代码': ['dai', 'ma'], '编程': ['bian', 'cheng'], '开发': ['kai', 'fa'],
    '软件': ['ruan', 'jian'], '硬件': ['ying', 'jian'], '系统': ['xi', 'tong'],
    '数据': ['shu', 'ju'], '信息': ['xin', 'xi'], '文件': ['wen', 'jian'],
    '文档': ['wen', 'dang'], '表格': ['biao', 'ge'], '图片': ['tu', 'pian'],
    '音乐': ['yin', 'yue'], '视频': ['shi', 'pin'], '电影': ['dian', 'ying'],
    '游戏': ['you', 'xi'], '运动': ['yun', 'dong'], '健康': ['jian', 'kang'],
    '美食': ['mei', 'shi'], '咖啡': ['ka', 'fei'], '奶茶': ['nai', 'cha'],
    '朋友': ['peng', 'you'], '家人': ['jia', 'ren'], '爸爸': ['ba', 'ba'],
    '妈妈': ['ma', 'ma'], '哥哥': ['ge', 'ge'], '姐姐': ['jie', 'jie'],
    '弟弟': ['di', 'di'], '妹妹': ['mei', 'mei'], '老师': ['lao', 'shi'],
    '学生': ['xue', 'sheng'], '学校': ['xue', 'xiao'], '大学': ['da', 'xue'],
    '中学': ['zhong', 'xue'], '小学': ['xiao', 'xue'], '公司': ['gong', 'si'],
    '会议': ['hui', 'yi'], '项目': ['xiang', 'mu'], '计划': ['ji', 'hua'],
    '目标': ['mu', 'biao'], '方法': ['fang', 'fa'], '问题': ['wen', 'ti'],
    '答案': ['da', 'an'], '结果': ['jie', 'guo'], '原因': ['yuan', 'yin'],
    '过程': ['guo', 'cheng'], '经验': ['jing', 'yan'], '知识': ['zhi', 'shi'],
    '力量': ['li', 'liang'], '速度': ['su', 'du'], '准确': ['zhun', 'que'],
    '简单': ['jian', 'dan'], '复杂': ['fu', 'za'], '容易': ['rong', 'yi'],
    '困难': ['kun', 'nan'], '开始': ['kai', 'shi'], '结束': ['jie', 'shu'],
    '继续': ['ji', 'xu'], '停止': ['ting', 'zhi'], '选择': ['xuan', 'ze'],
    '决定': ['jue', 'ding'], '支持': ['zhi', 'chi'], '帮助': ['bang', 'zhu'],
    '感谢': ['gan', 'xie'], '欢迎': ['huan', 'ying'], '再见': ['zai', 'jian'],
    '请问': ['qing', 'wen'], '谢谢': ['xie', 'xie'], '对不起': ['dui', 'bu', 'qi'],
    '没关系': ['mei', 'guan', 'xi'], '天气': ['tian', 'qi'], '太阳': ['tai', 'yang'],
    '月亮': ['yue', 'liang'], '星星': ['xing', 'xing'], '下雨': ['xia', 'yu'],
    '下雪': ['xia', 'xue'], '春天': ['chun', 'tian'], '夏天': ['xia', 'tian'],
    '秋天': ['qiu', 'tian'], '冬天': ['dong', 'tian'], '读书': ['du', 'shu'],
    '写字': ['xie', 'zi'], '说话': ['shuo', 'hua'], '听话': ['ting', 'hua'],
    '唱歌': ['chang', 'ge'], '跳舞': ['tiao', 'wu'], '走路': ['zou', 'lu'],
    '跑步': ['pao', 'bu'], '游泳': ['you', 'yong'], '睡觉': ['shui', 'jiao'],
    '起床': ['qi', 'chuang'], '吃饭': ['chi', 'fan'], '喝水': ['he', 'shui'],
    '洗澡': ['xi', 'zao'], '购物': ['gou', 'wu'], '花钱': ['hua', 'qian'],
    '赚钱': ['zhuan', 'qian'], '上班': ['shang', 'ban'], '下班': ['xia', 'ban'],
    '加班': ['jia', 'ban'], '放假': ['fang', 'jia'], '周末': ['zhou', 'mo'],
    '星期': ['xing', 'qi'], '月份': ['yue', 'fen'], '日期': ['ri', 'qi'],
    '努力': ['nu', 'li'], '认真': ['ren', 'zhen'], '坚持': ['jian', 'chi'],
    '成功': ['cheng', 'gong'], '失败': ['shi', 'bai'], '加油': ['jia', 'you'],
    '梦想': ['meng', 'xiang'], '未来': ['wei', 'lai'], '回忆': ['hui', 'yi'],
    '故事': ['gu', 'shi'], '音乐家': ['yin', 'yue', 'jia'], '计算机': ['ji', 'suan', 'ji'],
    '互联网': ['hu', 'lian', 'wang'], '输入法': ['shu', 'ru', 'fa'],
    '双拼': ['shuang', 'pin'], '五笔': ['wu', 'bi'], '拼音': ['pin', 'yin'],
    '笔画': ['bi', 'hua'], '全拼': ['quan', 'pin'], '声母': ['sheng', 'mu'],
    '韵母': ['yun', 'mu'], '字母': ['zi', 'mu'], '空格': ['kong', 'ge'],
    '回车': ['hui', 'che'], '退格': ['tui', 'ge'], '大小写': ['da', 'xiao', 'xie'],
    '快捷键': ['kuai', 'jie', 'jian'], '复制': ['fu', 'zhi'], '粘贴': ['zhan', 'tie'],
    '保存': ['bao', 'cun'], '打开': ['da', 'kai'], '关闭': ['guan', 'bi'],
    '搜索': ['sou', 'suo'], '浏览': ['liu', 'lan'], '下载': ['xia', 'zai'],
    '上传': ['shang', 'chuan'], '设置': ['she', 'zhi'], '帮助文档': ['bang', 'zhu', 'wen', 'dang'],
    '一个': ['yi', 'ge'], '美丽': ['mei', 'li'], '国家': ['guo', 'jia'],
    '打工': ['da', 'gong'], '平安': ['ping', 'an'], '顺利': ['shun', 'li'],
    '下次': ['xia', 'ci'], '我们': ['wo', 'men'], '自然': ['zi', 'ran'],
    '上来': ['shang', 'lai'], '一门': ['yi', 'men'], '熟练': ['shu', 'lian'],
    '如此': ['ru', 'ci'], '从不': ['cong', 'bu'], '使用': ['shi', 'yong'],
    '眼睛': ['yan', 'jing'], '看着': ['kan', 'zhe'], '十个': ['shi', 'ge'],
    '手指': ['shou', 'zhi'], '各司其职': ['ge', 'si', 'qi', 'zhi'],
    '温故': ['wen', 'gu'], '知新': ['zhi', 'xin'], '就是': ['jiu', 'shi'],
    '胜利': ['sheng', 'li'], '一天': ['yi', 'tian'], '一年': ['yi', 'nian'],
    '在于': ['zai', 'yu'], '书山': ['shu', 'shan'], '有路': ['you', 'lu'],
    '学海': ['xue', 'hai'], '无涯': ['wu', 'ya'], '功夫': ['gong', 'fu'],
    '不负': ['bu', 'fu'], '有心': ['you', 'xin'], '千里': ['qian', 'li'],
    '之行': ['zhi', 'xing'], '始于': ['shi', 'yu'], '足下': ['zu', 'xia'],
    '熟能生巧': ['shu', 'neng', 'sheng', 'qiao'], '打工人': ['da', 'gong', 'ren'],
    '好梦': ['hao', 'meng'], '心想': ['xin', 'xiang'], '事成': ['shi', 'cheng'],
    '万事': ['wan', 'shi'], '如意': ['ru', 'yi'], '一路': ['yi', 'lu'],
    '顺风': ['shun', 'feng'], '山高': ['shan', 'gao'], '路远': ['lu', 'yuan'],
    '早安': ['zao', 'an'], '晚安': ['wan', 'an'], '苦尽': ['ku', 'jin'],
    '甘来': ['gan', 'lai'], '勤奋': ['qin', 'fen'], '认真': ['ren', 'zhen'],
    '身体': ['shen', 'ti'], '折腾': ['zhe', 'teng']
  };
  // 单字词（供造句）
  var singleChars = '你 我 他 她 它 的 了 在 是 有 不 人 大 小 上 下 中 来 去 说 看 听 想 做 用 会 能 要 得 着 过 年 月 日 天 地 也 就 还 又 再 很 太 更 最 好 坏 多 少 高 低 长 短 新 旧 快 慢 早 晚 前 后 左 右 里 外 东 南 西 北 春 夏 秋 冬 风 雨 雪 云 山 水 火 木 金 土 车 马 牛 羊 鱼 鸟 花 草 树 叶 门 窗 书 笔 纸 字 句 话 语 言 心 意 力 气 光 明 暗 声 音 色 香 味 甜 苦 辣 酸 咸 冷 热 暖 凉 干 湿 净 脏 美 丑 胖 瘦 矮 粗 细 深 浅 厚 薄 软 硬 轻 重 稳 急 缓 松 紧 空 满 缺 圆 方 直 弯 平 斜 升 降 开 关 起 落 浮 沉 静 动 停 走 跑 跳 飞 爬 游 睡 醒 坐 站 躺 卧 握 拿 放 收 送 买 卖 借 给 找 丢 捡 修 建 拆 装 洗 擦 扫 拖 叠 挂 按 压 推 拉 搬 抬 背 抱 工 晨 尽 甘 勤 径 舟 而 之 计 于 其'.split(/\s+/);
  var pinyinSentences = [
    ['你好', '世界'], ['今天', '天气', '很', '好'], ['我', '在', '学习', '打字'],
    ['中国', '是', '一个', '美丽', '的', '国家'], ['熟能生巧'], ['千里', '之行', '始于', '足下'],
    ['功夫', '不负', '有心', '人'], ['书山', '有路', '学海', '无涯'], ['苦', '尽', '甘', '来'],
    ['一天', '之', '计', '在于', '晨'], ['一年', '之', '计', '在于', '春'], ['温故', '而', '知新'],
    ['坚持', '就是', '胜利'], ['眼睛', '看着', '屏幕'], ['十', '个', '手指', '各司其职'],
    ['先', '求', '准确', '再', '求', '速度'], ['速度', '自然', '会', '上来'],
    ['打字', '是', '一门', '熟练', '工'], ['生活', '如此', '美丽'], ['折腾', '从不', '停止'],
    ['欢迎', '使用', '打字', '练习'], ['谢谢', '你', '的', '支持'], ['我们', '下次', '再见'],
    ['早安', '打工人'], ['晚安', '好梦'], ['心想', '事成'], ['万事', '如意'],
    ['身体', '健康'], ['一路', '顺风'], ['山高', '路远'], ['一路', '平安'],
    ['勤奋', '认真'], ['努力', '坚持']
  ];
  var pinyinTips = [
    'ü 在键盘上用 v 代替：女 = nv，绿 = lv',
    '整句输入比逐字选字更快，输完一句话再回头改',
    '善用分词：遇到容易混的词，加个撇号 \' 分隔音节（如 西安 xi\'an）',
    '不会读的字：拆开打（忄+亡），或用手写/语音输入顶上',
    '标点符号也要练：中文标点占全角，速度一样受影响',
    '固定词库：把常用姓名、术语加到自定义词库，一劳永逸'
  ];

  /* ==================== 笔画输入 ==================== */
  var strokes = {
    keys: [
      { key: '1', letter: 'h', name: '横', includes: '一 二 三 提' },
      { key: '2', letter: 's', name: '竖', includes: '丨 竖钩' },
      { key: '3', letter: 'p', name: '撇', includes: '丿' },
      { key: '4', letter: 'n', name: '捺/点', includes: '丶 ㇏' },
      { key: '5', letter: 'z', name: '折', includes: '所有带转折的笔画：横折、竖折、横钩…' }
    ],
    rules: [
      '先横后竖（十 = 一 + 丨），先撇后捺（人 = 丿 + ㇏）',
      '从上到下（三 = 一 一 一），从左到右（川 = 丿 丨 丨）',
      '从外到内（月 = 丿 𠃌 一 一），先中间后两边（小 = 亅 丿 丶）',
      '所有折笔（横折、竖折、横钩、竖弯钩…）都算「折」，按 5',
      '提按横算：氵 的第一笔是「横」不是「竖」'
    ],
    tips: [
      '笔画输入是手机端主力：九宫格 1-5 就是 横竖撇捺折',
      '打不出的字词，笔画输入永远不会卡住——这是它最大的价值',
      '电脑端笔画输入法较少，通常作为五笔/拼音的备用',
      '常见字多笔画顺序记不清时，按「猜着打」：候选会实时刷新'
    ]
  };

  /* ==================== 英文练习文本 ==================== */
  var english = {
    words: 'the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us man find here thing great little world life still small large next early young important few public bad same able different following during'.split(/\s+/),
    quotes: [
      'The quick brown fox jumps over the lazy dog',
      'Practice makes perfect',
      'Simplicity is the ultimate sophistication',
      'Talk is cheap show me the code',
      'Stay hungry stay foolish',
      'The best way to predict the future is to invent it',
      'A journey of a thousand miles begins with a single step',
      'It does not matter how slowly you go so long as you do not stop',
      'What we think we become',
      'Life is like riding a bicycle to keep your balance you must keep moving',
      'Done is better than perfect',
      'Programs must be written for people to read',
      'First solve the problem then write the code',
      'Any fool can write code that a computer can understand'
    ],
    code: [
      'const sum = (a, b) => a + b;',
      'for (let i = 0; i < 10; i++) { console.log(i); }',
      'def hello(name): print(f"hello, {name}")',
      'git commit -m "fix: typing speed"',
      'docker compose up -d',
      'if (err) { throw new Error("oops"); }',
      'SELECT * FROM users WHERE id = 1;',
      'npm run build && npm run deploy',
      'function* range(n) { for (let i = 0; i < n; i++) yield i; }',
      'export default function App() { return null; }'
    ]
  };

  /* ==================== 指法诀窍 ==================== */
  var fingering = {
    home: '左手 A S D F，右手 J K L ；八个键是基准键，F 和 J 上有定位凸点',
    fingers: [
      { name: '左手小指', keys: '` 1 Q A Z Tab Caps Shift', color: '#c2410c' },
      { name: '左手无名指', keys: '2 W S X', color: '#a16207' },
      { name: '左手中指', keys: '3 E D C', color: '#4d7c0f' },
      { name: '左手食指', keys: '4 5 R T F G V B', color: '#0e7490' },
      { name: '右手食指', keys: '6 7 Y U H J N M', color: '#1d4ed8' },
      { name: '右手中指', keys: '8 I K ,', color: '#6d28d9' },
      { name: '右手无名指', keys: '9 O L .', color: '#be185d' },
      { name: '右手小指', keys: '0 - = P [ ] \\ ; \' Enter', color: '#b91c1c' },
      { name: '拇指', keys: 'Space', color: '#525252' }
    ],
    posture: [
      '屏幕顶端与眼睛平齐，距离一臂长',
      '手腕悬空或轻托在掌托上，不要压在桌沿',
      '手指自然弯曲，关节微拱，像握着鸡蛋',
      '击键后迅速回位到基准键，全程不看键盘',
      '每 45 分钟活动一下手腕，预防腱鞘炎'
    ],
    stages: [
      { title: '第 1 周：基准键', text: '只练 A S D F J K L ; 八个键，形成肌肉记忆' },
      { title: '第 2 周：上排 + 下排', text: '逐指扩展 Q W E R T Y U I O P 和 Z X C V B N M' },
      { title: '第 3 周：大小写与符号', text: '加入 Shift 组合键和常用标点' },
      { title: '第 4 周：数字行', text: '主键盘区数字，或直接上小键盘' },
      { title: '长期：中文输入', text: '拼音/双拼/五笔任选其一，与指法同步练' }
    ],
    tips: [
      '准确率优先于速度：错了马上改，不要蒙',
      '匀速比爆发重要，稳定节奏才能持久',
      '每天 15 分钟 > 周末突击 2 小时',
      '录屏回看自己的手，纠正是最快的进步方式'
    ]
  };

  /* ==================== 键盘图鉴 ==================== */
  var keyboardGuide = {
    layouts: [
      { name: '100% / 104 键', keys: '104 键', size: '约 444 × 140 mm', desc: '全尺寸带数字区，财务、数据录入效率最高，占地最大', zones: 'F 区 · 主键区 · 导航区 · 方向键 · 数字区', dg: { type: 'layout', spec: { f: 1, nav: 1, num: 1, navTop: 1 } } },
      { name: '96%', keys: '96 键', size: '约 400 × 135 mm', desc: '压缩了功能区间隙，保留数字区，体积接近 87 键', zones: '主键区 · 导航区 · 方向键 · 数字区（无 F 区）', dg: { type: 'layout', spec: { nav: 1, num: 1 } } },
      { name: 'TKL / 87 键', keys: '87 键', size: '约 360 × 135 mm', desc: '砍掉数字区，游戏玩家标配，给鼠标留出大片空间', zones: 'F 区 · 主键区 · 导航区 · 方向键', dg: { type: 'layout', spec: { f: 1, nav: 1, navTop: 1 } } },
      { name: '75%', keys: '80 ~ 82 键', size: '约 320 × 120 mm', desc: '保留 F 区和方向键，砍掉独立编辑键，小巧与功能平衡', zones: 'F 区 · 主键区 · 编辑键列（Home/PgUp/Del/PgDn）', dg: { type: 'layout', spec: { f: 1, side: 1 } } },
      { name: '65%', keys: '66 ~ 68 键', size: '约 310 × 110 mm', desc: '保留 F 区和导航/方向键，砍掉数字区与独立编辑键', zones: 'F 区 · 主键区 · 导航区 · 方向键', dg: { type: 'layout', spec: { f: 1, nav: 1 } } },
      { name: '60%', keys: '61 ~ 64 键', size: '约 290 × 110 mm', desc: '最紧凑的常用配列，~ 都要用组合键，便携之王', zones: '主键区（无 F 区 / 无导航区 / 无方向键）', dg: { type: 'layout', spec: {} } },
      { name: '40% 及以下', keys: '47 ~ 50 键', size: '约 240 × 100 mm', desc: '没有数字行也没有 F 行，极客玩具，日常使用门槛高', zones: '主键区（4 行）', dg: { type: 'layout', spec: { rows: [[{ x: 0, c: '`' }, { x: 1, c: '1' }, { x: 2, c: '2' }, { x: 3, c: '3' }, { x: 4, c: '4' }, { x: 5, c: '5' }, { x: 6, c: '6' }, { x: 7, c: '7' }, { x: 8, c: '8' }, { x: 9, c: '9' }, { x: 10, c: '0' }, { x: 11, c: '-' }, { x: 12, c: '=' }, { x: 13, w: 2, c: '⌫' }], [{ x: 0, w: 1.5, c: 'Tab' }, { x: 1.5, c: 'Q' }, { x: 2.5, c: 'W' }, { x: 3.5, c: 'E' }, { x: 4.5, c: 'R' }, { x: 5.5, c: 'T' }, { x: 6.5, c: 'Y' }, { x: 7.5, c: 'U' }, { x: 8.5, c: 'I' }, { x: 9.5, c: 'O' }, { x: 10.5, c: 'P' }, { x: 11.5, c: '[' }, { x: 12.5, c: ']' }, { x: 13.5, w: 1.5, c: '\\' }], [{ x: 0, w: 1.75, c: 'Caps' }, { x: 1.75, c: 'A' }, { x: 2.75, c: 'S' }, { x: 3.75, c: 'D' }, { x: 4.75, c: 'F' }, { x: 5.75, c: 'G' }, { x: 6.75, c: 'H' }, { x: 7.75, c: 'J' }, { x: 8.75, c: 'K' }, { x: 9.75, c: 'L' }, { x: 10.75, c: ';' }, { x: 11.75, c: '\'' }, { x: 12.75, w: 2.25, c: 'Enter' }], [{ x: 0, w: 2.25, c: 'Shift' }, { x: 2.25, c: 'Z' }, { x: 3.25, c: 'X' }, { x: 4.25, c: 'C' }, { x: 5.25, c: 'V' }, { x: 6.25, c: 'B' }, { x: 7.25, c: 'N' }, { x: 8.25, c: 'M' }, { x: 9.25, c: ',' }, { x: 10.25, c: '.' }, { x: 11.25, c: '/' }, { x: 12.25, w: 2.75, c: 'Shift' }]] } } },
      { name: '分体式 / Alice', keys: '约 76 键（左右各半）', size: '每半约 190 × 120 mm', desc: '左右分开或弧形倾斜，符合人体肩宽与手腕自然角度', zones: '左手 6 列 · 右手 6 列（拇指键可另加）', dg: { type: 'split' } }
    ],
    switches: [
      { name: '青轴', type: '段落轴', force: '50g', travel: '4.0mm', desc: '段落感清脆有声，「打字机」手感，办公室慎用', dg: { type: 'switch', stem: '#3d7ea6', tone: 'click' } },
      { name: '茶轴', type: '段落轴', force: '55g', travel: '4.0mm', desc: '轻微段落感，声音较小，被称为「万能轴」', dg: { type: 'switch', stem: '#8a5a34', tone: 'tactile' } },
      { name: '红轴', type: '线性轴', force: '45g', travel: '4.0mm', desc: '直上直下压力轻，游戏和长时间打字都合适', dg: { type: 'switch', stem: '#b4413a', tone: 'linear' } },
      { name: '黑轴', type: '线性轴', force: '60g', travel: '4.0mm', desc: '压力克数大，回弹猛，手劲大者适用', dg: { type: 'switch', stem: '#3c3a37', tone: 'linear' } },
      { name: '银轴', type: '线性轴', force: '45g', travel: '3.4mm', desc: '触发行程短触发快，电竞向，误触率略高', dg: { type: 'switch', stem: '#9aa2ab', tone: 'linear' } },
      { name: '静音红/静音月白', type: '线性/段落', force: '45g', travel: '3.5mm', desc: '加硅胶降噪，图书馆/卧室友好', dg: { type: 'switch', stem: '#c2695a', tone: 'linear' } }
    ],
    keycaps: [
      { name: '材质 ABS', desc: '手感细腻成本低，长期使用易打油发亮' },
      { name: '材质 PBT', desc: '磨砂质感耐打油，字符多为二色成型，价格略高' },
      { name: '高度 OEM', desc: '最常见，前高后低约 9mm 梯差' },
      { name: '高度 原厂/Cherry', desc: '比 OEM 矮一档，经典德产手感' },
      { name: '工艺 二色成型', desc: '字永不磨损，字符边缘略粗' },
      { name: '工艺 热升华', desc: '可做复杂彩色图案，PBT 键帽常用' },
      { name: '工艺 镭雕/丝印', desc: '成本最低，磨损后字符变淡' }
    ],
    structure: [
      { name: '船壳', desc: '外壳承力，结构简单成本低，手感偏硬' },
      { name: '托盘（Top）', desc: '内胆固定在顶盖，比船壳规整' },
      { name: 'Gasket 垫片', desc: '内胆通过垫片悬吊在壳内，软弹均匀，近年主流' },
      { name: '定位板', desc: '钢：硬朗；PC/FR4：适中；铝：扎实——直接影响手感' },
      { name: '消音棉', desc: '夹心棉+底棉降低空腔音，是性价比最高的改造' },
      { name: '热插拔', desc: '轴体可插拔更换，玩轴换轴不求人，坏了只换一颗' },
      { name: '连接方式', desc: '单模有线 / 双模（有线+蓝牙）/ 三模（+2.4G）' },
      { name: '键线分离', desc: 'Type-C 可拔线，便携和收纳都方便' }
    ],
    layout: [
      { name: 'ANSI', desc: '美式布局，Enter 横长，国内最常见' },
      { name: 'ISO', desc: '欧式布局，回车倒 L 形，多一个键' },
      { name: 'JIS', desc: '日式布局，空格短，多了几个日文专用键' },
      { name: 'QWERTY', desc: '通用布局，1868 年打字机遗产，将错就错至今' },
      { name: 'Dvorak', desc: '把常用字母放中排，速度上限更高，需软件映射' },
      { name: 'Colemak', desc: '折中方案：比 Dvorak 好学，比 QWERTY 高效' }
    ],
    glossary: [
      { name: '键程', desc: '按键从静止到触底的总距离，常见 3.4–4.0mm' },
      { name: '触发行程', desc: '从按下到触发信号的距离，越短响应越快' },
      { name: '触发压力', desc: '触发所需克数，45g 轻、60g 重' },
      { name: '全键无冲', desc: '同时按所有键都不冲突，游戏刚需' },
      { name: '回报率', desc: '每秒向电脑报告按键的次数，1000Hz = 1ms 延迟' },
      { name: '卫星轴', desc: '大键位（空格/回车/Shift）的平衡钢丝支架' },
      { name: '润轴', desc: '给轴加润滑脂消除弹簧音，DIY 进阶玩法' },
      { name: '套件 vs 成品', desc: '套件不含轴和键帽，自己搭配；成品开箱即用' }
    ],
    care: [
      '键帽定期拔下用清水洗，轴体用罐装压缩空气吹',
      '打油是 ABS 宿命，介意就选 PBT 或干脆接受包浆',
      '进水立刻断电倒置晾干，48 小时后再通电',
      '蓝牙键盘长期不用建议每月充一次电护电池'
    ],
    diagrams: {
      forceCurve: { title: '轴体手感曲线', desc: '线性轴直上直下，段落轴中途有一个小凸起，咔嗒轴先冲顶再回落。触发压力（g）决定手感轻重，触发行程（mm）决定响应快慢。' },
      keycapProfile: { title: '键帽高度剖面', desc: '键帽有高矮之分：原厂/OEM/SA/矮轴。键帽越高，手腕抬得越高；矮轴接近笔记本手感，长时间打字更轻松。' },
      structure: { title: '结构剖面对比', desc: '船壳由外壳直接承力，手感扎实偏硬；Gasket 让内胆悬吊在垫片上，敲击更软弹、声音更沉。' }
    }
  };


  /* ==================== 键盘选购指南 ==================== */
  var buyingGuide = {
    budgets: [
      { range: '200 元以下', tag: '能用', desc: '薄膜或入门机械。手感与寿命一般，但如果只是偶尔打字，够用。', pick: '带热插拔的入门款' },
      { range: '200 – 500 元', tag: '主流性价比', desc: '国产轴 + 热插拔 + Gasket 结构已经很成熟，这个价位能满足九成人的需求。', pick: '红轴 / 茶轴 · 87 或 75 配列' },
      { range: '500 – 1000 元', tag: '进阶', desc: '更好材料（PBT 键帽、厚重外壳）、更用心的卫星轴调教、更好的声音。', pick: '静音轴 · 三模 · 75%' },
      { range: '1000 元以上', tag: '客制化', desc: '买的是材料、做工与声音调校，边际收益递减，适合已经入坑的人。', pick: 'Gasket 铝坨 · 定制键帽' }
    ],
    scenes: [
      { scene: '办公室 / 宿舍', tip: '安静优先', desc: '红轴、茶轴或静音红轴，别带青轴——声音大且扰人。' },
      { scene: '长时间码字', tip: '轻压力 + 软弹', desc: '45g 左右线性轴 + Gasket 结构，手指和手腕不容易累。' },
      { scene: '打游戏', tip: '触发要快', desc: '银轴或短行程线性轴；87 / 75 配列给鼠标让位。' },
      { scene: '财务 / 数据录入', tip: '数字区不能少', desc: '104 或 98 配列，独立数字区效率高一个量级。' },
      { scene: '经常外出', tip: '小且能连', desc: '65% / 60% + 三模，重量尽量 500g 以内。' }
    ],
    checklist: [
      '热插拔优先：轴坏了只换一颗，不用整把更换',
      '看大键（卫星轴）调教：空格晃、闷响是廉价感的主要来源',
      'PBT 键帽优于 ABS：ABS 手感细腻，但半年就打油发亮',
      '别为灯效加钱：RGB 是锦上添花，不解决手感',
      '三模按需：桌面固定用有线最稳，不必为「无线」溢价',
      '轴体先买试轴器：同一颗轴的感受因人而异，别信排行榜'
    ]
  };

  return {
    schemes: schemes,
    encodeSyllable: encodeSyllable,
    wubi: wubi,
    pinyinWords: pinyinWords,
    singleChars: singleChars,
    pinyinSentences: pinyinSentences,
    pinyinTips: pinyinTips,
    strokes: strokes,
    english: english,
    fingering: fingering,
    keyboardGuide: keyboardGuide,
    buyingGuide: buyingGuide
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = window.DAZI_CONTENT;
