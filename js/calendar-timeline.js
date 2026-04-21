// ========== 温情检测缓存 ==========
const warmthHintCache = new Map();

// ========== 检测消息是否为温情消息 ==========
async function checkWarmthHint(msg) {
  if (!msg.content || msg.type !== 'text') return false;
  
  // 检查缓存
  if (warmthHintCache.has(msg.id)) {
    return warmthHintCache.get(msg.id);
  }
  
  try {
    const result = await analyzeEmotion(msg.content, msg.sender === 'child' ? 'parent' : 'child');
    const isWarmth = result.warmthPotential === true;
    warmthHintCache.set(msg.id, isWarmth);
    return isWarmth;
  } catch (e) {
    // 如果 ML 失败，使用关键词检测
    const warmthKeywords = ['想', '爱你', '爱你们', '想念', '想你了', '感恩', '谢谢', '开心', '幸福', '牵挂', '舍不得'];
    const isWarmth = warmthKeywords.some(kw => msg.content.includes(kw));
    warmthHintCache.set(msg.id, isWarmth);
    return isWarmth;
  }
}

// ========== 异步获取温情提示状态 ==========
async function getWarmthHintAsync(msgId) {
  return warmthHintCache.get(msgId) || false;
}

// ========== 渲染时间线面板 ==========
CalendarApp.render.timeline.show = function(dateStr) {
  const messages = CalendarApp.utils.getMessagesByDate(dateStr);
  if (!messages || messages.length === 0) {
    return '<div class="cal-empty">暂无消息记录</div>';
  }
  
  const chatCount = messages.filter(m => m.type === 'text' || m.type === 'ai').length;
  const photoCount = messages.filter(m => m.type === 'photo').length;
  const warmthCount = CalendarApp.data.warmthMoments.filter(w => w.date === dateStr).length;
  
  let summaryHtml = `📋 今天你们聊了 ${chatCount} 句话`;
  if (photoCount > 0) summaryHtml += `，分享了 ${photoCount} 张照片`;
  if (warmthCount > 0) summaryHtml += `，${warmthCount} 个温情时刻 ❤️`;
  
  return `
    <div class="cal-timeline active">
      <div class="cal-timeline-header">
        <div class="cal-timeline-date">${dateStr}</div>
        <button class="cal-timeline-close" onclick="CalendarApp.render.timeline.hide()">×</button>
      </div>
      <div class="cal-timeline-summary">${summaryHtml}</div>
      <div class="cal-timeline-messages">
        ${messages.map(msg => CalendarApp.render.timeline.messageCard(msg)).join('')}
      </div>
    </div>
  `;
};

