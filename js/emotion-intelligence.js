// ========== 情感智能引擎 v3 ==========
// ML模型 + 规则引擎混合方案
// 使用 transformers.js 本地模型进行情感分类，结合规则模板

// ========== 情感词典（用于规则分类） ==========
const SENTIMENT_LEXICON = {
  // 强正面词 (+8 ~ +10)
  loveStrong: [
    '爱你', '爱你们', '爱', '想念', '想你了', '想你们', '舍不得',
    '棒极了', '太棒了', '完美', '优秀', '杰出', '出色', '厉害',
    '感恩', '感激', '感谢', '谢谢妈', '谢谢爸', '么么哒', '亲亲',
    '幸福', '美满', '甜蜜', '温馨', '暖心', '窝心', '感动'
  ],

  // 弱正面词 (+4 ~ +7)
  loveWeak: [
    '好', '不错', '还行', '挺好', '还好', '好吧', '好的',
    '哈哈', '嘿嘿', '嘻嘻', '开心', '高兴', '快乐', '愉快',
    '棒', '棒棒', '赞', '点赞', '加油', '奥利给',
    '乖', '听话', '懂事', '贴心', '暖', '温暖', '暖暖',
    '放心', '安心', '平安', '顺利', '健康', '保重',
    '休息', '早睡', '睡好', '吃好', '照顾好', '保重身体'
  ],

  // 关心类词 (+3 ~ +6)
  care: [
    '注意', '小心', '当心', '多穿', '穿暖', '别着凉', '保暖',
    '记得吃饭', '好好吃饭', '按时吃饭', '别饿着', '多吃点',
    '早点睡', '早点休息', '别熬夜', '注意休息', '劳逸结合',
    '别太累', '别太辛苦', '悠着点', '慢慢来', '别着急',
    '多喝水', '补充水分', '常锻炼', '锻炼身体', '活动活动',
    '胃疼', '胃不好', '注意胃', '少外卖', '别老吃外卖',
    '健康第一', '身体重要', '养好身体', '照顾身体',
    '路上小心', '注意安全', '平安', '安全第一',
    '常打电话', '常视频', '多联系', '别断了联系'
  ],

  // 疲劳类词 (-3 ~ -8)
  fatigue: [
    '累', '好累', '太累了', '累死了', '累坏了', '累垮了',
    '困', '好困', '困死了', '困得很', '想睡', '想睡觉', '想休息',
    '疲惫', '疲倦', '倦', '没劲', '没精神', '没力气', '浑身没劲',
    '虚', '弱', '体虚', '透支', '超负荷', '疲劳',
    '熬', '熬夜', '通宵', '睡不够', '缺觉', '补觉',
    '腰酸', '背痛', '脖子酸', '眼睛酸', '肩膀酸'
  ],

  // 压力类词 (-4 ~ -9)
  stress: [
    '烦', '好烦', '太烦了', '烦死了', '好烦躁', '烦躁', '烦躁不安',
    '压力大', '压力好大', '压力山大', '焦虑', '好焦虑', '焦虑不安',
    '紧张', '好紧张', '紧张死了', '忐忑', '忐忑不安',
    '不安', '心慌', '心慌意乱', '恐慌', '害怕',
    '崩溃', '崩溃了', '快崩溃', '人要崩溃',
    '撑不住', '撑不住了', '扛不住', '扛不住了',
    '心累', '身心俱疲', '身心疲惫', '精疲力竭', '筋疲力尽',
    '压抑', '沉闷', '抑郁', '郁闷', '郁闷死了',
    '无奈', '无力', '无助', '绝望', '绝望了',
    '难', '好难', '太难了', '难熬', '过不去'
  ],

  // 负面情绪词 (-5 ~ -10)
  sadness: [
    '难过', '好难过', '太难过了', '伤心', '好伤心', '心碎',
    '哭', '想哭', '哭了', '流泪', '眼泪', '眼眶湿润',
    '失落', '失落感', '沮丧', '好沮丧', '消极', '悲观',
    '失望', '失望透顶', '绝望', '没希望', '无望',
    '委屈', '委屈巴巴', '憋屈', '憋得慌',
    '不爽', '不舒服', '不得劲', '别扭',
    '后悔', '遗憾', '可惜', '遗憾终生'
  ],

  // 开心/积极词 (+5 ~ +9)
  happy: [
    '开心', '好开心', '太开心了', '开心死了', '心花怒放',
    '高兴', '好高兴', '太高兴了', '兴高采烈', '兴奋',
    '快乐', '很快乐', '乐', '乐呵呵', '乐颠颠',
    '哈哈', '哈哈哈', '呵呵', '嘿嘿', '嘻嘻',
    '棒', '很棒', '太棒了', '真棒', '超棒', '最棒',
    '赞', '真赞', '太赞了', '赞不绝口',
    '优秀', '很优秀', '出色', '杰出', '不凡',
    '完美', '太完美了', '圆满', '圆满成功',
    '激动', '激动人心', '振奋', '振奋人心'
  ],

  // 思念类词 (+6 ~ +9)
  missing: [
    '想', '想你', '想你们', '想家', '想回家了', '思乡',
    '想念', '思念', '惦记', '挂念', '牵挂',
    '盼', '盼望', '期待', '期盼', '渴望',
    '好久不见', '许久不见', '甚是想念'
  ],

  // 日常回应词 (0 ~ +3)
 日常: [
    '嗯', '嗯嗯', '好的', '好', '知道了', '好的妈', '好嘞',
    '行', '可以', '没问题', 'OK', 'ok', '好哒', '好呀',
    '哦', '哦哦', '这样啊', '原来如此', '明白了',
    '在', '在的', '嗯在', '在呢', '我在',
    '忙', '在工作', '在复习', '在写作业', '在忙',
    '吃了', '吃了饭', '吃了早饭', '吃了午饭', '吃了晚饭',
    '没事', '没啥', '没什么', '没什么事', '还好还好',
    '挺好的', '还不错', '还行吧', '马马虎虎'
  ]
};

