/**
 * API性能对比测试
 * 
 * 同时测试DeepSeek和Gemini 2.0 Flash的性能表现
 * 
 * 使用方法：
 * 1. 确保.env文件中配置了所有必要的API密钥
 * 2. 运行：npx ts-node test-performance-comparison.ts
 */

import dotenv from 'dotenv';
import { runAllTests as runDeepSeekTests } from './test-generate-responses';
import { runTest as runGeminiTests } from './test-gemini-flash';

// 加载环境变量
dotenv.config();

async function runPerformanceComparison() {
  console.log('🏁 开始API性能对比测试\n');
  console.log('═'.repeat(60));

  // 检查环境变量
  const hasDeepSeekKey = !!process.env.OPENROUTER_API_KEY;
  const hasGeminiKey = !!process.env.OPENROUTER_API_KEY_GEMINI;

  if (!hasDeepSeekKey) {
    console.error('❌ 缺少 OPENROUTER_API_KEY (DeepSeek)');
  }
  if (!hasGeminiKey) {
    console.error('❌ 缺少 OPENROUTER_API_KEY_GEMINI (Gemini)');
  }

  if (!hasDeepSeekKey || !hasGeminiKey) {
    console.log('\n请在 .env 文件中配置所有必要的API密钥后重试。');
    return;
  }

  console.log('✅ 环境变量检查通过\n');

  try {
    // 运行DeepSeek测试
    console.log('🤖 开始DeepSeek API测试...');
    console.log('─'.repeat(40));
    const deepSeekStartTime = Date.now();
    await runDeepSeekTests();
    const deepSeekTotalTime = Date.now() - deepSeekStartTime;
    
    console.log('\n' + '═'.repeat(60));
    
    // 等待一段时间避免API限制
    console.log('⏳ 等待5秒后开始Gemini测试...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 运行Gemini测试
    console.log('🧠 开始Gemini 2.0 Flash API测试...');
    console.log('─'.repeat(40));
    const geminiStartTime = Date.now();
    await runGeminiTests();
    const geminiTotalTime = Date.now() - geminiStartTime;
    
    // 显示总体对比结果
    console.log('\n' + '═'.repeat(60));
    console.log('🏆 总体对比结果');
    console.log('═'.repeat(60));
    
    console.log(`DeepSeek 总测试时间: ${(deepSeekTotalTime / 1000).toFixed(1)}秒`);
    console.log(`Gemini 2.0 Flash 总测试时间: ${(geminiTotalTime / 1000).toFixed(1)}秒`);
    
    const winner = deepSeekTotalTime < geminiTotalTime ? 'DeepSeek' : 'Gemini 2.0 Flash';
    const timeDiff = Math.abs(deepSeekTotalTime - geminiTotalTime);
    
    console.log(`\n🥇 速度优胜者: ${winner}`);
    console.log(`⏱️  时间差: ${timeDiff}ms (${(timeDiff / 1000).toFixed(1)}秒)`);
    
    if (timeDiff < 1000) {
      console.log('📊 结论: 两个API的性能非常接近');
    } else if (timeDiff < 5000) {
      console.log('📊 结论: 存在明显但可接受的性能差异');
    } else {
      console.log('📊 结论: 存在显著的性能差异');
    }

  } catch (error) {
    console.error('❌ 对比测试过程中发生错误:', error);
  }

  console.log('\n🎉 性能对比测试完成！');
  console.log('\n💡 提示：');
  console.log('- 运行多次测试以获得更准确的平均值');
  console.log('- 网络条件和API服务器负载会影响结果');
  console.log('- 除了速度，还要考虑生成质量和成本因素');
}

// 如果直接运行此文件，则执行对比测试
if (require.main === module) {
  runPerformanceComparison().catch(console.error);
}

export { runPerformanceComparison }; 