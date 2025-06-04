import { createClient } from '@deepgram/sdk'
import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: '.env.local' })

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY

async function testMultilingualMode() {
  console.log('🧪 多语言模式单元测试')
  console.log('=' .repeat(50))

  if (!DEEPGRAM_API_KEY || DEEPGRAM_API_KEY === 'your_deepgram_api_key_here') {
    console.error('❌ 请在.env.local中配置有效的DEEPGRAM_API_KEY')
    return
  }

  const deepgram = createClient(DEEPGRAM_API_KEY)

  // 创建一个简单的WebM音频数据用于测试
  const createMockWebMAudio = (): Buffer => {
    // WebM文件头
    const webmHeader = new Uint8Array([
      0x1A, 0x45, 0xDF, 0xA3, // EBML Header
      0x9F, 0x42, 0x86, 0x81, 0x01,
      0x42, 0xF7, 0x81, 0x01,
      0x42, 0xF2, 0x81, 0x04,
      0x42, 0xF3, 0x81, 0x08,
      0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6D, // "webm"
      0x42, 0x87, 0x81, 0x04,
      0x42, 0x85, 0x81, 0x02,
    ])

    // 添加一些随机音频数据
    const audioData = new Uint8Array(5000)
    for (let i = 0; i < audioData.length; i++) {
      audioData[i] = Math.floor(Math.random() * 256)
    }

    // 合并头部和数据
    const combined = new Uint8Array(webmHeader.length + audioData.length)
    combined.set(webmHeader, 0)
    combined.set(audioData, webmHeader.length)

    return Buffer.from(combined)
  }

  const testConfigs = [
    {
      name: '多语言模式 (language: multi)',
      config: {
        model: 'nova-2',
        language: 'multi',
        smart_format: true,
        punctuate: true,
        diarize: false,
        paragraphs: false,
        utterances: false,
        filler_words: false,
        profanity_filter: false,
      }
    },
    {
      name: '中文单语言模式 (language: zh-CN)',
      config: {
        model: 'nova-2',
        language: 'zh-CN',
        smart_format: true,
        punctuate: true,
        diarize: false,
        paragraphs: false,
        utterances: false,
        filler_words: false,
        profanity_filter: false,
      }
    },
    {
      name: '英文单语言模式 (language: en-US)',
      config: {
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        punctuate: true,
        diarize: false,
        paragraphs: false,
        utterances: false,
        filler_words: false,
        profanity_filter: false,
      }
    }
  ]

  const results = []

  for (const test of testConfigs) {
    console.log(`\n🧪 测试: ${test.name}`)
    console.log('-' .repeat(30))

    const startTime = Date.now()
    
    try {
      const mockAudio = createMockWebMAudio()
      console.log(`📁 模拟音频大小: ${mockAudio.length} bytes`)

      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        mockAudio,
        test.config
      )

      const processingTime = Date.now() - startTime

      if (error) {
        console.log(`❌ API错误: ${error.message}`)
        results.push({
          name: test.name,
          success: false,
          error: error.message,
          processingTime
        })
        continue
      }

      // 分析响应结构
      const hasResults = !!result?.results
      const hasChannels = !!result?.results?.channels
      const channelCount = result?.results?.channels?.length || 0
      const alternative = result?.results?.channels?.[0]?.alternatives?.[0]

      console.log(`✅ API调用成功`)
      console.log(`📊 处理时间: ${processingTime}ms`)
      console.log(`📋 响应结构:`)
      console.log(`  - hasResults: ${hasResults}`)
      console.log(`  - hasChannels: ${hasChannels}`)
      console.log(`  - channelCount: ${channelCount}`)
      console.log(`  - hasAlternative: ${!!alternative}`)

      if (alternative) {
        console.log(`📝 转录结果:`)
        console.log(`  - transcript: "${alternative.transcript || ''}"`)
        console.log(`  - confidence: ${alternative.confidence || 0}`)
        console.log(`  - languages: [${(alternative.languages || []).join(', ')}]`)
        console.log(`  - words count: ${(alternative.words || []).length}`)

        // 检查多语言特性
        if (test.config.language === 'multi') {
          console.log(`🌍 多语言特性检查:`)
          console.log(`  - 支持languages字段: ${!!alternative.languages}`)
          console.log(`  - 支持words字段: ${!!alternative.words}`)
          
          if (alternative.words && alternative.words.length > 0) {
            console.log(`  - 单词级语言信息:`)
            alternative.words.slice(0, 3).forEach((word: any, i: number) => {
              console.log(`    ${i + 1}. "${word.word}" (${word.language})`)
            })
          }
        }

        results.push({
          name: test.name,
          success: true,
          transcript: alternative.transcript || '',
          confidence: alternative.confidence || 0,
          languages: alternative.languages || [],
          wordsCount: (alternative.words || []).length,
          processingTime,
          hasLanguageInfo: !!(alternative.languages && alternative.languages.length > 0),
          hasWordLevelLanguage: !!(alternative.words && alternative.words.length > 0 && alternative.words[0].language)
        })
      } else {
        console.log(`❌ 没有找到转录结果`)
        results.push({
          name: test.name,
          success: false,
          error: 'No alternative found',
          processingTime
        })
      }

    } catch (error) {
      const processingTime = Date.now() - startTime
      console.log(`❌ 测试失败: ${error instanceof Error ? error.message : '未知错误'}`)
      results.push({
        name: test.name,
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        processingTime
      })
    }
  }

  // 测试结果总结
  console.log('\n📊 测试结果总结')
  console.log('=' .repeat(50))

  const successfulTests = results.filter(r => r.success)
  const failedTests = results.filter(r => !r.success)

  console.log(`✅ 成功: ${successfulTests.length}/${results.length}`)
  console.log(`❌ 失败: ${failedTests.length}/${results.length}`)

  if (successfulTests.length > 0) {
    console.log('\n🎯 成功的测试:')
    successfulTests.forEach(result => {
      console.log(`  - ${result.name}: ${result.processingTime}ms`)
      if (result.hasLanguageInfo) {
        console.log(`    🌍 支持多语言检测: ${result.languages.join(', ')}`)
      }
      if (result.hasWordLevelLanguage) {
        console.log(`    🔤 支持单词级语言标记`)
      }
    })
  }

  if (failedTests.length > 0) {
    console.log('\n❌ 失败的测试:')
    failedTests.forEach(result => {
      console.log(`  - ${result.name}: ${result.error}`)
    })
  }

  // 性能对比
  if (successfulTests.length > 1) {
    console.log('\n⚡ 性能对比:')
    const avgTime = successfulTests.reduce((sum, r) => sum + r.processingTime, 0) / successfulTests.length
    console.log(`平均处理时间: ${avgTime.toFixed(0)}ms`)
    
    successfulTests.forEach(result => {
      const diff = result.processingTime - avgTime
      const diffStr = diff > 0 ? `+${diff.toFixed(0)}ms` : `${diff.toFixed(0)}ms`
      console.log(`  ${result.name}: ${result.processingTime}ms (${diffStr})`)
    })
  }

  // 多语言功能验证
  const multilingualResult = results.find(r => r.name.includes('多语言模式'))
  if (multilingualResult && multilingualResult.success) {
    console.log('\n🌍 多语言功能验证:')
    console.log(`✅ 多语言模式API调用成功`)
    console.log(`✅ 响应格式正确`)
    
    if (multilingualResult.hasLanguageInfo) {
      console.log(`✅ 支持languages字段`)
    } else {
      console.log(`⚠️  languages字段为空（可能是因为模拟音频没有实际语音内容）`)
    }
    
    if (multilingualResult.hasWordLevelLanguage) {
      console.log(`✅ 支持单词级语言检测`)
    } else {
      console.log(`⚠️  单词级语言信息为空（可能是因为模拟音频没有实际语音内容）`)
    }
  } else {
    console.log('\n❌ 多语言功能验证失败')
  }

  console.log('\n💡 注意事项:')
  console.log('- 此测试使用模拟音频数据，可能不会产生实际的转录结果')
  console.log('- 主要目的是验证API配置和响应格式的正确性')
  console.log('- 要测试实际的多语言识别，需要包含真实语音的音频文件')
}

// 运行测试
if (require.main === module) {
  testMultilingualMode().catch(console.error)
}

export { testMultilingualMode } 