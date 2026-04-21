const MOCK_CHAT_HISTORY = [
  {
    id: 'msg-001',
    type: 'chat',
    from: 'them',
    sender: '老妈',
    content: '儿子，今天是你爸六十大寿，记得忙完了打个电话回来。',
    timestamp: '09:15',
    emotionalContext: {
      emotionType: 'care',
      emotionTag: '关心',
      forChild: {
        interpreted: '妈妈提醒你别忘了关心爸爸',
        suggestion: '给爸爸打个电话吧'
      },
      forParent: {
        interpreted: '孩子收到了关于爸爸寿辰的通知',
        suggestion: ''
      }
    }
  },
  {
    id: 'msg-002',
    type: 'chat',
    from: 'me',
    sender: '小明',
    content: '知道了妈，我下班后第一时间打给爸！正好也跟你们说说房子装修的进展。',
    timestamp: '09:32',
    emotionalContext: {
      emotionType: 'care',
      emotionTag: '关心',
      forChild: {
        interpreted: '孩子在回应妈妈的关心',
        suggestion: ''
      },
      forParent: {
        interpreted: '孩子惦记着爸爸的寿辰，心里有家人',
        suggestion: '孩子很懂事，记得关心爸爸'
      }
    }
  },
  {
    id: 'msg-003',
    type: 'chat',
    from: 'them',
    sender: '老妈',
    content: '好好好！你爸念叨好几天了。对了，最近工作忙不忙？别太累了，注意身体。',
    timestamp: '09:35',
    emotionalContext: {
      emotionType: 'worry',
      emotionTag: '担心',
      forChild: {
        interpreted: '妈妈想知道你最近累不累，担心你工作太辛苦',
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
    sender: '小明',
    content: '最近项目赶进度，经常加班到十点。不过快了，月底应该就能喘口气了...',
    timestamp: '09:40',
    emotionalContext: {
      emotionType: 'fatigue',
      emotionTag: '疲惫',
      forChild: {
        interpreted: '孩子近期工作很忙，经常加班',
        suggestion: ''
      },
      forParent: {
        interpreted: '孩子最近比较辛苦，经常加班到很晚',
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
    content: '儿子，见字如面。上次视频看到你瘦了，妈心疼。你说最近工作忙，我们虽然帮不上什么忙，但有几点想唠叨几句：\n\n一则身体是本钱，熬夜伤身，能早睡就早睡；\n二则压力大时别憋着，给家里打电话，哪怕就是唠唠家常；\n三则不管多忙，记得按时吃饭，妈知道你有胃病。\n\n家里一切都好，你爸腿也不疼了，你寄的按摩仪很管用。\n\n盼你照顾好自己，常回家看看。\n\n爱你的妈妈',
    timestamp: '10:00'
  },
  {
    id: 'msg-006',
    type: 'letter',
    from: 'me',
    sender: '小明',
    letterType: '家书',
    content: '爸、妈：\n\n见字如面。来深圳已经五年了，今年终于攒够钱付了首付，正在装修。拿到钥匙那天，握着那小小的铜钥匙，忽然想起小时候你们给我做的那把木剑剑，爸说"男子汉要顶天立地"。\n\n养儿方知父母恩，这句话直到自己也成了家才真正明白。\n\n春节我一定带媳妇回去，咱们一大家子好好过个年，给爸补过这个六十大寿！\n\n儿 小明',
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
    sender: '小明',
    content: '妈，今天需求又改了，烦死了！感觉自己快撑不住了...',
    timestamp: '14:30',
    emotionalContext: {
      emotionType: 'stress',
      emotionTag: '压力',
      forChild: {
        interpreted: '孩子在诉说工作压力',
        suggestion: ''
      },
      forParent: {
        interpreted: '孩子最近工作压力很大，有些扛不住',
        suggestion: '语音安慰一下孩子吧，多倾听少说教'
      }
    }
  },
  {
    id: 'msg-009',
    type: 'chat',
    from: 'me',
    sender: '小明',
    content: '妈，项目终于上线了！虽然过程曲折，但结果还不错，有点小激动~',
    timestamp: '18:45',
    emotionalContext: {
      emotionType: 'care',
      emotionTag: '开心',
      forChild: {
        interpreted: '孩子项目上线了，很开心',
        suggestion: ''
      },
      forParent: {
        interpreted: '孩子有成就感和喜悦，需要被认可',
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
    content: '儿子，听说你项目上线了，妈打心眼里高兴！\n\n你从小就这样，遇到难事儿咬牙扛，扛过去了就笑呵呵。从学走路摔跤不哭，到后来高考考研，妈都看在眼里。\n\n但妈也想说一句：你不必总是坚强。累了就歇歇，烦了就说说，家人永远是你最坚强的后盾。\n\n对了，你爸让我告诉你：他托老战友弄了点你小时候最爱吃的腊肠，等你春节回来咱们一起吃。\n\n盼归。\n\n妈妈',
    timestamp: '20:00'
  }
];
