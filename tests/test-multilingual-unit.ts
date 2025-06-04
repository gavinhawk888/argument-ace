import { createClient } from '@deepgram/sdk'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// 加载环境变量
dotenv.config({ path: '.env.local' })

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY

interface TestResult {
  success: boolean
  transcript: string
  languages: string[]
  wordsWithLanguages: any[]
  confidence: number
  processingTime: number
  error?: string
}

class MultilingualTester {
  private deepgram: any

  constructor() {
    if (!DEEPGRAM_API_KEY || DEEPGRAM_API_KEY === 'your_deepgram_api_key_here') {
      throw new Error('请在.env.local中配置有效的DEEPGRAM_API_KEY')
    }
    this.deepgram = createClient(DEEPGRAM_API_KEY)
  }

  // 测试多语言模式配置
  async testMultilingualConfig(): Promise<TestResult> {
    console.log('🧪 测试1: 多语言模式配置')
    
    const startTime = Date.now()
    
    try {
      // 创建一个简单的测试音频数据（实际应用中需要真实音频）
      const testAudioPath = path.resolve(__dirname, 'test-audio.wav')
      
      if (!fs.existsSync(testAudioPath)) {
        return {
          success: false,
          transcript: '',
          languages: [],
          wordsWithLanguages: [],
          confidence: 0,
          processingTime: 0,
          error: '测试音频文件不存在，请创建 test-audio.wav 文件'
        }
      }

      const audioBuffer = fs.readFileSync(testAudioPath)
      
      const { result, error } = await this.deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: 'nova-2',
          language: 'multi', // 多语言模式
          smart_format: true,
          punctuate: true,
          diarize: false,
          paragraphs: false,
          utterances: false,
          filler_words: false,
          profanity_filter: false,
        }
      )

      const processingTime = Date.now() - startTime

      if (error) {
        return {
          success: false,
          transcript: '',
          languages: [],
          wordsWithLanguages: [],
          confidence: 0,
          processingTime,
          error: error.message
        }
      }

      const alternative = result?.results?.channels[0]?.alternatives[0]
      
