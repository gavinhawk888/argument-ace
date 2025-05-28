import { createClient, DeepgramResponse } from '@deepgram/sdk'

interface DeepgramWord {
  word: string
  start: number
  end: number
  confidence: number
  language: string
}

interface DeepgramResult {
  transcript: string
  confidence: number
  detectedLanguages: string[]
  wordsWithLanguages: Array<{
    word: string
    start_time: number
    end_time: number
    language: string
    confidence?: number
  }>
}

export class DeepgramService {
  private client: any
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.client = createClient(apiKey)
  }

  /**
   * 预录制音频转录（支持动态语言选择）
   */
  async transcribePrerecorded(audioData: ArrayBuffer, selectedLanguage?: string): Promise<DeepgramResult> {
    try {
      // 根据用户选择的语言确定Deepgram语言参数
      let deepgramLanguage = 'en' // 默认英文
      
      if (selectedLanguage) {
        // 语言映射：用户语言 -> Deepgram语言代码
        const languageMap: { [key: string]: string } = {
          'chinese': 'zh',
          'zh': 'zh',
          'zh-cn': 'zh-CN',  // 注意这里改为小写
          'zh-tw': 'zh-TW',
          'english': 'en',
          'en': 'en',
          'en-us': 'en-US',  // 注意这里改为小写
          'en-gb': 'en-GB',
          'en-au': 'en-AU',
          'spanish': 'es',
          'es': 'es',
          'french': 'fr',
          'fr': 'fr',
          'german': 'de',
          'de': 'de',
          'japanese': 'ja',
          'ja': 'ja',
          'korean': 'ko',
          'ko': 'ko'
        }
        
        deepgramLanguage = languageMap[selectedLanguage.toLowerCase()] || 'en'
      }

      console.log('🎯 开始使用 Deepgram 模型进行语音识别...')
      console.log('📊 音频数据大小:', audioData.byteLength, '字节')
      console.log('🌐 识别语言:', deepgramLanguage)

      // 根据语言选择合适的模型
      // Nova-3 只支持英文，其他语言使用Nova-2
      const isEnglish = deepgramLanguage.startsWith('en')
      const selectedModel = isEnglish ? 'nova-3' : 'nova-2'
      
      console.log('🤖 选择模型:', selectedModel, isEnglish ? '(Nova-3支持英文)' : '(Nova-2支持多语言)')

      // 使用选定的模型和用户选择的语言
      const { result, error } = await this.client.listen.prerecorded.transcribeFile(
        new Uint8Array(audioData),
        {
          model: selectedModel,
          language: deepgramLanguage, // 使用具体的语言代码
          smart_format: true,
          punctuate: true,
          diarize: false,
          utterances: false,
          measurements: false,
          profanity_filter: false,
          redact: false,
          search: [],
          replace: [],
          keywords: [],
          numerals: false,
        }
      )

      if (error) {
        console.error('❌ Deepgram API 错误:', error)
        throw new Error(`Deepgram API 错误: ${error.message || error}`)
      }

      if (!result || !result.results || !result.results.channels || result.results.channels.length === 0) {
        console.warn('⚠️ Deepgram 未返回识别结果')
        return {
          transcript: '',
          confidence: 0,
          detectedLanguages: [deepgramLanguage],
          wordsWithLanguages: []
        }
      }

      const channel = result.results.channels[0]
      const alternative = channel.alternatives?.[0]

      if (!alternative) {
        console.warn('⚠️ Deepgram 未返回可用的识别结果')
        return {
          transcript: '',
          confidence: 0,
          detectedLanguages: [deepgramLanguage],
          wordsWithLanguages: []
        }
      }

      const transcript = alternative.transcript || ''
      const confidence = alternative.confidence || 0
      const detectedLanguages = [deepgramLanguage] // 使用选定的语言

      // 处理单词级别的语言信息
      const wordsWithLanguages = (alternative.words || []).map((word: DeepgramWord) => ({
        word: word.word,
        start_time: Math.round(word.start * 1000), // 转换为毫秒
        end_time: Math.round(word.end * 1000),
        language: deepgramLanguage, // 统一使用选定的语言
        confidence: word.confidence
      }))

      console.log('✅ Deepgram 识别完成:')
      console.log('📝 转录文本:', transcript)
      console.log(' 置信度:', confidence)
      console.log('🌐 识别语言:', deepgramLanguage)
      console.log('📊 单词数量:', wordsWithLanguages.length)

      return {
        transcript,
        confidence,
        detectedLanguages,
        wordsWithLanguages
      }

    } catch (error) {
      console.error('❌ Deepgram 转录失败:', error)
      throw error
    }
  }

  /**
   * 流式音频转录（WebSocket）
   * 注意：这是一个简化的流式接口示例，实际应用需要更复杂的 WebSocket 处理
   */
  async transcribeStreaming(
    audioStream: ReadableStream,
    onTranscript: (result: DeepgramResult) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      console.log('🌊 开始 Deepgram 流式识别...')

      // 创建流式连接
      const connection = this.client.listen.live({
        model: 'nova-3',
        language: 'multi',
        smart_format: true,
        punctuate: true,
        endpointing: 100,
        interim_results: true,
        utterance_end_ms: 1000,
        vad_events: true
      })

      // 监听转录结果
      connection.on('Results', (data: any) => {
        try {
          const channel = data.channel
          const alternative = channel?.alternatives?.[0]

          if (alternative && alternative.transcript && data.is_final) {
            const transcript = alternative.transcript
            const confidence = alternative.confidence || 0
            const detectedLanguages = alternative.languages || []

            const wordsWithLanguages = (alternative.words || []).map((word: DeepgramWord) => ({
              word: word.word,
              start_time: Math.round(word.start * 1000),
              end_time: Math.round(word.end * 1000),
              language: word.language,
              confidence: word.confidence
            }))

            onTranscript({
              transcript,
              confidence,
              detectedLanguages,
              wordsWithLanguages
            })
          }
        } catch (error) {
          console.error('处理流式结果时出错:', error)
          onError(new Error('处理转录结果失败'))
        }
      })

      // 监听错误
      connection.on('Error', (error: any) => {
        console.error('Deepgram 流式连接错误:', error)
        onError(new Error(`Deepgram 连接错误: ${error.message}`))
      })

      // 监听连接关闭
      connection.on('Close', (event: any) => {
        console.log('Deepgram 流式连接已关闭:', event)
      })

      // 开始连接
      connection.on('Open', () => {
        console.log('✅ Deepgram 流式连接已建立')
        
        // 这里需要根据实际的音频流处理逻辑
        // 将音频数据发送到 connection
        // connection.send(audioChunk)
      })

    } catch (error) {
      console.error('❌ Deepgram 流式识别初始化失败:', error)
      onError(error instanceof Error ? error : new Error('流式识别初始化失败'))
    }
  }

  /**
   * 检查 API 密钥是否有效
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // 创建一个很小的测试音频buffer
      const testAudio = new ArrayBuffer(1024)
      
      await this.transcribePrerecorded(testAudio)
      return true
    } catch (error) {
      console.error('Deepgram API 密钥验证失败:', error)
      return false
    }
  }
}

/**
 * 创建 Deepgram 服务实例
 */
export function createDeepgramService(apiKey: string): DeepgramService {
  return new DeepgramService(apiKey)
} 