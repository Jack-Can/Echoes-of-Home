// ========== 年度温情报告模块 ==========
if (!window.CalendarApp.render) window.CalendarApp.render = {};
CalendarApp.render.report = {};

// ========== 统计全年数据 ==========
CalendarApp.render.report.getStats = function() {
  const records = CalendarApp.data.chatRecords;
  const warmthMoments = CalendarApp.data.warmthMoments;
  
  let totalDays = 0;
  let totalMessages = 0;
  const monthStats = {};
  const wordCount = {};
  
  // 遍历所有记录
  Object.keys(records).forEach(dateStr => {
    const messages = records[dateStr];
    if (messages && messages.length > 0) {
      totalDays++;
      totalMessages += messages.length;
      
      const month = dateStr.substring(0, 7);
      if (!monthStats[month]) monthStats[month] = { days: 0, messages: 0 };
      monthStats[month].days++;
      monthStats[month].messages += messages.length;
      
      // 词频统计
      messages.forEach(m => {
        if (m.type === 'text' || m.type === 'ai') {
          const words = m.content.split(/[,，.。!！?？\s]+/);
          words.forEach(w => {
            if (w.length >= 2) {
              wordCount[w] = (wordCount[w] || 0) + 1;
            }
          });
        }
      });
    }
  });
  
  // 获取最温情时刻
  const warmMoments = warmthMoments.sort((a, b) => new Date(b.date) - new Date(a.date));
  const warmestMoment = warmMoments[0] || null;
  
  // 获取最热闹的一天
  let busiestDay = { date: '', count: 0 };
  Object.keys(records).forEach(dateStr => {
    const count = records[dateStr].length;
    if (count > busiestDay.count) {
      busiestDay = { date: dateStr, count };
    }
  });
  
  // 获取高频词 TOP5
  const topWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));
  
  // 计算天气分布
  const weatherByMonth = {};
  Object.keys(monthStats).forEach(month => {
    const days = monthStats[month].days;
    if (days >= 20) weatherByMonth[month] = 'sunny';
    else if (days >= 10) weatherByMonth[month] = 'cloudy';
    else if (days >= 5) weatherByMonth[month] = 'rainy';
    else weatherByMonth[month] = 'rainy';
  });
  
  return {
    totalDays,
    totalMessages,
    monthStats,
    warmestMoment,
    busiestDay,
    topWords,
    weatherByMonth
  };
};

