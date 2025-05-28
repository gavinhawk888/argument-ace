import 'dotenv/config'
import { strict as assert } from 'assert'
import fs from 'fs'
import path from 'path'
import { createDeepgramService, DeepgramService } from './lib/deepgram-service'

// 测试配置
const TEST_CONFIG = {
  audioFile: 'test3.wav',
  apiKey: process.env.DEEPGRAM_API_KEY || '',
  timeout: 30000, // 30秒超时
  expectedMinConfidence: 0.5,
  expectedMaxProcessingTime: 10000 // 10秒最大处理时间
}

// 测试结果收集器
interface TestResult {
  name: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
  details?: any
}

class DeepgramTestSuite {
  private results: TestResult[] = []
  private deepgramService: DeepgramService | null = null
  private testAudioPath: string | null = null
  private testAudioData: ArrayBuffer | null = null

  constructor() {
    console.log('🎯 Deepgram Nova-3 API 单元测试套件')
    console.log('=' .repeat(60))
  }

  // 初始化测试环境
  async setup(): Promise<void> {
    console.log('\n📋 初始化测试环境...')
    
    // 检查API密钥
    if (!TEST_CONFIG.apiKey || TEST_CONFIG.apiKey === 'your_deepgram_api_key_here') {
      throw new Error('❌ 请在.env.local中配置有效的DEEPGRAM_API_KEY')
    }

    // 查找测试音频文件
    const audioPath = path.resolve(__dirname, TEST_CONFIG.audioFile)
    if (!fs.existsSync(audioPath)) {
      throw new Error(`❌ 测试音频文件不存在: ${TEST_CONFIG.audioFile}`)
    }

    this.testAudioPath = audioPath
    this.testAudioData = fs.readFileSync(audioPath).buffer.slice(
      fs.readFileSync(audioPath).byteOffset,
      fs.readFileSync(audioPath).byteOffset + fs.readFileSync(audioPath).byteLength
    )

    // 创建Deepgram服务实例
    this.deepgramService = createDeepgramService(TEST_CONFIG.apiKey)

    console.log('✅ 测试环境初始化完成')
    console.log(`📊 音频文件: ${path.basename(audioPath)} (${this.testAudioData.byteLength} bytes)`)
  }

  // 运行单个测试
  async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now()
    console.log(`\n🧪 测试: ${testName}`)
    
