import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { transcript, language } = await request.json()

    // 使用Gemini专用的API密钥
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY_GEMINI
    const SITE_URL = process.env.SITE_URL || 'http://localhost:3000'
    const SITE_NAME = process.env.SITE_NAME || 'Argument Ace'

    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY_GEMINI is not configured')
    }

    // 针对Gemini优化的prompt格式
    const prompt = language === 'chinese' 
      ? `对方在争论中说："${transcript}"

请生成3个精准有效的回应策略，每个回应都要有不同的风格：

1. 直接挑战：用有力、犀利、甚至带有反击意味的语言直接反驳对方观点，不要太温和，要让对方感受到你的立场和气势。
2. 理解共情：承认对方感受但保持自己立场，语气可以温和。
3. 引导思考：通过提问引导对方重新思考，语气可以中性。

请按以下JSON格式返回：
[
  {
    "text": "具体的回应内容",
    "description": "为什么这个回应有效的解释",
    "alternative": "更温和的替代版本"
  }
]

确保回应：
- 简洁有力，不超过30字
- 针对对方的具体论点
- 语言自然，适合口语对话
- 避免过于学术化的表达`
      : `The other person in the argument said: "${transcript}"

Please generate 3 precise and effective response strategies, each with a different style:

1. Direct challenge: Use strong, sharp, even confrontational language to directly refute the other person's point. Do NOT be too gentle—make your stance and momentum clear.
2. Understanding empathy: Acknowledge their feelings while maintaining your position, tone can be gentle.
3. Guided thinking: Guide them to reconsider through questions, tone can be neutral.

Please return in the following JSON format:
[
  {
    "text": "Specific response content",
    "description": "Explanation of why this response is effective",
    "alternative": "Gentler alternative version"
  }
]

Ensure responses are:
- Concise and powerful, under 30 words
- Targeted at their specific argument
- Natural language, suitable for spoken conversation
- Avoid overly academic expressions`

    // 使用fetch直接调用Gemini 2.0 Flash
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ],
        "temperature": 0.7,
        "max_tokens": 1000
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const responseContent = data.choices[0]?.message?.content

    if (!responseContent) {
      throw new Error('No content in Gemini API response')
    }

    // 针对Gemini优化的JSON解析
    try {
      // 首先尝试提取JSON数组
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const responses = JSON.parse(jsonMatch[0])
        if (Array.isArray(responses) && responses.length > 0) {
          return NextResponse.json({ responses })
        }
      }

      // 如果没有找到数组格式，尝试清理并解析
      const cleanContent = responseContent.replace(/```json|```/g, '').trim()
      const responsesObj = JSON.parse(cleanContent || '{}')
      
      let responses: any[] = []
      if (Array.isArray(responsesObj)) {
        responses = responsesObj
      } else if (
        responsesObj.direct_challenge &&
        responsesObj.understanding_empathy &&
        responsesObj.guided_thinking
      ) {
        responses = [
          responsesObj.direct_challenge,
          responsesObj.understanding_empathy,
          responsesObj.guided_thinking
        ]
      } else {
        // fallback: 兼容其它对象格式
        responses = Object.values(responsesObj)
      }
      
      if (responses.length > 0) {
        return NextResponse.json({ responses })
      }
      
      throw new Error('Invalid response format from Gemini')
    } catch (parseError) {
      // 如果解析失败，返回备用回应
      console.error('Failed to parse Gemini response:', parseError)
      console.error('Original response:', responseContent)
      
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
    console.error('Gemini response generation error:', error)
    return NextResponse.json({ error: 'Failed to generate responses' }, { status: 500 })
  }
} 