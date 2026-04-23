// ========== 日历视图渲染 ==========
if (!window.CalendarApp.render) window.CalendarApp.render = {};
CalendarApp.render.view = function() {
  const container = document.getElementById('cal-container');
  if (!container) return;
  
  const year = CalendarApp.state.currentYear;
  const month = CalendarApp.state.currentMonth;
  const monthData = CalendarApp.utils.getMonthData(year, month);
  
  // 获取天气图标
  const weather = CalendarApp.render.weather.calcWeather();
  const weatherIcons = { sunny: '☀️', cloudy: '⛅', rainy: '🌧️', rainbow: '🌈' };
  
  // 获取温度
  const temp = CalendarApp.utils.getTemperature(year, month);
  
  // 检查是否需要显示雨天提醒
  const rainyAlert = CalendarApp.render.weather.checkRainyReminder();
  
  // HTML 构建
  const html = `
    <div class="cal-header">
      <button class="cal-nav-btn" onclick="CalendarApp.utils.prevMonth()">◀</button>
      <div class="cal-month-title">${year}年${month}月</div>
      <button class="cal-nav-btn" onclick="CalendarApp.utils.nextMonth()">▶</button>
    </div>
    
    <div class="cal-weather-bar">
      <span class="cal-weather-icon" onclick="CalendarApp.render.weather.showCard()" title="查看详情">${weatherIcons[weather]}</span>
      <svg class="cal-temp-meter" onclick="CalendarApp.render.weather.showTempMeter()" viewBox="0 0 24 40" title="情感温度: ${temp}°">
        <rect x="6" y="30" width="12" height="8" rx="4" fill="#E0E0E0"/>
        <rect x="8" y="32" width="8" height="4" rx="2" fill="${temp < 30 ? '#42A5F5' : temp < 60 ? '#FFA726' : '#EF5350'}"/>
        <rect x="9" y="${30 - temp * 0.22}" width="6" height="${temp * 0.22}" rx="3" fill="${temp < 30 ? '#42A5F5' : temp < 60 ? '#FFA726' : '#EF5350'}"/>
      </svg>
    </div>
    
    ${rainyAlert}
    
    <div class="cal-grid">
      <div class="cal-weekday">日</div>
      <div class="cal-weekday">一</div>
      <div class="cal-weekday">二</div>
      <div class="cal-weekday">三</div>
      <div class="cal-weekday">四</div>
      <div class="cal-weekday">五</div>
      <div class="cal-weekday">六</div>
      ${CalendarApp.render.monthCells(year, month, monthData)}
    </div>
    
    <div class="cal-timeline" id="calTimeline">
      <div class="cal-timeline-header">
        <div class="cal-timeline-date" id="calTimelineDate"></div>
        <button class="cal-timeline-close" onclick="CalendarApp.render.closeTimeline()">×</button>
      </div>
      <div class="cal-timeline-summary" id="calTimelineSummary"></div>
      <div class="cal-timeline-messages" id="calTimelineMessages"></div>
    </div>
    
    <div class="cal-quick-actions">
      <button class="cal-quick-btn" onclick="CalendarApp.render.warmth.render()">📖 温情收藏册</button>
      <button class="cal-quick-btn" onclick="CalendarApp.render.report.open()">📊 年度报告</button>
    </div>
    
    <div class="cal-memo-section" id="calMemoSection">
      ${CalendarApp.render.memo.renderAlert()}
    </div>
    
    <div class="cal-countdown" id="calCountdown">
      ${CalendarApp.render.memo.renderCountdown()}
    </div>
  `;
  
  container.innerHTML = html;
};

