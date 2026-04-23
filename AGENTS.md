# AGENTS.md - 回声驿站开发指南

## 项目概述

- **项目名称**: 回声驿站 - 情感翻译机
- **技术栈**: 原生 HTML5 + CSS3 + Vanilla JavaScript（无框架）
- **运行**: 双击 `index.html` 或 `npx serve .` 后访问 `http://localhost:8000`
- **测试**: 刷新浏览器即可，无需构建

## 项目结构

```
├── index.html              # 主入口
├── SPEC.md                 # 产品规格说明
├── AGENTS.md               # 开发者指南（本文件）
├── css/                    # 样式文件
│   ├── layout.css          # 全局布局、CSS变量(:root)
│   ├── sidebar.css         # 侧边栏
│   ├── chat.css            # 聊天消息气泡
│   ├── input.css           # 输入区域
│   ├── utilities.css       # 工具类、动画
│   └── calendar.css        # 日历模块
├── js/                     # JavaScript文件
│   ├── app.js              # 主应用逻辑
│   ├── data.js             # 聊天模拟数据
│   ├── calendar-*.js       # 日历模块（7个子文件）
│   ├── emotion-*.js        # 情感分析引擎
│   ├── sentiment-pipeline.js  # ML情感分析管道
│   └── lib/transformers.min.js  # 本地ML库
└── models/                 # ML模型
    └── albert_chinese_small_sentiment/
```

## 运行与测试命令

```bash
# 运行项目（任选一种）
双击 index.html                    # 直接浏览器打开
npx serve .                        # 本地服务器 http://localhost:8000

# 无构建系统、无测试框架、无Linter
# 修改代码后只需刷新浏览器即可看到效果
```

## 代码风格规范

### 通用

- **语言**: 代码注释和用户文本均使用简体中文
- **缩进**: 2空格，不使用Tab
- **字符串**: 单引号 `''`
- **区块注释**: `<!-- ========== 区块名 ========== -->` (HTML) / `// ========== 区块名 ==========` (JS)

### HTML

- 语义化标签: `aside`, `main`, `header`, `nav`, `section`
- 区块注释分隔代码区域
- 禁止内联样式

### CSS

- **CSS变量集中在 `css/layout.css` 的 `:root` 中定义**
- 类名: 小写 + 连字符 (如 `msg-bubble`, `weather-card`)
- 属性顺序: 布局 → 尺寸 → 视觉 → 字体
- 禁止内联样式

### JavaScript

#### 命名规范

| 类型 | 风格 | 示例 |
|------|------|------|
| 全局常量 | `UPPER_SNAKE_CASE` | `MAX_RETRY`, `CURRENT_USER` |
| 全局变量 | `PascalCase` | `CHAT_TIMELINE`, `CURRENT_VIEW` |
| 函数/方法 | `camelCase` | `switchIdentity`, `renderChatHistory` |
| DOM引用 | 以 `Element` 结尾 | `chatStreamElement`, `msgInput` |
| 布尔值 | `is*`/`has*`/`can*` | `isWarmth`, `hasError` |
| 异步函数 | `*Async` 后缀 | `analyzeEmotionAsync` |

#### 函数组织顺序（必须遵循）

```
1. 全局状态 (let/const)
2. DOM引用
3. 初始化函数
4. 辅助函数
5. 事件绑定
6. 渲染函数
7. 业务逻辑
8. 弹窗函数
9. 工具函数
10. 启动代码
```

#### 代码规范

- 使用 `addEventListener` 绑定事件，优先箭头函数
- 避免直接操作 `this`
- 条件前置检查: `if (!element) return;`
- `try-catch` 包裹可能出错的代码
- 日志级别: `console.warn` (可恢复) / `console.error` (严重)

#### 错误处理

```javascript
// 条件前置检查
if (!element) return;

// try-catch 包裹可能出错的代码
try {
  const result = await analyzeSentiment(text);
} catch (e) {
  console.warn('ML失败，回退到规则:', e);
  return ruleBasedAnalyze(text);
}
```

## 命名映射

| 场景 | 变量/函数 | 取值 |
|------|-----------|------|
| 当前用户 | `CURRENT_USER` | `'child'` / `'parent'` |
| 角色 | `getCurrentRole()` | `'child'` / `'parent'` |
| 对方 | `getOppositeRole(role)` | 与role相反 |
| 消息来源 | `msg.from` | `'me'` / `'them'` |
| 消息类型 | `msg.type` | `'chat'` / `'letter'` / `'voice'` / `'attach'` |

## 状态管理

- 全局状态: 大写变量
- 组件状态: 小写变量
- 数据驱动渲染，避免直接修改DOM
- 使用 `Map` 做缓存（如 `warmthHintCache`）

## ML模型规范

```javascript
// 动态导入本地transformers.js
const { pipeline, env } = await import('./js/lib/transformers.min.js');
env.localModelPath = './models/albert_chinese_small_sentiment';
env.allowLocalModels = true;

// 所有ML调用必须有try-catch降级
try {
  const result = await analyzeSentiment(text);
} catch (e) {
  console.warn('ML失败，回退到规则:', e);
  return ruleBasedAnalyze(text);
}
```

## 重要约束

- **无框架**: 禁止使用 jQuery/Vue/React 等
- **无外部CDN**: 所有资源本地化，图片/脚本禁止CDN
- **10MB限制**: 最终zip打包控制在10MB以内
- **浏览器兼容**: Chrome 80+ / Firefox 75+ / Safari 13+ / Edge 80+

## 添加新功能流程

1. 分析需求，确定影响范围
2. 修改 `css/` 中现有样式（优先扩展）
3. 修改 `js/` 中对应文件
4. 新数据修改 `data.js` 或 `calendar-data.js`
5. 浏览器刷新测试

## 常见任务

### 添加新消息类型

在 `app.js` 的 `createMsgElement()` 中添加类型判断：

```javascript
if (msg.type === 'new-type') {
  const bubble = document.createElement('div');
  bubble.className = 'msg-new-type';
  bubble.textContent = msg.content;
  wrap.appendChild(bubble);
  return wrap;
}
```

### 调用情感分析

```javascript
const result = await analyzeEmotion('妈，我想你了', 'parent');
console.log(result.emotionType);    // 'care'
console.log(result.warmthPotential); // true
```
