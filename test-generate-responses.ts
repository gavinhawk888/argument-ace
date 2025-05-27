import 'dotenv/config'
import OpenAI from 'openai'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '你的真实API密钥'

interface TimeStats {
  totalTime: number;
  apiCallTime: number;
  parseTime: number;
  setupTime: number;
}

async function testGenerateResponsesWithTiming(transcript: string, testIndex: number): Promise<TimeStats | null> {
  const overallStartTime = Date.now();
  
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === '你的真实API密钥' || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    console.error('请在 .env 或 .env.local 中配置有效的 OPENROUTER_API_KEY')
    return null;
  }

  console.log(`\n📝 测试案例 ${testIndex}: "${transcript}"`);
  console.log('─'.repeat(50));

  // 设置阶段计时
  const setupStartTime = Date.now();
  
  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: OPENROUTER_API_KEY,
  })

  const language = 'chinese'
  const systemPrompt = language === 'chinese'
    ? `你是一个争论助手。用户会给你一个对方说的话，你需要生成3种不同风格的回应：\n1. 直接挑战型：直接反驳对方观点\n2. 理解共情型：承认对方感受但保持自己立场\n3. 引导思考型：通过提问引导对方重新思考\n\n每个回应都要包含一个更温和的替代版本。请用JSON格式返回，包含text（回应内容）、description（使用建议）、alternative（温和替代版本）字段。`
    : `You are an argument assistant. The user will give you something the other person said, and you need to generate 3 different styles of responses:\n1. Direct challenge: Directly refute the other person's point\n2. Understanding empathy: Acknowledge their feelings while maintaining your position\n3. Guided thinking: Guide them to reconsider through questions\n\nEach response should include a gentler alternative version. Please return in JSON format with fields: text (response content), description (usage suggestion), alternative (gentle alternative).`

  const setupTime = Date.now() - setupStartTime;

  try {
    // API调用阶段计时
    const apiStartTime = Date.now();
    
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

    const apiCallTime = Date.now() - apiStartTime;

    // 解析阶段计时
    const parseStartTime = Date.now();
    
    const responseContent = completion.choices[0].message.content
    console.log(`✅ DeepSeek API调用时间: ${apiCallTime}ms`);
    
    if (completion.usage) {
      console.log(`📊 Token使用情况:`, completion.usage);
    }
    
    console.log(`🤖 模型: ${completion.model || 'deepseek/deepseek-chat'}`);

    let responses = [];
    try {
      const cleanContent = (responseContent || '').replace(/```json|```/g, '').trim()
      responses = JSON.parse(cleanContent || '[]')
      console.log(`✅ 成功生成 ${responses.length} 个回应`);
      
      // 显示生成的回应
      responses.forEach((response: any, i: number) => {
        const types = ['直接挑战', '理解共情', '引导思考'];
        console.log(`\n${i + 1}. 【${types[i] || '未知类型'}】`);
        console.log(`   回应: "${response.text || '无内容'}"`);
        console.log(`   说明: ${response.description || '无说明'}`);
        if (response.alternative) {
          console.log(`   替代: "${response.alternative}"`);
        }
      });
      
    } catch (parseError) {
      console.error('❌ JSON解析失败:', parseError);
      console.log('原始响应:', responseContent);
    }

    const parseTime = Date.now() - parseStartTime;
    const totalTime = Date.now() - overallStartTime;

    // 时间统计
    console.log(`\n⏱️  时间统计:`);
    console.log(`   设置时间: ${setupTime}ms`);
    console.log(`   API调用时间: ${apiCallTime}ms`);
    console.log(`   解析时间: ${parseTime}ms`);
    console.log(`   总处理时间: ${totalTime}ms`);

    return {
      totalTime,
      apiCallTime,
      parseTime,
      setupTime
    };

  } catch (error) {
    const totalTime = Date.now() - overallStartTime;
    console.error(`❌ API调用失败 (${totalTime}ms):`, error);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 开始测试DeepSeek API性能...\n');

  const testCases = [
    "你说的完全没有道理",
    "这根本就是错误的",
    "你这个想法太天真了",
    "现在的年轻人就是不懂事",
    "你别说话"
  ];

  const timeStats: TimeStats[] = [];

  for (let index = 0; index < testCases.length; index++) {
    const testCase = testCases[index];
    const stats = await testGenerateResponsesWithTiming(testCase, index + 1);
    
    if (stats) {
      timeStats.push(stats);
    }

    // 在测试案例间添加延迟，避免API限制
    if (index < testCases.length - 1) {
      console.log('\n⏳ 等待2秒后继续下一个测试...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 计算总体统计
  if (timeStats.length > 0) {
    console.log('\n📊 总体性能统计 (DeepSeek):');
    console.log('═'.repeat(50));
    
    const avgTotal = timeStats.reduce((sum, stat) => sum + stat.totalTime, 0) / timeStats.length;
    const avgAPI = timeStats.reduce((sum, stat) => sum + stat.apiCallTime, 0) / timeStats.length;
    const avgParse = timeStats.reduce((sum, stat) => sum + stat.parseTime, 0) / timeStats.length;
    const avgSetup = timeStats.reduce((sum, stat) => sum + stat.setupTime, 0) / timeStats.length;

    const minTotal = Math.min(...timeStats.map(stat => stat.totalTime));
    const maxTotal = Math.max(...timeStats.map(stat => stat.totalTime));
    const minAPI = Math.min(...timeStats.map(stat => stat.apiCallTime));
    const maxAPI = Math.max(...timeStats.map(stat => stat.apiCallTime));

    console.log(`平均总处理时间: ${avgTotal.toFixed(1)}ms`);
    console.log(`平均API调用时间: ${avgAPI.toFixed(1)}ms`);
    console.log(`平均解析时间: ${avgParse.toFixed(1)}ms`);
    console.log(`平均设置时间: ${avgSetup.toFixed(1)}ms`);
    console.log(`\n最快/最慢总时间: ${minTotal}ms / ${maxTotal}ms`);
    console.log(`最快/最慢API时间: ${minAPI}ms / ${maxAPI}ms`);
    console.log(`\n成功测试数量: ${timeStats.length}/${testCases.length}`);
  }

  console.log('\n🎉 DeepSeek API测试完成！');
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { testGenerateResponsesWithTiming, runAllTests }; 