    try {
      await testFn()
      const duration = Date.now() - startTime
      this.results.push({
        name: testName,
        status: 'passed',
        duration
      })
      console.log(`✅ 测试通过 (${duration}ms)`)
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.results.push({
        name: testName,
        status: 'failed',
        duration,
        error: errorMessage
      })
      console.log(`❌ 测试失败 (${duration}ms): ${errorMessage}`)
    }
  }

  // 测试1: 基础转录功能
  async testBasicTranscription(): Promise<void> {
    assert(this.deepgramService, 'Deepgram服务未初始化')
    assert(this.testAudioData, '测试音频数据未加载')

    const result = await this.deepgramService.transcribePrerecorded(this.testAudioData)
    
    // 验证返回结果结构
    assert(typeof result === 'object', '返回结果应该是对象')
    assert(typeof result.transcript === 'string', 'transcript应该是字符串')
    assert(typeof result.confidence === 'number', 'confidence应该是数字')
    assert(Array.isArray(result.detectedLanguages), 'detectedLanguages应该是数组')
    assert(Array.isArray(result.wordsWithLanguages), 'wordsWithLanguages应该是数组')

    // 验证基础数据质量
    assert(result.confidence >= 0 && result.confidence <= 1, `置信度应该在0-1之间，实际: ${result.confidence}`)
    assert(result.transcript.length > 0, '转录文本不应该为空')
    
    console.log(`  📝 转录结果: "${result.transcript}"`)
    console.log(`  🎯 置信度: ${result.confidence.toFixed(4)}`)
    console.log(`  🌐 检测语言: ${result.detectedLanguages.join(', ')}`)
  }

  // 测试2: 多语言混合识别
  async testMultilingualSupport(): Promise<void> {
    assert(this.deepgramService, 'Deepgram服务未初始化')
    assert(this.testAudioData, '测试音频数据未加载')

    const result = await this.deepgramService.transcribePrerecorded(this.testAudioData)
    
    // 验证多语言特性
    if (result.wordsWithLanguages.length > 0) {
      // 检查每个单词都有语言标识
      result.wordsWithLanguages.forEach((word, index) => {
        assert(typeof word.word === 'string', `单词${index}应该有word字段`)
        assert(typeof word.language === 'string', `单词${index}应该有language字段`)
        assert(typeof word.start_time === 'number', `单词${index}应该有start_time字段`)
        assert(typeof word.end_time === 'number', `单词${index}应该有end_time字段`)
        assert(word.start_time >= 0, `单词${index}的开始时间应该>=0`)
        assert(word.end_time > word.start_time, `单词${index}的结束时间应该>开始时间`)
      })

      // 统计语言分布
      const languageStats: { [key: string]: number } = {}
      result.wordsWithLanguages.forEach(word => {
        languageStats[word.language] = (languageStats[word.language] || 0) + 1
      })

      console.log(`  📊 单词数量: ${result.wordsWithLanguages.length}`)
      console.log(`  🏷️ 语言分布:`, languageStats)
    }
  }

  // 测试3: 性能基准测试
  async testPerformance(): Promise<void> {
    assert(this.deepgramService, 'Deepgram服务未初始化')
    assert(this.testAudioData, '测试音频数据未加载')

    const startTime = Date.now()
    const result = await this.deepgramService.transcribePrerecorded(this.testAudioData)
    const processingTime = Date.now() - startTime

    // 验证性能要求
    assert(processingTime < TEST_CONFIG.expectedMaxProcessingTime, 
      `处理时间过长: ${processingTime}ms > ${TEST_CONFIG.expectedMaxProcessingTime}ms`)
    
    assert(result.confidence >= TEST_CONFIG.expectedMinConfidence, 
      `置信度过低: ${result.confidence} < ${TEST_CONFIG.expectedMinConfidence}`)

    console.log(`  ⏱️ 处理时间: ${processingTime}ms`)
    console.log(`  🎯 置信度: ${result.confidence.toFixed(4)}`)
    
    // 计算性能指标
    const audioDuration = this.testAudioData.byteLength / (44100 * 2) // 粗略估算
    const speedRatio = audioDuration > 0 ? (processingTime / 1000) / audioDuration : 0
    console.log(`  🚀 速度比率: ${speedRatio.toFixed(2)}x (处理时间/音频时长)`)
  }

  // 测试4: 错误处理
  async testErrorHandling(): Promise<void> {
    assert(this.deepgramService, 'Deepgram服务未初始化')

    // 测试空音频数据
    try {
      await this.deepgramService.transcribePrerecorded(new ArrayBuffer(0))
      assert.fail('空音频数据应该抛出错误')
    } catch (error) {
      assert(error instanceof Error, '应该抛出Error对象')
      console.log(`  ✅ 空音频错误处理正常: ${error.message}`)
    }

    // 测试无效音频数据
    try {
      const invalidAudio = new ArrayBuffer(100)
      await this.deepgramService.transcribePrerecorded(invalidAudio)
      // 这里可能不会抛出错误，但会返回空结果
      console.log(`  ✅ 无效音频处理正常`)
    } catch (error) {
      console.log(`  ✅ 无效音频错误处理正常: ${error instanceof Error ? error.message : error}`)
    }
  }

  // 测试5: API密钥验证
  async testApiKeyValidation(): Promise<void> {
    // 测试无效API密钥
    try {
      const invalidService = createDeepgramService('invalid_api_key')
      const testAudio = new ArrayBuffer(1024)
      await invalidService.transcribePrerecorded(testAudio)
      assert.fail('无效API密钥应该抛出错误')
    } catch (error) {
      assert(error instanceof Error, '应该抛出Error对象')
      console.log(`  ✅ API密钥验证正常: ${error.message}`)
    }
  }

  // 测试6: 数据格式验证
  async testDataFormat(): Promise<void> {
    assert(this.deepgramService, 'Deepgram服务未初始化')
    assert(this.testAudioData, '测试音频数据未加载')

    const result = await this.deepgramService.transcribePrerecorded(this.testAudioData)
    
    // 验证时间戳格式
    if (result.wordsWithLanguages && result.wordsWithLanguages.length > 0) {
      let previousEndTime = 0
      result.wordsWithLanguages.forEach((word, index) => {
        // 验证时间戳递增
        assert(word.start_time >= previousEndTime, 
          `单词${index}的时间戳顺序错误: ${word.start_time} < ${previousEndTime}`)
        previousEndTime = word.end_time

        // 验证语言代码格式
        assert(word.language && word.language.length >= 2, `语言代码格式错误: ${word.language}`)
        
        // 验证单词不为空
        assert(word.word && word.word.trim().length > 0, `单词${index}不应该为空`)
      })
      console.log(`  ✅ 数据格式验证通过 (${result.wordsWithLanguages.length}个单词)`)
    } else {
      console.log(`  ✅ 数据格式验证通过 (无单词数据)`)
    }
  }

  // 生成测试报告
  generateReport(): void {
    console.log('\n📊 测试报告')
    console.log('=' .repeat(60))
    
    const passed = this.results.filter(r => r.status === 'passed').length
    const failed = this.results.filter(r => r.status === 'failed').length
    const total = this.results.length
    
    console.log(`📈 总体结果: ${passed}/${total} 通过 (${((passed/total)*100).toFixed(1)}%)`)
    
    if (failed > 0) {
      console.log('\n❌ 失败的测试:')
      this.results.filter(r => r.status === 'failed').forEach(result => {
        console.log(`  • ${result.name}: ${result.error}`)
      })
    }
    
    console.log('\n⏱️ 执行时间:')
    this.results.forEach(result => {
      const status = result.status === 'passed' ? '✅' : '❌'
      console.log(`  ${status} ${result.name}: ${result.duration}ms`)
    })

    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0)
    console.log(`\n🕒 总执行时间: ${totalTime}ms`)
    
    if (passed === total) {
      console.log('\n🎉 所有测试通过！Deepgram API 工作正常。')
    } else {
      console.log('\n⚠️ 部分测试失败，请检查配置和网络连接。')
    }
  }

  // 运行所有测试
  async runAllTests(): Promise<void> {
    try {
      await this.setup()
      
      await this.runTest('基础转录功能测试', () => this.testBasicTranscription())
      await this.runTest('多语言混合识别测试', () => this.testMultilingualSupport())
      await this.runTest('性能基准测试', () => this.testPerformance())
      await this.runTest('错误处理测试', () => this.testErrorHandling())
      await this.runTest('API密钥验证测试', () => this.testApiKeyValidation())
      await this.runTest('数据格式验证测试', () => this.testDataFormat())
      
    } catch (error) {
      console.error('❌ 测试套件初始化失败:', error instanceof Error ? error.message : error)
      console.log('\n💡 故障排除建议:')
      console.log('1. 检查 .env.local 中的 DEEPGRAM_API_KEY 配置')
      console.log('2. 确保 test3.wav 文件存在于项目根目录')
      console.log('3. 验证网络连接和API访问权限')
      console.log('4. 检查Deepgram账户余额和API配额')
    } finally {
      this.generateReport()
    }
  }
}

// 主函数
async function main() {
  const testSuite = new DeepgramTestSuite()
  await testSuite.runAllTests()
}

// 运行测试
if (require.main === module) {
  main().catch(error => {
    console.error('💥 测试执行异常:', error)
    process.exit(1)
  })
}

export { DeepgramTestSuite, TEST_CONFIG } 