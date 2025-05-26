import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Test Speech API called')
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 返回模拟的语音识别结果
    const mockTranscripts = [
      "你总是这样说话，真的很让人生气！",
      "为什么你从来不听我的意见？",
      "我觉得你根本不理解我的想法。",
      "这种事情你已经做过很多次了。",
      "我们需要好好谈一谈这个问题。"
    ]
    
    const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)]
    
    console.log('Mock transcript:', randomTranscript)
    
    return NextResponse.json({ 
      transcript: randomTranscript,
      isMock: true 
    })
  } catch (error) {
    console.error('Test speech error:', error)
    return NextResponse.json({ 
      error: 'Test API error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
} 