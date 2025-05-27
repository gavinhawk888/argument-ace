# Gemini 2.0 Flash API 测试

这个测试文件用来验证Gemini 2.0 Flash与OpenAI GPT的生成速度对比。

## 设置环境变量

在项目根目录创建 `.env` 文件，添加以下内容：

```env
# 现有的API密钥
OPENAI_API_KEY=your_openai_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Gemini 2.0 Flash (通过OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key_here
SITE_URL=https://argument-ace.vercel.app
SITE_NAME=Argument Ace
```

## 获取OpenRouter API Key

1. 访问 [OpenRouter.ai](https://openrouter.ai/)
2. 注册账户并获取API密钥
3. 将密钥填入 `.env` 文件中的 `OPENROUTER_API_KEY`

## 运行测试

```bash
# 安装依赖（如果还没安装）
npm install

# 运行Gemini测试
npx ts-node test-gemini-flash.ts

# 对比：运行现有的OpenAI测试
npx ts-node test-generate-responses.ts
```

## 测试内容

测试会使用以下几个典型的争论场景：
- "你说的完全没有道理"
- "这根本就是错误的"  
- "你这个想法太天真了"
- "现在的年轻人就是不懂事"
- "你别说话"

## 输出信息

测试会显示：
- ✅ API响应时间
- 📊 Token使用情况
- 🤖 使用的模型版本
- 💬 生成的三种类型回应（直接挑战、理解共情、引导思考）

## 对比指标

主要对比：
1. **响应速度**：API调用到返回结果的时间
2. **生成质量**：回应的相关性和实用性
3. **Token效率**：生成相同质量内容的Token消耗
4. **成本效益**：API调用的成本对比

## 故障排除

如果遇到错误：

1. **API Key错误**：确保 `.env` 文件中的密钥正确
2. **网络问题**：检查网络连接和防火墙设置
3. **模型不可用**：OpenRouter可能临时不可用，稍后重试
4. **限流问题**：如果请求过快，会自动添加延迟

## 集成到主应用

测试通过后，可以修改 `lib/response-generator.ts` 来使用Gemini 2.0 Flash：

```typescript
import { generateResponsesWithGemini } from '../test-gemini-flash';

// 在 generateResponses 函数中调用
const responses = await generateResponsesWithGemini(argument);
``` 