      return {
        success: true,
        transcript: alternative?.transcript || '',
        languages: alternative?.languages || [],
        wordsWithLanguages: alternative?.words || [],
        confidence: alternative?.confidence || 0,
        processingTime
      }

    } catch (error) {
      return {
        success: false,
        transcript: '',
        languages: [],
        wordsWithLanguages: [],
        confidence: 0,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  // 测试单语言模式（作为对比）
  async testSingleLanguageConfig(language: string): Promise<TestResult> {
    console.log(`🧪 测试2: 单语言模式 (${language})`)
    
    const startTime = Date.now()
    
    try {
      const testAudioPath = path.resolve(__dirname, 'test-audio.wav')
      
      if (!fs.existsSync(testAudioPath)) {
        return {
          success: false,
          transcript: '',
          languages: [],
          wordsWithLanguages: [],
          confidence: 0,
          processingTime: 0,
          error: '测试音频文件不存在'
        }
      }

      const audioBuffer = fs.readFileSync(testAudioPath)
      
      const { result, error } = await this.deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: 'nova-2',
          language: language, // 单语言模式
          smart_format: true,
          punctuate: true,
          diarize: false,
          paragraphs: false,
          utterances: false,
          filler_words: false,
          profanity_filter: false,
        }
      )

      const processingTime = Date.now() - startTime

      if (error) {
        return {
          success: false,
          transcript: '',
          languages: [],
          wordsWithLanguages: [],
          confidence: 0,
          processingTime,
          error: error.message
        }
      }

      const alternative = result?.results?.channels[0]?.alternatives[0]
      
      return {
        success: true,
        transcript: alternative?.transcript || '',
        languages: alternative?.languages || [language],
        wordsWithLanguages: alternative?.words || [],
        confidence: alternative?.confidence || 0,
        processingTime
      }

    } catch (error) {
      return {
        success: false,
        transcript: '',
        languages: [],
        wordsWithLanguages: [],
        confidence: 0,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  // 测试模拟音频数据
  async testWithMockAudio(): Promise<TestResult> {
    console.log('🧪 测试3: 模拟音频数据测试')
    
    const startTime = Date.now()
    
    try {
      // 创建一个最小的WebM音频头
      const mockWebMHeader = new Uint8Array([
        0x1A, 0x45, 0xDF, 0xA3, // WebM signature
        0x9F, 0x42, 0x86, 0x81, 0x01, // EBML header
        0x42, 0xF7, 0x81, 0x01,
        0x42, 0xF2, 0x81, 0x04,
        0x42, 0xF3, 0x81, 0x08,
        0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6D, // "webm"
        // 添加一些模拟音频数据
        ...new Array(1000).fill(0).map(() => Math.floor(Math.random() * 256))
      ])

      const { result, error } = await this.deepgram.listen.prerecorded.transcribeFile(
        Buffer.from(mockWebMHeader),
        {
          model: 'nova-2',
          language: 'multi',
          smart_format: true,
          punctuate: true,
        }
      )

      const processingTime = Date.now() - startTime

      if (error) {
        return {
          success: false,
          transcript: '',
          languages: [],
          wordsWithLanguages: [],
          confidence: 0,
          processingTime,
          error: error.message
        }
      }

      const alternative = result?.results?.channels[0]?.alternatives[0]
      
      return {
        success: true,
        transcript: alternative?.transcript || '',
        languages: alternative?.languages || [],
        wordsWithLanguages: alternative?.words || [],
        confidence: alternative?.confidence || 0,
        processingTime
      }

    } catch (error) {
      return {
        success: false,
        transcript: '',
        languages: [],
        wordsWithLanguages: [],
        confidence: 0,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  // 分析测试结果
  analyzeResults(results: TestResult[]): void {
    console.log('\n📊 测试结果分析')
    console.log('=' .repeat(50))
    
    results.forEach((result, index) => {
      const testName = ['多语言模式', '单语言模式(zh-CN)', '单语言模式(en-US)', '模拟音频'][index] || `测试${index + 1}`
      
      console.log(`\n${testName}:`)
      console.log(`  ✅ 成功: ${result.success}`)
      console.log(`  📝 转录: "${result.transcript}"`)
      console.log(`  🌍 语言: [${result.languages.join(', ')}]`)
      console.log(`  🔤 单词数: ${result.wordsWithLanguages.length}`)
      console.log(`  📊 置信度: ${result.confidence}`)
      console.log(`  ⏱️  处理时间: ${result.processingTime}ms`)
      
      if (result.error) {
        console.log(`  ❌ 错误: ${result.error}`)
      }
      
      if (result.wordsWithLanguages.length > 0) {
        console.log(`  🔤 单词详情:`)
        result.wordsWithLanguages.slice(0, 5).forEach((word, i) => {
          console.log(`    ${i + 1}. "${word.word}" (${word.language}, 置信度: ${word.confidence?.toFixed(3) || 'N/A'})`)
        })
        if (result.wordsWithLanguages.length > 5) {
          console.log(`    ... 还有 ${result.wordsWithLanguages.length - 5} 个单词`)
        }
      }
    })

    // 性能对比
    const successfulResults = results.filter(r => r.success)
    if (successfulResults.length > 1) {
      console.log('\n⚡ 性能对比:')
      const avgTime = successfulResults.reduce((sum, r) => sum + r.processingTime, 0) / successfulResults.length
      console.log(`  平均处理时间: ${avgTime.toFixed(0)}ms`)
      
      successfulResults.forEach((result, index) => {
        const testName = ['多语言', '中文', '英文', '模拟'][index] || `测试${index + 1}`
        const diff = result.processingTime - avgTime
        const diffStr = diff > 0 ? `+${diff.toFixed(0)}ms` : `${diff.toFixed(0)}ms`
        console.log(`  ${testName}: ${result.processingTime}ms (${diffStr})`)
      })
    }
  }

  // 运行所有测试
  async runAllTests(): Promise<void> {
    console.log('🚀 开始多语言模式单元测试')
    console.log('=' .repeat(50))
    
    const results: TestResult[] = []
    
    // 测试1: 多语言模式
    results.push(await this.testMultilingualConfig())
    
    // 测试2: 单语言模式对比
    results.push(await this.testSingleLanguageConfig('zh-CN'))
    results.push(await this.testSingleLanguageConfig('en-US'))
    
    // 测试3: 模拟音频
    results.push(await this.testWithMockAudio())
    
    // 分析结果
    this.analyzeResults(results)
    
    // 总结
    const successCount = results.filter(r => r.success).length
    console.log(`\n🎯 测试总结: ${successCount}/${results.length} 个测试通过`)
    
    if (successCount === 0) {
      console.log('❌ 所有测试都失败了，请检查API密钥和网络连接')
    } else if (successCount < results.length) {
      console.log('⚠️  部分测试失败，请查看上面的错误信息')
    } else {
      console.log('✅ 所有测试都通过了！')
    }
  }
}

// 运行测试
async function main() {
  try {
    const tester = new MultilingualTester()
    await tester.runAllTests()
  } catch (error) {
    console.error('❌ 测试初始化失败:', error)
    console.log('\n💡 解决方案:')
    console.log('1. 确保在 .env.local 中配置了有效的 DEEPGRAM_API_KEY')
    console.log('2. 检查网络连接')
    console.log('3. 确保API密钥有足够的余额')
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error)
}

export { MultilingualTester }
export type { TestResult } 