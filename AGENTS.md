# AGENTS.md - 回声驿站开发指南

本文档为在此代码库中工作的智能代理提供开发规范和运行指南。

## 1. 项目概述

- **项目名称**: 回声驿站 - 情感翻译机
- **技术栈**: 原生 HTML5 + CSS3 + Vanilla JavaScript（无框架）
- **类型**: 单页 Web 应用，可直接在浏览器中打开 `index.html` 运行
- **运行方式**: `open index.html` 或 `npx serve .` 后访问 `http://localhost:8000`
- **构建/测试**: 本项目无构建工具，无测试框架，纯浏览器运行

## 2. 项目结构

```
├── index.html              # 主入口页面
├── SPEC.md                 # 项目需求规格说明
├── css/
│   ├── layout.css          # 全局布局、导航栏、CSS变量(:root)
│   ├── sidebar.css         # 侧边栏、身份切换
│   ├── chat.css            # 聊天消息气泡
│   ├── input.css           # 输入区域、写信模态框
│   ├── utilities.css       # 工具类、动画
│   └── calendar.css        # 日历模块样式
├── js/
│   ├── app.js              # 主应用逻辑 (~1500行)
│   ├── data.js             # 主聊天模拟数据
│   ├── emotion-intelligence.js  # 情感分析引擎 (规则+ML混合)
│   ├── sentiment-pipeline.js    # transformers.js ML模型管道
│   ├── calendar-data.js    # 日历模块模拟数据
│   ├── calendar-view.js    # 月历视图
│   ├── calendar-timeline.js # 互动时间线、温情标记
│   ├── calendar-warmth.js  # 温情标记与收藏册
│   ├── calendar-weather.js # 关系气象站
│   ├── calendar-memo.js    # 纪念日与提醒
│   ├── calendar-report.js  # 年度温情报告
│   ├── calendar.js         # 日历主控制器
│   └── lib/
│       └── transformers.min.js # 本地 transformers.js 库
├── models/                 # ML模型文件目录
│   └── albert_chinese_small_sentiment/
│       ├── model.onnx      # ONNX模型 (~12MB)
│       └── tokenizer.json   # 分词器配置
└── 发现的问题.md            # 问题追踪文档
```

## 3. 代码风格指南

### 3.1 HTML 规范

- 语义化标签: `aside`, `main`, `header`, `footer`, `nav`, `section`
- 2空格缩进，属性值双引号
- 区块注释: `<!-- ========== 区块说明 ========== -->`

```html
<!-- ========== 左侧栏 ========== -->
<aside class="sidebar">
  <div class="logo">...</div>
</aside>
```

### 3.2 CSS 规范

- **CSS变量定义在 `css/layout.css` 的 `:root` 中**，不要在其他文件中定义
- 类名: 小写字母 + 连字符 (BEM简化版: `组件名-元素名`)
- 属性声明顺序: 布局 → 尺寸 → 视觉 → 字体 → 其他
- 2空格缩进，选择器与 `{` 之间保留空格
- 禁止内联样式，通过切换 CSS 类控制显示

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

### 3.3 JavaScript 规范

#### 变量命名

| 类型 | 风格 | 示例 |
|------|------|------|
| 全局常量 | `UPPER_SNAKE_CASE` | `MAX_RETRY`, `CURRENT_USER` |
| 全局变量 | `PascalCase` | `CHAT_TIMELINE`, `CURRENT_VIEW` |
| 函数/方法 | `camelCase` | `switchIdentity`, `renderChatHistory` |
| DOM元素引用 | 以 `element` 结尾或具体标签名 | `chatStream`, `msgInput` |
| 布尔变量 | `is*` / `has*` / `can*` | `isWarmth`, `hasError` |
| Promise/异步 | `*Async` 后缀 | `analyzeEmotionAsync` |

#### 函数组织顺序

1. 全局状态变量 (`let` / `const`)
2. DOM 引用变量 (`const xxxElement = ...`)
3. 初始化函数 (`init`, `setup*`)
4. 辅助函数 (`get*`, `resolve*`, `normalize*`)
5. 事件绑定 (`bindEvents`)
6. 渲染函数 (`render*`, `create*Element`)
7. 业务逻辑函数
8. 弹窗/模态框函数 (`open*`, `close*`)
9. 工具函数
10. 启动代码 (`init()` 调用)

#### 代码块注释

```javascript
// ========== 全局状态 ==========
// ========== DOM 引用 ==========
// ========== 初始化 ==========
```

#### 字符串与事件

- 使用单引号 `''` 表示字符串
- 使用 `addEventListener` 绑定事件，优先用箭头函数
- 避免直接操作 `this`

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