// 构建快速查找的词典（词 -> 权重）
function buildLexiconMap() {
  const map = {};
  const categories = {
    positive: ['loveStrong', 'loveWeak', 'happy', 'missing'],
    negative: ['fatigue', 'stress', 'sadness'],
    neutral: ['care', '日常']
  };

  Object.entries(categories).forEach(([sentiment, categoryList]) => {
    categoryList.forEach(cat => {
      const words = SENTIMENT_LEXICON[cat] || [];
      words.forEach(word => {
        let score = 5; // 默认中性
        if (sentiment === 'positive') {
          if (cat === 'loveStrong' || cat === 'missing') score = 8;
          else if (cat === 'loveWeak') score = 5;
          else if (cat === 'happy') score = 7;
        } else if (sentiment === 'negative') {
          if (cat === 'stress') score = -7;
          else if (cat === 'fatigue') score = -6;
          else if (cat === 'sadness') score = -7;
        } else {
          score = 4; // care
        }
        map[word] = { score, category: sentiment === 'positive' ? 'care' : (sentiment === 'negative' ? 'negative' : 'care') };
      });
    });
  });

  return map;
}

const LEXICON_MAP = buildLexiconMap();

// ========== 中文分词（FMM正向最大匹配） ==========
const MAX_WORD_LEN = 4;

function tokenize(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (let len = Math.min(MAX_WORD_LEN, text.length - i); len >= 2; len--) {
      const word = text.substring(i, i + len);
      if (LEXICON_MAP[word] || len === 2) {
        tokens.push(word);
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(text[i]);
      i++;
    }
  }
  return tokens;
}

