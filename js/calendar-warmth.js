// ========== 温情标记与收藏册模块 ==========
if (!window.CalendarApp.render) window.CalendarApp.render = {};
CalendarApp.render.warmth = {};

// ========== 初始化收藏册 ==========
CalendarApp.render.warmth.init = function() {
  CalendarApp.render.warmth.filter = 'all';
  CalendarApp.render.warmth.timeFilter = 'all';
  CalendarApp.render.warmth.senderFilter = 'all';
};

// ========== 渲染收藏册（替换整个日历视图）==========
CalendarApp.render.warmth.render = function() {
  const container = document.getElementById('cal-container');
  if (!container) return;
  
  const html = `
    <div class="cal-warmth-header">
      <button class="cal-back-btn" onclick="CalendarApp.render.view()">← 返回</button>
      <div class="cal-warmth-title">📖 温情收藏册</div>
    </div>
    ${CalendarApp.render.warmth.getHtml()}
  `;
  
  container.innerHTML = html;
};

// ========== 获取收藏册 HTML ==========
CalendarApp.render.warmth.getHtml = function() {
  let moments = [...CalendarApp.data.warmthMoments];
  
  if (CalendarApp.render.warmth.filter !== 'all') {
    moments = moments.filter(m => m.tag === CalendarApp.render.warmth.filter);
  }
  
  if (CalendarApp.render.warmth.timeFilter !== 'all') {
    const now = new Date();
    const cutoff = new Date();
    if (CalendarApp.render.warmth.timeFilter === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else if (CalendarApp.render.warmth.timeFilter === 'month') {
      cutoff.setDate(now.getDate() - 30);
    }
    moments = moments.filter(m => new Date(m.date) >= cutoff);
  }
  
  if (CalendarApp.render.warmth.senderFilter !== 'all') {
    moments = moments.filter(m => m.sender === CalendarApp.render.warmth.senderFilter);
  }
  
  moments.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (moments.length === 0) {
    return `
      <div class="cal-empty-state">
        <div class="cal-empty-icon">💝</div>
        <div class="cal-empty-text">还没有温情时刻</div>
        <div class="cal-empty-hint">点击消息的「标记温情」记录温馨时刻</div>
      </div>
    `;
  }
  
  return `
    <div class="cal-filter-bar">
      <button class="cal-filter-tag ${CalendarApp.render.warmth.filter === 'all' ? 'active' : ''}" onclick="CalendarApp.render.warmth.setFilter('all')">全部</button>
      <button class="cal-filter-tag ${CalendarApp.render.warmth.filter === '思念' ? 'active' : ''}" onclick="CalendarApp.render.warmth.setFilter('思念')">#思念</button>
      <button class="cal-filter-tag ${CalendarApp.render.warmth.filter === '叮嘱' ? 'active' : ''}" onclick="CalendarApp.render.warmth.setFilter('叮嘱')">#叮嘱</button>
      <button class="cal-filter-tag ${CalendarApp.render.warmth.filter === '开心' ? 'active' : ''}" onclick="CalendarApp.render.warmth.setFilter('开心')">#开心</button>
      <button class="cal-filter-tag ${CalendarApp.render.warmth.filter === '牵挂' ? 'active' : ''}" onclick="CalendarApp.render.warmth.setFilter('牵挂')">#牵挂</button>
    </div>
    <div class="cal-waterfall">
      ${moments.map(m => CalendarApp.render.warmth.card(m)).join('')}
    </div>
  `;
};

// ========== 渲染单个温情卡片 ==========
CalendarApp.render.warmth.card = function(moment) {
  const tagColor = CalendarApp.utils.getTagColor(moment.tag);
  
  return `
    <div class="cal-collect-card" onclick="CalendarApp.render.warmth.coRead('${moment.id}')">
      <div class="cal-collect-header">
        <span class="cal-collect-date">${moment.date}</span>
        <span class="cal-collect-tag" style="background: ${tagColor}20; color: ${tagColor};">#${moment.tag}</span>
      </div>
      <div class="cal-collect-content">${moment.originalText}</div>
      <div class="cal-collect-footer">
        <span>${moment.senderName}</span>
        <button class="cal-collect-read">共读</button>
      </div>
    </div>
  `;
};

// ========== 设置筛选 ==========
CalendarApp.render.warmth.setFilter = function(filter) {
  CalendarApp.render.warmth.filter = filter;
  CalendarApp.render.warmth.render();
};

// ========== 设置时间筛选 ==========
CalendarApp.render.warmth.setTimeFilter = function(filter) {
  CalendarApp.render.warmth.timeFilter = filter;
  CalendarApp.render.warmth.render();
};

// ========== 设置发送方筛选 ==========
CalendarApp.render.warmth.setSenderFilter = function(filter) {
  CalendarApp.render.warmth.senderFilter = filter;
  CalendarApp.render.warmth.render();
};

// ========== 共读时刻 ==========
CalendarApp.render.warmth.coRead = function(momentId) {
  const moment = CalendarApp.data.warmthMoments.find(m => m.id === momentId);
  if (!moment) return;
  
  // 创建共读遮罩
  const overlay = document.createElement('div');
  overlay.className = 'cal-coread-overlay';
  overlay.id = 'calCoreadOverlay';
  overlay.innerHTML = `
    <div class="cal-coread-backdrop" onclick="CalendarApp.render.warmth.closeCoRead()"></div>
    <div class="cal-coread-card">
      <div class="cal-coread-status">
        <span class="cal-coread-dot"></span>
        对方也在阅读...
      </div>
      <div class="cal-coread-content" id="calCoreadContent">${moment.originalText}</div>
      <div class="cal-coread-meta">${moment.senderName} · ${moment.date}</div>
      <div class="cal-coread-hint">🎵 想象一段温柔的钢琴曲...</div>
      <button class="cal-coread-close" onclick="CalendarApp.render.warmth.closeCoRead()">关闭共读</button>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Typewriter 效果
  const content = document.getElementById('calCoreadContent');
  if (content) {
    content.textContent = '';
    const text = moment.originalText;
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        content.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);
  }
};

// ========== 关闭共读 ==========
CalendarApp.render.warmth.closeCoRead = function() {
  const overlay = document.getElementById('calCoreadOverlay');
  if (overlay) {
    overlay.remove();
  }
};

// ========== 温情模块样式（动态注入）==========
CalendarApp.render.warmth.initStyles = function() {
  if (document.getElementById('calWarmthStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'calWarmthStyles';
  style.textContent = `
    .cal-empty-state {
      text-align: center;
      padding: 60px 20px;
    }
    .cal-empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .cal-empty-text {
      font-size: 17px;
      color: var(--cal-color-text-primary);
      margin-bottom: 8px;
    }
    .cal-empty-hint {
      font-size: 14px;
      color: var(--cal-color-text-secondary);
    }
    .cal-collect-card {
      break-inside: avoid;
      background: var(--cal-color-card-bg);
      border-radius: var(--cal-radius-md);
      padding: 14px;
      margin-bottom: 12px;
      box-shadow: var(--cal-shadow-card);
      cursor: pointer;
      transition: all var(--cal-duration-fast) ease;
    }
    .cal-collect-card:hover {
      box-shadow: var(--cal-shadow-hover);
      transform: translateY(-2px);
    }
    .cal-collect-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .cal-collect-date {
      font-size: 12px;
      color: var(--cal-color-text-secondary);
    }
    .cal-collect-tag {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 10px;
    }
    .cal-collect-content {
      font-size: 14px;
      color: var(--cal-color-text-primary);
      line-height: 1.5;
      margin-bottom: 12px;
    }
    .cal-collect-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--cal-color-text-secondary);
    }
    .cal-collect-read {
      padding: 4px 12px;
      border: none;
      background: var(--cal-color-primary);
      color: #fff;
      border-radius: var(--cal-radius-sm);
      font-size: 12px;
      cursor: pointer;
    }
    .cal-coread-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cal-coread-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    .cal-coread-card {
      background: #fff;
      border-radius: var(--cal-radius-lg);
      padding: 32px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      position: relative;
      animation: coreadSlide 0.3s ease;
    }
    @keyframes coreadSlide {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .cal-coread-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 14px;
      color: #4CAF50;
      margin-bottom: 24px;
    }
    .cal-coread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4CAF50;
      animation: coreadPulse 1s infinite;
    }
    @keyframes coreadPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .cal-coread-content {
      font-size: 20px;
      line-height: 1.8;
      color: var(--cal-color-text-primary);
      margin-bottom: 20px;
      min-height: 60px;
    }
    .cal-coread-meta {
      font-size: 14px;
      color: var(--cal-color-text-secondary);
      margin-bottom: 16px;
    }
    .cal-coread-hint {
      font-size: 13px;
      color: var(--cal-color-text-hint);
      margin-bottom: 24px;
    }
    .cal-coread-close {
      padding: 12px 32px;
      border: none;
      background: var(--cal-color-primary);
      color: #fff;
      border-radius: var(--cal-radius-md);
      font-size: 15px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
};

// 初始化
CalendarApp.render.warmth.init();
CalendarApp.render.warmth.initStyles();

// ========== 温情模块就绪 ==========
console.log('💝 温情标记与收藏册模块已加载');