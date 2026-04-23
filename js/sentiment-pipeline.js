// ========== ML 情感分析管道 ==========
// 使用 transformers.js 加载本地模型进行情感分类

let sentimentClassifier = null;
let initPromise = null;

// ========== 初始化模型（Promise单例，避免重复加载） ==========
async function initSentimentPipeline() {
  if (initPromise) return initPromise;

  console.log('正在加载情感分析模型...');
  const startTime = Date.now();

  initPromise = (async () => {
    try {
      const { pipeline, env } = await import('./lib/transformers.min.js');

      env.allowLocalModels = true;

      sentimentClassifier = await pipeline(
        'text-classification',
        './models/albert_chinese_small_sentiment',
        {
          device: 'wasm'
        }
      );

      const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`情感分析模型加载完成，耗时 ${loadTime}s`);
    } catch (error) {
      console.error('模型加载失败:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

// ========== 分析情感（正向分数） ==========
async function analyzeSentiment(text) {
  await initPromise;

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
    '今天复习好烦',
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