// ========== 情感分类器（支持 ML 结果融合） ==========
function classifyEmotion(text, mlResult = null) {
  const tokens = tokenize(text);
  let totalScore = 0;
  let count = 0;
  let maxScore = 0;
  let minScore = 0;
  let careCount = 0;
  let negativeCount = 0;

  tokens.forEach(token => {
    const entry = LEXICON_MAP[token];
    if (entry) {
      totalScore += entry.score;
      count++;
      if (entry.score > maxScore) maxScore = entry.score;
      if (entry.score < minScore) minScore = entry.score;
      if (entry.category === 'care') careCount++;
      if (entry.category === 'negative') negativeCount++;
    }
  });

  const avgScore = count > 0 ? totalScore / count : 0;

  // 情绪类型判断
  let emotionType = 'neutral';
  let confidence = 0.5;

  // 优先级判断 - 疲劳类优先检测
  if (containsAny(text, SENTIMENT_LEXICON.fatigue)) {
    emotionType = 'fatigue';
    confidence = 0.85;
  } else if (containsAny(text, SENTIMENT_LEXICON.stress)) {
    emotionType = 'stress';
    confidence = 0.85;
  } else if (containsAny(text, SENTIMENT_LEXICON.sadness)) {
    emotionType = 'stress';
    confidence = 0.75;
  } else if (negativeCount > 0 && negativeCount >= careCount) {
    if (avgScore < -3) {
      emotionType = 'worry';
      confidence = 0.7;
    } else {
      emotionType = 'worry';
      confidence = 0.6;
    }
  } else if (careCount > 0 || avgScore > 0) {
    if (containsAny(text, SENTIMENT_LEXICON.missing)) {
      emotionType = 'care';
      confidence = 0.9;
    } else if (containsAny(text, SENTIMENT_LEXICON.loveStrong)) {
      emotionType = 'care';
      confidence = 0.9;
    } else if (avgScore > 3) {
      emotionType = 'care';
      confidence = 0.75;
    } else {
      emotionType = 'care';
      confidence = 0.65;
    }
  } else if (avgScore < -1) {
    emotionType = 'worry';
    confidence = 0.6;
  }

  // 特殊场景检测：寻求安慰
  if (emotionType === 'worry' || emotionType === 'stress') {
    if (containsAny(text, ['怎么办', '怎么办啊', '好烦', '不开心', '难过', '沮丧', '想哭', '扛不住'])) {
      emotionType = 'seeking';
      confidence = 0.8;
    }
  }

  // ML结果融合：如果 ML 检测到正向情感且分数很高，强化 care 类型
  if (mlResult && mlResult.label === 'positive' && mlResult.positiveScore > 0.8) {
    if (emotionType === 'neutral' || emotionType === 'care') {
      emotionType = 'care';
      confidence = Math.max(confidence, mlResult.positiveScore);
    }
  }

  return { emotionType, confidence, avgScore, tokens };
}

function containsAny(text, words) {
  return words.some(w => text.includes(w));
}

// ========== 情感标签映射 ==========
const EMOTION_TAG_MAP = {
  care: '关心',
  worry: '担心',
  fatigue: '疲惫',
  stress: '压力',
  seeking: '需要安慰',
  neutral: '日常'
};

