// ========== ML 情感分析管道 ==========
// 使用 transformers.js 加载本地模型进行情感分类

let sentimentClassifier = null;
let sentimentPipelineReady = false;

// ========== 初始化模型 ==========
async function initSentimentPipeline() {
  if (sentimentPipelineReady) return;

  console.log('正在加载情感分析模型...');
  const startTime = Date.now();

  try {
    // 动态导入 transformers.js
    const { pipeline, env } = await import('./lib/transformers.min.js');

    // 配置本地模型路径
    env.localModelPath = './models/albert_chinese_small_sentiment';
    env.allowLocalModels = true;

    // 加载本地模型
    sentimentClassifier = await pipeline(
      'text-classification',
      './models/albert_chinese_small_sentiment',
      { 
        device: 'wasm',
        dtype: 'q8'  // 8位量化
      }
    );

    sentimentPipelineReady = true;
    const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`情感分析模型加载完成，耗时 ${loadTime}s`);
  } catch (error) {
    console.error('模型加载失败:', error);
    throw error;
  }
}

// ========== 分析情感（正向分数） ==========
async function analyzeSentiment(text) {
  if (!sentimentPipelineReady) {
    await initSentimentPipeline();
  }

  try {
    const results = await sentimentClassifier(text);
    
    // 结果格式: [{ label: 'positive', score: 0.92 }]
    const result = results[0];
    
    // 转换为统一的输出格式
    let positiveScore = 0;
    if (result.label === 'positive') {
      positiveScore = result.score;
    } else {
      // negative 标签时，positive score = 1 - score
      positiveScore = 1 - result.score;
    }

    return {
      label: result.label,
      positiveScore: positiveScore,
      negativeScore: 1 - positiveScore,
      confidence: result.score
    };
  } catch (error) {
    console.error('情感分析失败:', error);
    return {
      label: 'neutral',
      positiveScore: 0.5,
      negativeScore: 0.5,
      confidence: 0
    };
  }
}

// ========== 温情检测（基于正向分数） ==========
async function detectWarmth(text) {
  const result = await analyzeSentiment(text);
  return {
    isWarmth: result.positiveScore > 0.7,
    positiveScore: result.positiveScore,
    label: result.label
  };
}

// ========== 批量分析 ==========
async function batchAnalyze(texts) {
  const results = await Promise.all(texts.map(t => analyzeSentiment(t)));
  return results;
}

// ========== 测试函数 ==========
async function testSentiment() {
  const testTexts = [
    '我好累呀',
    '妈，我想你了',
    '今天加班好烦',
    '谢谢妈',
    '注意身体',
    '吃了吗'
  ];

  console.log('\n========== 情感分析测试 ==========');
  for (const text of testTexts) {
    const result = await analyzeSentiment(text);
    console.log(`"${text}" => positive: ${result.positiveScore.toFixed(3)}, label: ${result.label}`);
  }
}

// 预加载模型
initSentimentPipeline().catch(console.error);