- 使用 `try-catch` 包裹可能出错的代码
- 条件判断前置检查: `if (!element) return;`
- 异步函数中 `try-catch` 包裹 await 调用
- 日志输出用 `console.warn` (可恢复错误) / `console.error` (严重错误)

```javascript
// 同步
function openLetterViewer(letter) {
  if (!letterOverlay || !letterScene || !letterPaperContent) return;
  // ... 业务逻辑
}

// 异步
async function detectAndShowWarmthHint(msgId, content, from) {
  if (!content || chatWarmthCache.has(msgId)) return;
  try {
    const direction = from === 'me' ? 'parent' : 'child';
    const result = await analyzeEmotion(content, direction);
    // ...
  } catch (e) {
    chatWarmthCache.set(msgId, false); // 检测失败，静默忽略
  }
}
```

## 4. ML 模型集成规范

### 4.1 模型加载

使用 ES 模块动态导入本地 transformers.js:

```javascript
const { pipeline, env } = await import('./lib/transformers.min.js');
env.localModelPath = './models/albert_chinese_small_sentiment';
env.allowLocalModels = true;
```

### 4.2 异步函数命名

- 同步版本: `analyzeEmotionSync(text, direction)`
- 异步版本: `analyzeEmotion(text, direction)` (推荐)
- 便捷包装: `analyze(text, direction)` → 调用同步版本

### 4.3 模型降级策略

所有 ML 调用必须有 try-catch，失败时回退到规则引擎:

```javascript
try {
  if (typeof analyzeSentiment === 'function') {
    mlResult = await analyzeSentiment(text);
  }
} catch (e) {
  console.warn('ML情感分析失败，使用规则引擎:', e);
}
```

## 5. 命名映射关系

| 场景 | 变量名 | 取值 |
|------|--------|------|
| 当前用户 | `CURRENT_USER` | `'child'` 或 `'parent'` |
| 当前角色 | `getCurrentRole()` | `'child'` / `'parent'` |
| 对方角色 | `getOppositeRole(role)` | 与 `role` 相反 |
| 消息来源 | `msg.from` | `'me'` 或 `'them'` |
| 消息类型 | `msg.type` | `'chat'`, `'letter'`, `'voice'`, `'attach'` |
| 情感类型 | `emotionType` | `'care'`, `'worry'`, `'fatigue'`, `'stress'`, `'seeking'`, `'neutral'` |
| 时间戳 | `timestamp` | `'HH:mm'` 格式字符串 |

## 6. 状态管理

- 全局状态: 大写变量 (`CURRENT_USER`, `CHAT_TIMELINE`)
- 组件状态: 小写变量
- 数据驱动: 避免直接修改 DOM，通过数据更新后重新渲染
- 缓存: 使用 `Map` 存储检测结果缓存 (如 `warmthHintCache`)

## 7. 添加新功能的流程

1. 分析需求，确定影响范围
2. 在 `css/` 中添加或修改样式 (优先在现有文件中扩展)
3. 在 `js/` 中添加或修改 JS 文件
4. 如需新数据，修改对应的 `data.js` 文件
5. 在浏览器中测试 (刷新页面即可)

## 8. 注意事项

- **禁止使用任何外部框架** (jQuery, Vue, React 等)
- **禁止外部 CDN**: 不使用任何外部图片/脚本 CDN
- **10MB zip 限制**: 最终打包需控制在 10MB 以内
- **ML 模型路径**: 固定为 `./models/albert_chinese_small_sentiment`
- **transformers.js**: 必须下载到本地 `js/lib/`，禁止 CDN
- **浏览器兼容性**: Chrome 80+ / Firefox 75+ / Safari 13+ / Edge 80+
- **国际化**: 用户可见文本和代码注释均使用简体中文

## 9. 常见任务示例

### 添加新消息类型

在 `js/app.js` 的 `createMsgElement()` 函数中添加新的类型判断:

```javascript
if (msg.type === 'new-type') {
  const bubble = document.createElement('div');
  bubble.className = 'msg-new-type';
  bubble.textContent = msg.content;
  wrap.appendChild(bubble);
  return wrap;
}
```

### 添加新 CSS 类

在对应的 CSS 文件中添加样式:

```css
.msg-new-type {
  background-color: #FAFAFA;
  border-left: 3px solid #007AFF;
}
```

### 调用情感分析

```javascript
const result = await analyzeEmotion('妈，我想你了', 'parent');
console.log(result.emotionType);    // 'care'
console.log(result.warmthPotential); // true (ML检测到正向情感)
```
