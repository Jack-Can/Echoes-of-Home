// ========== 日历模块全局命名空间 ==========
window.CalendarApp = {
  data: {},
  state: {},
  render: {},
  utils: {}
};

// ========== 聊天记录数据 ==========
CalendarApp.data.chatRecords = {};

// 生成2026年1月~4月的聊天记录
function generateChatRecords() {
  const records = {};
  
  // 辅助函数：生成日期字符串
  function getDateStr(year, month, day) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  // 辅助函数：随机生成消息
  function createMessage(id, time, sender, type, content, extra = {}) {
    return {
      id,
      time,
      sender,
      senderName: sender === 'parent' ? '妈妈' : '小雨',
      type,
      content,
      warmthMarked: false,
      warmthTag: null,
      ...extra
    };
  }
  
  const parentMessages = [
    '起床了吗？今天降温了多穿点',
    '吃了吗？记得按时吃饭',
    '最近工作忙不忙？',
    '天冷了，记得穿厚点',
    '别熬夜，对身体不好',
    '今天吃的是什么呀？',
    '下班了吗？',
    '周末有空吗？想跟你视频',
    '家里一切都好，放心',
    '你爸今天还念叨你呢',
    '今天买了你爱吃的菜',
    '注意安全，过马路小心',
    '记得多喝水',
    '别太累了，注意身体',
    '我们很好，勿担心'
  ];
  
  const childMessages = [
    '起来了起来了，穿了厚外套放心吧',
    '吃了吃了，今天吃的面条',
    '刚下班，在地铁上',
    '知道了妈，您和爸也要注意身体',
    '今天加班，不过不严重',
    '妈做的红烧肉最好吃了',
    '周末可能加班',
    '今天发项目奖金了',
    '挺好的，妈别担心',
    '爸的腿最近怎么样了？',
    '周末有空视频',
    '工作顺利',
    '今天下雨了，记得带伞',
    '我买了下周回家的票',
    '想你们了'
  ];
  
  // 1月数据（春节前后，互动频繁）
  const januaryDays = [
    { day: 1, count: 4, hasAi: true },
    { day: 2, count: 2, hasAi: false },
    { day: 3, count: 3, hasAi: false },
    { day: 4, count: 0, hasAi: false },
    { day: 5, count: 6, hasAi: true },
    { day: 6, count: 2, hasAi: false },
    { day: 7, count: 5, hasAi: false },
    { day: 8, count: 0, hasAi: false },
    { day: 9, count: 3, hasAi: false },
    { day: 10, count: 8, hasAi: true },
    { day: 11, count: 2, hasAi: false },
    { day: 12, count: 0, hasAi: false },
    { day: 13, count: 4, hasAi: false },
    { day: 14, count: 6, hasAi: true },
    { day: 15, count: 10, hasAi: true, special: '妈妈生日' },
    { day: 16, count: 3, hasAi: false },
    { day: 17, count: 0, hasAi: false },
    { day: 18, count: 2, hasAi: false },
    { day: 19, count: 4, hasAi: false },
    { day: 20, count: 5, hasAi: false },
    { day: 21, count: 0, hasAi: false },
    { day: 22, count: 3, hasAi: false },
    { day: 23, count: 7, hasAi: true },
    { day: 24, count: 2, hasAi: false },
    { day: 25, count: 4, hasAi: false },
    { day: 26, count: 0, hasAi: false },
    { day: 27, count: 3, hasAi: false },
    { day: 28, count: 12, hasAi: true, special: '春节' },
    { day: 29, count: 15, hasAi: true, special: '春节' },
    { day: 30, count: 8, hasAi: false, special: '春节' },
    { day: 31, count: 5, hasAi: false }
  ];
  
  // 2月数据（假期结束，互动减少）
  const februaryDays = [
    { day: 1, count: 3, hasAi: false },
    { day: 2, count: 6, hasAi: true },
    { day: 3, count: 0, hasAi: false },
    { day: 4, count: 2, hasAi: false },
    { day: 5, count: 4, hasAi: false },
    { day: 6, count: 1, hasAi: false },
    { day: 7, count: 0, hasAi: false },
    { day: 8, count: 3, hasAi: false },
    { day: 9, count: 2, hasAi: false },
    { day: 10, count: 4, hasAi: false },
    { day: 11, count: 0, hasAi: false },
    { day: 12, count: 2, hasAi: false },
    { day: 13, count: 1, hasAi: false },
    { day: 14, count: 5, hasAi: true, special: '情人节' },
    { day: 15, count: 0, hasAi: false },
    { day: 16, count: 3, hasAi: false },
    { day: 17, count: 2, hasAi: false },
    { day: 18, count: 0, hasAi: false },
    { day: 19, count: 1, hasAi: false },
    { day: 20, count: 2, hasAi: false },
    { day: 21, count: 0, hasAi: false },
    { day: 22, count: 0, hasAi: false },
    { day: 23, count: 1, hasAi: false },
    { day: 24, count: 0, hasAi: false },
    { day: 25, count: 3, hasAi: false },
    { day: 26, count: 2, hasAi: false },
    { day: 27, count: 0, hasAi: false },
    { day: 28, count: 4, hasAi: false }
  ];
  
  // 3月数据（月初冷战，月中破冰）
  const marchDays = [
    { day: 1, count: 0, hasAi: false },
    { day: 2, count: 0, hasAi: false },
    { day: 3, count: 1, hasAi: false },
    { day: 4, count: 0, hasAi: false },
    { day: 5, count: 0, hasAi: false },
    { day: 6, count: 2, hasAi: false },
    { day: 7, count: 0, hasAi: false },
    { day: 8, count: 5, hasAi: true },
    { day: 9, count: 3, hasAi: false },
    { day: 10, count: 6, hasAi: true },
    { day: 11, count: 4, hasAi: false },
    { day: 12, count: 8, hasAi: true },
    { day: 13, count: 2, hasAi: false },
    { day: 14, count: 0, hasAi: false },
    { day: 15, count: 3, hasAi: false },
    { day: 16, count: 4, hasAi: false },
    { day: 17, count: 2, hasAi: false },
    { day: 18, count: 0, hasAi: false },
    { day: 19, count: 3, hasAi: false },
    { day: 20, count: 5, hasAi: true },
    { day: 21, count: 2, hasAi: false },
    { day: 22, count: 0, hasAi: false },
    { day: 23, count: 4, hasAi: false },
    { day: 24, count: 3, hasAi: false },
    { day: 25, count: 6, hasAi: true },
    { day: 26, count: 2, hasAi: false },
    { day: 27, count: 5, hasAi: false },
    { day: 28, count: 0, hasAi: false },
    { day: 29, count: 3, hasAi: false },
    { day: 30, count: 2, hasAi: false },
    { day: 31, count: 4, hasAi: false }
  ];
  
  // 4月数据（当前月，互动良好）
  const aprilDays = [
    { day: 1, count: 3, hasAi: false },
    { day: 2, count: 5, hasAi: true },
    { day: 3, count: 2, hasAi: false },
    { day: 4, count: 6, hasAi: false },
    { day: 5, count: 0, hasAi: false },
    { day: 6, count: 4, hasAi: false },
    { day: 7, count: 3, hasAi: false },
    { day: 8, count: 8, hasAi: true },
    { day: 9, count: 2, hasAi: false },
    { day: 10, count: 5, hasAi: false },
    { day: 11, count: 0, hasAi: false },
    { day: 12, count: 3, hasAi: false },
    { day: 13, count: 4, hasAi: false },
    { day: 14, count: 2, hasAi: false },
    { day: 15, count: 6, hasAi: true },
    { day: 16, count: 3, hasAi: false },
    { day: 17, count: 0, hasAi: false },
    { day: 18, count: 4, hasAi: false },
    { day: 19, count: 3, hasAi: true, special: '今天' }
  ];
  
  const allDays = [
    { month: 1, days: januaryDays },
    { month: 2, days: februaryDays },
    { month: 3, days: marchDays },
    { month: 4, days: aprilDays }
  ];
  
  // 生成每一天的消息
  allDays.forEach(function(monthData) {
    monthData.days.forEach(function(dayInfo) {
      if (dayInfo.count === 0) return;
      
      const dateStr = getDateStr(2026, monthData.month, dayInfo.day);
      const messages = [];
      let msgIndex = 1;
      
      // 轮流生成父母和子女的消息
      for (let i = 0; i < dayInfo.count; i++) {
        const isParent = i % 2 === 0;
        const sender = isParent ? 'parent' : 'child';
        const hour = 8 + Math.floor(Math.random() * 14);
        const minute = Math.floor(Math.random() * 60);
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        
        // 决定消息类型
        let type = 'text';
        if (dayInfo.hasAi && i === dayInfo.count - 1 && !isParent) {
          type = 'ai';
        }
        
        const baseMsg = isParent 
          ? parentMessages[Math.floor(Math.random() * parentMessages.length)]
          : childMessages[Math.floor(Math.random() * childMessages.length)];
        
        const extra = {};
        if (type === 'ai') {
          extra.aiTranslation = {
            original: baseMsg,
            polished: baseMsg.replace(/烦/g, '有些操心')
                         .replace(/累/g, '需要休息')
                         .replace(/讨厌/g, '有些不喜欢')
          };
        }
        
        messages.push(createMessage(
          `msg_${dateStr}_${msgIndex}`,
          time,
          sender,
          type,
          baseMsg,
          extra
        ));
        msgIndex++;
      }
      
      records[dateStr] = messages;
    });
  });
  
  return records;
}

