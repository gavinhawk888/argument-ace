import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Test Speech API called')
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 从请求头获取用户语言偏好
    const userLanguage = request.headers.get('Accept-Language') || 'en'
    const isChinesePreferred = userLanguage.includes('zh')
    
    // 中文模拟语音识别结果
    const chineseTranscripts = [
      "你总是这样说话，真的很让人生气！",
      "为什么你从来不听我的意见？",
      "我觉得你根本不理解我的想法。",
      "这种事情你已经做过很多次了。",
      "我们需要好好谈一谈这个问题。"
    ]
    
    // 英文模拟语音识别结果
    const englishTranscripts = [
      "You always talk like this, it's really annoying!",
      "Why don't you ever listen to my opinions?",
      "I don't think you understand my thoughts at all.",
      "You've done this kind of thing many times before.",
      "We need to have a serious talk about this issue."
    ]
    
    // 多语言混合模拟结果
    const multilingualTranscripts = [
      "你好 hello 世界 world",
      "I think 我觉得 this is wrong",
      "Let's go 我们走吧",
      "Thank you 谢谢你 very much",
      "这个 problem 很复杂"
    ]
    
    // 随机选择是否使用多语言模式
    const useMultilingual = Math.random() < 0.3 // 30%概率使用多语言
    
    let transcript: string
    let detectedLanguages: string[]
    let wordsWithLanguages: any[] = []
    
    if (useMultilingual) {
      // 多语言模式
      transcript = multilingualTranscripts[Math.floor(Math.random() * multilingualTranscripts.length)]
      detectedLanguages = ['en', 'zh-CN']
      
      // 模拟单词级语言信息
      const words = transcript.split(' ')
      wordsWithLanguages = words.map((word, index) => ({
        word: word,
        language: /[一-龯]/.test(word) ? 'zh-CN' : 'en',
        confidence: 0.9 + Math.random() * 0.1,
        start: index * 0.5,
        end: (index + 1) * 0.5
      }))
    } else {
      // 单语言模式
      const transcripts = isChinesePreferred ? chineseTranscripts : englishTranscripts
      transcript = transcripts[Math.floor(Math.random() * transcripts.length)]
      detectedLanguages = [isChinesePreferred ? 'zh-CN' : 'en-US']
      
      // 模拟单词级语言信息
      const words = transcript.split(/\s+/)
      wordsWithLanguages = words.map((word, index) => ({
        word: word,
        language: detectedLanguages[0],
        confidence: 0.85 + Math.random() * 0.15,
        start: index * 0.6,
        end: (index + 1) * 0.6
      }))
    }
    
    console.log('Mock transcript:', transcript)
    console.log('Mock detected languages:', detectedLanguages)
    
    return NextResponse.json({ 
      transcript,
      detectedLanguages, // 新的多语言格式
      wordsWithLanguages,
      confidence: 0.9 + Math.random() * 0.1,
      // 保持向后兼容
      detectedLanguage: detectedLanguages[0],
      isMock: true 
    })
  } catch (error) {
    console.error('Test speech error:', error)
    return NextResponse.json({ 
      error: 'Test API error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
} 