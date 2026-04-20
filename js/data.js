const MOCK_CHAT_HISTORY = [
  {
    id: 'msg-001',
    type: 'chat',
    from: 'them',
    sender: '老妈',
    content: '儿子，昨天寄的包裹收到了吗？有几件新衣服，天冷了记得添上。',
    timestamp: '10:23'
  },
  {
    id: 'msg-002',
    type: 'chat',
    from: 'me',
    sender: '👨‍💻 孩子端',
    content: '收到了，妈，这件羽绒服很暖和！',
    timestamp: '10:25'
  },
  {
    id: 'msg-003',
    type: 'chat',
    from: 'them',
    sender: '老妈',
    content: '那就好。你工作忙不忙？最近天气转凉了，晚上早点睡，别熬夜。',
    timestamp: '10:30'
  },
  {
    id: 'msg-004',
    type: 'letter',
    from: 'me',
    sender: '👨‍💻 孩子端',
    content: '爸、妈：见字如面。来深圳已经五年了，今年终于存够了钱买了房子，把钥匙交给你们的那一刻，看到你们眼眶红了，我心里既高兴又酸涩。养儿方知父母恩，这句话直到自己也成了家才真正明白。春节我一定带媳妇孩子回老家，咱们一大家子好好过个年。',
    timestamp: '10:35'
  },
  {
    id: 'msg-005',
    type: 'chat',
    from: 'them',
    sender: '老妈',
    content: '好好好！我们等你们回来。妈给你们腌了腊肉，坛子肉，都是你小时候最爱吃的。',
    timestamp: '10:40'
  },
  {
    id: 'msg-006',
    type: 'chat',
    from: 'me',
    sender: '👨‍💻 孩子端',
    content: '太好了！想想就流口水～对了，上次视频看到爸腿不舒服，现在怎么样了？',
    timestamp: '10:42'
  },
  {
    id: 'msg-007',
    type: 'letter',
    from: 'them',
    sender: '老妈',
    content: '儿子，你爸这腿是老毛病了，入冬后有点酸痛，但不要紧。倒是你妈我这几天血压有点高，医生让少吃盐多走路。你爸让我别告诉你们，怕你们担心，但我觉得你们已经长大了，有些事可以说。家里一切都好，勿念。照顾好自己和媳妇孩子。',
    timestamp: '10:45'
  },
  {
    id: 'msg-008',
    type: 'buffer',
    title: '检测到高压情绪',
    desc: '这条消息中检测到「烦」「累」等词汇，可能携带较强情绪。建议先"润色"后再发送，让爱意更温和地传达。',
    actions: ['润色后发送', '直接发送']
  },
  {
    id: 'msg-009',
    type: 'chat',
    from: 'me',
    sender: '👨‍💻 孩子端',
    content: '妈，今天加班到很晚，好烦啊...',
    timestamp: '10:50'
  }
];
