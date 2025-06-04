# API 配置说明

## 🔐 API 密钥配置

为了使用真实的语音识别和AI回应功能，你需要配置以下API密钥：

### 1. 腾讯云实时语音识别API（新增）

1. 访问 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 开通语音识别服务
3. 进入 [API密钥管理页面](https://console.cloud.tencent.com/cam/capi) 获取：
   - AppID（应用ID）
   - SecretId（密钥ID）
   - SecretKey（密钥）

**腾讯云ASR特性：**
- 支持中英文混合识别
- 支持多种中文方言（粤语、上海话、四川话等）
- 使用 16k_zh_large 模型，识别准确率高
- WebSocket实时流式识别

### 2. OpenRouter API（AI回应生成 - Gemini 2.0 Flash）

1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账户
3. 获取API密钥
4. 确保账户有权限访问 `google/gemini-2.0-flash-001` 模型

### 3. 配置环境变量

在项目根目录的 `.env.local` 文件中，添加以下内容：

```bash
# 腾讯云实时语音识别API配置
TENCENT_ASR_APPID=你的腾讯云应用ID
TENCENT_ASR_SECRET_ID=你的腾讯云密钥ID
TENCENT_ASR_SECRET_KEY=你的腾讯云密钥

# AI回应生成API配置（OpenRouter + Gemini 2.0 Flash）
OPENROUTER_API_KEY_GEMINI=你的OpenRouter_API密钥

# 网站信息（用于OpenRouter统计，可选）
SITE_URL=http://localhost:3000
SITE_NAME=Argument Ace

# 备用配置（如果你想保留其他语音识别服务用于对比测试）
# DEEPGRAM_API_KEY=your_deepgram_api_key_here
# OPENROUTER_API_KEY=your_openrouter_deepseek_api_key_here
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

### 腾讯云实时语音识别功能
- 🎤 真实的浏览器麦克风录音
- 🔊 高质量音频捕获（16kHz, 单声道）
- 🧠 腾讯云16k_zh_large模型语音识别
- 🌏 支持中英文混合识别和多种中文方言
- ⚡ WebSocket实时流式识别
- 📍 基于官方文档 [https://cloud.tencent.com/document/api/1093/48982](https://cloud.tencent.com/document/api/1093/48982)

### AI回应生成（Gemini 2.0 Flash）
- 🤖 Google Gemini 2.0 Flash AI模型生成回应
- ⚡ 快速响应（平均1秒内）
- 💡 3种不同风格的回应策略
- 🕊️ 每个回应都包含更温和的替代版本
- 🌐 双语支持（中文/英文）
- 🎯 稳定的JSON输出格式

### 用户体验
- ⚡ 实时状态反馈
- 📱 响应式设计
- 🎨 现代化UI界面
- 🔄 错误处理和备用方案

## 🔧 腾讯云ASR技术规格

| 特性 | 规格 |
|------|------|
| 支持语言 | 中文普通话、粤语、英语、韩语、日语、泰语等多种语言 |
| 支持方言 | 上海话、四川话、武汉话、贵阳话、昆明话、西安话等 |
| 音频格式 | PCM, WAV, OPUS, SPEEX, SILK, MP3, M4A, AAC |
| 采样率 | 16000Hz 或 8000Hz |
| 声道 | 单声道（mono） |
| 识别模式 | 实时流式识别，边说边出文字 |
| 数据发送 | 建议每40ms发送40ms时长数据包 |

## 🛠️ 故障排除

### 如果语音识别不工作：
1. 检查腾讯云ASR密钥配置：
   - `TENCENT_ASR_APPID`
   - `TENCENT_ASR_SECRET_ID`
   - `TENCENT_ASR_SECRET_KEY`
2. 确认腾讯云语音识别服务已开通
3. 确认浏览器有麦克风权限
4. 检查控制台是否有错误信息

### 如果AI回应不生成：
1. 检查 `OPENROUTER_API_KEY_GEMINI` 环境变量是否正确设置
2. 确认OpenRouter账户有权限访问Gemini 2.0 Flash模型
3. 确认API配额是否充足
4. 查看网络连接是否正常

### 常见错误：
- `腾讯云ASR密钥未配置`: 检查环境变量配置
- `Microphone access denied`: 在浏览器中允许麦克风权限
- `腾讯云ASR连接错误`: 检查网络连接和API密钥
- `腾讯云ASR处理超时`: 网络问题或音频过长，重试即可

## 🔄 API对比

### 腾讯云ASR vs Deepgram

| 特性 | 腾讯云ASR | Deepgram |
|------|-----------|----------|
| 中文识别 | 优秀（专门优化） | 良好 |
| 方言支持 | 丰富（20+种方言） | 有限 |
| 实时性 | WebSocket流式 | HTTP批处理 |
| 成本 | 相对较低 | 较高 |
| 文档语言 | 中文 | 英文 |

## 📞 技术支持

如果遇到配置问题，请检查：
1. API密钥格式是否正确
2. 环境变量文件名是否为 `.env.local`
3. 腾讯云语音识别服务是否已开通
4. 是否重启了开发服务器
5. 浏览器控制台是否有错误信息

**参考文档：**
- [腾讯云实时语音识别API文档](https://cloud.tencent.com/document/api/1093/48982)
- [腾讯云控制台](https://console.cloud.tencent.com/)
- [OpenRouter文档](https://openrouter.ai/docs)

## 🔄 API性能对比

根据我们的测试结果：

| 指标 | Gemini 2.0 Flash | DeepSeek V3 |
|------|------------------|-------------|
| 平均响应时间 | ~1.0秒 | ~10.5秒 |
| 成功率 | 100% | 80% |
| JSON格式稳定性 | 优秀 | 偶有格式问题 |
| 输出质量 | 简洁有力 | 详细完整 |

## 🧪 性能测试

想要对比不同AI模型的性能？运行以下测试脚本：

```bash
# 测试Gemini 2.0 Flash性能
npx tsx test-gemini-flash.ts

# 如果配置了DeepSeek，运行性能对比
npx tsx test-performance-comparison.ts
``` 