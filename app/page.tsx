"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Mic, Square, Loader2, AlertCircle } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useLanguage } from "@/hooks/language-context"
import { generateResponses, ArgumentResponse } from "@/lib/response-generator"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const { language } = useLanguage()
  if (!language) return null;
  const [appState, setAppState] = useState<"idle" | "recording" | "processing" | "results" | "error">("idle")
  const [responses, setResponses] = useState<ArgumentResponse[]>([])
  const [isGeneratingResponses, setIsGeneratingResponses] = useState(false)
  const { isRecording, transcript, isProcessing, hasError, startRecording, stopRecording, checkMicrophonePermission, resetStates } = useAudioRecorder()
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
  
  // 等待消息列表
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

  // 进入results状态时立即开始请求AI回应，同时开始逐字显示
  useEffect(() => {
    if (appState === "results" && finalTranscript && !isGeneratingResponses && responses.length === 0 && !hasResponseError && !hasError && !isRecording) {
      // 立即开始生成AI回应，不等待逐字动画结束
      handleGenerateResponses(finalTranscript)
    }
  }, [appState, finalTranscript, isGeneratingResponses, responses.length, hasResponseError, hasError, isRecording])

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

  // Handle resets
  const handleReset = () => {
    setAppState("idle")
    setResponses([])
    setIsGeneratingResponses(false)
    setTranscriptTyped(false)
    setHasResponseError(false)
    setWaitingMessageIndex(0)
    prevTranscript.current = null
    setFinalTranscript("")
    setDisplayText("")
    setTranscriptLocked(false)
    resetStates()
  }

  // Handle retry: 立即重试直接重新开始录音
  const handleRetry = async () => {
    setResponses([])
    setIsGeneratingResponses(false)
    setTranscriptTyped(false)
    setHasResponseError(false)
    setWaitingMessageIndex(0)
    prevTranscript.current = null
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

  // 逐字显示文本动画（用于"对方说道"），动画结束时onEnd触发
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {appState === "idle" && (
          <div className="container mx-auto max-w-3xl px-4 py-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">
              {language === "chinese" ? "点击开始录音" : "Tap to Speak"}
            </h1>
            <p className="mb-12 text-lg text-muted-foreground">
              {language === "chinese" 
                ? "让我们听听对方的论点。我们会提供一些绝妙的回应。" 
                : "Let's hear your argument. We'll suggest some ace replies."}
            </p>
            
            <Button 
              onClick={handleMicClick}
              size="lg"
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Mic className="h-12 w-12 text-white" />
            </Button>
          </div>
        )}

        {appState === "recording" && (
          <div className="container mx-auto max-w-3xl px-4 py-12 text-center">
            <h1 className="mb-4 text-3xl font-bold animate-pulse">
              {language === "chinese" ? "正在倾听..." : "Listening..."}
            </h1>
            
            <div className="relative mx-auto mb-10 h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-blue-100 flex items-center justify-center">
                <Mic className="h-12 w-12 text-blue-500" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-75 animate-ping"></div>
            </div>
            
            <p className="mb-8 text-lg text-muted-foreground">
              {language === "chinese" 
                ? "清晰地对着麦克风说话。我们准备好捕捉您的论点了。" 
                : "Speak clearly into your microphone. We're ready to capture your argument."}
            </p>
            
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="lg"
              className="inline-flex items-center gap-2 align-middle"
            >
              <Square className="h-5 w-5 inline-block align-middle" />
              {language === "chinese" ? "停止录制" : "Stop Recording"}
            </Button>
          </div>
        )}

        {appState === "processing" && (
          <div className="container mx-auto max-w-3xl px-4 py-12 text-center">
            <h1 className="mb-4 text-3xl font-bold">
              {language === "chinese" ? "正在处理..." : "Processing..."}
            </h1>
            
            <div className="relative mx-auto mb-10 h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-green-100 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
              </div>
            </div>
            
            <p className="mb-8 text-lg text-muted-foreground">
              {isProcessing 
                ? (language === "chinese" ? "正在识别语音内容..." : "Recognizing speech content...")
                : (language === "chinese" ? "正在生成智能回应..." : "Generating intelligent responses...")}
            </p>
          </div>
        )}

        {appState === "error" && (
          <div className="container mx-auto max-w-3xl px-4 py-12 text-center">
            <h1 className="mb-4 text-3xl font-bold text-red-600">
              {language === "chinese" ? "音频识别失败，请重试！" : "Audio Recognition Failed, Please Try Again!"}
            </h1>
            
            <div className="relative mx-auto mb-10 h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
            </div>
            
            <p className="mb-8 text-lg text-muted-foreground">
              {language === "chinese" 
                ? "5秒后将自动返回初始页面..." 
                : "Returning to home page in 5 seconds..."}
            </p>
            
            <Button
              onClick={handleRetry}
              variant="outline"
              size="lg"
              className="inline-flex items-center gap-2 align-middle"
            >
              <Mic className="h-5 w-5 inline-block align-middle" />
              {language === "chinese" ? "立即重试" : "Try Again Now"}
            </Button>
          </div>
        )}

        {appState === "results" && (
          <div className="container mx-auto max-w-5xl px-4 py-8">
            <h2 className="mb-6 text-3xl font-bold text-center">
              {language === "chinese" ? "建议回应" : "Suggested Replies"}
            </h2>
            
            {hasResponseError && (
              <div className="mb-4 text-center">
                <div className="mb-2 text-red-600 font-semibold">
                  {language === "chinese"
                    ? "网络有点开小差，请点击重试按钮"
                    : "Network error, please click the retry button"}
                </div>
                <Button
                  onClick={handleRetryGenerate}
                  variant="destructive"
                  className="inline-flex items-center gap-2"
                >
                  {language === "chinese" ? "重试" : "Retry"}
                </Button>
              </div>
            )}
            
            <div className="mb-6 rounded-lg bg-secondary p-4">
              <h3 className="mb-2 font-medium text-sm text-muted-foreground">
                {language === "chinese" ? "对方说道" : "They said"}:
              </h3>
              <p className="text-lg italic">
                {transcriptTyped
                  ? <span>{displayText}</span>
                  : <TypingText text={displayText} onEnd={() => setTranscriptTyped(true)} />
                }
              </p>
              
              {isGeneratingResponses && (
                <div className="mt-4 pt-4 border-t border-muted-foreground/20">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">
                      {waitingMessages[waitingMessageIndex]}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {responses.length === 0 && !isGeneratingResponses ? (
              <div className="w-full flex justify-center">
                <div className="text-center text-muted-foreground text-lg py-8">
                  {language === "chinese" ? "等待生成回应..." : "Waiting to generate responses..."}
                </div>
              </div>
            ) : responses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-3">
                {responses.map((response, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-2">
                      <div className="flex justify-center">
                        <span className={`inline-block rounded px-3 py-0.5 text-base font-bold ${responseTypeColors[index]}`}>{responseTypes[index]}</span>
                      </div>
                      <CardTitle className="text-lg text-primary font-bold">
                        {response.text}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{response.description}</p>
                      {response.alternative && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium mb-1">
                            {language === "chinese" ? "更温和的替代方案" : "Cleaner Alternative"}:
                          </h4>
                          <p className="text-sm text-blue-600">"{response.alternative}"</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}
            
            <div className="mt-8 flex justify-center">
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
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