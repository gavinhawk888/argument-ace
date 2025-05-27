# API 配置说明

## 🔐 API 密钥配置

为了使用真实的语音识别和AI回应功能，你需要配置以下API密钥：

### 1. Deepgram API（语音识别）

1. 访问 [Deepgram Console](https://console.deepgram.com/)
2. 注册账户并创建项目
3. 获取API密钥

### 2. OpenRouter API（AI回应生成 - Gemini 2.0 Flash）

1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账户
3. 获取API密钥
4. 确保账户有权限访问 `google/gemini-2.0-flash-001` 模型

### 3. 配置环境变量

在项目根目录的 `.env.local` 文件中，添加以下内容：

```bash
# 将 'your_deepgram_api_key_here' 替换为你的真实Deepgram API密钥
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# 将 'your_openrouter_gemini_api_key_here' 替换为你的真实OpenRouter API密钥（用于Gemini）
OPENROUTER_API_KEY_GEMINI=your_openrouter_gemini_api_key_here

# 如果你想保留DeepSeek用于测试对比，也可以添加：
# OPENROUTER_API_KEY=your_openrouter_deepseek_api_key_here

# 网站信息（用于OpenRouter统计，可选）
SITE_URL=http://localhost:3000
SITE_NAME=Argument Ace
```

### 4. 重启开发服务器

配置完API密钥后，重启开发服务器：

```bash
npm run dev
```

## 🔒 安全说明

- ✅ API密钥存储在服务器端环境变量中，不会暴露给前端
- ✅ 所有敏感操作都在Next.js API路由中处理
- ✅ 前端只调用本地API端点，不直接访问第三方服务
- ✅ `.env.local` 文件已被 `.gitignore` 忽略，不会提交到版本控制

## 🚀 功能特性

配置完成后，你将获得以下功能：

### 语音识别功能
- 🎤 真实的浏览器麦克风录音
- 🔊 高质量音频捕获（16kHz, 单声道）
- 🧠 Deepgram Nova-2模型语音识别
- 🌏 支持中文和英文识别

### AI回应生成（现已升级为Gemini 2.0 Flash）
- 🤖 Google Gemini 2.0 Flash AI模型生成回应
- ⚡ 比DeepSeek快3倍的响应速度
- 💡 3种不同风格的回应策略
- 🕊️ 每个回应都包含更温和的替代版本
- 🌐 双语支持（中文/英文）
- 🎯 更稳定的JSON输出格式

### 用户体验
- ⚡ 实时状态反馈
- 📱 响应式设计
- 🎨 现代化UI界面
- 🔄 错误处理和备用方案
- 🚀 更快的AI回应生成（平均1秒内）

## 🔄 API性能对比

根据我们的测试结果：

| 指标 | Gemini 2.0 Flash | DeepSeek V3 |
|------|------------------|-------------|
| 平均响应时间 | ~1.0秒 | ~10.5秒 |
| 成功率 | 100% | 80% |
| JSON格式稳定性 | 优秀 | 偶有格式问题 |
| 输出质量 | 简洁有力 | 详细完整 |

## 🛠️ 故障排除

### 如果语音识别不工作：
1. 检查Deepgram API密钥是否正确
2. 确认浏览器有麦克风权限
3. 检查控制台是否有错误信息

### 如果AI回应不生成：
1. 检查 `OPENROUTER_API_KEY_GEMINI` 环境变量是否正确设置
2. 确认OpenRouter账户有权限访问Gemini 2.0 Flash模型
3. 确认API配额是否充足
4. 查看网络连接是否正常

### 常见错误：
- `OPENROUTER_API_KEY_GEMINI is not configured`: 检查环境变量配置
- `Microphone access denied`: 在浏览器中允许麦克风权限
- `Gemini API request failed`: 检查OpenRouter API密钥和Gemini模型权限
- `Failed to parse Gemini response`: 通常是临时网络问题，重试即可

## 🧪 性能测试

想要对比不同AI模型的性能？运行以下测试脚本：

```bash
# 测试Gemini 2.0 Flash性能
npx tsx test-gemini-flash.ts

# 如果配置了DeepSeek，运行性能对比
npx tsx test-performance-comparison.ts
```

## 📞 技术支持

如果遇到配置问题，请检查：
1. API密钥格式是否正确
2. 环境变量文件名是否为 `.env.local`
3. 环境变量名是否为 `OPENROUTER_API_KEY_GEMINI`（不是之前的 `OPENROUTER_API_KEY`）
4. 是否重启了开发服务器
5. 浏览器控制台是否有错误信息 