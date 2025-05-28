import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // 只在开发环境中启用此调试接口
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ 
      error: 'Debug API is only available in development environment' 
    }, { status: 404 })
  }

  try {
    console.log('Debug Audio API called')
    
    // 获取音频数据
    const audioData = await request.arrayBuffer()
    const audioBytes = new Uint8Array(audioData)
    
    // 基本信息
    const basicInfo = {
      size: audioData.byteLength,
      contentType: request.headers.get('Content-Type'),
      userAgent: request.headers.get('User-Agent'),
      acceptLanguage: request.headers.get('Accept-Language')
    }
    
    // 检查音频格式
    let formatInfo = 'Unknown'
    let isValidAudio = false
    
    // 检查WebM格式 (starts with 0x1A, 0x45, 0xDF, 0xA3)
    if (audioBytes.length >= 4 && 
        audioBytes[0] === 0x1A && 
        audioBytes[1] === 0x45 && 
        audioBytes[2] === 0xDF && 
        audioBytes[3] === 0xA3) {
      formatInfo = 'WebM'
      isValidAudio = true
    }
    // 检查WAV格式 (starts with "RIFF")
    else if (audioBytes.length >= 4 && 
             audioBytes[0] === 0x52 && 
             audioBytes[1] === 0x49 && 
             audioBytes[2] === 0x46 && 
             audioBytes[3] === 0x46) {
      formatInfo = 'WAV'
      isValidAudio = true
    }
    // 检查MP3格式 (starts with ID3 or 0xFF)
    else if (audioBytes.length >= 3 && 
             ((audioBytes[0] === 0x49 && audioBytes[1] === 0x44 && audioBytes[2] === 0x33) ||
              (audioBytes[0] === 0xFF && (audioBytes[1] & 0xE0) === 0xE0))) {
      formatInfo = 'MP3'
      isValidAudio = true
    }
    
    // 分析音频数据的统计信息
    const stats = {
      firstBytes: Array.from(audioBytes.slice(0, 16)).map(b => '0x' + b.toString(16).padStart(2, '0')),
      lastBytes: audioBytes.length > 16 ? Array.from(audioBytes.slice(-16)).map(b => '0x' + b.toString(16).padStart(2, '0')) : [],
      hasNonZeroData: audioBytes.some(b => b !== 0),
      zeroByteCount: Array.from(audioBytes).filter(b => b === 0).length,
      averageValue: Array.from(audioBytes).reduce((sum, b) => sum + b, 0) / audioBytes.length
    }
    
    // 检查是否可能是静音
    const isSilent = stats.averageValue < 10 || (stats.zeroByteCount / audioBytes.length) > 0.9
    
    const debugInfo = {
      basicInfo,
      formatInfo,
      isValidAudio,
      isSilent,
      stats,
      recommendations: [] as string[]
    }
    
    // 提供建议
    if (!isValidAudio) {
      debugInfo.recommendations.push('音频格式不被识别，请检查录音设置')
    }
    
    if (audioData.byteLength < 1000) {
      debugInfo.recommendations.push('音频文件太小，可能录音时间不够长')
    }
    
    if (isSilent) {
      debugInfo.recommendations.push('音频可能是静音的，请检查麦克风权限和音量')
    }
    
    if (audioData.byteLength === 0) {
      debugInfo.recommendations.push('没有接收到音频数据，请检查前端录音功能')
    }
    
    console.log('Audio debug info:', debugInfo)
    
    return NextResponse.json(debugInfo)
    
  } catch (error) {
    console.error('Debug audio error:', error)
    return NextResponse.json({ 
      error: 'Debug failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
} 