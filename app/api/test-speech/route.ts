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
    
    const transcripts = isChinesePreferred ? chineseTranscripts : englishTranscripts
    const randomTranscript = transcripts[Math.floor(Math.random() * transcripts.length)]
    const detectedLanguage = isChinesePreferred ? 'zh-CN' : 'en-US'
    
    console.log('Mock transcript:', randomTranscript)
    console.log('Mock detected language:', detectedLanguage)
    
    return NextResponse.json({ 
      transcript: randomTranscript,
      detectedLanguage,
      isMock: true 
    })
  } catch (error) {
    console.error('Test speech error:', error)
    return NextResponse.json({ 
      error: 'Test API error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
} 