// 初始化聊天记录
CalendarApp.data.chatRecords = generateChatRecords();

// ========== 温情标记数据 ==========
CalendarApp.data.warmthMoments = [
  {
    id: 'warmth_001',
    msgId: 'msg_2026-01-05_1',
    date: '2026-01-05',
    tag: '叮嘱',
    summary: '妈妈叮嘱降温多穿点',
    sender: 'parent',
    senderName: '妈妈',
    originalText: '起床了吗？今天降温了多穿点'
  },
  {
    id: 'warmth_002',
    msgId: 'msg_2026-01-10_3',
    date: '2026-01-10',
    tag: '思念',
    summary: '想爸妈了',
    sender: 'child',
    senderName: '小雨',
    originalText: '想你们了'
  },
  {
    id: 'warmth_003',
    msgId: 'msg_2026-01-15_5',
    date: '2026-01-15',
    tag: '开心',
    summary: '祝妈妈生日快乐',
    sender: 'child',
    senderName: '小雨',
    originalText: '妈，生日快乐！'
  },
  {
    id: 'warmth_004',
    msgId: 'msg_2026-01-28_6',
    date: '2026-01-28',
    tag: '牵挂',
    summary: '春节团聚的温暖',
    sender: 'parent',
    senderName: '妈妈',
    originalText: '一家人团聚真好'
  },
  {
    id: 'warmth_005',
    msgId: 'msg_2026-02-10_2',
    date: '2026-02-10',
    tag: '叮嘱',
    summary: '叮嘱注意安全',
    sender: 'parent',
    senderName: '妈妈',
    originalText: '注意安全，过马路小心'
  },
  {
    id: 'warmth_006',
    msgId: 'msg_2026-03-08_4',
    date: '2026-03-08',
    tag: '思念',
    summary: '破冰后的关心',
    sender: 'parent',
    senderName: '妈妈',
    originalText: '这么久没联系，妈很担心你'
  },
  {
    id: 'warmth_007',
    msgId: 'msg_2026-04-08_3',
    date: '2026-04-08',
    tag: '开心',
    summary: '分享加班餐',
    sender: 'child',
    senderName: '小雨',
    originalText: '今天项目上线了！'
  },
  {
    id: 'warmth_008',
    msgId: 'msg_2026-04-08_5',
    date: '2026-04-08',
    tag: '牵挂',
    summary: '爸妈的关心',
    sender: 'parent',
    senderName: '妈妈',
    originalText: '别太累了，注意身体'
  },
  {
    id: 'warmth_009',
    msgId: 'msg_2026-04-10_2',
    date: '2026-04-10',
    tag: '思念',
    summary: '想家了',
    sender: 'child',
    senderName: '小雨',
    originalText: '想吃妈妈做的红烧肉了'
  },
  {
    id: 'warmth_010',
    msgId: 'msg_2026-04-15_3',
    date: '2026-04-15',
    tag: '叮嘱',
    summary: '妈妈叮嘱周末休息',
    sender: 'parent',
    senderName: '妈妈',
    originalText: '周末好好休息，别熬夜'
  },
  {
    id: 'warmth_011',
    msgId: 'msg_2026-04-19_2',
    date: '2026-04-19',
    tag: '感恩',
    summary: '感谢爸妈的关心',
    sender: 'child',
    senderName: '小雨',
    originalText: '谢谢妈，我挺好的'
  }
];

