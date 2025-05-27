/**
 * Gemini 2.0 Flash API测试
 * 
 * 使用方法：
 * 1. 在.env文件中添加以下环境变量：
 *    OPENROUTER_API_KEY_GEMINI=your_openrouter_gemini_api_key_here
 *    SITE_URL=https://argument-ace.vercel.app
 *    SITE_NAME=Argument Ace
 * 2. 运行测试：npx ts-node test-gemini-flash.ts
 */

import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

interface GeminiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ArgumentResponse {
  text: string;
  description: string;
  alternative?: string;
}

/**
 * 调用Gemini 2.0 Flash API生成回应
 */
async function generateResponsesWithGemini(argument: string): Promise<ArgumentResponse[]> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY_GEMINI;
  const SITE_URL = process.env.SITE_URL || 'https://argument-ace.vercel.app';
  const SITE_NAME = process.env.SITE_NAME || 'Argument Ace';

  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY_GEMINI is not set in environment variables');
  }

  const prompt = `对方在争论中说："${argument}"

请生成3个精准有效的回应策略，每个回应都要有不同的风格：

1. 直接挑战：一个锋利、直接的反击
2. 理解共情：一个展现理解但巧妙反驳的回应  
3. 引导思考：一个通过提问引导对方重新思考的回应

请按以下JSON格式返回：
[
  {
    "text": "具体的回应内容",
    "description": "为什么这个回应有效的解释",
    "alternative": "可选：更温和的替代版本"
  }
]

确保回应：
- 简洁有力，不超过30字
- 针对对方的具体论点
- 语言自然，适合口语对话
- 避免过于学术化的表达`;

  const startTime = Date.now();

  try {
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
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    
    console.log(`✅ Gemini 2.0 Flash响应时间: ${responseTime}ms`);
    console.log(`📊 Token使用情况:`, data.usage);
    console.log(`🤖 模型: ${data.model}`);

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in API response');
    }

    // 尝试解析JSON响应
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedResponses = JSON.parse(jsonMatch[0]);
        return parsedResponses;
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('JSON解析失败，原始响应:', content);
      throw new Error(`Failed to parse JSON response: ${parseError}`);
    }

  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    console.error(`❌ Gemini 2.0 Flash请求失败 (${responseTime}ms):`, error);
    throw error;
  }
}

/**
 * 运行测试
 */
async function runTest() {
  console.log('🚀 开始测试Gemini 2.0 Flash API...\n');

  const testCases = [
    "你说的完全没有道理",
    "这根本就是错误的",
    "你这个想法太天真了",
    "现在的年轻人就是不懂事",
    "你别说话"
  ];

  for (let index = 0; index < testCases.length; index++) {
    const testCase = testCases[index];
    console.log(`\n📝 测试案例 ${index + 1}: "${testCase}"`);
    console.log('─'.repeat(50));

    try {
      const startTime = Date.now();
      const responses = await generateResponsesWithGemini(testCase);
      const endTime = Date.now();

      console.log(`⏱️  总处理时间: ${endTime - startTime}ms`);
      console.log(`✅ 成功生成 ${responses.length} 个回应:\n`);

      responses.forEach((response, i) => {
        const types = ['直接挑战', '理解共情', '引导思考'];
        console.log(`${i + 1}. 【${types[i]}】`);
        console.log(`   回应: "${response.text}"`);
        console.log(`   说明: ${response.description}`);
        if (response.alternative) {
          console.log(`   替代: "${response.alternative}"`);
        }
        console.log('');
      });

    } catch (error) {
      console.error(`❌ 测试失败:`, error);
    }

    // 在测试案例间添加延迟，避免API限制
    if (index < testCases.length - 1) {
      console.log('⏳ 等待2秒后继续下一个测试...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n🎉 测试完成！');
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runTest().catch(console.error);
}

export { generateResponsesWithGemini }; 