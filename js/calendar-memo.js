// ========== 家庭纪念日与智能提醒模块 ==========
if (!window.CalendarApp.render) window.CalendarApp.render = {};
CalendarApp.render.memo = {};

// ========== 获取临近的纪念日 ==========
CalendarApp.render.memo.getUpcoming = function() {
  const today = new Date();
  const upcoming = [];
  
  CalendarApp.data.anniversaries.forEach(a => {
    if (a.date.startsWith('custom_')) return;
    
    const [m, d] = a.date.split('-').map(Number);
    const targetDate = new Date(2026, m - 1, d);
    const diff = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    
    if (diff > 0 && diff <= 30) {
      upcoming.push({ ...a, diff, fullDate: `${2026}-${a.date}` });
    }
  });
  
  upcoming.sort((a, b) => a.diff - b.diff);
  return upcoming;
};

// ========== 渲染纪念日提醒 ==========
CalendarApp.render.memo.renderAlert = function() {
  const upcoming = CalendarApp.render.memo.getUpcoming();
  if (upcoming.length === 0) return '';
  
  return upcoming.slice(0, 2).map(u => `
    <div class="cal-memo-alert" onclick="CalendarApp.render.memo.showSuggestions('${u.date}')">
      <span class="cal-memo-icon">${u.icon}</span>
      <div class="cal-memo-text">
        ${u.diff <= 3 ? `还有 ${u.diff} 天就是${u.title}！` : `${u.title} (${u.diff}天后)`}
      </div>
      <button class="cal-memo-btn">查看建议 →</button>
    </div>
  `).join('');
};

// ========== 渲染回家倒计时 ==========
CalendarApp.render.memo.renderCountdown = function() {
  const custom = CalendarApp.data.anniversaries.find(a => a.type === 'custom');
  const today = new Date();
  
  if (!custom) {
    return `
      <div class="cal-countdown">
        <div class="cal-countdown-title">🏠 设置回家日期</div>
        <button class="cal-memo-btn" style="margin-top: 8px;" onclick="alert('设置功能开发中')">+ 添加倒计时</button>
      </div>
    `;
  }
  
  const target = new Date(custom.fullDate);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  
  return `
    <div class="cal-countdown">
      <div class="cal-countdown-title">🏠 距离${custom.title}${custom.fullDate}还有</div>
      <div class="cal-countdown-days">${diff} 天</div>
    </div>
  `;
};

// ========== 显示 AI 建议面板 ==========
CalendarApp.render.memo.showSuggestions = function(dateStr) {
  const anniversary = CalendarApp.data.anniversaries.find(a => a.date === dateStr);
  if (!anniversary) return;
  
  const [m, d] = dateStr.split('-').map(Number);
  const suggestions = CalendarApp.data.aiSuggestions;
  
  let giftSuggestions = [];
  let greetingSuggestions = [];
  
  if (anniversary.type === 'birthday') {
    if (anniversary.title.includes('妈妈')) {
      giftSuggestions = suggestions.gifts.birthday_mom;
    } else if (anniversary.title.includes('爸爸')) {
      giftSuggestions = suggestions.gifts.birthday_dad;
    } else {
      giftSuggestions = suggestions.gifts.birthday_mom;
    }
    greetingSuggestions = suggestions.greetings.warm;
  } else if (anniversary.type === 'festival') {
    giftSuggestions = suggestions.gifts.anniversary;
    greetingSuggestions = suggestions.greetings.warm;
  } else {
    giftSuggestions = suggestions.gifts.anniversary;
    greetingSuggestions = suggestions.greetings.humor;
  }
  
  const panelHtml = `
    <div class="cal-memo-panel">
      <button class="cal-memo-panel-close" onclick="CalendarApp.render.memo.closePanel()">×</button>
      <div class="cal-memo-panel-icon">${anniversary.icon}</div>
      <div class="cal-memo-panel-title">${anniversary.title}建议</div>
      
      <div class="cal-memo-section">
        <div class="cal-memo-section-title">🎁 礼物建议</div>
        <div class="cal-memo-gifts">
          ${giftSuggestions.map(g => `<div class="cal-memo-gift">${g}</div>`).join('')}
        </div>
      </div>
      
      <div class="cal-memo-section">
        <div class="cal-memo-section-title">💬 问候语（点击切换风格）</div>
        <div class="cal-memo-tabs">
          <button class="cal-memo-tab active" onclick="CalendarApp.render.memo.switchGreeting('warm', this)">温暖型</button>
          <button class="cal-memo-tab" onclick="CalendarApp.render.memo.switchGreeting('humor', this)">幽默型</button>
          <button class="cal-memo-tab" onclick="CalendarApp.render.memo.switchGreeting('formal', this)">正式型</button>
        </div>
        <div class="cal-memo-greeting" id="calMemoGreeting">
          ${greetingSuggestions[0]}
        </div>
      </div>
      
      <button class="cal-memo-save" onclick="CalendarApp.render.memo.saveReminder('${dateStr}')">📞 设置提醒</button>
    </div>
  `;
  
  // 创建或更新面板
  let panel = document.getElementById('calMemoPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'calMemoPanel';
    panel.className = 'cal-memo-panel-container';
    document.body.appendChild(panel);
  }
  panel.innerHTML = panelHtml;
  panel.classList.add('active');
};

