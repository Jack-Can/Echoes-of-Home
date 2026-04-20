// ========== 日历模块主控 ==========
CalendarApp.app = {};

// ========== 初始化日历模块 ==========
CalendarApp.app.init = function() {
  console.log('📅 初始化日历模块...');
  
  // 渲染日历视图
  CalendarApp.render.view();
  
  // 绑定全局事件
  CalendarApp.app.bindEvents();
  
  console.log('📅 日历模块初始化完成');
};

// ========== 绑定全局事件 ==========
CalendarApp.app.bindEvents = function() {
  // 键盘事件
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // 关闭所有弹窗
      CalendarApp.render.timeline.hide();
      CalendarApp.render.weather.closeCard();
      CalendarApp.render.memo.closePanel();
      CalendarApp.render.report.close();
      CalendarApp.render.warmth.closeCoRead();
    }
  });
  
  // 点击空白区域关闭
  document.addEventListener('click', (e) => {
    const weatherCard = document.getElementById('calWeatherCard');
    const memoPanel = document.getElementById('calMemoPanel');
    
    if (weatherCard && weatherCard.classList.contains('active')) {
      if (!weatherCard.contains(e.target) && !e.target.closest('.cal-cell')) {
        CalendarApp.render.weather.closeCard();
      }
    }
    
    if (memoPanel && memoPanel.classList.contains('active')) {
      if (!memoPanel.contains(e.target)) {
        CalendarApp.render.memo.closePanel();
      }
    }
  });
};

// ========== 显示日历 ==========
CalendarApp.app.show = function() {
  const calWrapper = document.getElementById('calWrapper');
  if (calWrapper) {
    calWrapper.style.display = 'block';
    CalendarApp.render.view();
  }
};

// ========== 隐藏日历 ==========
CalendarApp.app.hide = function() {
  const calWrapper = document.getElementById('calWrapper');
  if (calWrapper) {
    calWrapper.style.display = 'none';
  }
};

// ========== 全局暴露函数 ==========
// 切换视图
window.CalendarApp = CalendarApp;

// ========== 主控就绪 ==========
console.log('📅 日历主控模块已加载');