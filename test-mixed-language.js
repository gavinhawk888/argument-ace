const { createClient } = require('@deepgram/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

async function testMixedLanguageRecognition() {
  console.log('🌏 中英文混合语音识别测试');
  console.log('='.repeat(60));

  if (!DEEPGRAM_API_KEY) {
    console.error('❌ 请配置 DEEPGRAM_API_KEY');
    return;
  }

  console.log('✅ API Key 已配置');

  const deepgram = createClient(DEEPGRAM_API_KEY);

  // 检查音频文件
  const audioPath = path.resolve(__dirname, 'test2.wav');
  
  if (!fs.existsSync(audioPath)) {
    console.error('❌ 找不到音频文件:', audioPath);
    return;
  }

  const audioBuffer = fs.readFileSync(audioPath);
  const audioSize = audioBuffer.length;
  
  console.log('📁 音频文件信息:');
  console.log(`  文件: test2.wav`);
  console.log(`  大小: ${(audioSize / 1024).toFixed(1)} KB`);

  // 多种多语言配置测试
  const testConfigs = [
    {
      name: '🌍 标准多语言模式',
      config: {
        model: 'nova-2',
        language: 'multi',
        smart_format: true,
        punctuate: true,
        detect_language: true,
        language_detection: {
          include: ['en', 'zh-CN', 'zh', 'zh-TW'],
        },
      }
    },
    {
      name: '🌍 增强多语言模式 (更多语言)',
      config: {
        model: 'nova-2',
        language: 'multi',
        smart_format: true,
        punctuate: true,
        detect_language: true,
        language_detection: {
          include: ['en', 'en-US', 'zh', 'zh-CN', 'zh-TW', 'cmn', 'yue'],
        },
      }
    },
    {
      name: '🌍 简化多语言模式',
      config: {
        model: 'nova-2',
        language: 'multi',
        smart_format: true,
        punctuate: true,
      }
    },
    {
      name: '🔄 中英文双语言模式',
      config: {
        model: 'nova-2',
        language: ['en', 'zh-CN'], // 尝试数组形式
        smart_format: true,
        punctuate: true,
      }
    },
    {
      name: '🇨🇳 中文优先模式',
      config: {
        model: 'nova-2',
        language: 'zh-CN',
        smart_format: true,
        punctuate: true,
        detect_language: true,
      }
    }
  ];

  const results = [];

  for (const test of testConfigs) {
    console.log(`\n🧪 测试: ${test.name}`);
    console.log('-'.repeat(50));

    const startTime = Date.now();
    
    try {
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        test.config
      );

      const processingTime = Date.now() - startTime;

      if (error) {
        console.log(`❌ API错误: ${JSON.stringify(error)}`);
        results.push({
          name: test.name,
          success: false,
          error: error.message || JSON.stringify(error),
          processingTime
        });
        continue;
      }

      const alternative = result?.results?.channels?.[0]?.alternatives?.[0];

      if (alternative) {
        const transcript = alternative.transcript || '';
        const confidence = alternative.confidence || 0;
        const languages = alternative.languages || [];
        const words = alternative.words || [];

        console.log(`✅ API调用成功`);
        console.log(`📊 处理时间: ${processingTime}ms`);
        console.log(`📝 转录结果: "${transcript}"`);
        console.log(`📊 置信度: ${confidence.toFixed(3)}`);
        console.log(`🌍 检测语言: [${languages.join(', ')}]`);
        console.log(`🔤 单词数: ${words.length}`);

        // 分析语言分布
        if (words.length > 0) {
          const languageCounts = words.reduce((acc, word) => {
            const lang = word.language || 'unknown';
            acc[lang] = (acc[lang] || 0) + 1;
            return acc;
          }, {});

          console.log(`📊 语言分布:`);
          Object.entries(languageCounts).forEach(([lang, count]) => {
            const percentage = ((count / words.length) * 100).toFixed(1);
            console.log(`  ${lang}: ${count}词 (${percentage}%)`);
          });

          // 显示单词详情
          console.log(`🔤 单词详情:`);
          words.forEach((word, i) => {
            if (i < 15) { // 显示前15个单词
              console.log(`  ${i + 1}. "${word.word}" (${word.language || 'N/A'}, ${word.confidence?.toFixed(3) || 'N/A'})`);
            }
          });
          if (words.length > 15) {
            console.log(`  ... 还有 ${words.length - 15} 个单词`);
          }
        }

        // 检查是否包含中文字符
        const hasChinese = /[\u4e00-\u9fff]/.test(transcript);
        const hasEnglish = /[a-zA-Z]/.test(transcript);
        
        console.log(`🔍 内容分析:`);
        console.log(`  包含中文: ${hasChinese ? '✅' : '❌'}`);
        console.log(`  包含英文: ${hasEnglish ? '✅' : '❌'}`);
        console.log(`  混合语言: ${hasChinese && hasEnglish ? '✅' : '❌'}`);

        results.push({
          name: test.name,
          success: true,
          transcript,
          confidence,
          languages,
          wordsCount: words.length,
          processingTime,
          hasChinese,
          hasEnglish,
          isMixed: hasChinese && hasEnglish,
          languageDistribution: words.length > 0 ? words.reduce((acc, word) => {
            const lang = word.language || 'unknown';
            acc[lang] = (acc[lang] || 0) + 1;
            return acc;
          }, {}) : {}
        });
      } else {
        console.log(`❌ 没有找到转录结果`);
        results.push({
          name: test.name,
          success: false,
          error: 'No alternative found',
          processingTime
        });
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.log(`❌ 测试失败: ${error.message}`);
      results.push({
        name: test.name,
        success: false,
        error: error.message,
        processingTime
      });
    }
  }

  // 结果分析
  console.log('\n📊 中英文混合识别分析');
  console.log('='.repeat(60));

  const successfulTests = results.filter(r => r.success);
  const mixedLanguageTests = results.filter(r => r.success && r.isMixed);

  console.log(`✅ 成功测试: ${successfulTests.length}/${results.length}`);
  console.log(`🌏 混合语言识别: ${mixedLanguageTests.length}/${successfulTests.length}`);

  if (mixedLanguageTests.length > 0) {
    console.log('\n🎯 成功识别混合语言的配置:');
    mixedLanguageTests.forEach(result => {
      console.log(`\n${result.name}:`);
      console.log(`  📝 转录: "${result.transcript}"`);
      console.log(`  📊 置信度: ${result.confidence?.toFixed(3)}`);
      console.log(`  🌍 语言: [${result.languages.join(', ')}]`);
      console.log(`  📊 语言分布: ${JSON.stringify(result.languageDistribution)}`);
    });
  } else {
    console.log('\n⚠️  没有配置成功识别混合语言');
    
    // 分析最佳单语言结果
    const bestResult = successfulTests.reduce((best, current) => {
      return (current.confidence > (best?.confidence || 0)) ? current : best;
    }, null);

    if (bestResult) {
      console.log('\n🏆 最佳识别结果:');
      console.log(`  配置: ${bestResult.name}`);
      console.log(`  转录: "${bestResult.transcript}"`);
      console.log(`  置信度: ${bestResult.confidence?.toFixed(3)}`);
      console.log(`  语言: [${bestResult.languages.join(', ')}]`);
    }
  }

  // 问题诊断
  console.log('\n🔍 问题诊断:');
  
  if (mixedLanguageTests.length === 0) {
    console.log('❌ 中英文混合识别未成功，可能原因:');
    console.log('  1. 音频内容主要是单一语言');
    console.log('  2. 需要调整 Deepgram 多语言参数');
    console.log('  3. 音频质量影响语言检测');
    console.log('  4. 需要更明显的语言切换');
  } else {
    console.log('✅ 中英文混合识别成功！');
  }

  console.log('\n💡 建议:');
  console.log('  1. 录制包含明显中英文切换的音频');
  console.log('  2. 例如: "Hello 你好，今天 weather 很好"');
  console.log('  3. 确保每种语言都有足够的内容');
  console.log('  4. 在安静环境中清晰发音');
}

testMixedLanguageRecognition().catch(console.error); 