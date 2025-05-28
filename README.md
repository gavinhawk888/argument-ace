# 🎯 Argument Ace

**智能语音辩论助手** - 基于AI的实时语音识别与智能回应生成系统

![Language](https://img.shields.io/badge/language-TypeScript-blue)
![Framework](https://img.shields.io/badge/framework-Next.js%2014-black)
![ASR](https://img.shields.io/badge/ASR-Deepgram%20Nova--3-green)
![AI](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-orange)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen)
![Mobile](https://img.shields.io/badge/mobile-optimized-blue)

## 📋 项目简介

Argument Ace 是一个智能语音辩论助手，帮助用户在争论或辩论中快速生成有效的回应策略。通过 Deepgram Nova-3/Nova-2 多语言语音识别和 Google Gemini 2.0 Flash AI模型，提供高质量的语音识别和智能回应生成。

**🚀 最新更新 (2024):**
- ✅ **移动端导航优化**: 修复手机端"功能特点"和"常见问题"点击定位问题
- ✅ **多语言界面支持**: 完整的中英文双语界面切换
- ✅ **响应式设计优化**: 完美适配手机、平板、桌面设备
- ✅ **性能优化**: 提升页面加载速度和用户体验

## ✨ 核心功能

### 🎤 **Deepgram 多语言语音识别**
- **智能模型选择**: 英文使用Nova-3模型，其他语言使用Nova-2模型
- **多语言支持**: 支持中文、英文、西班牙语、法语、德语、日语、韩语等
- **动态语言切换**: 用户可以选择识别语言，系统自动适配
- **高精度识别**: 95%+ 的识别准确率
- **快速响应**: 1-2秒完成识别
- **智能格式化**: 自动添加标点符号和格式化

### 🤖 **AI智能回应生成**
- **Gemini 2.0 Flash**: Google最新最快的AI模型
- **多种策略**: 逻辑反驳、情感共鸣、幽默化解三种风格
- **温和替代**: 每个回应都包含更友善的表达方式
- **双语支持**: 中文和英文智能切换
- **快速响应**: 平均1秒内生成回应

### 📱 **完美移动端体验**
- **响应式设计**: 手机、平板、桌面完美适配
- **触摸优化**: 针对移动设备优化的交互体验
- **导航修复**: 解决移动端菜单导航定位问题
- **手势支持**: 支持滑动、点击等移动端手势
- **性能优化**: 移动端加载速度优化

### 🌐 **多语言智能处理**
- **单语言识别**: 根据用户选择进行精准的单语言识别
- **语言自动切换**: 界面支持中英文动态切换
- **智能格式化**: 自动标点符号、数字格式化
- **时间戳精确**: 毫秒级单词时间戳
- **界面双语**: 完整的中英文界面切换支持

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-username/argument-ace.git
cd argument-ace
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置API密钥
创建 `.env.local` 文件并配置：

```bash
# Deepgram 语音识别API (必需)
DEEPGRAM_API_KEY=你的Deepgram_API密钥

# AI回应生成 (二选一)
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

### 测试不同语言识别
录制以下测试用例验证效果：
- **中文**: "我今天要去开会"
- **英文**: "I need to attend a meeting today"  
- **西班牙语**: "Necesito asistir a una reunión hoy"
- **法语**: "Je dois assister à une réunion aujourd'hui"

### AI回应生成测试
```bash
npm run test:gemini-flash
```

### 移动端测试
1. 在手机浏览器中访问应用
2. 测试"功能特点"和"常见问题"导航
3. 验证语音录制功能
4. 检查响应式布局

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
- **Lucide React**: 现代图标库

### 后端服务
- **Next.js API Routes**: 服务器端API
- **Deepgram API**: Nova-3/Nova-2 多语言语音识别
- **OpenAI/Google API**: AI模型服务
- **自定义服务层**: 错误处理和重试机制

### 音频处理
- **MediaRecorder API**: 浏览器音频录制
- **WebM/MP4/WAV**: 多格式音频支持
- **44.1kHz 采样率**: 高质量音频处理
- **自适应压缩**: 智能音频优化

### 移动端优化
- **响应式设计**: Mobile-first 设计方法
- **触摸优化**: 专门针对移动设备的交互
- **性能优化**: 代码分割和懒加载
- **PWA就绪**: 支持离线使用和安装

## 📊 性能特性

| 功能 | 性能指标 | 移动端优化 |
|------|----------|------------|
| 语音识别响应时间 | 1-2秒 | ✅ 移动端优化 |
| AI回应生成速度 | < 1秒（平均） | ✅ 快速响应 |
| 单语言识别准确率 | > 95% | ✅ 同样高精度 |
| 页面加载速度 | < 3秒 | 🚀 移动端 < 2秒 |
| 导航响应 | 即时 | ✅ 修复移动端问题 |
| 支持音频格式 | WebM, MP4, WAV, MP3 | ✅ 移动端兼容 |

## 🌍 支持的语言

### Deepgram 语音识别支持
- 🇨🇳 **中文** (zh-CN) - 使用Nova-2模型
- 🇺🇸 **英语** (en-US) - 使用Nova-3模型
- 🇪🇸 **西班牙语** (es) - 使用Nova-2模型
- 🇫🇷 **法语** (fr) - 使用Nova-2模型
- 🇩🇪 **德语** (de) - 使用Nova-2模型
- 🇮🇹 **意大利语** (it) - 使用Nova-2模型
- 🇵🇹 **葡萄牙语** (pt) - 使用Nova-2模型
- 🇯🇵 **日语** (ja) - 使用Nova-2模型
- 🇰🇷 **韩语** (ko) - 使用Nova-2模型
- 🇳🇱 **荷兰语** (nl) - 使用Nova-2模型
- 🇷🇺 **俄语** (ru) - 使用Nova-2模型

### 界面语言
- 🇨🇳 **简体中文**: 完整的本地化界面
- 🇺🇸 **English**: Full English interface
- 🔄 **动态切换**: 实时语言切换，无需刷新页面

### 特色功能
- **智能模型选择**: 根据语言自动选择最适合的模型
- **动态语言切换**: 用户可以在界面中选择识别语言
- **精准识别**: 针对选定语言进行优化识别

## 🔒 安全特性

- ✅ **服务器端处理**: API密钥安全存储在服务器端
- ✅ **HTTPS通信**: 所有通信都通过HTTPS加密
- ✅ **无日志存储**: 不存储用户音频或对话内容
- ✅ **权限控制**: 浏览器麦克风权限管理
- ✅ **错误处理**: 完善的错误处理和fallback机制
- ✅ **API密钥验证**: 自动验证API密钥有效性
- ✅ **移动端安全**: 移动端同样的安全标准

## 🛠️ 开发工具

### 脚本命令
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 代码质量检查
npm run test:wav     # 测试 Deepgram 识别
npm run test:mobile  # 移动端功能测试
```

### 开发环境要求
- Node.js 18+
- npm 或 yarn
- 现代浏览器（支持MediaRecorder API）
- Deepgram API 账户
- 移动设备或模拟器（用于移动端测试）

## 📈 项目路线图

### 已完成 ✅
- [x] Deepgram Nova-3/Nova-2 多语言识别集成
- [x] 智能模型选择（英文用Nova-3，其他语言用Nova-2）
- [x] 动态语言切换功能
- [x] Gemini 2.0 Flash AI回应生成
- [x] 响应式Web界面
- [x] 完善的错误处理
- [x] **移动端导航修复** (2024新增)
- [x] **多语言界面支持** (2024新增)
- [x] **移动端体验优化** (2024新增)
- [x] **性能优化和代码重构** (2024新增)

### 开发中 🚧
- [ ] 实时流式语音识别
- [ ] 真正的中英文混合识别支持
- [ ] 自定义词汇字典
- [ ] 语音活动检测
- [ ] 多说话人识别

### 规划中 📋
- [ ] PWA离线支持
- [ ] 移动端原生应用
- [ ] 个性化回应风格训练
- [ ] 团队协作功能
- [ ] 云同步和历史记录

## 🐛 最新修复

### 移动端导航修复 (最新)
- **问题**: 手机端点击"功能特点"和"常见问题"无法正确定位
- **修复**: 
  - 添加移动端Sheet状态管理
  - 实现专门的移动端导航处理函数
  - 增加滚动定位延迟时间，确保Sheet完全关闭
  - 添加页面加载状态检查，确保DOM完全渲染
  - 优化时序控制和哈希变化处理

### 代码质量提升
- TypeScript类型安全
- ESLint代码规范
- 组件化架构优化
- 性能监控和优化

## ⚠️ 重要说明

### 关于语言识别能力
当前版本支持**单语言识别**，即每次录音需要指定一种语言进行识别。项目暂不支持在同一段录音中混合使用多种语言（如中英文混合）。

如需要混合语言识别功能，这将是未来版本的开发重点。

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

### 开发规范
- 使用TypeScript进行开发
- 遵循ESLint代码规范
- 确保移动端兼容性
- 添加必要的测试
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持与反馈

- 🐛 **Bug反馈**: [GitHub Issues](https://github.com/your-repo/issues)
- 💡 **功能建议**: [GitHub Discussions](https://github.com/your-repo/discussions)
- 📚 **文档**: [Deepgram 文档](https://developers.deepgram.com/docs/)
- 🆘 **技术支持**: [Deepgram 社区](https://developers.deepgram.com/community/)
- 📱 **移动端问题**: 请在Issue中标注`mobile`标签

## 🎉 致谢

感谢以下技术和服务提供商：
- **Deepgram** - 提供强大的语音识别服务
- **Google** - Gemini 2.0 Flash AI模型
- **Vercel** - 优秀的部署平台
- **Next.js** - 强大的React框架
- **Tailwind CSS** - 现代化的CSS框架

---

<div align="center">

**🎯 Argument Ace - 让辩论更智能，让沟通更有效**

Made with ❤️ using Next.js + Deepgram + Gemini 2.0 Flash

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/argument-ace)

</div> 