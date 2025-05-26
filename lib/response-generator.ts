export type ArgumentResponse = {
  text: string
  description: string
  alternative?: string
}

export async function generateResponses(transcript: string, language: string = "english"): Promise<ArgumentResponse[]> {
  try {
    // 调用后端API生成AI回应
    const response = await fetch('/api/generate-responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        language
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }

    // 确保返回的是正确格式的数组
    if (Array.isArray(result.responses)) {
      return result.responses
    }

    // 如果AI返回的不是数组，尝试包装成数组
    if (result.responses && typeof result.responses === 'object') {
      return [result.responses]
    }

    throw new Error('Invalid response format from AI')
  } catch (error) {
    console.error('Response generation error:', error)
    
    // 如果AI API失败，返回备用回应
    return getFallbackResponses(language)
  }
}

function getFallbackResponses(language: string): ArgumentResponse[] {
  if (language === "chinese") {
    return [
      {
        text: "这个观点我无法认同，我们可以从另一个角度来看。",
        description: "这个回应礼貌地表达了不同意见，并邀请进一步讨论。",
        alternative: "我理解你的想法，但我觉得可能还有其他的可能性。"
      },
      {
        text: "我明白你的感受，但我认为事情可能比这更复杂。",
        description: "这个回应承认对方的情感，同时指出问题的复杂性。",
        alternative: "我能理解你为什么这样想，不过我们是否可以考虑更多的因素？"
      },
      {
        text: "你能帮我理解一下你为什么会有这样的看法吗？",
        description: "这个回应通过提问来了解对方的思路，避免直接冲突。",
        alternative: "我很好奇你的想法，能分享一下你的考虑吗？"
      }
    ]
  }

  return [
    {
      text: "I can't agree with that perspective. Let's look at this from another angle.",
      description: "This response politely expresses disagreement and invites further discussion.",
      alternative: "I understand your thoughts, but I think there might be other possibilities."
    },
    {
      text: "I understand your feelings, but I think this might be more complex than that.",
      description: "This response acknowledges their emotions while pointing out the complexity of the issue.",
      alternative: "I can see why you'd think that, but could we consider more factors?"
    },
    {
      text: "Could you help me understand why you see it that way?",
      description: "This response seeks to understand their reasoning through questions, avoiding direct conflict.",
      alternative: "I'm curious about your perspective. Could you share your thinking?"
    }
  ]
}