// ========== 家庭纪念日数据 ==========
CalendarApp.data.anniversaries = [
  { date: '03-15', title: '妈妈生日', type: 'birthday', icon: '🎂' },
  { date: '06-20', title: '爸爸生日', type: 'birthday', icon: '🎂' },
  { date: '10-08', title: '小雨生日', type: 'birthday', icon: '🎂' },
  { date: '01-28', title: '春节', type: 'festival', icon: '🧨' },
  { date: '02-14', title: '情人节', type: 'festival', icon: '💕' },
  { date: '04-04', title: '清明节', type: 'festival', icon: '🏮' },
  { date: 'custom_001', title: '回家日', type: 'custom', icon: '🏠',
    fullDate: '2026-05-01', countFrom: '2026-01-01', countTo: '2026-05-01' }
];

// ========== 记忆钩子数据 ==========
CalendarApp.data.memoryHooks = {
  parent: {
    mom: {
      name: '妈妈',
      traits: ['怕冷', '爱做饭', '总担心子女吃不好', '喜欢跳广场舞'],
      concerns: ['想孩子但不好意思说', '怕孩子嫌弃自己唠叨']
    }
  },
  child: {
    name: '小雨',
    traits: ['在外地工作', '经常加班', '喜欢吃妈妈做的红烧肉'],
    concerns: ['担心父母身体', '觉得陪伴太少']
  }
};