// ========== 渲染消息卡片 ==========
CalendarApp.render.timeline.messageCard = function(msg) {
  const isMe = msg.sender === 'child';
  const avatar = isMe ? '👨‍💻' : '👵';
  
  let contentHtml = '';
  
  switch (msg.type) {
    case 'text':
      contentHtml = `<div class="cal-msg-bubble">${msg.content}</div>`;
      break;
    case 'ai':
      contentHtml = `
        <div class="cal-msg-bubble cal-msg-bubble--ai">
          <div class="cal-ai-label">✨ AI 情感翻译</div>
          <div class="cal-ai-original">原文：${msg.aiTranslation.original}</div>
          <div class="cal-ai-polished">${msg.aiTranslation.polished}</div>
        </div>
      `;
      break;
    case 'voice':
      contentHtml = `
        <div class="cal-msg-bubble cal-msg-bubble--voice">
          <div class="cal-voice-icon">🎵</div>
          <div class="cal-voice-waveform">●●●●●○○○</div>
          <div class="cal-voice-duration">${msg.voiceDuration || 8}秒</div>
          <button class="cal-voice-play">▶</button>
        </div>
      `;
      break;
    case 'photo':
      contentHtml = `
        <div class="cal-msg-bubble cal-msg-bubble--photo">
          <div class="cal-photo-placeholder">${msg.photoUrl ? '' : '🍜'}</div>
          <div class="cal-photo-caption">${msg.content}</div>
        </div>
      `;
      break;
    default:
      contentHtml = `<div class="cal-msg-bubble">${msg.content}</div>`;
  }
  
  return `
    <div class="cal-msg cal-msg--${isMe ? 'me' : 'them'}" data-msg-id="${msg.id}">
      <div class="cal-msg-header">
        <span class="cal-msg-avatar">${avatar}</span>
        <span class="cal-msg-sender">${msg.senderName}</span>
        <span class="cal-msg-time">${msg.time}</span>
      </div>
      ${contentHtml}
      <div class="cal-msg-actions">
        ${!msg.warmthMarked ? `<button class="cal-warmth-btn" onclick="CalendarApp.render.timeline.markWarmth('${msg.id}')">❤️ 标记温情</button>` : ''}
        ${msg.warmthTag ? `<span class="cal-warmth-tag" style="background: ${CalendarApp.utils.getTagColor(msg.warmthTag)}20; color: ${CalendarApp.utils.getTagColor(msg.warmthTag)};">#${msg.warmthTag}</span>` : ''}
      </div>
    </div>
  `;
};

// ========== 更新温情提示状态 ==========
CalendarApp.render.timeline.updateWarmthHints = async function() {
  const hints = document.querySelectorAll('.cal-warmth-hint');
  for (const hint of hints) {
    const msgId = hint.dataset.msgId;
    const isWarmth = await checkWarmthHint({ id: msgId, content: hint.closest('.cal-msg').querySelector('.cal-msg-bubble')?.textContent, type: 'text', sender: hint.closest('.cal-msg').classList.contains('cal-msg--me') ? 'child' : 'parent' });
    
    if (isWarmth) {
      hint.classList.add('active');
      hint.title = '✨ AI检测到温情时刻，点击标记';
      hint.onclick = function() { CalendarApp.render.timeline.markWarmth(msgId); };
    } else {
      hint.classList.add('hidden');
    }
  }
};

// ========== 关闭时间线 ==========
CalendarApp.render.timeline.hide = function() {
  const timeline = document.getElementById('calTimeline');
  if (timeline) {
    timeline.classList.remove('active');
  }
};

// ========== 标记温情 ==========
CalendarApp.render.timeline.markWarmth = async function(msgId) {
  const tags = ['思念', '叮嘱', '开心', '牵挂', '感恩', '陪伴'];
  
  // 尝试自动推荐标签
  let autoTag = null;
  try {
    const msgContent = document.querySelector(`.cal-msg[data-msg-id="${msgId}"] .cal-msg-bubble`)?.textContent || '';
    const result = await analyzeEmotion(msgContent, 'child');
    
    // 基于情感类型推荐标签
    if (result.emotionType === 'care') {
      if (msgContent.includes('想') || msgContent.includes('想念')) autoTag = '思念';
      else if (msgContent.includes('注意') || msgContent.includes('小心')) autoTag = '叮嘱';
      else if (msgContent.includes('开心') || msgContent.includes('哈哈')) autoTag = '开心';
      else if (msgContent.includes('谢谢') || msgContent.includes('感恩')) autoTag = '感恩';
      else if (msgContent.includes('一起') || msgContent.includes('陪伴')) autoTag = '陪伴';
      else autoTag = '牵挂';
    } else if (result.emotionType === 'fatigue') {
      autoTag = '叮嘱';
    }
  } catch (e) {
    // 使用默认推荐
    autoTag = '牵挂';
  }
  
  const tag = prompt('选择温情标签: ' + tags.join(', ') + '\n\n推荐: ' + autoTag, autoTag);
  if (tag && tags.includes(tag)) {
    // 找到消息并标记
    Object.keys(CalendarApp.data.chatRecords).forEach(dateStr => {
      const messages = CalendarApp.data.chatRecords[dateStr];
      const msg = messages.find(m => m.id === msgId);
      if (msg) {
        msg.warmthMarked = true;
        msg.warmthTag = tag;
        
        // 添加到温情时刻列表
        CalendarApp.data.warmthMoments.push({
          id: 'warmth_' + Date.now(),
          msgId: msgId,
          date: dateStr,
          tag: tag,
          summary: msg.content.substring(0, 20),
          sender: msg.sender,
          senderName: msg.senderName,
          originalText: msg.content
        });
      }
    });
    
    alert('已标记为 #' + tag + ' ❤️');
    
    // 显示爱心动画
    CalendarApp.render.timeline.heartAnimation();
    
    // 刷新视图以更新温情标记
    CalendarApp.render.view();
  }
};

// ========== 爱心动画 ==========
CalendarApp.render.timeline.heartAnimation = function() {
  const hearts = ['❤️', '💕', '💗', '💖'];
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      const heart = document.createElement('span');
      heart.className = 'cal-heart';
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.left = (Math.random() * 60 + 20) + '%';
      heart.style.top = '50%';
      document.getElementById('cal-container').appendChild(heart);
      setTimeout(() => heart.remove(), 800);
    }, i * 100);
  }
};

// ========== 时间线模块就绪 ==========
console.log('📋 互动时间线模块已加载');