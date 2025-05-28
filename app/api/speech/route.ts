import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@deepgram/sdk'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('Speech API called')
    
    // 检查API密钥是否存在
    if (!process.env.DEEPGRAM_API_KEY || process.env.DEEPGRAM_API_KEY === 'your_deepgram_api_key_here') {
      console.error('Deepgram API key not configured')
      return NextResponse.json({ 
        error: 'Deepgram API key not configured. Please check your .env.local file.' 
      }, { status: 500 })
    }

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY)

    // 获取音频数据
    const audioData = await request.arrayBuffer()
    console.log('Audio data size:', audioData.byteLength)
    
    if (audioData.byteLength === 0) {
      return NextResponse.json({ 
        error: 'No audio data received' 
      }, { status: 400 })
    }

    // 从请求头获取用户语言偏好
    const userLanguage = request.headers.get('Accept-Language') || 'en'
    const preferredLanguage = userLanguage.includes('zh') ? 'zh-CN' : 'en-US'
    
    console.log('User language preference:', userLanguage, '-> Using:', preferredLanguage)

    // 使用Deepgram进行语音识别 - 支持多语言
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      Buffer.from(audioData),
      {
        model: 'nova-2',
        language: preferredLanguage, // 根据用户偏好选择语言
        smart_format: true,
        punctuate: true,
        detect_language: true, // 启用语言自动检测
      }
    )

    if (error) {
      console.error('Deepgram error:', error)
      return NextResponse.json({ 
        error: 'Speech recognition failed: ' + error.message 
      }, { status: 500 })
    }

    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || ''
    const detectedLanguage = result.results?.channels[0]?.detected_language || preferredLanguage
    
    console.log('Transcript:', transcript)
    console.log('Detected language:', detectedLanguage)
    
    return NextResponse.json({ 
      transcript,
      detectedLanguage 
    })
  } catch (error) {
    console.error('Speech recognition error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
} 