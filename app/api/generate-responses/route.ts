import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { transcript, language } = await request.json()

    const systemPrompt = language === 'chinese' 
      ? `你是一个争论助手。用户会给你一个对方说的话，你需要生成3种不同风格的回应：
      1. 直接挑战型：直接反驳对方观点
      2. 理解共情型：承认对方感受但保持自己立场  
      3. 引导思考型：通过提问引导对方重新思考
      
      每个回应都要包含一个更温和的替代版本。请用JSON格式返回，包含text（回应内容）、description（使用建议）、alternative（温和替代版本）字段。`
      : `You are an argument assistant. The user will give you something the other person said, and you need to generate 3 different styles of responses:
      1. Direct challenge: Directly refute the other person's point
      2. Understanding empathy: Acknowledge their feelings while maintaining your position
      3. Guided thinking: Guide them to reconsider through questions
      
      Each response should include a gentler alternative version. Please return in JSON format with fields: text (response content), description (usage suggestion), alternative (gentle alternative).`

    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `对方说：${transcript}`
        }
      ],
      temperature: 0.7,
    }, {
      headers: {
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": process.env.SITE_NAME || "Argument Ace",
      }
    })

    const responseContent = completion.choices[0].message.content
    // 去除 markdown 代码块包裹
    const cleanContent = (responseContent || '').replace(/```json|```/g, '').trim()
    try {
      // 尝试解析AI返回的JSON
      const responses = JSON.parse(cleanContent || '[]')
      return NextResponse.json({ responses })
    } catch (parseError) {
      // 如果解析失败，返回备用回应
      console.error('Failed to parse AI response:', parseError)
      const fallbackResponses = language === 'chinese' ? [
        {
          text: "我不同意你的观点，让我们重新讨论这个问题。",
          description: "这个回应保持了礼貌但明确表达了不同意见。",
          alternative: "我理解你的想法，但我有不同的看法。能否听听我的观点？"
        }
      ] : [
        {
          text: "I disagree with your point. Let's discuss this matter again.",
          description: "This response maintains politeness while clearly expressing disagreement.",
          alternative: "I understand your perspective, but I have a different view. Could you hear my thoughts?"
        }
      ]
      
      return NextResponse.json({ responses: fallbackResponses })
    }
  } catch (error) {
    console.error('Response generation error:', error)
    return NextResponse.json({ error: 'Failed to generate responses' }, { status: 500 })
  }
} 