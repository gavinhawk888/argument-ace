"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Mic, Square, Loader2, AlertCircle, Zap, Brain, Globe, Shield, Target, MessageSquare, Sparkles, Clock, Star, Quote, Users, TrendingUp, Award, CheckCircle, Mail, MessageCircle, Phone } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useLanguage } from "@/hooks/language-context"
import { generateResponses, ArgumentResponse } from "@/lib/response-generator"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

// 将TypingText组件移到外部，避免hooks在主组件内部定义
function TypingText({ text, onEnd }: { text: string, onEnd?: () => void }) {
  const [displayed, setDisplayed] = useState("")
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    if (!text) return
    
    setDisplayed("")
    let i = 0
    
    if (timerRef.current) clearInterval(timerRef.current)
    
    timerRef.current = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) {
        if (timerRef.current) clearInterval(timerRef.current)
        if (onEnd) onEnd()
      }
    }, 100)
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [text, onEnd])
  
  return <span>{displayed}</span>
}

export default function HomePage() {
  const { language, setLanguage } = useLanguage()
  
  // ✅ 将所有 Hooks 移到条件返回之前
  const [appState, setAppState] = useState<"idle" | "recording" | "processing" | "results" | "error">("idle")
  const [responses, setResponses] = useState<ArgumentResponse[]>([])
  const [isGeneratingResponses, setIsGeneratingResponses] = useState(false)
  const { 
    isRecording, 
    audioBlob, 
    transcript, 
    isProcessing, 
    hasError,
    startRecording, 
    stopRecording, 
    processAudio,
    checkMicrophonePermission, 
    resetStates 
  } = useAudioRecorder()
  const router = useRouter()
  const { toast } = useToast()
  const [hasResponseError, setHasResponseError] = useState(false)

  // 记录"对方说道"逐字动画是否完成
  const [transcriptTyped, setTranscriptTyped] = useState(false)
  const [finalTranscript, setFinalTranscript] = useState<string>("")
  const [displayText, setDisplayText] = useState<string>("") // 专门用于显示的文本，一旦设置就不变
  const [waitingMessageIndex, setWaitingMessageIndex] = useState(0)
  const [transcriptLocked, setTranscriptLocked] = useState(false) // 添加锁定机制
  const prevTranscript = useRef<string | null>(null);
  const processedAudioBlob = useRef<Blob | null>(null); // 跟踪已处理的audioBlob

  // 等待消息列表 - 确保language不为null
  const waitingMessages = language === "chinese" 
    ? [
        "AI正在生成回复...",
        "请你耐心等待",
        "快好了快好了，别催了！",
        "正在思考最佳回应策略...",
        "马上就好，再等等...",
        "AI大脑正在高速运转中..."
      ]
    : [
        "AI is generating responses...",
        "Please be patient",
        "Almost there, don't rush!",
        "Thinking of the best response strategy...",
        "Just a moment more...",
        "AI brain is running at full speed..."
      ];

  // ✅ 将所有函数定义移到useEffect之前
  // Generate AI responses
  const handleGenerateResponses = async (transcriptText: string) => {
    if (!transcriptText.trim()) return
    setIsGeneratingResponses(true)
    // 不再切换到processing状态，保持在results页面
    setHasResponseError(false)
    try {
      const generatedResponses = await generateResponses(transcriptText, language)
      if (!generatedResponses || generatedResponses.length === 0 || !generatedResponses[0].text?.trim()) {
        setHasResponseError(true)
        return
      }
      setResponses(generatedResponses)
      toast({
        title: language === "chinese" ? "回应生成完成" : "Responses Generated",
        description: language === "chinese"
          ? `生成了 ${generatedResponses.length} 个建议回应`
          : `Generated ${generatedResponses.length} suggested responses`,
      })
    } catch (error) {
      setHasResponseError(true)
      toast({
        variant: "destructive",
        title: language === "chinese" ? "生成失败" : "Generation Failed",
        description: language === "chinese"
          ? "网络有点开小差，请点击重试按钮"
          : "Network error, please click the retry button",
      })
    } finally {
      setIsGeneratingResponses(false)
    }
  }

  // Handle resets
  const handleReset = () => {
    setAppState("idle")
    setResponses([])
    setIsGeneratingResponses(false)
    setTranscriptTyped(false)
    setHasResponseError(false)
    setWaitingMessageIndex(0)
    prevTranscript.current = null
    processedAudioBlob.current = null // 重置已处理的audioBlob
    setFinalTranscript("")
    setDisplayText("")
    setTranscriptLocked(false)
    resetStates()
  }

  // Handle microphone button click
  const handleMicClick = async () => {
    try {
      if (appState === "idle") {
        const hasPermission = await checkMicrophonePermission()
        if (hasPermission) {
          startRecording()
        }
      } else if (appState === "recording") {
        stopRecording()
      } else {
        // Reset to initial state
        handleReset()
      }
    } catch (error) {
      console.error("Error handling microphone:", error)
      toast({
        variant: "destructive",
        title: language === "chinese" ? "错误" : "Error",
        description: language === "chinese" 
          ? "访问麦克风时发生意外错误" 
          : "An unexpected error occurred while accessing the microphone",
      })
    }
  }

  // Handle retry: 立即重试直接重新开始录音
  const handleRetry = async () => {
    setResponses([])
    setIsGeneratingResponses(false)
    setTranscriptTyped(false)
    setHasResponseError(false)
    setWaitingMessageIndex(0)
    prevTranscript.current = null
    processedAudioBlob.current = null // 重置已处理的audioBlob
    setFinalTranscript("")
    setDisplayText("")
    setTranscriptLocked(false)
    resetStates();
    startRecording();
  }

  const handleRetryGenerate = () => {
    setHasResponseError(false)
    handleGenerateResponses(finalTranscript)
  }

  // 处理URL哈希定位
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#features") {
        setTimeout(() => {
          const featuresElement = document.getElementById("features");
          if (featuresElement) {
            const headerHeight = 64; // 头部高度
            const elementPosition = featuresElement.offsetTop - headerHeight - 20;
            
            // 确保页面已完全加载和渲染
            if (document.readyState === 'complete') {
              window.scrollTo({
                top: elementPosition,
                behavior: "smooth"
              });
            } else {
              // 如果页面还在加载，等待加载完成
              window.addEventListener('load', () => {
                window.scrollTo({
                  top: elementPosition,
                  behavior: "smooth"
                });
              }, { once: true });
            }
          }
        }, 200); // 增加延迟确保页面已渲染
      } else if (hash === "#faq") {
        setTimeout(() => {
          const faqElement = document.getElementById("faq");
          if (faqElement) {
            const headerHeight = 64; // 头部高度
            const elementPosition = faqElement.offsetTop - headerHeight - 20;
            
            // 确保页面已完全加载和渲染
            if (document.readyState === 'complete') {
              window.scrollTo({
                top: elementPosition,
                behavior: "smooth"
              });
            } else {
              // 如果页面还在加载，等待加载完成
              window.addEventListener('load', () => {
                window.scrollTo({
                  top: elementPosition,
                  behavior: "smooth"
                });
              }, { once: true });
            }
          }
        }, 200);
      }
    };

    // 页面加载时检查哈希
    handleHashChange();
    
    // 监听哈希变化
    window.addEventListener("hashchange", handleHashChange);
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // 动态切换等待消息
  useEffect(() => {
    if (isGeneratingResponses) {
      const interval = setInterval(() => {
        setWaitingMessageIndex((prev) => (prev + 1) % waitingMessages.length)
      }, 3000)
      return () => clearInterval(interval)
    } else {
      setWaitingMessageIndex(0) // 重置到第一条消息
    }
  }, [isGeneratingResponses, waitingMessages.length])

  useEffect(() => {
    if (hasError && !isProcessing && !isRecording) {
      setAppState("error")
      const timer = setTimeout(() => {
        handleReset()
      }, 5000)
      return () => clearTimeout(timer)
    } else if (isRecording) {
      setAppState("recording")
    } else if (transcript && transcript !== prevTranscript.current && !transcriptLocked && !isProcessing) {
      // 只有在transcript未锁定且不在处理中时才处理新的transcript
      setTranscriptTyped(false);
      setFinalTranscript(transcript); // 设置最终确定的transcript
      setDisplayText(transcript); // 设置显示文本，这个不会再改变
      setTranscriptLocked(true); // 锁定transcript，防止后续更新
      prevTranscript.current = transcript;
      setAppState("results");
      setResponses([]);
    }
  }, [isRecording, transcript, hasError, isProcessing, transcriptLocked])

  // 当录音完成时自动进行语音识别，传递用户选择的语言
  useEffect(() => {
    if (audioBlob && !isProcessing && audioBlob !== processedAudioBlob.current) {
      console.log('🔥 开始处理新的音频blob')
      processedAudioBlob.current = audioBlob // 标记为已处理
      processAudio(audioBlob, language)
    }
  }, [audioBlob, language, isProcessing]) // 移除processAudio依赖，避免重复调用

  // 进入results状态时立即开始请求AI回应，同时开始逐字显示
  useEffect(() => {
    if (appState === "results" && finalTranscript && !isGeneratingResponses && responses.length === 0 && !hasResponseError && !hasError && !isRecording) {
      // 立即开始生成AI回应，不等待逐字动画结束
      handleGenerateResponses(finalTranscript)
    }
  }, [appState, finalTranscript, isGeneratingResponses, responses.length, hasResponseError, hasError, isRecording])

  // 回应类型标签及颜色
  const responseTypes = [
    language === "chinese" ? "直接挑战" : "Direct Challenge",
    language === "chinese" ? "理解共情" : "Empathy",
    language === "chinese" ? "引导思考" : "Guided Thinking"
  ];
  const responseTypeColors = [
    "bg-red-100 text-red-700",
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700"
  ];

  // ✅ 现在在所有 Hooks 调用之后进行条件返回
  if (!language) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {appState === "idle" && (
          <div className="container mx-auto max-w-6xl px-4 w-full">
            {/* 主要录音区域 - 增强视觉焦点 */}
            <div className="min-h-screen flex flex-col justify-center items-center text-center relative -mt-16 overflow-hidden">
              {/* 背景装饰 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-sky-50/30 to-cyan-50/50 rounded-none sm:rounded-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/60"></div>
              
              {/* 主要内容 */}
              <div className="relative z-10 w-full max-w-4xl mx-auto py-12 sm:py-20 px-4">
                <h1 className="mb-6 sm:mb-8 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight break-words">
                  {language === "chinese" ? "吵架从此不败！" : "Never Lose Again!"}
                </h1>
                <h2 className="mb-4 sm:mb-6 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-blue-700 to-sky-700 bg-clip-text text-transparent break-words">
                  {language === "chinese" ? "AI助你舌战群雄" : "AI-Powered Debate Mastery"}
                </h2>
                <p className="mb-8 sm:mb-12 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed break-words">
                  {language === "chinese" 
                    ? "点击麦克风开始录对方的话，我会立刻生成反击内容！" 
                    : "Click the microphone to record their argument, and I'll instantly generate your comeback!"}
                </p>
                
                {/* 超大麦克风按钮 - 移动端适配 */}
                <div className="relative flex justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full blur-2xl opacity-30 scale-150 animate-pulse"></div>
                  <Button 
                    onClick={handleMicClick}
                    size="lg"
                    className="relative flex h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-40 lg:w-40 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all duration-500 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-110 border-4 border-white/20"
                  >
                    <Mic className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 text-white drop-shadow-lg" />
                  </Button>
                </div>
                
                {/* 提示文字 */}
                <p className="mt-6 sm:mt-8 text-sm sm:text-base md:text-lg text-gray-500 animate-bounce">
                  {language === "chinese" ? "点击开始" : "Click to Start"}
                </p>
              </div>
            </div>

            {/* 功能特点展示 - 移动端优化 */}
            <div id="features" className="py-12 sm:py-20 bg-gray-50/50 overflow-hidden">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-700 break-words">
                    {language === "chinese" ? "核心功能" : "Core Features"}
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-4xl mx-auto break-words">
                    {language === "chinese" 
                      ? "专业、快速、智能的AI辩论助手"
                      : "Professional, fast, and intelligent AI debate assistance"
                    }
                  </p>
                </div>

                {/* 核心功能卡片 - 移动端优化 */}
                <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                  {[
                    {
                      icon: Mic,
                      titleCN: "智能语音识别",
                      titleEN: "Smart Speech Recognition",
                      descCN: "Deepgram Nova-2模型，95%+识别准确率",
                      descEN: "Deepgram Nova-2 model, 95%+ accuracy",
                      color: "border-blue-300 text-blue-400"
                    },
                    {
                      icon: Brain,
                      titleCN: "AI智能回应",
                      titleEN: "AI Smart Response",
                      descCN: "Google Gemini 2.0，1秒生成3种策略",
                      descEN: "Google Gemini 2.0, 3 strategies in 1 second",
                      color: "border-sky-300 text-sky-400"
                    },
                    {
                      icon: Zap,
                      titleCN: "极速响应",
                      titleEN: "Lightning Speed",
                      descCN: "平均1秒响应，比传统AI快10倍",
                      descEN: "1 second response, 10x faster than traditional AI",
                      color: "border-cyan-300 text-cyan-400"
                    },
                    {
                      icon: Target,
                      titleCN: "三种策略",
                      titleEN: "Three Strategies",
                      descCN: "挑战、共情、引导 - 适应不同场景",
                      descEN: "Challenge, Empathy, Guidance - for different scenarios",
                      color: "border-blue-400 text-blue-500"
                    },
                    {
                      icon: Globe,
                      titleCN: "双语支持",
                      titleEN: "Bilingual Support",
                      descCN: "中英文双语，自动识别语言",
                      descEN: "Chinese & English, auto language detection",
                      color: "border-cyan-300 text-cyan-500"
                    },
                    {
                      icon: Shield,
                      titleCN: "隐私保护",
                      titleEN: "Privacy Protection",
                      descCN: "不存储数据，绝对保护隐私",
                      descEN: "No data storage, absolute privacy protection",
                      color: "border-blue-300 text-blue-500"
                    }
                  ].map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <div key={index} className="group text-center p-4 sm:p-6 w-full min-w-0">
                        <div className="mb-4 sm:mb-6">
                          <div className={`inline-flex p-3 sm:p-4 rounded-xl border ${feature.color} bg-white/50 group-hover:scale-105 transition-all duration-300`}>
                            <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 mb-2 sm:mb-3 break-words">
                          {language === "chinese" ? feature.titleCN : feature.titleEN}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-500 leading-relaxed break-words">
                          {language === "chinese" ? feature.descCN : feature.descEN}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 全球精英信任模块 */}
            <div className="py-12 sm:py-20 bg-gradient-to-br from-blue-50/40 via-sky-50/30 to-cyan-50/40 overflow-hidden">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12 sm:mb-16">
                  <div className="inline-flex items-center gap-2 bg-blue-100/60 text-blue-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    {language === "chinese" ? "全球认证" : "Globally Certified"}
                  </div>
                  <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 break-words">
                    {language === "chinese" 
                      ? "全球精英都在用的辩论神器" 
                      : "The Debate Tool Used by Global Elites"
                    }
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed break-words">
                    {language === "chinese" 
                      ? "从硅谷CEO到华尔街律师，从学术教授到创业精英，他们都选择 Argument Ace 提升辩论实力"
                      : "From Silicon Valley CEOs to Wall Street lawyers, from academic professors to startup elites, they all choose Argument Ace to enhance their debate skills"
                    }
                  </p>
                </div>

                {/* 核心数据展示 - 移动端优化 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto mb-12 sm:mb-16">
                  <div className="text-center group">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-blue-600 mb-1 sm:mb-2 md:mb-3 break-words">100K+</div>
                      <div className="text-xs sm:text-sm md:text-base text-gray-600 font-medium break-words">
                        {language === "chinese" ? "活跃用户" : "Active Users"}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                        {language === "chinese" ? "遍布全球" : "Worldwide"}
                      </div>
                    </div>
                  </div>
                  <div className="text-center group">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm border border-sky-100 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-sky-600 mb-1 sm:mb-2 md:mb-3 break-words">500K+</div>
                      <div className="text-xs sm:text-sm md:text-base text-gray-600 font-medium break-words">
                        {language === "chinese" ? "成功对话" : "Successful Debates"}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                        {language === "chinese" ? "每日新增" : "Daily Growth"}
                      </div>
                    </div>
                  </div>
                  <div className="text-center group">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm border border-cyan-100 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-cyan-600 mb-1 sm:mb-2 md:mb-3 break-words">4.9</div>
                      <div className="text-xs sm:text-sm md:text-base text-gray-600 font-medium break-words">
                        {language === "chinese" ? "用户评分" : "User Rating"}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                        {language === "chinese" ? "满分5.0" : "Out of 5.0"}
                      </div>
                    </div>
                  </div>
                  <div className="text-center group">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-blue-600 mb-1 sm:mb-2 md:mb-3 break-words">98%</div>
                      <div className="text-xs sm:text-sm md:text-base text-gray-600 font-medium break-words">
                        {language === "chinese" ? "推荐率" : "Recommendation"}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                        {language === "chinese" ? "用户推荐" : "User Recommend"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 信任标识 - 移动端优化 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
                  <div className="text-center p-4 sm:p-6 w-full min-w-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 break-words">
                      {language === "chinese" ? "全球精英首选" : "Global Elite's Choice"}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words">
                      {language === "chinese" 
                        ? "500强企业高管、顶级律师事务所合伙人、知名学府教授都在使用"
                        : "Used by Fortune 500 executives, top law firm partners, and renowned university professors"
                      }
                    </p>
                  </div>
                  <div className="text-center p-4 sm:p-6 w-full min-w-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-sky-100 rounded-full mb-3 sm:mb-4">
                      <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-sky-600 flex-shrink-0" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 break-words">
                      {language === "chinese" ? "效果立竿见影" : "Immediate Results"}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words">
                      {language === "chinese" 
                        ? "平均使用3天后，用户在辩论中的胜率提升67%，自信心显著增强"
                        : "After 3 days of use, users' debate win rate increases by 67% with significantly boosted confidence"
                      }
                    </p>
                  </div>
                  <div className="text-center p-4 sm:p-6 w-full min-w-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-cyan-100 rounded-full mb-3 sm:mb-4">
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-600 flex-shrink-0" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 break-words">
                      {language === "chinese" ? "安全可信赖" : "Safe & Trustworthy"}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words">
                      {language === "chinese" 
                        ? "企业级安全保障，不存储任何个人数据，通过多项国际安全认证"
                        : "Enterprise-grade security, no personal data storage, certified by multiple international security standards"
                      }
                    </p>
                  </div>
                </div>

                {/* 立即行动按钮 - 移动端优化 */}
                <div className="text-center mt-12 sm:mt-16">
                  <div className="inline-flex flex-col items-center gap-3 sm:gap-4">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white px-6 sm:px-8 md:px-12 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={handleMicClick}
                    >
                      <Sparkles className="mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
                      {language === "chinese" ? "立即免费体验" : "Try Free Now"}
                    </Button>
                    <p className="text-xs sm:text-sm text-gray-500 break-words">
                      {language === "chinese" 
                        ? "无需注册 • 完全免费 • 立即可用"
                        : "No Registration • Completely Free • Ready to Use"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 用户评价模块 - 增大 */}
            <div className="py-12 sm:py-20 bg-gradient-to-br from-blue-50/30 via-sky-50/20 to-cyan-50/30 overflow-hidden">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-700 break-words">
                    {language === "chinese" ? "用户评价" : "User Reviews"}
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-4xl mx-auto break-words">
                    {language === "chinese" 
                      ? "已有超过10万用户选择 Argument Ace，看看他们怎么说"
                      : "Over 100,000 users have chosen Argument Ace, see what they say"
                    }
                  </p>
                </div>

                {/* 评价统计 - 移动端优化 */}
                <div className="text-center mb-12 sm:mb-16">
                  <div className="flex justify-center items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      ))}
                    </div>
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700">4.9</span>
                    <span className="text-sm sm:text-base md:text-lg text-gray-500">/ 5.0</span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-gray-500 break-words">
                    {language === "chinese" 
                      ? "基于 12,847 条真实用户评价"
                      : "Based on 12,847 genuine user reviews"
                    }
                  </p>
                </div>

                {/* 用户评价卡片 - 移动端优化 */}
                <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                  {[
                    {
                      nameCN: "张经理",
                      nameEN: "Manager Zhang",
                      titleCN: "互联网公司产品经理",
                      titleEN: "Product Manager, Tech Company",
                      contentCN: "开会时再也不怕被挑战了！AI生成的回应既专业又有说服力，帮我在团队讨论中更有自信。",
                      contentEN: "No more fear of being challenged in meetings! AI responses are professional and persuasive, boosting my confidence in team discussions.",
                      rating: 5,
                      avatar: "👨‍💼"
                    },
                    {
                      nameCN: "李律师",
                      nameEN: "Lawyer Li",
                      titleCN: "执业律师",
                      titleEN: "Practicing Lawyer",
                      contentCN: "作为律师，我需要快速反应能力。这个工具在法庭辩论准备中给了我很多灵感，1秒生成回应真的很神奇！",
                      contentEN: "As a lawyer, I need quick response skills. This tool gives me great inspiration for court debate preparation. 1-second response generation is amazing!",
                      rating: 5,
                      avatar: "👩‍⚖️"
                    },
                    {
                      nameCN: "王同学",
                      nameEN: "Student Wang",
                      titleCN: "大学辩论队队长",
                      titleEN: "University Debate Team Captain",
                      contentCN: "辩论赛前必备神器！三种不同策略让我能应对各种对手，队友们都在用，我们战绩提升了很多。",
                      contentEN: "Essential tool before debate competitions! Three different strategies help me handle various opponents. Our team's performance has improved significantly.",
                      rating: 5,
                      avatar: "🎓"
                    },
                    {
                      nameCN: "陈总监",
                      nameEN: "Director Chen",
                      titleCN: "销售总监",
                      titleEN: "Sales Director",
                      contentCN: "客户谈判时的秘密武器！当客户提出异议时，我能立刻找到合适的回应角度，成交率明显提高。",
                      contentEN: "Secret weapon in client negotiations! When clients raise objections, I can immediately find the right response angle. Closing rate has improved significantly.",
                      rating: 5,
                      avatar: "👔"
                    },
                    {
                      nameCN: "刘博士",
                      nameEN: "Dr. Liu",
                      titleCN: "大学教授",
                      titleEN: "University Professor",
                      contentCN: "学术讨论中经常需要为自己的观点辩护，这个AI助手帮我组织思路，让论证更加严密和有说服力。",
                      contentEN: "Academic discussions often require defending viewpoints. This AI assistant helps organize my thoughts, making arguments more rigorous and persuasive.",
                      rating: 5,
                      avatar: "👨‍🏫"
                    },
                    {
                      nameCN: "赵创业者",
                      nameEN: "Entrepreneur Zhao",
                      titleCN: "创业公司CEO",
                      titleEN: "Startup CEO",
                      contentCN: "投资人路演时的救星！面对投资人的尖锐问题，AI帮我快速组织回应，已经成功融资两轮了。",
                      contentEN: "Lifesaver during investor pitches! Facing sharp questions from investors, AI helps me quickly organize responses. Successfully raised two funding rounds!",
                      rating: 5,
                      avatar: "🚀"
                    }
                  ].map((review, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 w-full min-w-0">
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="text-xl sm:text-2xl md:text-3xl flex-shrink-0">{review.avatar}</div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                            {language === "chinese" ? review.nameCN : review.nameEN}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-500 break-words">
                            {language === "chinese" ? review.titleCN : review.titleEN}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 mb-3 sm:mb-4">
                        {[1,2,3,4,5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                          />
                        ))}
                      </div>
                      
                      <div className="relative">
                        <Quote className="absolute -top-1 -left-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-200 flex-shrink-0" />
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed pl-4 sm:pl-6 break-words">
                          {language === "chinese" ? review.contentCN : review.contentEN}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 常见问题模块 - 增大 */}
            <div id="faq" className="py-12 sm:py-20 bg-white overflow-hidden">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-700 break-words">
                    {language === "chinese" ? "常见问题" : "FAQ"}
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-4xl mx-auto break-words">
                    {language === "chinese" 
                      ? "快速了解 Argument Ace"
                      : "Quick guide to Argument Ace"
                    }
                  </p>
                </div>

                {/* FAQ内容 - 移动端优化 */}
                <div className="grid gap-6 sm:gap-8 md:gap-10 grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto">
                  {[
                    {
                      titleCN: "基础功能",
                      titleEN: "Basic Features",
                      icon: Mic,
                      iconColor: "border-blue-300 text-blue-400",
                      questions: [
                        {
                          questionCN: "Argument Ace 是什么？",
                          questionEN: "What is Argument Ace?",
                          answerCN: "AI语音辩论助手，1秒生成3种回应策略",
                          answerEN: "AI voice debate assistant, 3 response strategies in 1 second"
                        },
                        {
                          questionCN: "需要下载软件吗？",
                          questionEN: "Need to download software?",
                          answerCN: "不需要，直接在浏览器中使用",
                          answerEN: "No, use directly in your browser"
                        },
                        {
                          questionCN: "支持哪些语言？",
                          questionEN: "What languages are supported?",
                          answerCN: "中英文双语，自动识别",
                          answerEN: "Chinese & English, auto-detection"
                        }
                      ]
                    },
                    {
                      titleCN: "技术优势",
                      titleEN: "Technical Advantages",
                      icon: Brain,
                      iconColor: "border-sky-300 text-sky-400",
                      questions: [
                        {
                          questionCN: "AI回应质量如何？",
                          questionEN: "How good is AI response quality?",
                          answerCN: "Google Gemini 2.0模型，自然流畅",
                          answerEN: "Google Gemini 2.0 model, natural and fluent"
                        },
                        {
                          questionCN: "为什么这么快？",
                          questionEN: "Why so fast?",
                          answerCN: "比传统AI快10倍，平均1秒响应",
                          answerEN: "10x faster than traditional AI, 1 second response"
                        },
                        {
                          questionCN: "识别准确率如何？",
                          questionEN: "How accurate is recognition?",
                          answerCN: "Deepgram Nova-2，95%+准确率",
                          answerEN: "Deepgram Nova-2, 95%+ accuracy"
                        }
                      ]
                    },
                    {
                      titleCN: "隐私安全",
                      titleEN: "Privacy & Security",
                      icon: Shield,
                      iconColor: "border-cyan-300 text-cyan-400",
                      questions: [
                        {
                          questionCN: "录音会被保存吗？",
                          questionEN: "Will recordings be saved?",
                          answerCN: "不会，实时处理后立即删除",
                          answerEN: "No, deleted immediately after processing"
                        },
                        {
                          questionCN: "对话内容安全吗？",
                          questionEN: "Is conversation content secure?",
                          answerCN: "全程加密，不存储个人数据",
                          answerEN: "Fully encrypted, no personal data storage"
                        },
                        {
                          questionCN: "需要注册账户吗？",
                          questionEN: "Need to register an account?",
                          answerCN: "不需要注册，直接使用",
                          answerEN: "No registration required, use directly"
                        }
                      ]
                    },
                    {
                      titleCN: "使用场景",
                      titleEN: "Use Cases",
                      icon: Target,
                      iconColor: "border-blue-300 text-blue-500",
                      questions: [
                        {
                          questionCN: "什么时候最有效？",
                          questionEN: "When is it most effective?",
                          answerCN: "工作讨论、辩论、需要快速反驳时",
                          answerEN: "Work discussions, debates, quick rebuttals needed"
                        },
                        {
                          questionCN: "三种策略有何区别？",
                          questionEN: "What's the difference between strategies?",
                          answerCN: "挑战、共情、引导 - 适应不同场景",
                          answerEN: "Challenge, Empathy, Guidance - for different scenarios"
                        },
                        {
                          questionCN: "温和替代是什么？",
                          questionEN: "What are gentle alternatives?",
                          answerCN: "提供更礼貌的表达方式",
                          answerEN: "Provides more polite expressions"
                        }
                      ]
                    }
                  ].map((category, categoryIndex) => {
                    const IconComponent = category.icon;
                    return (
                      <div key={categoryIndex} className="bg-gray-50/50 rounded-lg p-4 sm:p-6 md:p-8 w-full min-w-0">
                        <div className="mb-6 sm:mb-8">
                          <div className="flex items-center gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
                            <div className={`p-2 sm:p-3 md:p-4 rounded-xl border bg-white ${category.iconColor} flex-shrink-0`}>
                              <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                            </div>
                            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 break-words">
                              {language === "chinese" ? category.titleCN : category.titleEN}
                            </h3>
                          </div>
                        </div>
                        <div className="space-y-4 sm:space-y-6">
                          {category.questions.map((faq, faqIndex) => (
                            <div key={faqIndex} className="border-l-3 border-gray-300 pl-4 sm:pl-5">
                              <h4 className="font-bold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base break-words">
                                {language === "chinese" ? faq.questionCN : faq.questionEN}
                              </h4>
                              <p className="text-gray-600 text-sm sm:text-base leading-relaxed break-words">
                                {language === "chinese" ? faq.answerCN : faq.answerEN}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 联系方式模块 */}
            <div className="py-12 sm:py-20 bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-sky-50/40 overflow-hidden">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-700 break-words">
                    {language === "chinese" ? "联系我们" : "Contact Us"}
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-4xl mx-auto break-words">
                    {language === "chinese" 
                      ? "有问题或建议？我们随时为您提供帮助"
                      : "Have questions or suggestions? We're here to help"
                    }
                  </p>
                </div>

                {/* 联系方式卡片 - 移动端优化 */}
                <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
                  {/* 邮件联系 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 text-center group w-full min-w-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 break-words">
                      {language === "chinese" ? "邮件咨询" : "Email Support"}
                    </h3>
                    <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm md:text-base break-words">
                      {language === "chinese" 
                        ? "技术问题、功能建议或合作咨询，我们会在24小时内回复"
                        : "Technical issues, feature suggestions, or partnership inquiries - we'll respond within 24 hours"
                      }
                    </p>
                    <a 
                      href="mailto:gavinhawk888@gmail.com?subject=Argument Ace - 咨询&body=您好，我想咨询关于 Argument Ace 的问题：%0A%0A"
                      className="inline-flex items-center gap-1 sm:gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-300 text-xs sm:text-sm md:text-base break-words"
                    >
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      {language === "chinese" ? "发送邮件" : "Send Email"}
                    </a>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 break-words">
                      gavinhawk888@gmail.com
                    </p>
                  </div>

                  {/* 反馈建议 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 text-center group w-full min-w-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-sky-100 rounded-full mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-sky-600 flex-shrink-0" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 break-words">
                      {language === "chinese" ? "产品反馈" : "Product Feedback"}
                    </h3>
                    <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm md:text-base break-words">
                      {language === "chinese" 
                        ? "使用体验、功能改进建议，帮助我们打造更好的产品"
                        : "User experience and feature improvement suggestions to help us build a better product"
                      }
                    </p>
                    <a 
                      href="mailto:gavinhawk888@gmail.com?subject=Argument Ace - 产品反馈&body=产品反馈：%0A%0A使用场景：%0A%0A建议改进：%0A%0A整体评价：%0A%0A"
                      className="inline-flex items-center gap-1 sm:gap-2 bg-sky-500 hover:bg-sky-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-300 text-xs sm:text-sm md:text-base break-words"
                    >
                      <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      {language === "chinese" ? "提交反馈" : "Submit Feedback"}
                    </a>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 break-words">
                      {language === "chinese" ? "您的意见很重要" : "Your feedback matters"}
                    </p>
                  </div>

                  {/* 商务合作 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 text-center group w-full min-w-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-cyan-100 rounded-full mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-600 flex-shrink-0" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 break-words">
                      {language === "chinese" ? "商务合作" : "Business Partnership"}
                    </h3>
                    <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm md:text-base break-words">
                      {language === "chinese" 
                        ? "企业定制、API接入、渠道合作等商务洽谈"
                        : "Enterprise customization, API integration, channel partnerships and other business discussions"
                      }
                    </p>
                    <a 
                      href="mailto:gavinhawk888@gmail.com?subject=Argument Ace - 商务合作&body=合作类型：%0A%0A公司信息：%0A%0A合作需求：%0A%0A联系方式：%0A%0A"
                      className="inline-flex items-center gap-1 sm:gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-300 text-xs sm:text-sm md:text-base break-words"
                    >
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      {language === "chinese" ? "商务洽谈" : "Business Inquiry"}
                    </a>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 break-words">
                      {language === "chinese" ? "期待与您合作" : "Looking forward to cooperation"}
                    </p>
                  </div>
                </div>

                {/* 底部提示 - 移动端优化 */}
                <div className="text-center mt-12 sm:mt-16">
                  <div className="bg-blue-50/50 rounded-xl p-4 sm:p-6 max-w-3xl mx-auto">
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 break-words">
                      {language === "chinese" ? "💡 快速获得帮助" : "💡 Get Help Quickly"}
                    </h4>
                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base break-words">
                      {language === "chinese" 
                        ? "在发送邮件前，建议先查看上方的常见问题，可能已经有您需要的答案。如果没有找到解决方案，请详细描述您遇到的问题，我们会尽快为您解答。"
                        : "Before sending an email, we recommend checking the FAQ section above - you might find the answer you need. If you don't find a solution, please describe your issue in detail and we'll get back to you as soon as possible."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {appState === "recording" && (
          <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12 text-center overflow-hidden">
            <h1 className="mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl font-bold animate-pulse break-words">
              {language === "chinese" ? "正在倾听..." : "Listening..."}
            </h1>
            
            <div className="relative mx-auto mb-8 sm:mb-10 h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
              <div className="absolute inset-0 rounded-full bg-blue-100 flex items-center justify-center">
                <Mic className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-500" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-75 animate-ping"></div>
            </div>
            
            <p className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg text-muted-foreground break-words px-2">
              {language === "chinese" 
                ? "清晰地对着麦克风说话。我们准备好捕捉您的论点了。" 
                : "Speak clearly into your microphone. We're ready to capture your argument."}
            </p>
            
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="lg"
              className="inline-flex items-center gap-2 align-middle px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base"
            >
              <Square className="h-4 w-4 sm:h-5 sm:w-5 inline-block align-middle flex-shrink-0" />
              {language === "chinese" ? "停止录制" : "Stop Recording"}
            </Button>
          </div>
        )}

        {appState === "processing" && (
          <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12 text-center overflow-hidden">
            <h1 className="mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl font-bold break-words">
              {language === "chinese" ? "正在处理..." : "Processing..."}
            </h1>
            
            <div className="relative mx-auto mb-8 sm:mb-10 h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
              <div className="absolute inset-0 rounded-full bg-green-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-green-500 animate-spin" />
              </div>
            </div>
            
            <p className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg text-muted-foreground break-words px-2">
              {isProcessing 
                ? (language === "chinese" ? "正在识别语音内容..." : "Recognizing speech content...")
                : (language === "chinese" ? "正在生成智能回应..." : "Generating intelligent responses...")}
            </p>
          </div>
        )}

        {appState === "error" && (
          <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12 text-center overflow-hidden">
            <h1 className="mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl font-bold text-red-600 break-words">
              {language === "chinese" ? "音频识别失败，请重试！" : "Audio Recognition Failed, Please Try Again!"}
            </h1>
            
            <div className="relative mx-auto mb-8 sm:mb-10 h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
              <div className="absolute inset-0 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-red-500" />
              </div>
            </div>
            
            <p className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg text-muted-foreground break-words px-2">
              {language === "chinese" 
                ? "5秒后将自动返回初始页面..." 
                : "Returning to home page in 5 seconds..."}
            </p>
            
            <Button
              onClick={handleRetry}
              variant="outline"
              size="lg"
              className="inline-flex items-center gap-2 align-middle px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base"
            >
              <Mic className="h-4 w-4 sm:h-5 sm:w-5 inline-block align-middle flex-shrink-0" />
              {language === "chinese" ? "立即重试" : "Try Again Now"}
            </Button>
          </div>
        )}

        {appState === "results" && (
          <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-8 overflow-hidden">
            <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-center break-words">
              {language === "chinese" ? "建议回应" : "Suggested Replies"}
            </h2>
            
            {hasResponseError && (
              <div className="mb-4 text-center">
                <div className="mb-2 text-red-600 font-semibold text-sm sm:text-base break-words">
                  {language === "chinese"
                    ? "网络有点开小差，请点击重试按钮"
                    : "Network error, please click the retry button"}
                </div>
                <Button
                  onClick={handleRetryGenerate}
                  variant="destructive"
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 text-sm sm:text-base"
                >
                  {language === "chinese" ? "重试" : "Retry"}
                </Button>
              </div>
            )}
            
            <div className="mb-4 sm:mb-6 rounded-lg bg-secondary p-3 sm:p-4">
              <h3 className="mb-2 font-medium text-xs sm:text-sm text-muted-foreground break-words">
                {language === "chinese" ? "对方说道" : "They said"}:
              </h3>
              <p className="text-sm sm:text-base md:text-lg italic break-words">
                {transcriptTyped
                  ? <span>{displayText}</span>
                  : <TypingText text={displayText} onEnd={() => setTranscriptTyped(true)} />
                }
              </p>
              
              {isGeneratingResponses && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-muted-foreground/20">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
                    <span className="text-xs sm:text-sm break-words">
                      {waitingMessages[waitingMessageIndex]}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {responses.length === 0 && !isGeneratingResponses ? (
              <div className="w-full flex justify-center">
                <div className="text-center text-muted-foreground text-sm sm:text-base md:text-lg py-6 sm:py-8 break-words">
                  {language === "chinese" ? "等待生成回应..." : "Waiting to generate responses..."}
                </div>
              </div>
            ) : responses.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
                {responses.map((response, index) => (
                  <Card key={index} className="overflow-hidden w-full min-w-0">
                    <CardHeader className="bg-primary/5 pb-2">
                      <div className="flex justify-center">
                        <span className={`inline-block rounded px-2 sm:px-3 py-0.5 text-xs sm:text-sm font-bold break-words ${responseTypeColors[index]}`}>{responseTypes[index]}</span>
                      </div>
                      <CardTitle className="text-sm sm:text-base md:text-lg text-primary font-bold break-words">
                        {response.text}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 sm:pt-4">
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">{response.description}</p>
                      {response.alternative && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                          <h4 className="text-xs sm:text-sm font-medium mb-1 break-words">
                            {language === "chinese" ? "更温和的替代方案" : "Cleaner Alternative"}:
                          </h4>
                          <p className="text-xs sm:text-sm text-sky-600 break-words">"{response.alternative}"</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}
            
            <div className="mt-6 sm:mt-8 flex justify-center">
              <Button onClick={handleRetry} className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                <Mic className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                {language === "chinese" ? "再次录制" : "Record Again"}
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}