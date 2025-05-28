# 多语言语音识别功能更新

## 概述

根据 [Deepgram多语言代码切换文档](https://developers.deepgram.com/docs/multilingual-code-switching)，我们已经将语音识别系统升级为支持多语言代码切换模式。

## 主要更新

### 1. API配置更改

**之前（单语言模式）：**
```typescript
{
  model: 'nova-2',
  language: 'zh-CN', // 或 'en-US'
  detect_language: true
}
```

**现在（多语言模式）：**
```typescript
{
  model: 'nova-2', // Nova-2支持多语言代码切换
  language: 'multi', // 启用多语言代码切换模式
  smart_format: true,
  punctuate: true
}
```

### 2. 响应格式更新

**之前的响应：**
```json
{
  "transcript": "你好世界",
  "detectedLanguage": "zh-CN"
}
```

**现在的响应：**
```json
{
  "transcript": "你好 hello 世界 world",
  "detectedLanguages": ["zh-CN", "en"],
  "wordsWithLanguages": [
    {
      "word": "你好",
      "language": "zh-CN",
      "confidence": 0.99,
      "start": 0.0,
      "end": 0.5
    },
    {
      "word": "hello",
      "language": "en",
      "confidence": 0.98,
      "start": 0.5,
      "end": 1.0
    }
  ],
  "confidence": 0.95
}
```

### 3. 新增功能

#### 单词级语言检测
- 每个单词都有独立的语言标识
- 提供单词级置信度
- 包含时间戳信息

#### 多语言格式处理
- 自动处理中英文混合文本的格式
- 智能添加中英文之间的空格
- 移除中文字符间的多余空格

#### 语言统计信息
- 显示检测到的所有语言
- 提供语言分布统计
- 在控制台输出详细的分析信息

## 使用示例

### 前端调用
```typescript
const response = await fetch('/api/speech', {
  method: 'POST',
  body: audioBlob,
  headers: {
    'Content-Type': 'audio/webm',
    'Accept-Language': navigator.language
  }
})

const result = await response.json()

// 处理多语言结果
if (result.detectedLanguages && result.detectedLanguages.length > 1) {
  console.log('检测到多语言:', result.detectedLanguages)
  
  // 显示语言分布
  const languageCounts = result.wordsWithLanguages.reduce((acc, word) => {
    acc[word.language] = (acc[word.language] || 0) + 1
    return acc
  }, {})
  
  console.log('语言分布:', languageCounts)
}
```

### 后端处理
```typescript
// 多语言后处理
function postProcessMultilingualTranscript(transcript: string, wordsWithLanguages: any[]): string {
  const languageGroups = groupWordsByLanguage(wordsWithLanguages)
  
  // 根据检测到的语言进行相应处理
  if (languageGroups.en) {
    transcript = fixEnglishSpacing(transcript)
  }
  
  if (languageGroups['zh-CN']) {
    transcript = fixChineseSpacing(transcript)
  }
  
  return transcript
}
```

## 支持的语言

根据Deepgram文档，多语言代码切换支持以下语言组合：
- 英语 (en)
- 中文 (zh-CN, zh-TW)
- 西班牙语 (es)
- 法语 (fr)
- 德语 (de)
- 意大利语 (it)
- 葡萄牙语 (pt)
- 俄语 (ru)
- 日语 (ja)
- 韩语 (ko)

## 兼容性

为了保持向后兼容性，API响应中仍然包含 `detectedLanguage` 字段（取第一个检测到的语言），但建议使用新的 `detectedLanguages` 数组。

## 测试

### 模拟测试
测试API (`/api/test-speech`) 已更新为支持多语言模式，会随机返回单语言或多语言混合的模拟结果。

### 真实测试
要测试真实的多语言功能，请：
1. 确保配置了有效的 `DEEPGRAM_API_KEY`
2. 录制包含多语言内容的音频
3. 通过前端界面进行测试
4. 查看浏览器控制台的详细语言分析信息

## 注意事项

1. **模型要求**：多语言代码切换仅在 Nova-2 和 Nova-3 模型中可用
2. **性能**：多语言处理可能比单语言稍慢
3. **准确性**：在语言切换频繁的情况下，识别准确性可能会有所下降
4. **格式化**：系统会自动处理多语言文本的格式，但复杂情况可能需要手动调整

## 更新日志

- ✅ 启用 Deepgram 多语言代码切换模式
- ✅ 更新 API 响应格式支持多语言信息
- ✅ 添加单词级语言检测
- ✅ 实现多语言文本格式处理
- ✅ 更新前端显示逻辑
- ✅ 保持向后兼容性
- ✅ 更新测试API支持多语言模拟 