// ========== 打开年度报告 ==========
CalendarApp.render.report.open = function() {
  const stats = CalendarApp.render.report.getStats();
  
  const reportHtml = `
    <div class="cal-report active" id="calReport">
      <button class="cal-report-close" onclick="CalendarApp.render.report.close()">×</button>
      
      <div class="cal-report-screen" id="reportScreen1">
        <div class="cal-report-intro">
          <div class="cal-report-year">2026</div>
          <div class="cal-report-title">家的回声 · 年度温情报告</div>
          <div class="cal-report-subtitle">今年</div>
          <div class="cal-report-stat">${stats.totalDays}</div>
          <div class="cal-report-stat-label">天有互动</div>
          <div class="cal-report-hint">↓ 继续下滑</div>
        </div>
      </div>
      
      <div class="cal-report-screen" id="reportScreen2">
        <div class="cal-report-card">
          <div class="cal-report-card-icon">📅</div>
          <div class="cal-report-card-title">最热闹的一天</div>
          <div class="cal-report-card-date">${stats.busiestDay.date}</div>
          <div class="cal-report-card-desc">你们说了 ${stats.busiestDay.count} 句话</div>
        </div>
      </div>
      
      <div class="cal-report-screen" id="reportScreen3">
        <div class="cal-report-card">
          <div class="cal-report-card-icon">❤️</div>
          <div class="cal-report-card-title">最温情的时刻</div>
          <div class="cal-report-card-quote">"${stats.warmestMoment ? stats.warmestMoment.originalText : '暂无'}"</div>
          <div class="cal-report-card-date">${stats.warmestMoment ? stats.warmestMoment.date : '-'}</div>
        </div>
      </div>
      
      <div class="cal-report-screen" id="reportScreen4">
        <div class="cal-report-card">
          <div class="cal-report-card-title">💬 你们之间的高频词</div>
          <div class="cal-report-wordcloud">
            ${stats.topWords.map((w, i) => `
              <span class="cal-report-word" style="font-size: ${32 - i * 4}px; color: ${['#E8734A', '#FF6B9D', '#7986CB', '#81C784', '#FFB74D'][i]};">
                ${w.word}
              </span>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div class="cal-report-screen" id="reportScreen5">
        <div class="cal-report-card">
          <div class="cal-report-card-title">🌤️ 这一年我们的天气</div>
          <div class="cal-report-weather">
            ${Object.entries(stats.weatherByMonth).map(([month, weather]) => {
              const weatherIcons = { sunny: '☀️', cloudy: '⛅', rainy: '🌧️' };
              const [y, m] = month.split('-');
              return `<span>${m}月${weatherIcons[weather]}</span>`;
            }).join('')}
          </div>
          <div class="cal-report-weather-summary">
            ${Object.values(stats.weatherByMonth).filter(w => w === 'sunny').length}个月晴天 · 
            ${Object.values(stats.weatherByMonth).filter(w => w === 'cloudy').length}个月多云 · 
            ${Object.values(stats.weatherByMonth).filter(w => w === 'rainy').length}个月雨天
          </div>
        </div>
      </div>
      
      <div class="cal-report-screen" id="reportScreen6">
        <div class="cal-report-card">
          <div class="cal-report-card-title">💌 给彼此的一句话</div>
          <div class="cal-report-quote">"无论走多远，家的声音永远在身后"</div>
          <div class="cal-report-author">— 家的回声</div>
          <button class="cal-report-share" onclick="alert('📤 已分享给爸妈（模拟）')">📤 分享给爸妈</button>
        </div>
      </div>
    </div>
  `;
  
  // 创建或更新报告
  let report = document.getElementById('calReport');
  if (!report) {
    report = document.createElement('div');
    report.id = 'calReport';
    document.body.appendChild(report);
  }
  report.innerHTML = reportHtml;
  
  // 触发 countUp 动画
  setTimeout(() => {
    const statEl = report.querySelector('.cal-report-stat');
    if (statEl) {
      CalendarApp.render.report.countUp(statEl, 0, stats.totalDays, 1000);
    }
  }, 300);
};

// ========== 数字跳动动画 ==========
CalendarApp.render.report.countUp = function(el, start, end, duration) {
  const startTime = performance.now();
  const diff = end - start;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.round(start + diff * progress);
    el.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
};

// ========== 关闭报告 ==========
CalendarApp.render.report.close = function() {
  const report = document.getElementById('calReport');
  if (report) {
    report.remove();
  }
};

// ========== 报告模块样式（动态注入）==========
CalendarApp.render.report.initStyles = function() {
  if (document.getElementById('calReportStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'calReportStyles';
  style.textContent = `
    .cal-report {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--cal-color-warm-bg);
      z-index: 1000;
      overflow-y: auto;
      scroll-snap-type: y mandatory;
    }
    .cal-report.active {
      display: block;
    }
    .cal-report-close {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      border: none;
      background: #fff;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      box-shadow: var(--cal-shadow-card);
      z-index: 1001;
    }
    .cal-report-screen {
      min-height: 100vh;
      scroll-snap-align: start;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .cal-report-intro {
      text-align: center;
    }
    .cal-report-year {
      font-size: 64px;
      font-weight: 200;
      color: var(--cal-color-text-secondary);
    }
    .cal-report-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--cal-color-text-primary);
      margin-bottom: 40px;
    }
    .cal-report-subtitle {
      font-size: 20px;
      color: var(--cal-color-text-secondary);
    }
    .cal-report-stat {
      font-size: 96px;
      font-weight: 700;
      color: var(--cal-color-primary);
    }
    .cal-report-stat-label {
      font-size: 20px;
      color: var(--cal-color-text-secondary);
      margin-bottom: 60px;
    }
    .cal-report-hint {
      font-size: 14px;
      color: var(--cal-color-text-hint);
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(10px); }
    }
    .cal-report-card {
      background: #fff;
      border-radius: var(--cal-radius-lg);
      padding: 40px;
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    .cal-report-card-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .cal-report-card-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--cal-color-text-primary);
      margin-bottom: 20px;
    }
    .cal-report-card-date {
      font-size: 28px;
      font-weight: 600;
      color: var(--cal-color-primary);
      margin-bottom: 8px;
    }
    .cal-report-card-desc {
      font-size: 16px;
      color: var(--cal-color-text-secondary);
    }
    .cal-report-card-quote {
      font-size: 22px;
      line-height: 1.6;
      color: var(--cal-color-text-primary);
      margin: 20px 0;
      font-style: italic;
    }
    .cal-report-wordcloud {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
    }
    .cal-report-word {
      font-weight: 600;
      animation: wordFade 0.5s ease backwards;
    }
    .cal-report-word:nth-child(1) { animation-delay: 0s; }
    .cal-report-word:nth-child(2) { animation-delay: 0.1s; }
    .cal-report-word:nth-child(3) { animation-delay: 0.2s; }
    .cal-report-word:nth-child(4) { animation-delay: 0.3s; }
    .cal-report-word:nth-child(5) { animation-delay: 0.4s; }
    @keyframes wordFade {
      from { opacity: 0; transform: scale(0.5); }
      to { opacity: 1; transform: scale(1); }
    }
    .cal-report-weather {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 20px 0;
      font-size: 24px;
    }
    .cal-report-weather-summary {
      font-size: 14px;
      color: var(--cal-color-text-secondary);
    }
    .cal-report-quote {
      font-size: 24px;
      line-height: 1.6;
      color: var(--cal-color-text-primary);
      font-style: italic;
      margin: 20px 0;
    }
    .cal-report-author {
      font-size: 14px;
      color: var(--cal-color-text-secondary);
      margin-bottom: 30px;
    }
    .cal-report-share {
      padding: 14px 32px;
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

// 初始化样式
CalendarApp.render.report.initStyles();

// ========== 报告模块就绪 ==========
console.log('📊 年度温情报告模块已加载');