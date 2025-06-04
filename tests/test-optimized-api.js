const fs = require('fs');
const path = require('path');

async function testOptimizedAPI() {
  console.log('🧪 测试优化后的多语言API');
  console.log('='.repeat(50));

  const audioPath = path.resolve(__dirname, 'test3.wav');
  
  if (!fs.existsSync(audioPath)) {
    console.error('❌ 找不到 test3.wav 文件');
    return;
  }

  const audioBuffer = fs.readFileSync(audioPath);
  console.log(`📁 音频文件: test3.wav (${(audioBuffer.length / 1024).toFixed(1)} KB)`);
  console.log('📝 预期内容: "吵死了，what the fuck"');
  console.log('-'.repeat(50));

  try {
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
    formData.append('audio', audioBlob, 'test3.wav');

    console.log('🚀 调用优化后的 Speech API...');
    const startTime = Date.now();

    const response = await fetch('http://localhost:3000/api/speech', {
      method: 'POST',
      body: formData,
    });

    const processingTime = Date.now() - startTime;
    console.log(`⏱️  API 响应时间: ${processingTime}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 错误:', response.status, errorText);
      return;
    }

    const result = await response.json();
    
    console.log('\n🎯 识别结果:');
    console.log('='.repeat(30));
    console.log(`📝 转录文本: "${result.transcript}"`);
    console.log(`📊 置信度: ${result.confidence?.toFixed(3) || 'N/A'}`);
    console.log(`🌍 检测语言: [${result.detectedLanguages?.join(', ') || 'N/A'}]`);
    console.log(`🔤 单词数量: ${result.wordsWithLanguages?.length || 0}`);

    // 内容分析
    const transcript = result.transcript || '';
    const hasChinese = /[\u4e00-\u9fff]/.test(transcript);
    const hasEnglish = /[a-zA-Z]/.test(transcript);
    const isMixed = hasChinese && hasEnglish;

    // 检查预期内容
    const hasChaoSiLe = transcript.includes('吵') || transcript.includes('死') || transcript.includes('了');
    const hasWhatTheFuck = transcript.toLowerCase().includes('what') && transcript.toLowerCase().includes('fuck');

    console.log('\n🔍 内容分析:');
    console.log('='.repeat(30));
    console.log(`包含中文字符: ${hasChinese ? '✅' : '❌'}`);
    console.log(`包含英文字符: ${hasEnglish ? '✅' : '❌'}`);
    console.log(`混合语言识别: ${isMixed ? '✅' : '❌'}`);
    console.log(`识别"吵死了": ${hasChaoSiLe ? '✅' : '❌'}`);
    console.log(`识别"what...fuck": ${hasWhatTheFuck ? '✅' : '❌'}`);

    // 单词级分析
    if (result.wordsWithLanguages && result.wordsWithLanguages.length > 0) {
      console.log('\n🔤 单词级语言分析:');
      console.log('='.repeat(30));
      result.wordsWithLanguages.forEach((word, i) => {
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
    if (result.detectedLanguages && result.detectedLanguages.length > 1) score += 10; // 多语言检测奖励

    console.log('\n📊 综合评分:');
    console.log('='.repeat(30));
    console.log(`总分: ${score}/100`);
    
    if (score >= 90) {
      console.log('🎉 优秀！完美识别了中英文混合内容');
    } else if (score >= 70) {
      console.log('✅ 良好！成功识别了大部分内容');
    } else if (score >= 50) {
      console.log('⚠️  一般，识别了部分内容，仍有改进空间');
    } else {
      console.log('❌ 较差，识别效果不理想');
    }

    // 与之前结果对比
    console.log('\n📈 改进分析:');
    console.log('='.repeat(30));
    console.log('优化前问题: 多语言模式只识别英文，丢失中文');
    console.log('优化策略: 添加中文模式补充，智能选择最佳结果');
    
    if (hasChaoSiLe && hasWhatTheFuck) {
      console.log('✅ 成功解决: 现在能同时识别中英文内容');
    } else if (hasChaoSiLe) {
      console.log('🔄 部分改进: 成功识别中文，英文识别需要进一步优化');
    } else if (hasWhatTheFuck) {
      console.log('🔄 部分改进: 成功识别英文，中文识别需要进一步优化');
    } else {
      console.log('❌ 仍需改进: 中英文识别都需要进一步优化');
    }

    console.log('\n💡 建议:');
    if (score >= 70) {
      console.log('✅ API 优化成功！可以在实际应用中使用');
      console.log('🚀 下一步: 在浏览器中测试实时录音功能');
    } else {
      console.log('🔧 继续优化建议:');
      console.log('  1. 调整 Deepgram 参数（endpointing, vad_events）');
      console.log('  2. 改进决策逻辑（何时选择中文模式结果）');
      console.log('  3. 优化后处理算法');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 检查是否在 Node.js 环境中运行
if (typeof window === 'undefined') {
  // Node.js 环境，使用 node-fetch
  // const fetch = require('node-fetch'); // Commented out
  // const FormData = require('form-data'); // Commented out
  // const { Blob } = require('buffer'); // Commented out
  
  // Provide dummy placeholders to avoid crashing if script structure relies on them,
  // without interfering with Next.js build.
  if (typeof fetch === 'undefined') {
    global.fetch = async () => { 
      console.warn("fetch called in Node.js context but was commented out for Next.js compatibility test."); 
      return { ok: false, text: async () => 'fetch is disabled in this test configuration' }; 
    };
  }
  if (typeof FormData === 'undefined') {
    global.FormData = function() { 
      console.warn("FormData used in Node.js context but was commented out."); 
    };
  }
  if (typeof Blob === 'undefined') {
    global.Blob = function(parts, options) { 
      console.warn("Blob used in Node.js context but was commented out."); 
      return { type: options ? options.type : 'application/octet-stream', size: parts.reduce((acc, p) => acc + (p.length || p.size || 0), 0) };
    };
  }

  testOptimizedAPI().catch(console.error);
} else {
  // 浏览器环境
  console.log('请在 Node.js 环境中运行此测试脚本');
} 