// ========== 渲染月份单元格 ==========
CalendarApp.render.monthCells = function(year, month, monthData) {
  let html = '';
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // 上月的日期
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  for (let i = monthData.startWeekday - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const dateStr = `${year}-${String(month - 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    html += CalendarApp.render.cell(day, dateStr, true);
  }
  
  // 当月的日期
  for (let day = 1; day <= monthData.daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === CalendarApp.state.selectedDate;
    const hasData = CalendarApp.data.chatRecords[dateStr] && CalendarApp.data.chatRecords[dateStr].length > 0;
    const isAnniversary = CalendarApp.data.anniversaries.some(a => {
      const monthDay = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return a.date === monthDay || (a.monthDay && a.monthDay === monthDay);
    });
    
    html += CalendarApp.render.cell(day, dateStr, false, isToday, isSelected, hasData, isAnniversary);
  }
  
  // 下月的日期补齐
  const totalCells = monthData.startWeekday + monthData.daysInMonth;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let day = 1; day <= remainingCells; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    html += CalendarApp.render.cell(day, dateStr, true);
  }
  
  return html;
};

// ========== 渲染单个日期单元格 ==========
CalendarApp.render.cell = function(day, dateStr, isOtherMonth, isToday, isSelected, hasData, isAnniversary) {
  const classes = ['cal-cell'];
  if (isOtherMonth) classes.push('cal-cell--other-month');
  if (isToday) classes.push('cal-cell--today');
  if (isSelected) classes.push('cal-cell--selected');
  
  // 获取当天的数据点
  let dots = '';
  if (!isOtherMonth && (hasData || isAnniversary)) {
    const messages = CalendarApp.utils.getMessagesByDate(dateStr);
    const hasChat = messages.some(m => m.type === 'text');
    const hasVoice = messages.some(m => m.type === 'voice');
    const hasWarmth = CalendarApp.data.warmthMoments.some(w => w.date === dateStr);
    
    if (hasChat) dots += '<span class="cal-cell-dot cal-cell-dot--chat"></span>';
    if (hasVoice) dots += '<span class="cal-cell-dot cal-cell-dot--voice"></span>';
    if (hasWarmth) dots += '<span class="cal-cell-dot cal-cell-dot--warmth">❤️</span>';
    if (isAnniversary) {
      const monthDay = dateStr.substring(5); // "2026-05-01" → "05-01"
      const anniv = CalendarApp.data.anniversaries.find(a => 
        a.date === monthDay || (a.monthDay && a.monthDay === monthDay)
      );
      const icon = (anniv && anniv.markerIcon) ? anniv.markerIcon : (anniv ? anniv.icon : '🎂');
      dots += `<span class="cal-cell-dot cal-cell-dot--anniversary">${icon}</span>`;
    }
  }
  
  return `
    <div class="${classes.join(' ')}" onclick="CalendarApp.render.selectDate('${dateStr}')">
      <div class="cal-cell-date">${day}</div>
      <div class="cal-cell-dots">${dots}</div>
    </div>
  `;
};

// ========== 选择日期 ==========
CalendarApp.render.selectDate = function(dateStr) {
  CalendarApp.state.selectedDate = dateStr;
  
  // 获取今天的日期
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const isToday = (dateStr === todayStr);
  
  // 清除所有选中状态，只保留今日标记
  document.querySelectorAll('.cal-cell').forEach(cell => {
    cell.classList.remove('cal-cell--selected');
  });
  
  // 为选中的日期添加样式
  const selectedCell = event.target.closest('.cal-cell');
  selectedCell.classList.add('cal-cell--selected');
  if (isToday) {
    selectedCell.classList.add('cal-cell--today');
  }
  
  // 显示时间线
  const timeline = document.getElementById('calTimeline');
  const timelineDate = document.getElementById('calTimelineDate');
  const timelineSummary = document.getElementById('calTimelineSummary');
  const timelineMessages = document.getElementById('calTimelineMessages');
  
  if (timeline && timelineDate && timelineSummary && timelineMessages) {
    timelineDate.textContent = dateStr;
    
    const messages = CalendarApp.utils.getMessagesByDate(dateStr);
    const chatCount = messages.filter(m => m.type === 'text' || m.type === 'ai').length;
    const photoCount = messages.filter(m => m.type === 'photo').length;
    const warmthCount = CalendarApp.data.warmthMoments.filter(w => w.date === dateStr).length;
    
    timelineSummary.innerHTML = `📋 今天你们聊了 ${chatCount} 句话${photoCount > 0 ? `，分享了 ${photoCount} 张照片` : ''}${warmthCount > 0 ? `，${warmthCount} 个温情时刻 ❤️` : ''}`;
    
    // 渲染消息
    if (CalendarApp.render.timeline && CalendarApp.render.timeline.messageCard) {
      timelineMessages.innerHTML = messages.map(msg => CalendarApp.render.timeline.messageCard(msg)).join('');
    } else {
      timelineMessages.innerHTML = '<div class="cal-empty">加载中...</div>';
    }
    
    timeline.classList.add('active');
  }
};

// ========== 关闭时间线 ==========
CalendarApp.render.closeTimeline = function() {
  CalendarApp.render.timeline.hide();
};

// ========== 纪念日提醒（使用 memo 模块）==========
CalendarApp.render.memoAlert = function() {
  const upcoming = CalendarApp.render.memo.getUpcoming();
  if (upcoming.length === 0) return '';
  
  return upcoming.slice(0, 1).map(u => `
    <div class="cal-memo-alert" onclick="CalendarApp.render.memo.showSuggestions('${u.date}')">
      <span class="cal-memo-icon">${u.icon}</span>
      <div class="cal-memo-text">还有 ${u.diff} 天就是${u.title}，准备好惊喜了吗？</div>
      <button class="cal-memo-btn" onclick="event.stopPropagation(); CalendarApp.render.memo.showSuggestions('${u.date}')">查看建议 →</button>
    </div>
  `).join('');
};

// ========== 倒计时（使用 memo 模块）==========
CalendarApp.render.countdown = function() {
  return CalendarApp.render.memo.renderCountdown();
};

// ========== 标记温情 ==========
CalendarApp.render.markWarmth = function(msgId) {
  CalendarApp.render.timeline.markWarmth(msgId);
};

// ========== 天气卡片 ==========
CalendarApp.render.weatherCard = function() {
  alert('📊 关系气象站\n\n近3天互动频繁，状态良好！\n\n💡 建议：继续保持哦！');
};

// ========== 温度计 ==========
CalendarApp.render.tempMeter = function() {
  const temp = CalendarApp.utils.getTemperature(CalendarApp.state.currentYear, CalendarApp.state.currentMonth);
  alert('❤️ 情感温度: ' + temp + '°\n\n' + (temp < 30 ? '❄️ 需要更多关心' : temp < 60 ? '🌤️ 状态不错' : '🔥 情感炽热'));
};

// ========== 初始化日历 ==========
CalendarApp.render.init = function() {
  CalendarApp.render.view();
};

// ========== 月份切换工具 ==========
CalendarApp.utils.prevMonth = function() {
  if (CalendarApp.state.currentMonth === 1) {
    CalendarApp.state.currentMonth = 12;
    CalendarApp.state.currentYear--;
  } else {
    CalendarApp.state.currentMonth--;
  }
  CalendarApp.render.view();
};

CalendarApp.utils.nextMonth = function() {
  if (CalendarApp.state.currentMonth === 12) {
    CalendarApp.state.currentMonth = 1;
    CalendarApp.state.currentYear++;
  } else {
    CalendarApp.state.currentMonth++;
  }
  CalendarApp.render.view();
};

// ========== 日历模块就绪 ==========
console.log('📅 日历视图已加载');

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 如果日历可见则初始化
  const calWrapper = document.getElementById('calWrapper');
  if (calWrapper && calWrapper.style.display !== 'none') {
    CalendarApp.render.init();
  }
});