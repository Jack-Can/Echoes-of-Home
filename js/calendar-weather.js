// ========== 关系气象站与情感温度计模块 ==========
if (!window.CalendarApp.render) window.CalendarApp.render = {};
CalendarApp.render.weather = {};

// ========== 计算天气状态 ==========
CalendarApp.render.weather.calcWeather = function() {
  const today = new Date();
  let interactionDays = 0;
  let hasNegative = false;
  
  for (let i = 0; i < 3; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const messages = CalendarApp.utils.getMessagesByDate(dateStr);
    if (messages && messages.length > 0) {
      interactionDays++;
      // 检查是否有负向消息
      const negativeKeywords = ['烦', '累', '讨厌', '恨', '气死'];
      messages.forEach(m => {
        if (m.sender === 'child') {
          negativeKeywords.forEach(k => {
            if (m.content.includes(k)) hasNegative = true;
          });
        }
      });
    }
  }
  
  if (interactionDays >= 2 && !hasNegative) return 'sunny';
  if (interactionDays === 1 || (interactionDays >= 2 && hasNegative)) return 'cloudy';
  return 'rainy';
};

// ========== 获取7天数据 ==========
CalendarApp.render.weather.getWeekData = function() {
  const data = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const messages = CalendarApp.utils.getMessagesByDate(dateStr);
    data.push({
      date: dateStr,
      day: d.getDate(),
      count: messages ? messages.length : 0
    });
  }
  
  return data;
};

// ========== 渲染天气卡片 ==========
CalendarApp.render.weather.showCard = function() {
  const weather = CalendarApp.render.weather.calcWeather();
  const weekData = CalendarApp.render.weather.getWeekData();
  const maxCount = Math.max(...weekData.map(d => d.count)) || 1;
  
  const weatherInfo = {
    sunny: { icon: '☀️', title: '晴天', desc: '最近你们互动很频繁呢！', color: '#FFB300' },
    cloudy: { icon: '⛅', title: '多云', desc: '保持联系，偶尔聊聊也不错。', color: '#90A4AE' },
    rainy: { icon: '🌧️', title: '雨天', desc: '已经几天没联系了，记得问候一下。', color: '#5C6BC0' },
    rainbow: { icon: '🌈', title: '彩虹', desc: '破冰重联，关系回温！', color: '#AB47BC' }
  };
  
  const info = weatherInfo[weather];
  const suggestions = CalendarApp.data.aiSuggestions.quickReplies;
  
  // SVG 折线图
  const points = weekData.map((d, i) => {
    const x = (i / 6) * 280 + 20;
    const y = 80 - (d.count / maxCount) * 60;
    return `${x},${y}`;
  }).join(' ');
  
  const cardHtml = `
    <div class="cal-weather-card">
      <button class="cal-weather-card-close" onclick="CalendarApp.render.weather.closeCard()">×</button>
      <div class="cal-weather-card-icon">${info.icon}</div>
      <div class="cal-weather-card-title">${info.title}</div>
      <div class="cal-weather-card-desc">${info.desc}</div>
      
      <div class="cal-weather-chart-label">📊 近7天互动频次</div>
      <svg class="cal-weather-chart" viewBox="0 0 320 100">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${info.color};stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:${info.color};stop-opacity:0" />
          </linearGradient>
        </defs>
        <polyline points="${points}" fill="none" stroke="${info.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        ${weekData.map((d, i) => {
          const x = (i / 6) * 280 + 20;
          const y = 80 - (d.count / maxCount) * 60;
          return `<circle cx="${x}" cy="${y}" r="4" fill="${info.color}"/>`;
        }).join('')}
        ${weekData.map((d, i) => {
          const x = (i / 6) * 280 + 20;
          const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
          const dObj = new Date(d.date);
          return `<text x="${x}" y="95" text-anchor="middle" fill="#999" font-size="10">${dayNames[dObj.getDay()]}</text>`;
        }).join('')}
      </svg>
      
      <div class="cal-weather-suggestion">💡 建议：${info.desc}</div>
      
      ${weather === 'rainy' ? `
        <div class="cal-weather-quick">
          <div class="cal-weather-quick-label">快捷回复：</div>
          <div class="cal-weather-quick-btns">
            <button onclick="CalendarApp.render.weather.quickReply('${suggestions[0]}')">${suggestions[0]}</button>
            <button onclick="CalendarApp.render.weather.quickReply('${suggestions[1]}')">${suggestions[1]}</button>
            <button onclick="CalendarApp.render.weather.quickReply('${suggestions[2]}')">${suggestions[2]}</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  // 创建或更新卡片
  let card = document.getElementById('calWeatherCard');
  if (!card) {
    card = document.createElement('div');
    card.id = 'calWeatherCard';
    card.className = 'cal-weather-card-container';
    document.getElementById('cal-container').appendChild(card);
  }
  card.innerHTML = cardHtml;
  card.classList.add('active');
};

// ========== 关闭天气卡片 ==========
CalendarApp.render.weather.closeCard = function() {
  const card = document.getElementById('calWeatherCard');
  if (card) {
    card.classList.remove('active');
  }
};

// ========== 快捷回复 ==========
CalendarApp.render.weather.quickReply = function(text) {
  if (typeof appendChatBubble === 'function') {
    appendChatBubble('me', text);
  }
  CalendarApp.render.weather.closeCard();
  if (typeof switchView === 'function') {
    switchView('chat');
  }
  if (CalendarApp && CalendarApp.render && CalendarApp.render.weather) {
    CalendarApp.render.weather.updateTipBox();
    if (typeof updateWeatherCard === 'function') {
      updateWeatherCard();
    }
  }
};

