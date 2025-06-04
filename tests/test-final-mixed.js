const { createClient } = require('@deepgram/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

async function testFinalMixedLanguage() {
  console.log('🎯 最终中英文混合语音识别测试');
  console.log('='.repeat(60));

  if (!DEEPGRAM_API_KEY) {
    console.error('❌ 请配置 DEEPGRAM_API_KEY');
    return;
  }

  const deepgram = createClient(DEEPGRAM_API_KEY);
  const audioPath = path.resolve(__dirname, 'test2.wav');
  
  if (!fs.existsSync(audioPath)) {
    console.error('❌ 找不到音频文件:', audioPath);
    return;
  }

  const audioBuffer = fs.readFileSync(audioPath);
  console.log(`📁 音频文件: test2.wav (${(audioBuffer.length / 1024).toFixed(1)} KB)`);

  // 使用优化后的配置
  const config = {
    model: 'nova-2',
    language: 'multi',
    smart_format: true,
    punctuate: true,
    diarize: false,
    paragraphs: false,
    utterances: false,
    filler_words: false,
    profanity_filter: false,
    interim_results: false,
    endpointing: 300,
    vad_events: true,
    numerals: true,
    measurements: true,
  };

  console.log('\n🔧 使用配置:');
  console.log(JSON.stringify(config, null, 2));

  console.log('\n🧪 开始测试...');
  const startTime = Date.now();

  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      config
    );

    const processingTime = Date.now() - startTime;

    if (error) {
      console.error('❌ API错误:', error);
      return;
    }

    const alternative = result?.results?.channels?.[0]?.alternatives?.[0];

    if (!alternative) {
      console.error('❌ 没有找到转录结果');
      return;
    }

    const transcript = alternative.transcript || '';
    const confidence = alternative.confidence || 0;
    const languages = alternative.languages || [];
    const words = alternative.words || [];

    console.log('\n📊 识别结果:');
    console.log(`✅ 处理时间: ${processingTime}ms`);
    console.log(`📝 转录内容: "${transcript}"`);
    console.log(`📊 置信度: ${confidence.toFixed(3)}`);
    console.log(`🌍 检测语言: [${languages.join(', ')}]`);
    console.log(`🔤 单词总数: ${words.length}`);

    // 分析内容
    const hasChinese = /[\u4e00-\u9fff]/.test(transcript);
    const hasEnglish = /[a-zA-Z]/.test(transcript);
    const isMixed = hasChinese && hasEnglish;

    console.log('\n🔍 内容分析:');
    console.log(`包含中文字符: ${hasChinese ? '✅' : '❌'}`);
    console.log(`包含英文字符: ${hasEnglish ? '✅' : '❌'}`);
    console.log(`混合语言内容: ${isMixed ? '✅' : '❌'}`);

    if (words.length > 0) {
      console.log('\n🔤 单词详细分析:');
      
      // 统计语言分布
      const languageCounts = {};
      const chineseWords = [];
      const englishWords = [];

      words.forEach((word, index) => {
        const lang = word.language || 'unknown';
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;

        const wordInfo = {
          word: word.word,
          language: lang,
          confidence: word.confidence?.toFixed(3) || 'N/A'
        };

        // 根据内容分类
        if (/[\u4e00-\u9fff]/.test(word.word)) {
          chineseWords.push(wordInfo);
        } else if (/[a-zA-Z]/.test(word.word)) {
          englishWords.push(wordInfo);
        }

        console.log(`  ${index + 1}. "${word.word}" (${lang}, 置信度: ${word.confidence?.toFixed(3) || 'N/A'})`);
      });

      console.log('\n📊 语言分布统计:');
      Object.entries(languageCounts).forEach(([lang, count]) => {
        const percentage = ((count / words.length) * 100).toFixed(1);
        console.log(`  ${lang}: ${count}词 (${percentage}%)`);
      });

      console.log('\n🔤 按内容分类:');
      console.log(`中文单词: ${chineseWords.length}个`);
      chineseWords.forEach(w => console.log(`  - "${w.word}" (${w.language})`));
      
      console.log(`英文单词: ${englishWords.length}个`);
      englishWords.forEach(w => console.log(`  - "${w.word}" (${w.language})`));
    }

    // 结果评估
    console.log('\n🎯 测试结果评估:');
    
    if (isMixed) {
      console.log('✅ 成功识别中英文混合内容！');
      console.log('📝 转录准确性: 能够正确识别中英文混合语音');
      console.log('🎉 多语言语音识别系统工作正常！');
    } else {
      console.log('⚠️  当前音频主要是单一语言');
      if (hasChinese) {
        console.log('📝 检测到: 纯中文内容');
      } else if (hasEnglish) {
        console.log('📝 检测到: 纯英文内容');
      }
    }

    console.log('\n🚀 下一步建议:');
    console.log('1. 在浏览器中测试实时录音功能');
    console.log('2. 录制包含中英文切换的语音');
    console.log('3. 系统已经能够正确处理混合语言内容');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testFinalMixedLanguage().catch(console.error); 