// ========== 互动时间线模块 ==========
if (!window.CalendarApp.render) window.CalendarApp.render = {};
CalendarApp.render.timeline = {};

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
    <div class="cal-msg cal-msg--${isMe ? 'me' : 'them'}">
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

// ========== 关闭时间线 ==========
CalendarApp.render.timeline.hide = function() {
  const timeline = document.getElementById('calTimeline');
  if (timeline) {
    timeline.classList.remove('active');
  }
};

// ========== 标记温情 ==========
CalendarApp.render.timeline.markWarmth = function(msgId) {
  const tags = ['思念', '叮嘱', '开心', '牵挂', '感恩', '陪伴'];
  const tag = prompt('选择温情标签: ' + tags.join(', '));
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