// ========== 父母→孩子翻译规则（大幅扩展） ==========
const PARENT_TO_CHILD_RULES = {
  worry: {
    patterns: [
      { match: /不睡|还没睡|这么晚|还没睡呢|还不睡/, interpreted: '妈妈担心你熬坏身体', suggestion: '早点休息，妈妈才安心' },
      { match: /多穿|穿暖|冷不冷|冷着了|着凉|受凉|保暖/, interpreted: '妈妈怕你着凉生病', suggestion: '穿暖和点，妈妈才放心' },
      { match: /外卖|吃饭了吗|吃了吗|吃了没|饿不饿|饿了|胃疼|胃不好/, interpreted: '妈妈担心你吃得不健康', suggestion: '少吃点外卖，妈妈更安心' },
      { match: /工作忙不忙|工作怎么样|累不累|辛苦不辛苦|累坏了吧/, interpreted: '妈妈想知道你最近累不累', suggestion: '和妈妈说说近况吧' },
      { match: /安全吗|注意安全|小心点|路上小心|过马路小心/, interpreted: '妈妈担心你的安全', suggestion: '平安是福，妈妈才安心' },
      { match: /早点睡|早点休息|别熬夜|别太晚|注意休息/, interpreted: '妈妈希望你好好休息', suggestion: '照顾好自己，妈妈才放心' },
      { match: /身体第一|身体重要|健康第一|养好身体/, interpreted: '妈妈希望你身体健康', suggestion: '身体是革命的本钱' },
      { match: /钱够吗|钱够不够|省钱|别太省|别太省了/, interpreted: '妈妈担心你钱不够花', suggestion: '别太省，对自己好一点' },
      { match: /喝水了吗|多喝水|补充水分|渴不渴/, interpreted: '妈妈关心你的水分补充', suggestion: '多喝水，身体好' },
      { match: /锻炼了吗|多锻炼|活动活动|动一动/, interpreted: '妈妈希望你多锻炼身体', suggestion: '生命在于运动' },
      { match: /常联系|多打电话|常视频|别断联系/, interpreted: '妈妈想多和你联系', suggestion: '常给家里打电话' },
      { match: /别太累|别太辛苦|悠着点|慢慢来/, interpreted: '妈妈心疼你太辛苦', suggestion: '累了就歇歇' }
    ],
    default: { interpreted: '妈妈在关心你', suggestion: '感受到了妈妈的爱' }
  },
  care: {
    patterns: [
      { match: /红烧肉|想吃妈妈做的|想吃家里的|好想吃/, interpreted: '妈妈想念你，想给你做好吃的', suggestion: '春节回家尝尝妈妈的手艺' },
      { match: /家|回来|春节|过年|回家|什么时候回来/, interpreted: '爸妈盼着你回家', suggestion: '记得早点买票回家' },
      { match: /身体|健康|锻炼|体检/, interpreted: '妈妈希望你身体健康', suggestion: '多锻炼，注意身体' },
      { match: /钱|够花|省钱|别省/, interpreted: '妈妈担心你钱不够花', suggestion: '别太省，对自己好一点' },
      { match: /担心|怕你|怕什么|不要担心/, interpreted: '妈妈心里一直惦记着你', suggestion: '妈妈的爱从未减少' },
      { match: /想你|想念|惦记你|牵挂你/, interpreted: '妈妈很想念你', suggestion: '记得常给家里打电话' },
      { match: /生日|生辰|长大了/, interpreted: '妈妈记得你的重要日子', suggestion: '妈妈永远爱你' },
      { match: /好孩子|乖|懂事|孝顺/, interpreted: '妈妈为你骄傲', suggestion: '你是妈妈最大的欣慰' },
      { match: /腊肠|家乡味|家里的味道/, interpreted: '妈妈想让你吃到家乡的味道', suggestion: '那是家的味道' },
      { match: /新房|装修|房子|新家/, interpreted: '爸妈很关心你的新家进展', suggestion: '有什么需要帮忙的尽管说' }
    ],
    default: { interpreted: '妈妈在关心你', suggestion: '感受到了妈妈的爱' }
  },
  fatigue: {
    patterns: [
      { match: /累|辛苦|累坏了吧|累不累/, interpreted: '妈妈知道你最近很辛苦', suggestion: '累了就歇一歇，家人是你坚实的后盾' }
    ],
    default: { interpreted: '妈妈心疼你最近的状态', suggestion: '照顾好自己' }
  },
  stress: {
    patterns: [
      { match: /忙|复习|考试|压力|烦|烦躁/, interpreted: '妈妈知道你有压力', suggestion: '扛不住的时候记得回家' }
    ],
    default: { interpreted: '妈妈感觉到你最近有压力', suggestion: '放轻松，家人永远支持你' }
  },
  neutral: {
    patterns: [],
    default: { interpreted: '妈妈在日常问候你', suggestion: '随意回复就好' }
  }
};

