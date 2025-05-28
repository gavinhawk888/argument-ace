# 迁移到腾讯云实时语音识别 API

## 📋 迁移概述

本文档描述了如何将语音识别服务从 Deepgram 迁移到腾讯云实时语音识别 API。

## 🎯 迁移目标

- ✅ 更好的中文识别效果
- ✅ 支持多种中文方言
- ✅ 更低的成本
- ✅ 国内更稳定的网络连接
- ✅ 实时流式识别

## 🔄 主要变更

### 1. API服务提供商
- **之前**: Deepgram (美国)
- **现在**: 腾讯云 (中国)

### 2. 识别模型
- **之前**: Nova-2 (多语言模式)
- **现在**: 16k_zh_large (中英文+方言优化)

### 3. 连接方式
- **之前**: HTTP POST (批处理)
- **现在**: WebSocket (实时流式)

### 4. 环境变量
```bash
# 移除的变量
# DEEPGRAM_API_KEY

# 新增的变量
TENCENT_ASR_APPID=你的腾讯云应用ID
TENCENT_ASR_SECRET_ID=你的腾讯云密钥ID
TENCENT_ASR_SECRET_KEY=你的腾讯云密钥
```

## 🛠️ 迁移步骤

### 步骤 1: 获取腾讯云API密钥

1. 访问 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 开通语音识别服务
3. 进入 [API密钥管理页面](https://console.cloud.tencent.com/cam/capi)
4. 获取以下信息：
   - AppID（应用ID）
   - SecretId（密钥ID）  
   - SecretKey（密钥）

### 步骤 2: 更新环境变量

在 `.env.local` 文件中添加：

```bash
# 腾讯云实时语音识别API配置
TENCENT_ASR_APPID=你的腾讯云应用ID
TENCENT_ASR_SECRET_ID=你的腾讯云密钥ID
TENCENT_ASR_SECRET_KEY=你的腾讯云密钥

# 保留AI回应生成配置
OPENROUTER_API_KEY_GEMINI=你的OpenRouter_API密钥
SITE_URL=http://localhost:3000
SITE_NAME=Argument Ace

# 可选：保留Deepgram用于备用或对比测试
# DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

### 步骤 3: 重启开发服务器

```bash
npm run dev
```

### 步骤 4: 测试新的ASR服务

```bash
# 测试腾讯云ASR连接
npm run test:tencent-asr
```

## 📊 功能对比

| 特性 | Deepgram | 腾讯云ASR |
|------|----------|-----------|
| 中文识别准确率 | 良好 | 优秀 |
| 方言支持 | 有限 | 丰富（20+种） |
| 实时性 | 批处理模式 | 实时流式 |
| 网络稳定性（国内） | 一般 | 优秀 |
| 成本 | 较高 | 相对较低 |
| 文档语言 | 英文 | 中文 |

## 🎯 识别模型特性

### 16k_zh_large 模型优势

- **多语言支持**: 中文普通话、英语、粤语、韩语、日语等
- **方言识别**: 上海话、四川话、武汉话、贵阳话等20+种中文方言
- **音频格式**: PCM、WAV、OPUS、SPEEX、SILK、MP3、M4A、AAC
- **采样率**: 16kHz / 8kHz
- **实时性**: WebSocket连接，边说边出文字

## 🔧 技术变更

### API调用方式

**之前 (Deepgram):**
```typescript
const response = await deepgram.listen.prerecorded.transcribeFile(
  audioBuffer,
  { model: 'nova-2', language: 'multi' }
)
```

**现在 (腾讯云ASR):**
```typescript
const session = new TencentAsrSession({
  appId: process.env.TENCENT_ASR_APPID!,
  secretId: process.env.TENCENT_ASR_SECRET_ID!,
  secretKey: process.env.TENCENT_ASR_SECRET_KEY!,
  engineModelType: '16k_zh_large'
})
await session.connect()
```

### 响应格式

**之前 (Deepgram):**
```json
{
  "results": {
    "channels": [{
      "alternatives": [{
        "transcript": "识别文本",
        "confidence": 0.95
      }]
    }]
  }
}
```

**现在 (腾讯云ASR):**
```json
{
  "code": 0,
  "message": "success",
  "voice_id": "uuid",
  "result": {
    "slice_type": 1,
    "voice_text_str": "识别文本",
    "word_list": [...]
  },
  "final": 1
}
```

## 🚨 注意事项

### 1. 网络要求
- 腾讯云ASR使用WebSocket连接
- 需要稳定的网络连接
- 建议在国内网络环境下使用

### 2. 音频格式
- 推荐使用PCM格式（16kHz, 16bit, 单声道）
- 建议每40ms发送一个音频包（1280字节）

### 3. 并发限制
- 默认单账号限制并发数为200路
- 如需提高并发，请联系腾讯云购买

### 4. 错误处理
- 新增腾讯云特有的错误码处理
- WebSocket连接可能因网络问题断开

## 🧪 测试验证

### 基本功能测试
```bash
npm run test:tencent-asr
```

### 手动测试
1. 启动应用: `npm run dev`
2. 打开浏览器访问 `http://localhost:3000`
3. 点击麦克风按钮测试录音识别
4. 检查控制台输出确认使用腾讯云ASR

### 验证指标
- ✅ 连接成功
- ✅ 中文识别准确率
- ✅ 方言识别支持
- ✅ 实时响应速度
- ✅ 错误处理机制

## 🔄 回滚方案

如果需要回滚到Deepgram：

1. 在 `.env.local` 中恢复 `DEEPGRAM_API_KEY`
2. 将 `app/api/speech/route.ts` 恢复到之前的Deepgram实现
3. 重启开发服务器

## 📞 支持与文档

- **腾讯云ASR官方文档**: [https://cloud.tencent.com/document/api/1093/48982](https://cloud.tencent.com/document/api/1093/48982)
- **腾讯云控制台**: [https://console.cloud.tencent.com/](https://console.cloud.tencent.com/)
- **SDK示例**: [腾讯云语音识别SDK](https://cloud.tencent.com/document/product/1093/35727)

## ✅ 迁移检查清单

- [ ] 获取腾讯云API密钥
- [ ] 配置环境变量
- [ ] 更新API实现代码
- [ ] 重启开发服务器
- [ ] 运行测试脚本
- [ ] 手动功能验证
- [ ] 性能测试
- [ ] 错误处理测试
- [ ] 生产环境部署

---

🎉 **迁移完成！** 现在您的应用使用腾讯云实时语音识别API，享受更好的中文识别效果和稳定性。 