"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mic, Square, Loader2 } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { generateResponses, ArgumentResponse } from "@/lib/response-generator"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [language] = useLocalStorage<string>("language", "english")
  const [appState, setAppState] = useState<"idle" | "recording" | "processing" | "results">("idle")
  const [responses, setResponses] = useState<ArgumentResponse[]>([])
  const [isGeneratingResponses, setIsGeneratingResponses] = useState(false)
  const { isRecording, transcript, isProcessing, startRecording, stopRecording, checkMicrophonePermission } = useAudioRecorder()
  const router = useRouter()
  const { toast } = useToast()

  // Set app state based on recording state and transcript
  useEffect(() => {
    if (isRecording) {
      setAppState("recording")
    } else if (isProcessing) {
      setAppState("processing")
    } else if (transcript && !isGeneratingResponses) {
      // Generate responses when transcript is available
      handleGenerateResponses(transcript)
    }
  }, [isRecording, isProcessing, transcript])

  // Generate AI responses
  const handleGenerateResponses = async (transcriptText: string) => {
    if (!transcriptText.trim()) return
    
    setIsGeneratingResponses(true)
    setAppState("processing")
    
    try {
      const generatedResponses = await generateResponses(transcriptText, language)
      setResponses(generatedResponses)
      setAppState("results")
      
      toast({
        title: language === "chinese" ? "回应生成完成" : "Responses Generated",
        description: language === "chinese" 
          ? `生成了 ${generatedResponses.length} 个建议回应` 
          : `Generated ${generatedResponses.length} suggested responses`,
      })
    } catch (error) {
      console.error("Error generating responses:", error)
      toast({
        variant: "destructive",
        title: language === "chinese" ? "生成失败" : "Generation Failed",
        description: language === "chinese" 
          ? "无法生成回应，请稍后重试" 
          : "Failed to generate responses, please try again",
      })
      setAppState("idle")
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
              className="flex items-center gap-2"
            >
              <Square className="h-5 w-5" />
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

        {appState === "results" && (
          <div className="container mx-auto max-w-5xl px-4 py-8">
            <h2 className="mb-6 text-3xl font-bold text-center">
              {language === "chinese" ? "建议回应" : "Suggested Replies"}
            </h2>
            
            <div className="mb-6 rounded-lg bg-secondary p-4">
              <h3 className="mb-2 font-medium text-sm text-muted-foreground">
                {language === "chinese" ? "对方说道" : "They said"}:
              </h3>
              <p className="text-lg italic">"{transcript}"</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {responses.map((response, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="text-lg text-primary font-bold">
                      "{response.text}"
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
            
            <div className="mt-8 flex justify-center">
              <Button onClick={handleReset} className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                {language === "chinese" ? "录制新的论点" : "Record New Argument"}
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}