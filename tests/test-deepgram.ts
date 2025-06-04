import 'dotenv/config'
import { createClient } from '@deepgram/sdk'
import fs from 'fs'
import path from 'path'

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || '你的真实API密钥'

async function testDeepgramMultilingual() {
  console.log('🎯 开始测试 Deepgram Nova-3 多语言混合识别...')

  if (!DEEPGRAM_API_KEY || DEEPGRAM_API_KEY === '你的真实API密钥' || DEEPGRAM_API_KEY === 'your_deepgram_api_key_here') {
    console.error('❌ 请在.env.local中配置有效的DEEPGRAM_API_KEY')
    console.log('📝 获取API密钥: https://console.deepgram.com/')
    return
  }

  // 查找测试音频文件
  const possibleAudioFiles = [
    'test3.wav',
    'test.wav', 
    'test.webm',
    'test.mp3',
    'test.m4a'
  ]

  let audioPath: string | null = null
  for (const filename of possibleAudioFiles) {
    const filePath = path.resolve(__dirname, filename)
    if (fs.existsSync(filePath)) {
      audioPath = filePath
      break
    }
  }

  if (!audioPath) {
    console.error('❌ 未找到测试音频文件')
    console.log('📝 请将测试音频文件放在项目根目录，支持的格式: .wav, .webm, .mp3, .m4a')
    console.log('📝 推荐文件名: test3.wav, test.wav')
    return
  }

  const audio = fs.readFileSync(audioPath)
  const deepgram = createClient(DEEPGRAM_API_KEY)

  console.log('📊 准备发送音频文件:', path.basename(audioPath))
  console.log('📊 文件大小:', audio.length, '字节')

  try {
    const startTime = Date.now()

    // 使用 nova-3 模型和多语言混合识别
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audio,
      {
        model: 'nova-3',           // 使用最新的 Nova-3 模型
        language: 'multi',         // 启用多语言代码切换功能
        smart_format: true,        // 智能格式化
        punctuate: true,          // 自动标点
        diarize: false,           // 不需要说话人识别
        utterances: false,        // 不需要话语分割
        measurements: false,      // 不需要测量单位处理
        profanity_filter: false,  // 不过滤脏话
        redact: false,           // 不编辑敏感信息
        search: [],              // 不搜索特定词汇
        replace: [],             // 不替换词汇
        keywords: [],            // 不使用关键词提升
        numerals: false,         // 不特殊处理数字
        endpointing: 100,        // 推荐用于代码切换的端点值
      }
    )

    const processingTime = Date.now() - startTime

    if (error) {
      console.error('❌ Deepgram API 错误:', error)
      return
    }

    if (!result || !result.results || !result.results.channels || result.results.channels.length === 0) {
      console.warn('⚠️ Deepgram 未返回识别结果')
      return
    }

    const channel = result.results.channels[0]
    const alternative = channel.alternatives?.[0]

    if (!alternative) {
      console.warn('⚠️ Deepgram 未返回可用的识别结果')
      return
    }

    // 显示基本结果
    console.log('\n🎉 识别完成!')
    console.log('⏱️ 处理时间:', processingTime, 'ms')
    console.log('📝 转录文本:', alternative.transcript || '(无内容)')
    console.log('🎯 置信度:', (alternative.confidence || 0).toFixed(4))
    console.log('🌐 检测到的语言:', alternative.languages || [])

    // 显示单词级别的语言信息
    if (alternative.words && alternative.words.length > 0) {
      console.log('\n📊 单词级语言分析:')
      console.log('━'.repeat(80))
      
      alternative.words.forEach((word: any, index: number) => {
        const startTime = (word.start || 0).toFixed(2)
        const endTime = (word.end || 0).toFixed(2)
        const confidence = (word.confidence || 0).toFixed(3)
        const language = word.language || '未知'
        
        console.log(`${(index + 1).toString().padStart(3)}. ${word.word.padEnd(15)} | ${language.padEnd(4)} | ${startTime}s-${endTime}s | 置信度: ${confidence}`)
      })
      
      // 统计语言分布
      const languageStats: { [key: string]: number } = {}
      alternative.words.forEach((word: any) => {
        const lang = word.language || 'unknown'
        languageStats[lang] = (languageStats[lang] || 0) + 1
      })
      
      console.log('\n📈 语言分布统计:')
      console.log('━'.repeat(40))
      Object.entries(languageStats).forEach(([lang, count]) => {
        const percentage = ((count / alternative.words.length) * 100).toFixed(1)
        console.log(`${lang.toUpperCase().padEnd(10)}: ${count} 个单词 (${percentage}%)`)
      })
    } else {
      console.log('\n⚠️ 没有单词级别的详细信息')
    }

    // 显示完整的 API 响应信息（用于调试）
    console.log('\n🔍 API 响应详情:')
    console.log('━'.repeat(40))
    console.log('请求ID:', result.metadata?.request_id || '未知')
    console.log('音频时长:', result.metadata?.duration || '未知', '秒')
    console.log('声道数:', result.metadata?.channels || '未知')
    console.log('模型信息:', result.metadata?.model_info || '未知')

  } catch (err: any) {
    console.error('❌ API调用异常:', err)
    
    // 提供更详细的错误信息
    if (err.message?.includes('401')) {
      console.log('💡 提示: API 密钥可能无效，请检查配置')
    } else if (err.message?.includes('quota') || err.message?.includes('limit')) {
      console.log('💡 提示: API 配额可能已用完，请检查账户余额')
    } else if (err.message?.includes('audio') || err.message?.includes('format')) {
      console.log('💡 提示: 音频格式可能不受支持，尝试使用 WAV 格式')
    }
  }
}

// 测试中英文混合识别的常见场景
function showTestCases() {
  console.log('\n🧪 中英文混合识别测试用例建议:')
  console.log('━'.repeat(60))
  console.log('1. "我今天要去 meeting"')
  console.log('2. "Please help me 翻译这个句子"') 
  console.log('3. "这个 project 非常 interesting"')
  console.log('4. "Let\'s go to 北京"')
  console.log('5. "我的 email 是 test@example.com"')
  console.log('6. "今天是 Monday，明天是星期二"')
  console.log('7. "这个 API 很好用，we should use it"')
  console.log('8. "开会时间是 3 PM，地点在会议室"')
  console.log('')
  console.log('💡 提示: 录制以上任一句子作为测试音频可以验证中英文混合识别效果')
}

// 显示测试用例
showTestCases()

// 运行测试
testDeepgramMultilingual() 