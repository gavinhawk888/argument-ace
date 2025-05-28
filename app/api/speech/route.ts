import { NextRequest, NextResponse } from 'next/server'
import { createDeepgramService } from '@/lib/deepgram-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Deepgram 语音识别 API 调用开始')
    
    // 检查 Deepgram API 密钥是否存在
    if (!process.env.DEEPGRAM_API_KEY) {
      console.error('❌ Deepgram API 密钥未配置')
      return NextResponse.json({ 
        error: 'Deepgram API 密钥未配置，请检查 .env.local 文件中的 DEEPGRAM_API_KEY' 
      }, { status: 500 })
    }

    // 获取用户选择的语言
    const searchParams = request.nextUrl.searchParams
    const languageFromQuery = searchParams.get('language')
    const languageFromHeader = request.headers.get('X-Language') || request.headers.get('Accept-Language')
    const selectedLanguage = languageFromQuery || languageFromHeader || 'english'
    
    console.log('🌐 用户选择的语言:', selectedLanguage)

    // 检查是否为FormData格式
    const contentType = request.headers.get('Content-Type') || '';
    let audioData: ArrayBuffer;

    if (contentType.includes('multipart/form-data')) {
      // FormData格式
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File | null;

      if (!audioFile) {
        return NextResponse.json({ error: 'FormData中没有找到音频文件' }, { status: 400 });
      }

      audioData = await audioFile.arrayBuffer();
    } else {
      // 直接的音频blob格式
      audioData = await request.arrayBuffer();
    }

    console.log('📊 音频数据大小:', audioData.byteLength, '字节')
    
    if (audioData.byteLength === 0) {
      return NextResponse.json({ 
        error: '没有接收到音频数据' 
      }, { status: 400 })
    }

    // 检查音频数据大小是否合理
    if (audioData.byteLength < 1000) {
      console.warn('⚠️ 音频数据似乎太小:', audioData.byteLength, '字节')
    }

    const startTime = Date.now()
    
    try {
      // 创建 Deepgram 服务实例
      const deepgramService = createDeepgramService(process.env.DEEPGRAM_API_KEY!)
      
      // 使用 Deepgram 进行语音识别，传入用户选择的语言
      const result = await deepgramService.transcribePrerecorded(audioData, selectedLanguage)
      
      const processingTime = Date.now() - startTime
      console.log('⏱️ Deepgram 处理时间:', processingTime, 'ms')

      // 构建响应
      const response = {
        transcript: result.transcript,
        confidence: result.confidence,
        detectedLanguages: result.detectedLanguages,
        wordsWithLanguages: result.wordsWithLanguages,
        processingTime,
        source: 'deepgram_nova3',
        selectedLanguage,
        debug: {
          audioSize: audioData.byteLength,
          processingTime,
          model: 'nova-3',
          language: selectedLanguage,
          deepgramLanguage: result.detectedLanguages[0]
        }
      }

      console.log('✅ 识别结果:', result.transcript)
      console.log('🎯 置信度:', result.confidence)
      console.log('🌐 识别语言:', result.detectedLanguages)
      console.log('📊 单词级语言数据:', result.wordsWithLanguages.length, '个单词')

      return NextResponse.json(response)

    } catch (error) {
      console.error('❌ Deepgram 识别失败:', error)
      
      // 提供更详细的错误信息
      let errorMessage = 'Deepgram 语音识别失败'
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Deepgram API 密钥无效，请检查配置'
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = 'Deepgram API 配额已用完，请检查账户余额'
        } else if (error.message.includes('audio') || error.message.includes('format')) {
          errorMessage = '音频格式不受支持，请检查音频数据'
        } else {
          errorMessage = `Deepgram 错误: ${error.message}`
        }
      }
      
      return NextResponse.json({
        error: errorMessage,
        debug: {
          audioSize: audioData.byteLength,
          selectedLanguage,
          errorType: error instanceof Error ? error.name : 'UnknownError',
          originalError: error instanceof Error ? error.message : String(error)
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Speech API 错误:', error)
    return NextResponse.json({
      error: `语音识别服务错误: ${error instanceof Error ? error.message : '未知错误'}`
    }, { status: 500 })
  }
} 