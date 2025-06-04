// test-tencent-asr-unit.ts
// 腾讯云实时语音识别API单元测试 - 使用test3.wav文件
// 模型: 16k_zh-PY (支持中文、英文、粤语)

import dotenv from 'dotenv'
import { TencentAsrSession, TencentAsrResponse } from '../lib/tencent-asr-service'
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
  wordCount: number;
  audioFileSize: number;
  confidence: number;
}

/**
 * 读取WAV文件并转换为PCM数据
 * 改进：支持立体声转单声道，优化音频质量
 */
function wavToPcm(wavBuffer: Buffer): ArrayBuffer {
  // WAV文件头通常是44字节，之后是PCM数据
  const headerSize = 44;
  
  if (wavBuffer.length < headerSize) {
    throw new Error('WAV文件太小，可能不是有效的WAV文件');
  }
  
  // 检查WAV文件头
  const riffHeader = wavBuffer.toString('ascii', 0, 4);
  const waveHeader = wavBuffer.toString('ascii', 8, 12);
  
  if (riffHeader !== 'RIFF' || waveHeader !== 'WAVE') {
    throw new Error('不是有效的WAV文件格式');
  }
  
  console.log('📄 WAV文件信息:');
  console.log('   - 文件大小:', wavBuffer.length, '字节');
  console.log('   - RIFF头:', riffHeader);
  console.log('   - WAVE头:', waveHeader);
  
  // 读取音频格式信息
  const audioFormat = wavBuffer.readUInt16LE(20);
  const numChannels = wavBuffer.readUInt16LE(22);
  const sampleRate = wavBuffer.readUInt32LE(24);
  const bitsPerSample = wavBuffer.readUInt16LE(34);
  
  console.log('   - 音频格式:', audioFormat === 1 ? 'PCM' : `格式代码${audioFormat}`);
  console.log('   - 声道数:', numChannels);
  console.log('   - 采样率:', sampleRate, 'Hz');
  console.log('   - 位深度:', bitsPerSample, 'bit');
  
  // 提取PCM数据
  const pcmData = wavBuffer.slice(headerSize);
  console.log('   - PCM数据大小:', pcmData.length, '字节');
  console.log('   - 音频时长:', (pcmData.length / (sampleRate * numChannels * (bitsPerSample / 8))).toFixed(2), '秒');
  
  // 如果是立体声，转换为单声道
  if (numChannels === 2 && bitsPerSample === 16) {
    console.log('🔄 检测到立体声，转换为单声道...');
    
    const stereoSamples = new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength / 2);
    const monoSamples = new Int16Array(stereoSamples.length / 2);
    
    // 取左右声道的平均值
    for (let i = 0; i < monoSamples.length; i++) {
      const left = stereoSamples[i * 2];
      const right = stereoSamples[i * 2 + 1];
      monoSamples[i] = Math.round((left + right) / 2);
    }
    
    console.log('✅ 立体声转单声道完成');
    console.log('   - 转换后大小:', monoSamples.byteLength, '字节');
    console.log('   - 转换后时长:', (monoSamples.byteLength / (sampleRate * 1 * (bitsPerSample / 8))).toFixed(2), '秒');
    
    return monoSamples.buffer.slice(monoSamples.byteOffset, monoSamples.byteOffset + monoSamples.byteLength);
  }
  
  return pcmData.buffer.slice(pcmData.byteOffset, pcmData.byteOffset + pcmData.byteLength);
}

/**
 * 使用test3.wav文件测试腾讯云ASR
 */