// ========== 孩子→父母翻译规则（大幅扩展） ==========
const CHILD_TO_PARENT_RULES = {
  fatigue: {
    patterns: [
      { match: /累|好累|太累了|累死了|累坏了/, interpreted: '孩子最近很辛苦，身体有点吃不消', suggestion: '给孩子发个红包鼓励一下吧' },
      { match: /困|好困|困死了|想睡觉|想睡/, interpreted: '孩子可能没睡好，休息不够', suggestion: '叮嘱孩子早点休息' },
      { match: /很晚下课|熬夜|通宵|复习到很晚/, interpreted: '孩子学习很忙，经常很晚才休息', suggestion: '语音安慰一下孩子吧' },
      { match: /腰酸背痛|肩膀酸|眼睛酸|脖子疼/, interpreted: '孩子身体有些吃不消了', suggestion: '关心一下孩子的身体' },
      { match: /没精神|没力气|虚|疲惫/, interpreted: '孩子看起来很疲惫', suggestion: '给孩子发个红包鼓励一下吧' }
    ],
    default: { interpreted: '孩子最近比较疲惫', suggestion: '多关心孩子的身体' }
  },
  stress: {
    patterns: [
      { match: /烦|好烦|太烦了|烦死了/, interpreted: '孩子最近学业压力很大，有些烦躁', suggestion: '给孩子发个拥抱的表情吧' },
      { match: /压力大|焦虑|好焦虑|焦虑不安/, interpreted: '孩子压力很大，需要理解和支持', suggestion: '多倾听，少说教' },
      { match: /崩溃|撑不住|扛不住|快崩溃/, interpreted: '孩子可能遇到了比较大的困难', suggestion: '主动给孩子打个电话吧' },
      { match: /烦躁|烦躁不安|不安|紧张/, interpreted: '孩子心里有些烦躁', suggestion: '给孩子一些安慰和理解' },
      { match: /好难|太难了|难熬|过不去/, interpreted: '孩子觉得现在很艰难', suggestion: '多给孩子一些鼓励' },
      { match: /委屈|憋屈|无奈|无助/, interpreted: '孩子心里有些委屈', suggestion: '耐心倾听，不要急着给建议' }
    ],
    default: { interpreted: '孩子心里可能有些烦', suggestion: '多倾听，少说教' }
  },
  care: {
    patterns: [
      { match: /你们注意|保重|身体|多锻炼/, interpreted: '孩子心里惦记着你们', suggestion: '告诉孩子我们都很好，让他安心' },
      { match: /想家|想你们|想回家了|思念/, interpreted: '孩子很想念家人', suggestion: '给孩子打个视频电话吧' },
      { match: /担心你们|怕你们|不放心你们/, interpreted: '孩子很担心你们的身体', suggestion: '让孩子放心，你们会照顾好自己' },
      { match: /谢谢|感谢|感恩/, interpreted: '孩子在感谢你们的付出', suggestion: '你们是孩子最大的支柱' },
      { match: /爱你们|爱爸妈|爱你们俩/, interpreted: '孩子深爱着你们', suggestion: '告诉孩子你们也爱他' },
      { match: /辛苦了爸妈|爸妈辛苦了|谢谢爸妈/, interpreted: '孩子体谅你们的辛苦', suggestion: '你们辛苦了，孩子懂事了' },
      { match: /身体健康|平平安安|健健康康/, interpreted: '孩子祝你们身体健康', suggestion: '孩子最在乎的是你们的健康' }
    ],
    default: { interpreted: '孩子在关心你们', suggestion: '给孩子一些正向回应' }
  },
  seeking: {
    patterns: [
      { match: /怎么办|怎么办啊/, interpreted: '孩子可能需要一些鼓励和帮助', suggestion: '多给孩子一些肯定和支持' },
      { match: /不开心|难过|不爽/, interpreted: '孩子心情不太好', suggestion: '给孩子发个红包，或者打个电话' },
      { match: /想哭|想发脾气|心情不好/, interpreted: '孩子需要情感支持', suggestion: '给孩子一些安慰和陪伴' },
      { match: /沮丧|失落|消极|悲观/, interpreted: '孩子可能有些消极', suggestion: '多给孩子一些正能量' },
      { match: /睡不着|失眠|睡不好/, interpreted: '孩子可能有心事', suggestion: '关心一下孩子是不是有什么困扰' }
    ],
    default: { interpreted: '孩子可能需要一些安慰', suggestion: '多关心孩子的情绪' }
  },
  worry: {
    patterns: [
      { match: /担心|怕|不放 心/, interpreted: '孩子在担心某件事', suggestion: '问问孩子怎么了，倾听比建议更重要' },
      { match: /害怕|恐慌|紧张/, interpreted: '孩子心里有些害怕', suggestion: '给孩子安全感，告诉他你们永远支持他' }
    ],
    default: { interpreted: '孩子可能在担心什么', suggestion: '主动关心孩子' }
  },
  neutral: {
    patterns: [
      { match: /好的|知道了|嗯|行|好嘞/, interpreted: '孩子收到了你的关心', suggestion: '这就是最好的回应' },
      { match: /在忙|复习|写作业|做实验/, interpreted: '孩子暂时忙，过会儿回复', suggestion: '不要着急，孩子心里有你' },
      { match: /吃了|吃了饭|吃得很好/, interpreted: '孩子告诉你他吃了', suggestion: '孩子有在照顾自己' }
    ],
    default: { interpreted: '孩子收到了你的关心', suggestion: '' }
  }
};

