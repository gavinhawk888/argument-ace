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

    // 使用Deepgram进行语音识别
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      Buffer.from(audioData),
      {
        model: 'nova-2',
        language: 'zh-CN', // 支持中文
        smart_format: true,
        punctuate: true,
      }
    )

    if (error) {
      console.error('Deepgram error:', error)
      return NextResponse.json({ 
        error: 'Speech recognition failed: ' + error.message 
      }, { status: 500 })
    }

    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || ''
    console.log('Transcript:', transcript)
    
    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('Speech recognition error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
} 