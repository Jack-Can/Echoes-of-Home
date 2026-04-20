# AGENTS.md - 回声驿站开发指南

本文档为在此代码库中工作的智能代理提供开发规范和运行指南。

## 1. 项目概述

- **项目名称**: 回声驿站 - 情感翻译机
- **技术栈**: 原生 HTML5 + CSS3 + Vanilla JavaScript（无框架）
- **类型**: 单页 Web 应用
- **运行方式**: 直接在浏览器中打开 `index.html` 即可运行

## 2. 快速开始

```bash
# 方式1: 直接用浏览器打开
open index.html

# 方式2: 使用简单 HTTP 服务器（推荐）
npx serve .
# 或
python -m http.server 8000
```

访问 `http://localhost:8000`，修改 CSS/JS 后刷新页面即可看到效果。

## 3. 项目结构

```
├── index.html              # 主入口页面
├── SPEC.md                 # 项目需求规格说明
├── css/
│   ├── layout.css          # 全局布局、导航栏
│   ├── sidebar.css         # 侧边栏、身份切换
│   ├── chat.css            # 聊天消息气泡
│   ├── input.css           # 输入区域、写信模态框
│   ├── utilities.css       # 工具类、动画
│   └── calendar.css        # 日历模块样式
├── js/
│   ├── app.js              # 主应用逻辑
│   ├── data.js             # 主聊天模拟数据
│   ├── calendar-data.js    # 日历模块模拟数据
│   ├── calendar-view.js    # 月历视图
│   ├── calendar-timeline.js # 互动时间线
│   ├── calendar-warmth.js  # 温情标记与收藏册
│   ├── calendar-weather.js # 关系气象站
│   ├── calendar-memo.js    # 纪念日与提醒
│   ├── calendar-report.js  # 年度温情报告
│   └── calendar.js         # 日历主控制器
├── images/                 # 图片资源目录
└── 模块设计/               # 模块设计文档
```

## 4. 代码风格指南

### 4.1 HTML 规范

- 使用语义化标签（`aside`, `main`, `header`, `footer` 等）
- 保持 2 空格缩进，属性值使用双引号
- 注释格式：`<!-- 区块说明 -->`

```html
<!-- ========== 左侧栏 ========== -->
<aside class="sidebar">
  <div class="logo">...</div>
</aside>
```

### 4.2 CSS 规范

- 使用 CSS 自定义变量管理颜色和间距
- 类名使用 BEM 风格简化版（组件名-元素名）
- 属性声明顺序：布局 → 尺寸 → 视觉 → 字体 → 其他
- 2 空格缩进，选择器与左花括号之间保留空格

```css
.sidebar {
  display: flex;
  flex-direction: column;
  width: 300px;
  padding: 30px 20px;
  background-color: #FFFFFF;
  color: #333;
  font-size: 14px;
  overflow: hidden;
}
```

### 4.3 JavaScript 规范

#### 变量命名

- 常量：`UPPER_SNAKE_CASE`（如 `MAX_RETRY`）
- 函数/方法：`camelCase`（如 `switchIdentity`）
- DOM 元素引用：以 `element` 或具体标签名结尾（如 `chatStream`、`msgInput`）

#### 函数组织顺序

1. 全局状态变量 → 2. DOM 引用变量 → 3. 初始化函数（`init`）
4. 辅助函数（`get*`） → 5. 事件绑定（`bindEvents`）
6. 渲染函数（`render*`） → 7. 业务逻辑函数
8. 弹窗/模态框函数 → 9. 工具函数 → 10. 启动代码

#### 代码块注释

```javascript
// ========== 全局状态 ==========
// ========== DOM 引用 ==========
// ========== 初始化 ==========
```

#### 字符串与事件处理

- 使用单引号 `''` 表示字符串
- 使用 `addEventListener` 绑定事件，优先用箭头函数保持 `this`

```javascript
function bindEvents() {
  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
}
```

#### 错误处理

- 使用 `try-catch` 捕获可能出错代码
- 条件判断前置检查：`if (!element) return;`

```javascript
function openLetterViewer(letter) {
  if (!letterOverlay || !letterScene || !letterPaperContent) return;
  // ... 业务逻辑
}
```

### 4.4 命名映射关系

| 场景 | 命名 | 说明 |
|------|------|------|
| 当前用户 | `CURRENT_USER` | `'child'` 或 `'parent'` |
| 当前角色 | `currentRole` | 通过 `getCurrentRole()` 获取 |
| 消息类型 | `type` | `'chat'` 或 `'letter'` |
| 消息来源 | `from` | `'me'` 或 `'them'` |
| 时间戳 | `timestamp` | `'HH:mm'` 格式 |

### 4.5 状态管理

- 全局状态使用大写变量（如 `CURRENT_USER`）
- 组件状态使用小写变量
- 避免直接修改 DOM，通过数据驱动渲染

### 4.6 国际化

- 用户可见文本使用简体中文
- 代码注释使用简体中文

## 5. 添加新功能的流程

1. 分析需求，确定影响范围
2. 在 `css/` 中添加或修改样式
3. 在 `js/app.js` 中添加对应的函数和逻辑
4. 如需新数据，修改 `js/data.js`
5. 在浏览器中测试

## 6. 常见任务示例

### 添加新样式

```css
.msg-new-type {
  background-color: #FAFAFA;
  border-left: 3px solid #007AFF;
}
```

### 添加新功能函数

```javascript
// ========== 新功能 ==========
function newFeature() {
  // 功能实现
}
```

### 添加新消息类型

在 `createMsgElement` 函数中添加新的类型判断：

```javascript
if (msg.type === 'new-type') {
  // 创建对应的 DOM 元素
}
```

## 7. 注意事项

- **不要使用任何外部框架**（jQuery、Vue、React 等）
- **CSS 变量定义在 `layout.css`** 的 `:root` 中
- **修改 CSS 前先阅读对应的 CSS 文件**，了解现有类名和结构
- **所有 CSS 类名均以小写字母加连字符命名**
- **JS 中使用 `document.getElementById`** 获取 DOM 元素
- **不要在 JS 中直接写入内联样式**，通过切换 CSS 类名控制显示

## 8. 浏览器兼容性

- Chrome 80+ / Firefox 75+ / Safari 13+ / Edge 80+
- 不支持 IE 浏览器