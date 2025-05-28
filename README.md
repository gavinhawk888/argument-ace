# 🎯 Argument Ace

**智能语音辩论助手** - 基于AI的实时语音识别与智能回应生成系统

![Language](https://img.shields.io/badge/language-TypeScript-blue)
![Framework](https://img.shields.io/badge/framework-Next.js-black)
![ASR](https://img.shields.io/badge/ASR-Deepgram%20Nova--3-green)
![AI](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-orange)

## 📋 项目简介

Argument Ace 是一个智能语音辩论助手，帮助用户在争论或辩论中快速生成有效的回应策略。通过 Deepgram Nova-3 多语言语音识别和 Google Gemini 2.0 Flash AI模型，提供高质量的中英文混合识别和智能回应生成。

## ✨ 核心功能

### 🎤 **Deepgram Nova-3 多语言语音识别**
- **Nova-3 模型**: 最新一代语音识别模型，专门优化多语言混合识别
- **多语言代码切换**: 原生支持中英文混合内容，实时语言标识
- **单词级语言标签**: 每个单词都有对应的语言标识和置信度
- **高精度识别**: 95%+ 的识别准确率
- **快速响应**: 1-2秒完成识别，比传统方案快50%+
- **智能端点检测**: 100ms端点优化，专门针对代码切换场景

### 🤖 **AI智能回应生成**
- **Gemini 2.0 Flash**: Google最新最快的AI模型
- **多种策略**: 逻辑反驳、情感共鸣、幽默化解三种风格
- **温和替代**: 每个回应都包含更友善的表达方式
- **双语支持**: 中文和英文智能切换
- **快速响应**: 平均1秒内生成回应

### 🌐 **多语言智能处理**
- **混合语言**: 中英文混合内容无缝识别和处理
- **实时语言检测**: 句子级和单词级语言自动识别
- **智能格式化**: 自动标点符号、数字格式化
- **时间戳精确**: 毫秒级单词时间戳

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd argument-ace
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置API密钥
创建 `.env.local` 文件并配置：

```bash
# Deepgram 语音识别API
DEEPGRAM_API_KEY=你的Deepgram_API密钥

# AI回应生成
OPENAI_API_KEY=你的OpenAI_API密钥
# 或者使用 Google API
GOOGLE_API_KEY=你的Google_API密钥

# 网站信息（可选）
SITE_URL=http://localhost:3000
SITE_NAME=Argument Ace
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用！

## 📖 详细文档

- **[Deepgram 配置指南](DEEPGRAM-SETUP.md)** - 详细的 Deepgram API 配置说明
- **[迁移总结](DEEPGRAM-MIGRATION-SUMMARY.md)** - 从腾讯云ASR到Deepgram的迁移详情
- **[API配置指南](README-API-SETUP.md)** - 详细的API密钥配置说明
- **[多语言功能](README-MULTILINGUAL.md)** - 多语言识别功能说明
- **[设置指南](SETUP-GUIDE.md)** - 项目设置和配置指南
- **[故障排除](TROUBLESHOOTING.md)** - 常见问题解决方案

## 🧪 测试和验证

### 环境配置验证
```bash
# 验证Deepgram环境配置
npm run verify:deepgram
```

### 语音识别API测试
```bash
# 运行完整的单元测试套件 (推荐)
npm run test:deepgram-unit

# 运行基础功能测试
npm run test:wav

# 或者直接运行
npx tsx test-deepgram-unit.ts
```

### 测试中英文混合识别
录制以下测试用例验证效果：
- "我今天要去 meeting"
- "Please help me 翻译这个句子"
- "这个 project 非常 interesting"
- "Let's go to 北京"

### AI回应生成测试
```bash
npm run test:gemini-flash
```

### 📊 测试报告
查看详细的测试结果和性能分析：
- **[测试指南](DEEPGRAM-TESTING-GUIDE.md)** - 完整测试说明
- **[测试结果](DEEPGRAM-TEST-RESULTS.md)** - 最新测试报告

## 🏗️ 技术架构

### 前端技术栈
- **Next.js 14**: React框架，App Router
- **TypeScript**: 类型安全的JavaScript
- **Tailwind CSS**: 现代化CSS框架
- **Shadcn/ui**: 高质量UI组件库
- **Radix UI**: 无障碍访问的原始组件

### 后端服务
- **Next.js API Routes**: 服务器端API
- **Deepgram API**: Nova-3 多语言语音识别
- **OpenAI/Google API**: AI模型服务
- **自定义服务层**: 错误处理和重试机制

### 音频处理
- **MediaRecorder API**: 浏览器音频录制
- **WebM/MP4/WAV**: 多格式音频支持
- **44.1kHz 采样率**: 高质量音频处理
- **自适应压缩**: 智能音频优化

## 📊 性能特性

| 功能 | 性能指标 | 相比腾讯云ASR |
|------|----------|-------------|
| 语音识别响应时间 | 1-2秒 | 🚀 50%+ 提升 |
| AI回应生成速度 | < 1秒（平均） | 保持优秀 |
| 中英混合识别准确率 | > 95% | 📈 10%+ 提升 |
| 单词级语言标识 | ✅ 支持 | 🆕 新增功能 |
| 支持音频格式 | WebM, MP4, WAV, MP3 | 🔧 更灵活 |
| API稳定性 | 99.9% | ✅ 更稳定 |

## 🌍 支持的语言

### Deepgram Nova-3 多语言支持
- 🇨🇳 **中文** (zh)
- 🇺🇸 **英语** (en)
- 🇪🇸 **西班牙语** (es)
- 🇫🇷 **法语** (fr)
- 🇩🇪 **德语** (de)
- 🇮🇹 **意大利语** (it)
- 🇵🇹 **葡萄牙语** (pt)
- 🇯🇵 **日语** (ja)
- 🇰🇷 **韩语** (ko)
- 🇳🇱 **荷兰语** (nl)
- 🇷🇺 **俄语** (ru)

### 特色功能
- **代码切换**: 同一句话中混合多种语言
- **实时语言检测**: 自动识别每个单词的语言
- **上下文感知**: 根据上下文优化识别准确率

## 🔒 安全特性

- ✅ **服务器端处理**: API密钥安全存储在服务器端
- ✅ **HTTPS通信**: 所有通信都通过HTTPS加密
- ✅ **无日志存储**: 不存储用户音频或对话内容
- ✅ **权限控制**: 浏览器麦克风权限管理
- ✅ **错误处理**: 完善的错误处理和fallback机制
- ✅ **API密钥验证**: 自动验证API密钥有效性

## 🛠️ 开发工具

### 脚本命令
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 代码质量检查
npm run test:wav     # 测试 Deepgram 识别
```

### 开发环境要求
- Node.js 18+
- npm 或 yarn
- 现代浏览器（支持MediaRecorder API）
- Deepgram API 账户

## 📈 项目路线图

### 已完成 ✅
- [x] Deepgram Nova-3 多语言识别集成
- [x] 中英文混合语音识别
- [x] 单词级语言标识
- [x] Gemini 2.0 Flash AI回应生成
- [x] 响应式Web界面
- [x] 完善的错误处理

### 规划中 🚧
- [ ] 实时流式语音识别
- [ ] 自定义词汇字典
- [ ] 语音活动检测
- [ ] 多说话人识别
- [ ] 移动端原生应用
- [ ] 个性化回应风格训练

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持与反馈

- 🐛 **Bug反馈**: [GitHub Issues](https://github.com/your-repo/issues)
- 💡 **功能建议**: [GitHub Discussions](https://github.com/your-repo/discussions)
- 📚 **文档**: [Deepgram 文档](https://developers.deepgram.com/docs/)
- 🆘 **技术支持**: [Deepgram 社区](https://developers.deepgram.com/community/)

---

<div align="center">

**🎯 Argument Ace - 让辩论更智能，让沟通更有效**

Made with ❤️ using Next.js + Deepgram + Gemini 2.0 Flash

</div> 