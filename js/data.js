const MOCK_CHAT_HISTORY = [
  {
    id: 'msg-001',
    type: 'chat',
    from: 'them',
    sender: '老妈',
    content: '儿子，这周末是你爸生日，记得打个电话回来。',
    timestamp: '09:15',
    emotionalContext: {
      emotionType: 'care',
      emotionTag: '关心',
      forChild: {
        interpreted: '妈妈提醒你别忘了关心爸爸',
        suggestion: '给爸爸打个电话吧'
      },
      forParent: {
        interpreted: '孩子收到了关于爸爸生日的通知',
        suggestion: ''
      }
    }
  },
  {
    id: 'msg-002',
    type: 'chat',
    from: 'me',
    sender: '小天',
    content: '知道了妈，我周末一有空就打给爸！正好也跟你们说说这学期期末复习的情况。',
    timestamp: '09:32',
    emotionalContext: {
      emotionType: 'care',
      emotionTag: '关心',
      forChild: {
        interpreted: '孩子在回应妈妈的关心',
        suggestion: ''
      },
      forParent: {
        interpreted: '孩子惦记着爸爸的生日，心里有家人',
        suggestion: '孩子很懂事，记得关心爸爸'
      }
    }
  },
  {
    id: 'msg-003',
    type: 'chat',
    from: 'them',
    sender: '老妈',
    content: '好好好！你爸念叨好几天了。对了，最近课多不多？别熬太晚，注意身体。',
    timestamp: '09:35',
    emotionalContext: {
      emotionType: 'worry',
      emotionTag: '担心',
      forChild: {
        interpreted: '妈妈想知道你最近学习累不累，担心你熬夜伤身',
        suggestion: '和妈妈说说近况吧'
      },
      forParent: {
        interpreted: '孩子收到了妈妈的关心',
        suggestion: ''
      }
    }
  },
  {
    id: 'msg-004',
    type: 'chat',
    from: 'me',
    sender: '小天',
    content: '最近期末复习赶进度，经常很晚才下课。不过快了，考完试就能喘口气了...',
    timestamp: '09:40',
    emotionalContext: {
      emotionType: 'fatigue',
      emotionTag: '疲惫',
      forChild: {
        interpreted: '孩子近期学习很忙，经常熬夜',
        suggestion: ''
      },
      forParent: {
        interpreted: '孩子最近比较辛苦，学习到很晚',
        suggestion: '心疼孩子，提醒他注意休息'
      }
    }
  },
  {
    id: 'msg-005',
    type: 'letter',
    from: 'them',
    sender: '老妈',
    letterType: '家书',
    content: '儿子，见字如面。上次视频看到你瘦了，妈心疼。你说最近复习忙，我们虽然帮不上什么忙，但有几点想唠叨几句：\n\n一则身体是本钱，熬夜伤身，能早睡就早睡；\n二则压力大时别憋着，给家里打电话，哪怕就是唠唠家常；\n三则不管多忙，记得按时吃饭，妈知道你有胃病。\n\n家里一切都好，你爸腿也不疼了，你买的泡脚包收到了，昨晚泡了睡得真好。\n\n盼你照顾好自己，常回家看看。\n\n爱你的妈妈',
    timestamp: '10:00'
  },
  {
    id: 'msg-006',
    type: 'letter',
    from: 'me',
    sender: '小天',
    letterType: '家书',
    content: '爸、妈：\n\n见字如面。来武汉两年了，今年大二，专业课越来越难，但也都跟上了。拿到期末复习计划那天，看着那一页页要背的知识点，忽然想起高考前你们陪我复习的日子，爸说"坚持就是胜利"。\n\n离开家才知道你们的好，这句话直到自己也独自在外才真正明白。\n\n五一我一定回武汉看你们，给你们带点热干面和鸭脖！\n\n儿 小天',
    timestamp: '10:15'
  },
  {
    id: 'msg-007',
    type: 'buffer',
    title: '检测到高压情绪',
    desc: '这条消息中检测到「烦」「累」等词汇，可能携带较强情绪。建议先"润色"后再发送，让爱意更温和地传达。',
    actions: ['润色后发送', '直接发送']
  },
  {
    id: 'msg-008',
    type: 'chat',
    from: 'me',
    sender: '小天',
    content: '妈，论文老师又打回来让改，烦死了！感觉自己快撑不住了...',
    timestamp: '14:30',
    emotionalContext: {
      emotionType: 'stress',
      emotionTag: '压力',
      forChild: {
        interpreted: '孩子在诉说学业压力',
        suggestion: ''
      },
      forParent: {
        interpreted: '孩子论文反复修改，压力很大',
        suggestion: '语音安慰一下孩子吧，多倾听少说教'
      }
    }
  },
  {
    id: 'msg-009',
    type: 'chat',
    from: 'me',
    sender: '小天',
    content: '妈，论文终于交稿了！虽然改了好几遍，但结果还不错，有点小激动~',
    timestamp: '18:45',
    emotionalContext: {
      emotionType: 'care',
      emotionTag: '开心',
      forChild: {
        interpreted: '孩子论文交稿了，很开心',
        suggestion: ''
      },
      forParent: {
        interpreted: '孩子努力有了结果，需要被肯定',
        suggestion: '夸夸孩子吧，他很努力'
      }
    }
  },
  {
    id: 'msg-010',
    type: 'letter',
    from: 'them',
    sender: '老妈',
    letterType: '家书',
    content: '儿子，听说你论文交稿了，妈打心眼里高兴！\n\n你从小就这样，遇到难事儿咬牙扛，扛过去了就笑呵呵。从学走路摔跤不哭，到后来高考，妈都看在眼里。\n\n但妈也想说一句：你不必总是坚强。累了就歇歇，烦了就说说，家人永远是你最坚强的后盾。\n\n对了，你爸让我告诉你：给你寄了点零食和水果，记得去取。\n\n盼归。\n\n妈妈',
    timestamp: '20:00'
  }
];
