# 语音识别故障排除指南

## 问题：语音识别返回空结果

如果您遇到以下返回结果：
```json
{"transcript":"","detectedLanguages":[],"wordsWithLanguages":[],"confidence":0}
```

请按以下步骤排查：

## 1. 检查浏览器控制台

打开浏览器开发者工具（F12），查看控制台输出：

### 查找关键日志：
- `🔍 音频调试信息:` - 音频格式和质量信息
- `Speech API called` - API是否被调用
- `Audio data size:` - 音频数据大小
- `Deepgram processing time:` - 处理时间
- `Raw Deepgram response:` - 原始识别结果

## 2. 常见问题及解决方案

### 问题1：音频数据太小
**症状：** `Audio data size: < 1000 bytes`
**解决：** 
- 录音时间太短，请说话至少2-3秒
- 确保麦克风正常工作

### 问题2：音频格式问题
**症状：** `formatInfo: 'Unknown'` 或 `isValidAudio: false`
**解决：**
- 检查浏览器兼容性（推荐Chrome/Edge）
- 确保使用HTTPS（localhost除外）

### 问题3：麦克风权限问题
**症状：** 录音按钮无响应或权限错误
**解决：**
- 点击浏览器地址栏的麦克风图标
- 选择"允许"麦克风访问
- 刷新页面重试

### 问题4：静音检测
**症状：** `isSilent: true`
**解决：**
- 检查系统音量设置
- 确保麦克风未被静音
- 尝试其他麦克风设备

### 问题5：API密钥问题
**症状：** `Deepgram API key not configured`
**解决：**
- 检查 `.env.local` 文件中的 `DEEPGRAM_API_KEY`
- 确保API密钥有效且有足够余额

## 3. 调试步骤

### 步骤1：基础检查
1. 打开浏览器控制台（F12）
2. 点击录音按钮
3. 清晰说话2-3秒
4. 停止录音
5. 查看控制台输出

### 步骤2：音频质量检查
查看调试信息中的：
```javascript
{
  basicInfo: {
    size: 12345,  // 应该 > 1000
    contentType: "audio/webm"
  },
  isValidAudio: true,  // 应该为 true
  isSilent: false      // 应该为 false
}
```

### 步骤3：API响应检查
查看原始API响应：
```javascript
Raw Deepgram response:
  Original transcript: "..."
  Confidence: 0.95
  Languages: ["en", "zh-CN"]
  Words count: 5
```

## 4. 测试建议

### 测试1：使用模拟API
如果真实API有问题，系统会自动切换到模拟API。查看是否显示"使用模拟识别"提示。

### 测试2：不同语言测试
- 尝试纯英文："Hello world"
- 尝试纯中文："你好世界"
- 尝试混合语言："Hello 你好"

### 测试3：不同录音时长
- 短录音：1-2秒
- 中等录音：3-5秒
- 长录音：5-10秒

## 5. 环境要求

### 浏览器支持
- ✅ Chrome 66+
- ✅ Firefox 60+
- ✅ Safari 14+
- ✅ Edge 79+

### 网络要求
- ✅ HTTPS连接（生产环境）
- ✅ 稳定的网络连接
- ✅ 无防火墙阻拦

### 设备要求
- ✅ 工作正常的麦克风
- ✅ 麦克风权限已授予
- ✅ 系统音量正常

## 6. 联系支持

如果以上步骤都无法解决问题，请提供：

1. **浏览器信息**：版本、操作系统
2. **控制台日志**：完整的错误信息
3. **音频调试信息**：`🔍 音频调试信息` 的完整输出
4. **API调试信息**：`🐛 API调试信息` 的完整输出
5. **录音环境**：设备类型、麦克风型号、环境噪音等

## 7. 快速修复

### 最常见的解决方案：
1. **刷新页面**并重新授权麦克风
2. **使用Chrome浏览器**（兼容性最好）
3. **确保网络连接稳定**
4. **说话声音清晰**，避免环境噪音
5. **录音时间至少3秒** 