// ========== 翻译生成 ==========
function translateForChild(text, emotionType) {
  const rules = PARENT_TO_CHILD_RULES[emotionType] || PARENT_TO_CHILD_RULES.neutral;
  for (const rule of rules.patterns) {
    if (rule.match.test(text)) {
      return { interpreted: rule.interpreted, suggestion: rule.suggestion };
    }
  }
  return rules.default;
}

function translateForParent(text, emotionType) {
  const rules = CHILD_TO_PARENT_RULES[emotionType] || CHILD_TO_PARENT_RULES.neutral;
  for (const rule of rules.patterns) {
    if (rule.match.test(text)) {
      return { interpreted: rule.interpreted, suggestion: rule.suggestion };
    }
  }
  return rules.default;
}

// ========== 主函数：同步分析情感（规则引擎） ==========
function analyzeEmotionSync(text, direction) {
  const { emotionType, confidence } = classifyEmotion(text);

  let translation;
  if (direction === 'child') {
    translation = translateForChild(text, emotionType);
  } else {
    translation = translateForParent(text, emotionType);
  }

  return {
    emotionType,
    emotionTag: EMOTION_TAG_MAP[emotionType] || '日常',
    confidence: confidence,
    interpreted: translation.interpreted,
    suggestion: translation.suggestion,
    warmthPotential: false,
    mlResult: null
  };
}

// ========== 异步版本：ML模型 + 规则引擎混合 ==========
async function analyzeEmotion(text, direction) {
  let mlResult = null;
  let warmthPotential = false;

  // 调用 ML 模型获取情感分析结果
  try {
    if (typeof analyzeSentiment === 'function') {
      mlResult = await analyzeSentiment(text);
      
      // 温情检测：positive score > 0.7
      if (mlResult && mlResult.positiveScore > 0.7) {
        warmthPotential = true;
      }
    }
  } catch (e) {
    console.warn('ML情感分析失败，使用规则引擎:', e);
  }

  // 使用规则引擎进行6分类
  const { emotionType, confidence } = classifyEmotion(text, mlResult);

  let translation;
  if (direction === 'child') {
    translation = translateForChild(text, emotionType);
  } else {
    translation = translateForParent(text, emotionType);
  }

  return {
    emotionType,
    emotionTag: EMOTION_TAG_MAP[emotionType] || '日常',
    confidence: confidence,
    interpreted: translation.interpreted,
    suggestion: translation.suggestion,
    warmthPotential: warmthPotential,
    mlResult: mlResult
  };
}

// ========== 便捷调用：分析并返回完整结果 ==========
function analyze(text, direction) {
  return analyzeEmotionSync(text, direction);
}

// ========== 异步便捷调用 ==========
async function analyzeAsync(text, direction) {
  return analyzeEmotion(text, direction);
}