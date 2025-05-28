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

    // 使用Deepgram进行语音识别 - 改进配置以确保正确的格式化
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      Buffer.from(audioData),
      {
        model: 'nova-2',
        language: preferredLanguage, // 根据用户偏好选择语言
        smart_format: true, // 智能格式化
        punctuate: true, // 添加标点符号
        detect_language: true, // 启用语言自动检测
        diarize: false, // 关闭说话人分离以避免格式问题
        paragraphs: false, // 关闭段落分割
        utterances: false, // 关闭话语分割
        filler_words: false, // 移除填充词
        profanity_filter: false, // 不过滤脏话以保持原始内容
      }
    )

    if (error) {
      console.error('Deepgram error:', error)
      return NextResponse.json({ 
        error: 'Speech recognition failed: ' + error.message 
      }, { status: 500 })
    }

    let transcript = result.results?.channels[0]?.alternatives[0]?.transcript || ''
    const detectedLanguage = result.results?.channels[0]?.detected_language || preferredLanguage
    
    // 后处理：修复可能的格式问题
    transcript = postProcessTranscript(transcript, detectedLanguage)
    
    console.log('Original transcript:', result.results?.channels[0]?.alternatives[0]?.transcript)
    console.log('Processed transcript:', transcript)
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

// 后处理函数：修复转录文本的格式问题
function postProcessTranscript(transcript: string, detectedLanguage: string): string {
  if (!transcript) return transcript
  
  // 如果检测到英文或包含英文，进行英文格式修复
  if (detectedLanguage.includes('en') || /[a-zA-Z]/.test(transcript)) {
    // 修复连在一起的英文单词
    transcript = fixEnglishSpacing(transcript)
  }
  
  // 通用清理
  transcript = transcript
    .trim() // 去除首尾空格
    .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
    .replace(/\s+([,.!?;:])/g, '$1') // 移除标点符号前的空格
  
  return transcript
}

// 修复英文单词间距的函数
function fixEnglishSpacing(text: string): string {
  // 如果文本看起来像是连在一起的英文单词，尝试修复
  if (/^[a-zA-Z]+$/.test(text.replace(/\s/g, ''))) {
    // 在小写字母后跟大写字母的地方添加空格
    text = text.replace(/([a-z])([A-Z])/g, '$1 $2')
    
    // 更全面的常见英文单词模式匹配（按长度排序，长的优先）
    const wordPatterns = [
      // 最长的组合优先
      { pattern: /youarereallystupid/gi, replacement: 'you are really stupid' },
      { pattern: /thisisreallycrazy/gi, replacement: 'this is really crazy' },
      { pattern: /whatthefuckisthis/gi, replacement: 'what the fuck is this' },
      
      // 三个单词的组合
      { pattern: /youarereally/gi, replacement: 'you are really' },
      { pattern: /thisisreally/gi, replacement: 'this is really' },
      { pattern: /thisiscrazy/gi, replacement: 'this is crazy' },
      { pattern: /thisisso/gi, replacement: 'this is so' },
      { pattern: /whatthefuck/gi, replacement: 'what the fuck' },
      { pattern: /youareso/gi, replacement: 'you are so' },
      { pattern: /iamso/gi, replacement: 'i am so' },
      { pattern: /thatisso/gi, replacement: 'that is so' },
      { pattern: /rightnow/gi, replacement: 'right now' },
      
      // 两个单词的组合
      { pattern: /whatthe/gi, replacement: 'what the' },
      { pattern: /thefuck/gi, replacement: 'the fuck' },
      { pattern: /youare/gi, replacement: 'you are' },
      { pattern: /youknow/gi, replacement: 'you know' },
      { pattern: /shutup/gi, replacement: 'shut up' },
      { pattern: /goaway/gi, replacement: 'go away' },
      { pattern: /getout/gi, replacement: 'get out' },
      { pattern: /leaveme/gi, replacement: 'leave me' },
      { pattern: /stopit/gi, replacement: 'stop it' },
      { pattern: /comeon/gi, replacement: 'come on' },
      { pattern: /geton/gi, replacement: 'get on' },
      { pattern: /getoff/gi, replacement: 'get off' },
      { pattern: /thisis/gi, replacement: 'this is' },
      { pattern: /thatis/gi, replacement: 'that is' },
      { pattern: /iam/gi, replacement: 'i am' },
      { pattern: /weare/gi, replacement: 'we are' },
      { pattern: /theyare/gi, replacement: 'they are' },
      { pattern: /heis/gi, replacement: 'he is' },
      { pattern: /sheis/gi, replacement: 'she is' },
      { pattern: /itis/gi, replacement: 'it is' },
      { pattern: /reallystupid/gi, replacement: 'really stupid' },
      { pattern: /socrazy/gi, replacement: 'so crazy' },
      { pattern: /verybad/gi, replacement: 'very bad' },
      { pattern: /verygood/gi, replacement: 'very good' },
      { pattern: /donot/gi, replacement: 'do not' },
      { pattern: /cannot/gi, replacement: 'can not' },
      { pattern: /willnot/gi, replacement: 'will not' },
      { pattern: /didnot/gi, replacement: 'did not' },
      { pattern: /allthe/gi, replacement: 'all the' },
      { pattern: /inthe/gi, replacement: 'in the' },
      { pattern: /onthe/gi, replacement: 'on the' },
      { pattern: /atthe/gi, replacement: 'at the' },
      { pattern: /ofthe/gi, replacement: 'of the' },
      { pattern: /tothe/gi, replacement: 'to the' },
      { pattern: /forthe/gi, replacement: 'for the' },
    ]
    
    // 应用所有模式（按顺序，长的优先）
    wordPatterns.forEach(({ pattern, replacement }) => {
      text = text.replace(pattern, replacement)
    })
    
    // 如果还是没有空格，尝试基于常见英文单词进行分割
    if (!/\s/.test(text) && text.length > 6) {
      text = addSpacesToConcatenatedWords(text)
    }
  }
  
  return text
}

// 基于常见英文单词添加空格的函数
function addSpacesToConcatenatedWords(text: string): string {
  // 常见的英文单词列表（按长度排序，长的优先）
  const commonWords = [
    'really', 'stupid', 'crazy', 'right', 'wrong', 'never', 'always', 'maybe', 'please',
    'what', 'that', 'this', 'they', 'them', 'with', 'from', 'have', 'will', 'your',
    'you', 'are', 'the', 'and', 'for', 'not', 'but', 'can', 'get', 'got', 'put',
    'out', 'off', 'all', 'now', 'how', 'why', 'who', 'bad', 'good', 'big', 'new',
    'old', 'way', 'day', 'man', 'boy', 'girl', 'come', 'go', 'do', 'be', 'is', 'am',
    'he', 'she', 'it', 'we', 'me', 'my', 'so', 'up', 'no', 'on', 'in', 'at', 'to',
    'of', 'a', 'i'
  ]
  
  let result = text.toLowerCase()
  let processed = ''
  let i = 0
  
  while (i < result.length) {
    let matched = false
    
    // 尝试匹配最长的单词
    for (const word of commonWords) {
      if (result.substr(i, word.length) === word) {
        if (processed && !processed.endsWith(' ')) {
          processed += ' '
        }
        processed += word
        i += word.length
        matched = true
        break
      }
    }
    
    if (!matched) {
      processed += result[i]
      i++
    }
  }
  
  return processed
} 