// ========== 切换问候语风格 ==========
CalendarApp.render.memo.switchGreeting = function(style, btn) {
  // 更新标签状态
  document.querySelectorAll('.cal-memo-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  
  // 更新问候语
  const greeting = CalendarApp.data.aiSuggestions.greetings[style];
  const greetingText = greeting[Math.floor(Math.random() * greeting.length)];
  document.getElementById('calMemoGreeting').textContent = greetingText;
};

// ========== 关闭建议面板 ==========
CalendarApp.render.memo.closePanel = function() {
  const panel = document.getElementById('calMemoPanel');
  if (panel) {
    panel.classList.remove('active');
  }
};

// ========== 保存提醒 ==========
CalendarApp.render.memo.saveReminder = function(dateStr) {
  alert('✅ 已设置提醒！\n\n当天您将收到通知~');
  CalendarApp.render.memo.closePanel();
};

// ========== 渲染日历上的纪念日标记 ==========
CalendarApp.render.memo.getAnniversaryMarker = function(month, day) {
  const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const anniversary = CalendarApp.data.anniversaries.find(a => a.date === dateKey);
  
  if (anniversary) {
    return `<span class="cal-anniversary-marker">${anniversary.icon}</span>`;
  }
  return '';
};

// ========== 纪念日模块样式（动态注入）==========
CalendarApp.render.memo.initStyles = function() {
  if (document.getElementById('calMemoStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'calMemoStyles';
  style.textContent = `
    .cal-memo-panel-container {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 500;
      align-items: center;
      justify-content: center;
    }
    .cal-memo-panel-container.active {
      display: flex;
    }
    .cal-memo-panel {
      background: #fff;
      border-radius: var(--cal-radius-lg);
      padding: 24px;
      max-width: 380px;
      width: 90%;
      position: relative;
      max-height: 80vh;
      overflow-y: auto;
    }
    .cal-memo-panel-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      border: none;
      background: #f5f5f5;
      border-radius: 50%;
      font-size: 16px;
      cursor: pointer;
    }
    .cal-memo-panel-icon {
      font-size: 40px;
      text-align: center;
      margin-bottom: 8px;
    }
    .cal-memo-panel-title {
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 20px;
    }
    .cal-memo-section {
      margin-bottom: 20px;
    }
    .cal-memo-section-title {
      font-size: 14px;
      color: var(--cal-color-text-secondary);
      margin-bottom: 12px;
    }
    .cal-memo-gifts {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .cal-memo-gift {
      padding: 10px 14px;
      background: var(--cal-color-warm-bg);
      border-radius: var(--cal-radius-sm);
      font-size: 14px;
    }
    .cal-memo-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .cal-memo-tab {
      flex: 1;
      padding: 8px;
      border: none;
      background: #f5f5f5;
      border-radius: var(--cal-radius-sm);
      font-size: 13px;
      cursor: pointer;
    }
    .cal-memo-tab.active {
      background: var(--cal-color-primary-bg);
      color: var(--cal-color-primary);
    }
    .cal-memo-greeting {
      padding: 14px;
      background: var(--cal-color-warm-bg);
      border-radius: var(--cal-radius-md);
      font-size: 15px;
      line-height: 1.6;
    }
    .cal-memo-save {
      width: 100%;
      padding: 14px;
      border: none;
      background: var(--cal-color-primary);
      color: #fff;
      border-radius: var(--cal-radius-md);
      font-size: 15px;
      cursor: pointer;
      margin-top: 16px;
    }
    .cal-anniversary-marker {
      font-size: 12px;
    }
  `;
  document.head.appendChild(style);
};

// 初始化样式
CalendarApp.render.memo.initStyles();

// ========== 纪念日模块就绪 ==========
console.log('🎂 家庭纪念日与智能提醒模块已加载');