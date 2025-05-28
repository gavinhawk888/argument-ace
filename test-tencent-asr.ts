// test-tencent-asr.ts
// 腾讯云实时语音识别API测试脚本

import dotenv from 'dotenv'
import { TencentAsrSession, TencentAsrResponse } from './tencent-asr-service'
import fs from 'fs'
import path from 'path'

// 加载环境变量
dotenv.config({ path: '.env.local' })

interface TestResult {
  testName: string;
  success: boolean;
  transcript: string;
  processingTime: number;
  error?: string;
  detectedLanguages: string[];
}

/**
 * 测试腾讯云ASR的基本功能
 */
async function testTencentAsrBasic(): Promise<TestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let finalTranscript = '';
    let detectedLanguages: string[] = [];
    let hasError = false;
    let errorMessage = '';

    console.log('\n📝 测试腾讯云ASR基本连接...');
    console.log('─'.repeat(50));

    // 检查环境变量
    if (!process.env.TENCENT_ASR_APPID || !process.env.TENCENT_ASR_SECRET_ID || !process.env.TENCENT_ASR_SECRET_KEY) {
      resolve({
        testName: '基本连接测试',
        success: false,
        transcript: '',
        processingTime: 0,
        error: '腾讯云ASR环境变量未配置',
        detectedLanguages: []
      });
      return;
    }

    const session = new TencentAsrSession({
      appId: process.env.TENCENT_ASR_APPID!,
      secretId: process.env.TENCENT_ASR_SECRET_ID!,
      secretKey: process.env.TENCENT_ASR_SECRET_KEY!,
      engineModelType: '16k_zh_large',
      voiceFormat: 1,
      needVad: 1,
      onHandlers: {
        onOpen: () => {
          console.log('✅ 腾讯云ASR连接成功');
          
          // 发送模拟音频数据（PCM格式）
          const sampleRate = 16000;
          const duration = 2; // 2秒
          const samples = sampleRate * duration;
          const audioBuffer = new ArrayBuffer(samples * 2); // 16bit = 2 bytes
          const audioView = new Int16Array(audioBuffer);
          
          // 生成简单的正弦波作为测试音频
          for (let i = 0; i < samples; i++) {
            audioView[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 32767;
          }
          
          console.log('🎵 发送测试音频数据');
          
          // 分块发送音频数据
          const chunkSize = 1280; // 40ms chunk
          let offset = 0;
          
          const sendChunk = () => {
            if (offset < audioBuffer.byteLength && !hasError) {
              const chunk = audioBuffer.slice(offset, offset + chunkSize);
              session.sendAudio(chunk);
              offset += chunkSize;
              setTimeout(sendChunk, 40); // 40ms interval
            } else {
              console.log('🏁 音频发送完毕，发送结束信号');
              session.end();
            }
          };
          
          sendChunk();
        },
        onMessage: (response: TencentAsrResponse) => {
          console.log('📨 收到响应:', response);
          
          if (response.code === 0) {
            if (response.result && response.result.voice_text_str) {
              finalTranscript = response.result.voice_text_str;
              
              // 检测语言
              const hasChinese = /[\u4e00-\u9fff]/.test(finalTranscript);
              const hasEnglish = /[a-zA-Z]/.test(finalTranscript);
              
              if (hasChinese) detectedLanguages.push('zh');
              if (hasEnglish) detectedLanguages.push('en');
              
              console.log('🗣️ 识别结果:', finalTranscript);
            }
            
            if (response.final === 1) {
              console.log('✅ 识别完成');
              session.close();
              
              const processingTime = Date.now() - startTime;
              resolve({
                testName: '基本连接测试',
                success: true,
                transcript: finalTranscript,
                processingTime,
                detectedLanguages
              });
            }
          } else {
            console.error('❌ ASR错误:', response.message);
            hasError = true;
            errorMessage = `ASR错误 ${response.code}: ${response.message}`;
            session.close();
          }
        },
        onError: (event) => {
          console.error('❌ 连接错误:', event);
          hasError = true;
          errorMessage = '连接错误';
          
          const processingTime = Date.now() - startTime;
          resolve({
            testName: '基本连接测试',
            success: false,
            transcript: finalTranscript,
            processingTime,
            error: errorMessage,
            detectedLanguages
          });
        },
        onClose: (event) => {
          console.log('🔌 连接关闭:', event.code, event.reason);
          
          if (!hasError) {
            const processingTime = Date.now() - startTime;
            resolve({
              testName: '基本连接测试',
              success: finalTranscript.length > 0,
              transcript: finalTranscript,
              processingTime,
              error: finalTranscript.length === 0 ? '未识别到内容' : undefined,
              detectedLanguages
            });
          }
        }
      }
    });

    // 开始连接
    session.connect().catch(error => {
      console.error('❌ 连接失败:', error);
      hasError = true;
      
      resolve({
        testName: '基本连接测试',
        success: false,
        transcript: '',
        processingTime: Date.now() - startTime,
        error: `连接失败: ${error.message}`,
        detectedLanguages: []
      });
    });

    // 超时处理
    setTimeout(() => {
      if (!hasError) {
        hasError = true;
        session.close();
        
        resolve({
          testName: '基本连接测试',
          success: false,
          transcript: finalTranscript,
          processingTime: Date.now() - startTime,
          error: '测试超时',
          detectedLanguages
        });
      }
    }, 15000); // 15秒超时
  });
}