// ========== 渲染温度计 ==========
CalendarApp.render.weather.showTempMeter = function() {
  const temp = CalendarApp.utils.getTemperature(CalendarApp.state.currentYear, CalendarApp.state.currentMonth);
  
  let tempDesc = '';
  let tempColor = '';
  if (temp < 30) {
    tempDesc = '❄️ 需要更多关心';
    tempColor = '#42A5F5';
  } else if (temp < 60) {
    tempDesc = '🌤️ 状态不错';
    tempColor = '#FFA726';
  } else {
    tempDesc = '🔥 情感炽热';
    tempColor = '#EF5350';
  }
  
  alert('❤️ 情感温度: ' + temp + '°\n\n' + tempDesc + '\n\n计算依据：\n- 互动天数 × 3\n- 温情标记 × 5\n- 基础温度 30°');
};

// ========== 计算距离最后消息的天数 ==========
CalendarApp.render.weather.getDaysSince = function(dateStr) {
  if (!dateStr) return 999;
  const lastDate = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
};

// ========== 更新侧边栏 tip-box ==========
CalendarApp.render.weather.updateTipBox = function() {
  const tipBox = document.querySelector('.tip-box');
  if (!tipBox) return;
  
  const weather = CalendarApp.render.weather.calcWeather();
  const records = CalendarApp.data.chatRecords;
  const dates = Object.keys(records).sort();
  const lastMsgDate = dates.length > 0 ? dates[dates.length - 1] : null;
  const days = CalendarApp.render.weather.getDaysSince(lastMsgDate);
  const tips = CalendarApp.data.aiSuggestions.dailyTips;
  const isParent = window.CURRENT_USER === 'parent';
  const targetName = isParent ? '孩子' : '爸妈';
  
  if (weather === 'rainy') {
    tipBox.classList.add('rainy');
    tipBox.innerHTML = `
      <div class="tip-label">🌧️ 关系气象站提醒</div>
      <div class="rainy-icon">🌧️</div>
      <div class="rainy-text">已经 ${days} 天没和${targetName}聊天了，要不要发个消息？</div>
      <div class="rainy-btns">
        <button onclick="CalendarApp.render.weather.quickReply('${isParent ? '孩子，今天怎么样？' : '今天吃了吗？想你们了 😊'}')">${isParent ? '孩子，今天怎么样？' : '今天吃了吗？'}</button>
        <button onclick="CalendarApp.render.weather.quickReply('${isParent ? '刚看到一个好玩的' : '刚看到一个好玩的'}')">${isParent ? '看到一个好玩的' : '看到一个好玩的'}</button>
      </div>
    `;
  } else {
    tipBox.classList.remove('rainy');
    const tipList = tips[weather] || tips.cloudy;
    const randomTip = tipList[Math.floor(Math.random() * tipList.length)];
    tipBox.innerHTML = `
      <div class="tip-label">💡 今日锦囊</div>
      <div class="tip-text">${randomTip}</div>
    `;
  }
};

// ========== 雨天的互动提醒（已迁移到 tip-box，此函数仅作兼容返回空）==========
CalendarApp.render.weather.checkRainyReminder = function() {
  return '';
};

// ========== 天气模块样式（动态注入）==========
CalendarApp.render.weather.initStyles = function() {
  if (document.getElementById('calWeatherStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'calWeatherStyles';
  style.textContent = `
    .cal-weather-card-container {
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
    .cal-weather-card-container.active {
      display: flex;
    }
    .cal-weather-card {
      background: #fff;
      border-radius: var(--cal-radius-lg);
      padding: 24px;
      max-width: 360px;
      width: 90%;
      position: relative;
      animation: weatherSlide 0.3s ease;
    }
    @keyframes weatherSlide {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    .cal-weather-card-close {
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
    .cal-weather-card-icon {
      font-size: 48px;
      text-align: center;
      margin-bottom: 8px;
    }
    .cal-weather-card-title {
      font-size: 20px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 8px;
    }
    .cal-weather-card-desc {
      font-size: 14px;
      color: var(--cal-color-text-secondary);
      text-align: center;
      margin-bottom: 20px;
    }
    .cal-weather-chart-label {
      font-size: 13px;
      color: var(--cal-color-text-secondary);
      margin-bottom: 8px;
    }
    .cal-weather-chart {
      width: 100%;
      height: 100px;
    }
    .cal-weather-suggestion {
      font-size: 14px;
      color: var(--cal-color-text-primary);
      margin-top: 16px;
      padding: 12px;
      background: var(--cal-color-warm-bg);
      border-radius: var(--cal-radius-sm);
    }
    .cal-weather-quick {
      margin-top: 16px;
    }
    .cal-weather-quick-label {
      font-size: 13px;
      color: var(--cal-color-text-secondary);
      margin-bottom: 8px;
    }
    .cal-weather-quick-btns {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .cal-weather-quick-btns button {
      padding: 8px 12px;
      border: none;
      background: var(--cal-color-primary-bg);
      color: var(--cal-color-primary);
      border-radius: var(--cal-radius-sm);
      font-size: 13px;
      cursor: pointer;
    }
    .cal-rainy-alert {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      background: var(--cal-color-primary-bg);
      border-radius: var(--cal-radius-md);
      margin-bottom: 16px;
    }
    .cal-rainy-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .cal-rainy-text {
      font-size: 14px;
      color: var(--cal-color-text-primary);
      margin-bottom: 12px;
    }
    .cal-rainy-btns {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .cal-rainy-btns button {
      padding: 8px 12px;
      border: none;
      background: #fff;
      color: var(--cal-color-text-primary);
      border-radius: var(--cal-radius-sm);
      font-size: 13px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
};

// 初始化样式
CalendarApp.render.weather.initStyles();

// ========== 天气模块就绪 ==========
console.log('🌤️ 关系气象站与温度计模块已加载');