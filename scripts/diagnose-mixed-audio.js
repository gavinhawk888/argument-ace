const { createClient } = require('@deepgram/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

async function testAudioFile(fileName, expectedContent) {
  console.log(`\n🎵 测试音频文件: ${fileName}`);
  console.log('='.repeat(60));
  console.log(`📝 预期内容: "${expectedContent}"`);
  console.log('='.repeat(60));

  const deepgram = createClient(DEEPGRAM_API_KEY);
  const audioPath = path.resolve(__dirname, fileName);
  
  if (!fs.existsSync(audioPath)) {
    console.error(`❌ 找不到音频文件: ${audioPath}`);
    return null;
  }

  const audioBuffer = fs.readFileSync(audioPath);
  console.log(`📁 音频文件: ${fileName} (${(audioBuffer.length / 1024).toFixed(1)} KB)`);

  // 多种配置策略测试
  const testConfigs = [
    {
      name: '🌍 当前多语言配置',
      config: {
        model: 'nova-2',
        language: 'multi',
        smart_format: true,
        punctuate: true,
        interim_results: false,
        endpointing: 300,
        vad_events: true,
        numerals: true,
        measurements: true,
      }
    },
    {
      name: '🌍 敏感多语言配置',
      config: {
        model: 'nova-2',
        language: 'multi',
        smart_format: true,
        punctuate: true,
        interim_results: false,
        endpointing: 100, // 减少静音检测时间
        vad_events: true,
        numerals: true,
        measurements: true,
        diarize: false,
        paragraphs: false,
        utterances: false,
      }
    },
    {
      name: '🇨🇳 纯中文模式',
      config: {
        model: 'nova-2',
        language: 'zh-CN',
        smart_format: true,
        punctuate: true,
        interim_results: false,
        endpointing: 100,
        vad_events: true,
      }
    },
    {
      name: '🇺🇸 纯英文模式',
      config: {
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        punctuate: true,
        interim_results: false,
        endpointing: 100,
        vad_events: true,
      }
    },
    {
      name: '🌍 基础多语言模式',
      config: {
        model: 'nova-2',
        language: 'multi',
        smart_format: false, // 关闭智能格式化
        punctuate: false,    // 关闭标点符号
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

      if (!alternative) {
        console.log(`❌ 没有找到转录结果`);
        results.push({
          name: test.name,
          success: false,
          error: 'No alternative found',
          processingTime
        });
        continue;
      }

      const transcript = alternative.transcript || '';
      const confidence = alternative.confidence || 0;
      const languages = alternative.languages || [];
      const words = alternative.words || [];

      console.log(`✅ 处理时间: ${processingTime}ms`);
      console.log(`📝 转录结果: "${transcript}"`);
      console.log(`📊 置信度: ${confidence.toFixed(3)}`);
      console.log(`🌍 检测语言: [${languages.join(', ')}]`);
      console.log(`🔤 单词数: ${words.length}`);

      // 详细分析
      const hasChinese = /[\u4e00-\u9fff]/.test(transcript);
      const hasEnglish = /[a-zA-Z]/.test(transcript);
      const isMixed = hasChinese && hasEnglish;

      // 检查是否包含预期内容（更灵活的匹配）
      const hasChaoSiLe = transcript.includes('吵') || transcript.includes('死') || transcript.includes('了');
      const hasWhatTheFuck = transcript.toLowerCase().includes('what') && transcript.toLowerCase().includes('fuck');

      console.log(`🔍 内容检查:`);
      console.log(`  包含中文字符: ${hasChinese ? '✅' : '❌'}`);
      console.log(`  包含英文字符: ${hasEnglish ? '✅' : '❌'}`);
      console.log(`  混合语言: ${isMixed ? '✅' : '❌'}`);
      console.log(`  包含"吵死了": ${hasChaoSiLe ? '✅' : '❌'}`);
      console.log(`  包含"what...fuck": ${hasWhatTheFuck ? '✅' : '❌'}`);

      if (words.length > 0) {
        console.log(`🔤 单词详情:`);
        words.forEach((word, i) => {
          const lang = word.language || 'unknown';
          const conf = word.confidence?.toFixed(3) || 'N/A';
          console.log(`  ${i + 1}. "${word.word}" (${lang}, ${conf})`);
        });
      }

      // 评分系统
      let score = 0;
      if (hasChaoSiLe) score += 50; // 识别到中文部分
      if (hasWhatTheFuck) score += 50; // 识别到英文部分
      if (isMixed) score += 20; // 混合语言奖励
      if (languages.length > 1) score += 10; // 多语言检测奖励

      console.log(`📊 识别评分: ${score}/100`);

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
        isMixed,
        hasChaoSiLe,
        hasWhatTheFuck,
        score
      });

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

  return results;
}

async function diagnoseMixedAudio() {
  console.log('🔬 中英文混合音频详细诊断');
  console.log('🎯 目标: 识别中文"吵死了"和英文"what the fuck"');

  if (!DEEPGRAM_API_KEY) {
    console.error('❌ 请配置 DEEPGRAM_API_KEY');
    return;
  }

  // 测试新的清晰音频文件
  const test3Results = await testAudioFile('test3.wav', '吵死了，what the fuck');
  
  // 如果test2.wav存在，也进行对比测试
  const test2Exists = fs.existsSync(path.resolve(__dirname, 'test2.wav'));
  let test2Results = null;
  
  if (test2Exists) {
    test2Results = await testAudioFile('test2.wav', '吵死了，what the fuck');
  }

  // 结果分析
  console.log('\n📊 诊断结果分析');
  console.log('='.repeat(60));

  function analyzeResults(results, fileName) {
    if (!results) return;
    
    console.log(`\n📁 ${fileName} 分析:`);
    const successfulTests = results.filter(r => r.success);
    const mixedTests = results.filter(r => r.success && r.isMixed);
    const chineseTests = results.filter(r => r.success && r.hasChaoSiLe);
    const englishTests = results.filter(r => r.success && r.hasWhatTheFuck);

    console.log(`  ✅ 成功测试: ${successfulTests.length}/${results.length}`);
    console.log(`  🌏 混合语言识别: ${mixedTests.length}/${successfulTests.length}`);
    console.log(`  🇨🇳 识别到中文部分: ${chineseTests.length}/${successfulTests.length}`);
    console.log(`  🇺🇸 识别到英文部分: ${englishTests.length}/${successfulTests.length}`);

    // 最佳结果
    const bestResult = successfulTests.reduce((best, current) => {
      return (current.score > (best?.score || 0)) ? current : best;
    }, null);

    if (bestResult) {
      console.log(`  🏆 最佳结果: ${bestResult.name} (${bestResult.score}/100分)`);
      console.log(`    转录: "${bestResult.transcript}"`);
      console.log(`    置信度: ${bestResult.confidence?.toFixed(3)}`);
      console.log(`    语言: [${bestResult.languages.join(', ')}]`);
    }

    return { successfulTests, mixedTests, chineseTests, englishTests, bestResult };
  }

  const test3Analysis = analyzeResults(test3Results, 'test3.wav');
  const test2Analysis = test2Results ? analyzeResults(test2Results, 'test2.wav') : null;

  // 对比分析
  if (test2Analysis && test3Analysis) {
    console.log('\n🔄 对比分析 (test2.wav vs test3.wav):');
    console.log('-'.repeat(50));
    
    const test2Score = test2Analysis.bestResult?.score || 0;
    const test3Score = test3Analysis.bestResult?.score || 0;
    
    console.log(`📊 最佳评分对比:`);
    console.log(`  test2.wav: ${test2Score}/100`);
    console.log(`  test3.wav: ${test3Score}/100`);
    console.log(`  改进程度: ${test3Score > test2Score ? '✅' : '❌'} ${test3Score - test2Score > 0 ? '+' : ''}${test3Score - test2Score}分`);
    
    console.log(`🇨🇳 中文识别对比:`);
    console.log(`  test2.wav: ${test2Analysis.chineseTests.length}/${test2Analysis.successfulTests.length} 配置成功`);
    console.log(`  test3.wav: ${test3Analysis.chineseTests.length}/${test3Analysis.successfulTests.length} 配置成功`);
    
    console.log(`🌏 混合语言识别对比:`);
    console.log(`  test2.wav: ${test2Analysis.mixedTests.length}/${test2Analysis.successfulTests.length} 配置成功`);
    console.log(`  test3.wav: ${test3Analysis.mixedTests.length}/${test3Analysis.successfulTests.length} 配置成功`);
  }

  // 问题诊断和建议
  console.log('\n🔍 问题诊断:');
  
  if (test3Analysis) {
    if (test3Analysis.chineseTests.length === 0) {
      console.log('❌ test3.wav: 所有配置都未能识别中文部分"吵死了"');
      console.log('💡 可能原因:');
      console.log('  1. 中文发音需要更加清晰');
      console.log('  2. 中英文之间需要更明显的停顿');
      console.log('  3. 录音环境仍有改进空间');
    } else {
      console.log(`✅ test3.wav: ${test3Analysis.chineseTests.length}个配置成功识别了中文部分`);
    }

    if (test3Analysis.mixedTests.length > 0) {
      console.log(`🎉 test3.wav: ${test3Analysis.mixedTests.length}个配置成功识别了混合语言！`);
      
      // 推荐最佳配置
      if (test3Analysis.bestResult && test3Analysis.bestResult.score >= 70) {
        console.log('\n💡 推荐配置:');
        console.log(`  使用: ${test3Analysis.bestResult.name}`);
        console.log('  这个配置在您的音频上表现最佳');
      }
    }
  }

  console.log('\n🚀 下一步建议:');
  if (test3Analysis?.bestResult?.score >= 70) {
    console.log('✅ test3.wav 识别效果良好！');
    console.log('💡 建议:');
    console.log('  1. 在实际应用中使用最佳配置');
    console.log('  2. 测试浏览器实时录音功能');
    console.log('  3. 系统已准备好处理中英文混合语音');
  } else {
    console.log('⚠️  识别效果仍需改进:');
    console.log('  1. 尝试更清晰的发音');
    console.log('  2. 在中英文之间增加0.5秒停顿');
    console.log('  3. 确保录音音量适中且环境安静');
    console.log('  4. 可以尝试先说中文，再说英文的顺序');
  }
}

diagnoseMixedAudio().catch(console.error); 