async function testTencentAsrWithWavFile(): Promise<TestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let finalTranscript = '';
    let detectedLanguages: string[] = [];
    let wordCount = 0;
    let confidence = 0;
    let hasError = false;
    let errorMessage = '';

    console.log('\n📝 开始腾讯云ASR WAV文件测试...');
    console.log('='.repeat(60));

    // 检查环境变量
    if (!process.env.TENCENT_ASR_APPID || !process.env.TENCENT_ASR_SECRET_ID || !process.env.TENCENT_ASR_SECRET_KEY) {
      resolve({
        testName: 'WAV文件识别测试',
        success: false,
        transcript: '',
        processingTime: 0,
        error: '腾讯云ASR环境变量未配置',
        detectedLanguages: [],
        wordCount: 0,
        audioFileSize: 0,
        confidence: 0
      });
      return;
    }

    // 读取test3.wav文件
    const wavFilePath = path.join(__dirname, 'test3.wav');
    
    if (!fs.existsSync(wavFilePath)) {
      resolve({
        testName: 'WAV文件识别测试',
        success: false,
        transcript: '',
        processingTime: 0,
        error: 'test3.wav文件不存在',
        detectedLanguages: [],
        wordCount: 0,
        audioFileSize: 0,
        confidence: 0
      });
      return;
    }

    let wavBuffer: Buffer;
    let pcmData: ArrayBuffer;
    
    try {
      wavBuffer = fs.readFileSync(wavFilePath);
      console.log('✅ 成功读取WAV文件:', wavFilePath);
      
      // 转换为PCM数据
      pcmData = wavToPcm(wavBuffer);
      console.log('✅ WAV转PCM成功');
      
    } catch (error) {
      console.error('❌ 读取或转换WAV文件失败:', error);
      resolve({
        testName: 'WAV文件识别测试',
        success: false,
        transcript: '',
        processingTime: 0,
        error: `文件处理失败: ${error instanceof Error ? error.message : '未知错误'}`,
        detectedLanguages: [],
        wordCount: 0,
        audioFileSize: 0,
        confidence: 0
      });
      return;
    }

    // 创建腾讯云ASR会话
    const session = new TencentAsrSession({
      appId: process.env.TENCENT_ASR_APPID!,
      secretId: process.env.TENCENT_ASR_SECRET_ID!,
      secretKey: process.env.TENCENT_ASR_SECRET_KEY!,
      engineModelType: '16k_zh-PY',
      voiceFormat: 1, // PCM
      needVad: 1, // 启用静音检测
      onHandlers: {
        onOpen: () => {
          console.log('✅ 腾讯云ASR连接成功');
          console.log('🎵 开始发送WAV音频数据...');
          
          // 分块发送音频数据
          const chunkSize = 1280; // 16kHz * 16bit * 1channel * 40ms = 1280 bytes
          let offset = 0;
          let chunkCount = 0;
          
          const sendChunk = () => {
            if (offset < pcmData.byteLength && !hasError) {
              const chunk = pcmData.slice(offset, offset + chunkSize);
              session.sendAudio(chunk);
              offset += chunkSize;
              chunkCount++;
              
              if (chunkCount % 25 === 0) { // 每秒输出一次进度（25 * 40ms = 1000ms）
                const progress = ((offset / pcmData.byteLength) * 100).toFixed(1);
                console.log(`📊 发送进度: ${progress}% (${chunkCount}个音频块)`);
              }
              
              // 模拟40ms间隔发送
              setTimeout(sendChunk, 40);
            } else {
              console.log('🏁 音频数据发送完毕，发送结束信号');
              console.log(`📊 总共发送: ${chunkCount}个音频块，${offset}字节`);
              session.end();
            }
          };
          
          // 开始发送数据
          sendChunk();
        },
        onMessage: (response: TencentAsrResponse) => {
          console.log('📨 收到腾讯云ASR响应:');
          console.log('   - 代码:', response.code);
          console.log('   - 消息:', response.message);
          
          if (response.code === 0 && response.result) {
            const result = response.result;
            console.log('   - 切片类型:', result.slice_type);
            console.log('   - 开始时间:', result.start_time, 'ms');
            console.log('   - 结束时间:', result.end_time, 'ms');
            console.log('   - 识别文本:', result.voice_text_str);
            
            // 更新最终识别结果
            if (result.slice_type === 1 || result.slice_type === 2) {
              // 最终结果或段落结束
              if (result.voice_text_str) {
                finalTranscript = result.voice_text_str;
                
                // 分析识别的文本，检测语言
                const hasChinese = /[\u4e00-\u9fff]/.test(finalTranscript);
                const hasEnglish = /[a-zA-Z]/.test(finalTranscript);
                const hasNumbers = /\d/.test(finalTranscript);
                
                // 粤语检测（基于常见粤语词汇和语法特征）
                const cantonesePatterns = [
                  /係/, /啦/, /喇/, /嘅/, /咗/, /緊/, /冇/, /佢/, /咁/, /嗎/, /呀/, /囉/, /喎/, /咩/, /乜/, /麼/, /點/, /做咩/, /咪係/, /得唔得/
                ];
                const hasCantonese = cantonesePatterns.some(pattern => pattern.test(finalTranscript));
                
                detectedLanguages = [];
                if (hasChinese) {
                  if (hasCantonese) {
                    detectedLanguages.push('zh-HK'); // 粤语
                  } else {
                    detectedLanguages.push('zh'); // 普通话
                  }
                }
                if (hasEnglish) detectedLanguages.push('en');
                
                // 统计词汇数量
                wordCount = result.word_size || finalTranscript.split(/\s+/).filter(w => w.length > 0).length;
                
                // 设置置信度（简单估算）
                confidence = 0.85; // 腾讯云通常不提供置信度，给一个合理估值
                
                console.log('🎯 识别结果更新:');
                console.log('   - 文本长度:', finalTranscript.length);
                console.log('   - 词汇数量:', wordCount);
                console.log('   - 检测语言:', detectedLanguages.join(', '));
                console.log('   - 包含中文:', hasChinese ? '是' : '否');
                console.log('   - 包含英文:', hasEnglish ? '是' : '否');
                console.log('   - 包含数字:', hasNumbers ? '是' : '否');
                console.log('   - 检测到粤语特征:', hasCantonese ? '是' : '否');
              }
            }
          } else if (response.code !== 0) {
            console.error('❌ 腾讯云ASR返回错误:', response.message);
            hasError = true;
            errorMessage = `ASR错误 ${response.code}: ${response.message}`;
            session.close();
          }
          
          // 如果是最终消息
          if (response.final === 1) {
            console.log('🎉 腾讯云ASR识别完成！');
            session.close();
            
            const processingTime = Date.now() - startTime;
            resolve({
              testName: 'WAV文件识别测试',
              success: true,
              transcript: finalTranscript,
              processingTime,
              detectedLanguages,
              wordCount,
              audioFileSize: wavBuffer.length,
              confidence
            });
          }
        },
        onError: (event) => {
          console.error('❌ 腾讯云ASR WebSocket错误:', event);
          hasError = true;
          errorMessage = 'WebSocket连接错误';
          session.close();
        },
        onClose: (event) => {
          console.log('🔌 腾讯云ASR连接关闭:', event.code, event.reason);
          
          if (!hasError) {
            const processingTime = Date.now() - startTime;
            resolve({
              testName: 'WAV文件识别测试',
              success: finalTranscript.length > 0,
              transcript: finalTranscript,
              processingTime,
              error: finalTranscript.length === 0 ? '未识别到任何内容' : undefined,
              detectedLanguages,
              wordCount,
              audioFileSize: wavBuffer.length,
              confidence
            });
          } else {
            const processingTime = Date.now() - startTime;
            resolve({
              testName: 'WAV文件识别测试',
              success: false,
              transcript: finalTranscript,
              processingTime,
              error: errorMessage,
              detectedLanguages,
              wordCount,
              audioFileSize: wavBuffer.length,
              confidence
            });
          }
        }
      }
    });

    // 开始连接
    session.connect().catch(error => {
      console.error('❌ 腾讯云ASR连接失败:', error);
      hasError = true;
      
      resolve({
        testName: 'WAV文件识别测试',
        success: false,
        transcript: '',
        processingTime: Date.now() - startTime,
        error: `连接失败: ${error.message}`,
        detectedLanguages: [],
        wordCount: 0,
        audioFileSize: wavBuffer.length,
        confidence: 0
      });
    });

    // 设置超时（60秒，因为音频文件可能较长）
    setTimeout(() => {
      if (!hasError) {
        hasError = true;
        session.close();
        console.warn('⚠️ 测试超时（60秒）');
        
        resolve({
          testName: 'WAV文件识别测试',
          success: false,
          transcript: finalTranscript,
          processingTime: Date.now() - startTime,
          error: '测试超时（60秒）',
          detectedLanguages,
          wordCount,
          audioFileSize: wavBuffer.length,
          confidence
        });
      }
    }, 60000); // 60秒超时
  });
}