/**
 * 测试不同的语音内容
 */
async function testDifferentContent() {
  console.log('\n🧪 测试不同语音内容场景...');
  console.log('='.repeat(60));

  const testCases = [
    {
      name: '中文测试',
      description: '测试中文识别',
      expectedLanguages: ['zh']
    },
    {
      name: '英文测试',
      description: '测试英文识别',
      expectedLanguages: ['en']
    },
    {
      name: '混合语言测试',
      description: '测试中英文混合识别',
      expectedLanguages: ['zh', 'en']
    }
  ];

  const results: TestResult[] = [];

  for (const testCase of testCases) {
    console.log(`\n🔬 ${testCase.name}: ${testCase.description}`);
    
    try {
      const result = await testTencentAsrBasic();
      result.testName = testCase.name;
      results.push(result);
      
      if (result.success) {
        console.log(`✅ ${testCase.name} 成功`);
        console.log(`   识别结果: "${result.transcript}"`);
        console.log(`   处理时间: ${result.processingTime}ms`);
        console.log(`   检测语言: ${result.detectedLanguages.join(', ')}`);
      } else {
        console.log(`❌ ${testCase.name} 失败: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ ${testCase.name} 异常:`, error);
      results.push({
        testName: testCase.name,
        success: false,
        transcript: '',
        processingTime: 0,
        error: error instanceof Error ? error.message : '未知错误',
        detectedLanguages: []
      });
    }
    
    // 测试间隔
    if (testCase !== testCases[testCases.length - 1]) {
      console.log('⏱️ 等待2秒后继续下一个测试...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}

/**
 * 显示测试统计
 */
function displayTestStats(results: TestResult[]) {
  console.log('\n📊 测试统计');
  console.log('='.repeat(60));
  
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  
  console.log(`总测试数: ${totalTests}`);
  console.log(`成功: ${successfulTests} ✅`);
  console.log(`失败: ${failedTests} ❌`);
  console.log(`成功率: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
  
  if (successfulTests > 0) {
    const avgProcessingTime = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.processingTime, 0) / successfulTests;
    
    console.log(`平均处理时间: ${avgProcessingTime.toFixed(0)}ms`);
  }
  
  console.log('\n📝 详细结果:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.testName}`);
    
    if (result.success) {
      console.log(`   识别内容: "${result.transcript}"`);
      console.log(`   处理时间: ${result.processingTime}ms`);
      if (result.detectedLanguages.length > 0) {
        console.log(`   检测语言: ${result.detectedLanguages.join(', ')}`);
      }
    } else {
      console.log(`   错误: ${result.error}`);
    }
    console.log('');
  });
}

/**
 * 主测试函数
 */
async function main() {
  console.log('🚀 腾讯云实时语音识别API测试开始');
  console.log('='.repeat(60));
  console.log('📍 基于官方文档: https://cloud.tencent.com/document/api/1093/48982');
  console.log('🎯 测试模型: 16k_zh_large（支持中英文+方言）');
  console.log('');

  const startTime = Date.now();
  
  try {
    // 检查环境变量
    console.log('🔍 检查环境变量配置...');
    const requiredEnvVars = [
      'TENCENT_ASR_APPID',
      'TENCENT_ASR_SECRET_ID', 
      'TENCENT_ASR_SECRET_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ 缺少环境变量:', missingVars.join(', '));
      console.error('请在 .env.local 文件中配置腾讯云ASR密钥');
      return;
    }
    
    console.log('✅ 环境变量配置完整');
    
    // 运行测试
    const results = await testDifferentContent();
    
    // 显示统计
    displayTestStats(results);
    
    const totalTime = Date.now() - startTime;
    console.log(`\n⏱️ 总测试时间: ${totalTime}ms`);
    console.log('🏁 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

export { testTencentAsrBasic, testDifferentContent }; 