// ========== AI建议模板数据 ==========
CalendarApp.data.aiSuggestions = {
  gifts: {
    birthday_mom: ['一条保暖围巾🧣', '一套养生茶具🍵', '一张全家福相框🖼️'],
    birthday_dad: ['一个护膝护具🦵', '一本他爱看的书📖', '一套精品茶叶🍃'],
    anniversary: ['一次家庭旅行✈️', '重温结婚照📸', '一顿烛光晚餐🕯️']
  },
  greetings: {
    warm: ['妈/爸，生日快乐！谢谢你们一直以来的付出，我爱你们 ❤️', '又长大一岁啦，希望新的一年身体健康，天天开心！'],
    humor: ['恭喜又年轻了一岁！今晚我请客（虽然不在身边，心意到了）🎉', '生日快乐！今天你最大，说什么都对 😄'],
    formal: ['祝您生日快乐，福寿安康。虽然远在他乡，但心中时刻牵挂。', '生辰之喜，遥祝安康。期待早日回家团聚。']
  },
  quickReplies: [
    '今天吃了吗？想你们了 😊',
    '刚看到一个好玩的，发给你们看看',
    '周末有空打个视频吧 📱'
  ]
};

// ========== 运行时状态 ==========
CalendarApp.state = {
  currentYear: 2026,
  currentMonth: 4,
  selectedDate: null,
  currentView: 'month',
  activeSubPage: null,
  weatherCache: {}
};

// ========== 工具函数 ==========
CalendarApp.utils = {
  // 获取指定月份的日历数据
  getMonthData: function(year, month) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    return {
      year,
      month,
      firstDay,
      lastDay,
      startWeekday,
      daysInMonth
    };
  },
  
  // 获取指定日期的消息
  getMessagesByDate: function(dateStr) {
    return CalendarApp.data.chatRecords[dateStr] || [];
  },
  
  // 获取指定月份的互动天数
  getInteractionDays: function(year, month) {
    let count = 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (CalendarApp.data.chatRecords[dateStr] && CalendarApp.data.chatRecords[dateStr].length > 0) {
        count++;
      }
    }
    return count;
  },
  
  // 计算天气状态
  getWeather: function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    
    let interactionDays = 0;
    for (let i = 1; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (CalendarApp.data.chatRecords[dateStr] && CalendarApp.data.chatRecords[dateStr].length > 0) {
        interactionDays++;
      }
    }
    
    if (interactionDays >= 2) return 'sunny';
    if (interactionDays === 1) return 'cloudy';
    return 'rainy';
  },
  
  // 计算情感温度
  getTemperature: function(year, month) {
    const days = CalendarApp.utils.getInteractionDays(year, month);
    const warmth = CalendarApp.data.warmthMoments.filter(w => w.date.startsWith(`${year}-${String(month).padStart(2, '0')}`)).length;
    
    let temp = days * 3 + warmth * 5 + 30;
    return Math.min(100, Math.max(0, temp));
  },
  
  // 获取温情标签颜色
  getTagColor: function(tag) {
    const colors = {
      '思念': '#7986CB',
      '叮嘱': '#FFB74D',
      '开心': '#81C784',
      '牵挂': '#FF6B9D',
      '感恩': '#4DB6AC',
      '陪伴': '#BA68C8'
    };
    return colors[tag] || '#FF6B9D';
  }
};

// ========== 数据就绪 ==========
console.log('📅 日历模块数据已加载:', Object.keys(CalendarApp.data.chatRecords).length, '天聊天记录');