/**
 * 显示详细测试结果
 */
function displayDetailedResult(result: TestResult) {
  console.log('\n📊 详细测试结果');
  console.log('='.repeat(60));
  
  const status = result.success ? '✅ 成功' : '❌ 失败';
  console.log(`状态: ${status}`);
  console.log(`测试名称: ${result.testName}`);
  console.log(`处理时间: ${result.processingTime}ms`);
  console.log(`音频文件大小: ${(result.audioFileSize / 1024).toFixed(2)} KB`);
  
  if (result.success) {
    console.log(`\n🎯 识别结果:`);
    console.log(`文本内容: "${result.transcript}"`);
    console.log(`文本长度: ${result.transcript.length} 字符`);
    console.log(`词汇数量: ${result.wordCount} 个`);
    console.log(`检测语言: ${result.detectedLanguages.join(', ') || '未检测到'}`);
    console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`);
    
    // 计算性能指标
    const audioSizeKB = result.audioFileSize / 1024;
    const processingSpeed = audioSizeKB / (result.processingTime / 1000); // KB/s
    console.log(`\n⚡ 性能指标:`);
    console.log(`处理速度: ${processingSpeed.toFixed(2)} KB/s`);
    console.log(`每字符耗时: ${(result.processingTime / result.transcript.length).toFixed(2)} ms/字符`);
    
    // 内容分析
    const hasChinese = /[\u4e00-\u9fff]/.test(result.transcript);
    const hasEnglish = /[a-zA-Z]/.test(result.transcript);
    const hasNumbers = /\d/.test(result.transcript);
    const hasPunctuation = /[，。！？；：、""''（）【】]/.test(result.transcript);
    
    // 粤语特征检测
    const cantonesePatterns = [
      /係/, /啦/, /喇/, /嘅/, /咗/, /緊/, /冇/, /佢/, /咁/, /嗎/, /呀/, /囉/, /喎/, /咩/, /乜/, /麼/, /點/, /做咩/, /咪係/, /得唔得/
    ];
    const hasCantonese = cantonesePatterns.some(pattern => pattern.test(result.transcript));
    
    console.log(`\n📝 内容分析:`);
    console.log(`包含中文: ${hasChinese ? '是' : '否'}`);
    console.log(`包含英文: ${hasEnglish ? '是' : '否'}`);
    console.log(`包含数字: ${hasNumbers ? '是' : '否'}`);
    console.log(`包含标点: ${hasPunctuation ? '是' : '否'}`);
    console.log(`粤语特征: ${hasCantonese ? '是' : '否'}`);
    
    if (hasCantonese) {
      const detectedCantoneseWords = cantonesePatterns
        .filter(pattern => pattern.test(result.transcript))
        .map(pattern => pattern.source);
      console.log(`检测到的粤语词汇模式: ${detectedCantoneseWords.join(', ')}`);
    }
    
  } else {
    console.log(`\n❌ 错误信息: ${result.error}`);
  }
}

/**
 * 主测试函数
 */
async function main() {
  console.log('🚀 腾讯云ASR单元测试 - test3.wav文件');
  console.log('='.repeat(60));
  console.log('📍 测试文件: test3.wav');
  console.log('🎯 测试模型: 16k_zh-PY（支持中文、英文、粤语）');
  console.log('📖 官方文档: https://cloud.tencent.com/document/api/1093/48982');
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
      console.error('参考: README-API-SETUP.md');
      return;
    }
    
    console.log('✅ 环境变量配置完整');
    
    // 检查文件是否存在
    const wavFilePath = path.join(__dirname, 'test3.wav');
    if (!fs.existsSync(wavFilePath)) {
      console.error('❌ test3.wav文件不存在');
      console.error('请确保test3.wav文件在项目根目录下');
      return;
    }
    
    console.log('✅ test3.wav文件存在');
    
    // 运行测试
    const result = await testTencentAsrWithWavFile();
    
    // 显示详细结果
    displayDetailedResult(result);
    
    const totalTime = Date.now() - startTime;
    console.log(`\n⏱️ 总测试时间: ${totalTime}ms`);
    
    if (result.success) {
      console.log('🎉 测试成功完成！');
      console.log('\n💡 提示: 如果识别结果不理想，可能的原因:');
      console.log('   - 音频质量不佳（噪音、音量低等）');
      console.log('   - 音频格式不匹配（建议16kHz, 16bit, 单声道）');
      console.log('   - 说话内容包含方言或口音');
      console.log('   - 网络连接不稳定');
    } else {
      console.log('❌ 测试失败');
      console.log('\n🔧 故障排除建议:');
      console.log('   1. 检查API密钥配置是否正确');
      console.log('   2. 确认腾讯云语音识别服务已开通');
      console.log('   3. 检查网络连接');
      console.log('   4. 查看控制台详细错误信息');
      console.log('   5. 参考文档: README-API-SETUP.md');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生异常:', error);
    console.error('\n请检查:');
    console.error('  - test3.wav文件是否存在且格式正确');
    console.error('  - 环境变量是否正确配置');
    console.error('  - 网络连接是否正常');
  }
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

export { testTencentAsrWithWavFile }; 