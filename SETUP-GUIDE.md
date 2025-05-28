# 🚀 多语言语音识别系统设置指南

## 📋 前置要求

1. **Deepgram API 密钥**
   - 访问 [Deepgram Console](https://console.deepgram.com/)
   - 注册账户并获取 API 密钥
   - 确保账户有足够的余额

## 🔧 环境配置

### 步骤 1: 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# 在项目根目录运行
touch .env.local  # Linux/Mac
# 或者在 Windows 中手动创建文件
```

### 步骤 2: 配置 API 密钥

在 `.env.local` 文件中添加：

```env
DEEPGRAM_API_KEY=your_actual_deepgram_api_key_here
```

**重要**: 将 `your_actual_deepgram_api_key_here` 替换为您的实际 Deepgram API 密钥。

### 步骤 3: 验证配置

运行环境检查脚本：

```bash
node check-env.js
```

应该看到类似输出：
```
✅ DEEPGRAM_API_KEY 已配置
   长度: 40 字符
   前缀: 12345678...
```

## 🧪 测试多语言功能

### 快速测试

```bash
npm run test:multilingual
```

### 完整单元测试

```bash
npm run test:multilingual-unit
```

### 手动测试

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问 http://localhost:3000

3. 点击录音按钮测试语音识别

## 🌍 支持的语言

多语言模式支持以下语言的自动检测：

- 🇺🇸 英语 (en-US)
- 🇨🇳 中文 (zh-CN)
- 🇪🇸 西班牙语 (es)
- 🇫🇷 法语 (fr)
- 🇩🇪 德语 (de)
- 🇯🇵 日语 (ja)
- 🇰🇷 韩语 (ko)
- 🇮🇹 意大利语 (it)
- 🇵🇹 葡萄牙语 (pt)
- 🇷🇺 俄语 (ru)

## 🔍 故障排除

### 常见问题

1. **API 密钥未找到**
   ```
   ❌ DEEPGRAM_API_KEY 未找到
   ```
   **解决方案**: 确保 `.env.local` 文件存在且包含正确的 API 密钥

2. **空转录结果**
   ```json
   {"transcript":"","detectedLanguages":[],"wordsWithLanguages":[],"confidence":0}
   ```
   **可能原因**:
   - 音频质量太低
   - 音频格式不支持
   - 网络连接问题
   - API 余额不足

3. **API 调用失败**
   **检查项目**:
   - API 密钥是否正确
   - 网络连接是否正常
   - Deepgram 服务状态

### 调试步骤

1. **检查环境变量**:
   ```bash
   node check-env.js
   ```

2. **测试 API 连接**:
   ```bash
   npm run test:multilingual
   ```

3. **查看详细日志**:
   - 打开浏览器开发者工具
   - 查看 Console 和 Network 标签页

## 📞 获取帮助

如果遇到问题，请检查：

1. [Deepgram 文档](https://developers.deepgram.com/)
2. [项目故障排除指南](./TROUBLESHOOTING.md)
3. [多语言功能说明](./README-MULTILINGUAL.md)

## 🎯 下一步

配置完成后，您可以：

1. 测试多语言语音识别
2. 查看单词级语言检测
3. 体验中英文混合识别
4. 自定义语言处理逻辑 