import 'dotenv/config'
import OpenAI from 'openai'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '你的真实API密钥'

async function testGenerateResponses() {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === '你的真实API密钥' || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    console.error('请在 .env 或 .env.local 中配置有效的 OPENROUTER_API_KEY')
    return
  }

  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: OPENROUTER_API_KEY,
  })

  const transcript = '你总是这样说话，真的很让人生气！'
  const language = 'chinese'

  const systemPrompt = language === 'chinese'
    ? `你是一个争论助手。用户会给你一个对方说的话，你需要生成3种不同风格的回应：\n1. 直接挑战型：直接反驳对方观点\n2. 理解共情型：承认对方感受但保持自己立场\n3. 引导思考型：通过提问引导对方重新思考\n\n每个回应都要包含一个更温和的替代版本。请用JSON格式返回，包含text（回应内容）、description（使用建议）、alternative（温和替代版本）字段。`
    : `You are an argument assistant. The user will give you something the other person said, and you need to generate 3 different styles of responses:\n1. Direct challenge: Directly refute the other person's point\n2. Understanding empathy: Acknowledge their feelings while maintaining your position\n3. Guided thinking: Guide them to reconsider through questions\n\nEach response should include a gentler alternative version. Please return in JSON format with fields: text (response content), description (usage suggestion), alternative (gentle alternative).`

  try {
    const completion = await client.chat.completions.create({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `对方说：${transcript}` },
      ],
      temperature: 0.7,
    }, {
      headers: {
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.SITE_NAME || 'Argument Ace',
      }
    })

    const responseContent = completion.choices[0].message.content
    console.log('AI 原始返回内容:', responseContent)
    try {
      const cleanContent = (responseContent || '').replace(/```json|```/g, '').trim()
      const responses = JSON.parse(cleanContent || '[]')
      console.log('解析后的回应:', responses)
    } catch (parseError) {
      console.error('AI 返回内容 JSON 解析失败:', parseError)
    }
  } catch (error) {
    console.error('API 调用异常:', error)
  }
}

testGenerateResponses() 