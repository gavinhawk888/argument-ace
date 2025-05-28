"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { toast } = useToast()
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const processingRef = useRef<boolean>(false) // 防重复处理标志

  // 重置所有状态
  const resetStates = useCallback(() => {
    setIsRecording(false)
    setAudioBlob(null)
    setTranscript("")
    setIsProcessing(false)
    setHasError(false)
    processingRef.current = false // 重置处理标志
  }, [])

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      // 重置之前的状态
      resetStates()
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      // 检查支持的MIME类型
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4'
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''
          }
        }
      }
      
      console.log('🎤 使用音频格式:', mimeType)
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 128000
      })
      
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mimeType || 'audio/webm' 
        })
        setAudioBlob(audioBlob)
        
        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop())
        
        // 不在这里调用processAudio，让页面的useEffect处理
        // await processAudio(audioBlob)
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // 每秒收集一次数据
      setIsRecording(true)
      
      toast({
        title: "录音开始",
        description: "请清晰地说话，我们正在监听...",
      })
    } catch (error) {
      console.error('Start recording error:', error)
      setHasError(true)
      toast({
        variant: "destructive",
        title: "录音失败",
        description: "无法访问麦克风，请检查权限设置",
      })
    }
  }, [toast, resetStates])

  // 停止录音
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      // 不在这里设置isProcessing，让processAudio函数自己管理
      // setIsProcessing(true)
      
      toast({
        title: "录音结束",
        description: "正在处理音频，请稍候...",
      })
    }
  }, [isRecording, toast])

  // 处理音频识别
  const processAudio = useCallback(async (audioBlob: Blob, selectedLanguage?: string) => {
    if (processingRef.current) return
    processingRef.current = true
    setIsProcessing(true) // 开始处理时设置为true
    try {
      // 获取用户语言偏好，优先使用传入的语言参数
      const userLanguage = selectedLanguage || navigator.language || 'en-US'
      
      // 只在开发环境中调试音频数据
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 开始调试音频数据...')
        const debugResponse = await fetch('/api/debug-audio', {
          method: 'POST',
          body: audioBlob,
          headers: {
            'Content-Type': 'audio/webm',
            'X-Language': userLanguage
          }
        })
        
        if (debugResponse.ok) {
          const debugInfo = await debugResponse.json()
          console.log('🔍 音频调试信息:', debugInfo)
          
          // 如果音频有问题，显示警告
          if (debugInfo.recommendations && debugInfo.recommendations.length > 0) {
            console.warn('⚠️ 音频问题:', debugInfo.recommendations)
            toast({
              variant: "destructive",
              title: "音频质量警告",
              description: debugInfo.recommendations.join('; '),
            })
          }
        }
      }
      
      // 首先尝试真实的语音识别API，传递语言参数
      let response = await fetch('/api/speech', {
        method: 'POST',
        body: audioBlob,
        headers: {
          'Content-Type': 'audio/webm',
          'X-Language': userLanguage
        }
      })
      
      let result = await response.json()
      
      // 如果真实API失败，尝试测试API
      if (!response.ok || result.error) {
        console.log('Real API failed, trying test API:', result.error)
        
        response = await fetch('/api/test-speech', {
          method: 'POST',
          body: audioBlob,
          headers: {
            'Content-Type': 'audio/webm',
            'X-Language': userLanguage
          }
        })
        
        result = await response.json()
        
        if (result.isMock) {
          toast({
            title: "使用模拟识别",
            description: "真实API不可用，使用模拟语音识别",
          })
        }
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      // 如果有调试信息，输出到控制台
      if (result.debug) {
        console.log('🐛 API调试信息:', result.debug)
      }
      
      setTranscript(result.transcript || "")
      
      if (result.transcript) {
        // 处理语言检测结果
        let detectedLang = result.selectedLanguage || userLanguage
        let languageInfo = ""
        
        if (result.detectedLanguages && result.detectedLanguages.length > 0) {
          // 新的多语言API响应
          detectedLang = result.detectedLanguages[0] // 使用最主要的语言
          
          if (result.detectedLanguages.length > 1) {
            // 多语言混合
            languageInfo = `检测到多语言：${result.detectedLanguages.join(', ')}`
          } else {
            languageInfo = `检测到语言：${result.detectedLanguages[0]}`
          }
          
          // 如果有单词级别的语言信息，显示更详细的信息
          if (result.wordsWithLanguages && result.wordsWithLanguages.length > 0) {
            const languageCounts = result.wordsWithLanguages.reduce((acc: Record<string, number>, word: any) => {
              acc[word.language] = (acc[word.language] || 0) + 1
              return acc
            }, {})
            
            const languageStats = Object.entries(languageCounts)
              .map(([lang, count]) => `${lang}(${count}词)`)
              .join(', ')
            
            languageInfo = `语言分布：${languageStats}`
          }
        } else if (result.detectedLanguage) {
          // 兼容旧的单语言API响应
          detectedLang = result.detectedLanguage
          languageInfo = `检测到语言：${result.detectedLanguage}`
        }
        
        const isChineseDetected = detectedLang.includes('zh')
        
        toast({
          title: isChineseDetected ? "识别完成" : "Recognition Complete",
          description: isChineseDetected 
            ? `${languageInfo}\n识别到：${result.transcript.substring(0, 50)}${result.transcript.length > 50 ? '...' : ''}`
            : `${languageInfo}\nRecognized: ${result.transcript.substring(0, 50)}${result.transcript.length > 50 ? '...' : ''}`,
        })
        
        // 在控制台输出详细的多语言信息
        if (result.detectedLanguages) {
          console.log('🌍 多语言识别结果:')
          console.log('  检测到的语言:', result.detectedLanguages)
          console.log('  置信度:', result.confidence)
          
          if (result.wordsWithLanguages) {
            console.log('  单词级语言信息:')
            result.wordsWithLanguages.forEach((word: any, index: number) => {
              console.log(`    ${index + 1}. "${word.word}" (${word.language}, 置信度: ${word.confidence?.toFixed(2) || 'N/A'})`)
            })
          }
        }
      } else {
        // 识别到空内容也算作错误
        setHasError(true)
        
        // 如果有调试信息，显示更详细的错误
        let errorMessage = "未能识别到有效的语音内容"
        if (result.debug) {
          errorMessage += `\n调试信息: 音频大小=${result.debug.audioSize}字节, 处理时间=${result.debug.processingTime}ms`
        }
        
        toast({
          variant: "destructive", 
          title: "音频识别失败，请重试！",
          description: errorMessage,
        })
      }
    } catch (error) {
      console.error('Audio processing error:', error)
      setHasError(true)
      toast({
        variant: "destructive",
        title: "音频识别失败，请重试！", 
        description: "音频处理过程中出现错误：" + (error instanceof Error ? error.message : '未知错误'),
      })
    } finally {
      setIsProcessing(false)
      processingRef.current = false
    }
  }, [toast])

  // 检查麦克风权限
  const checkMicrophonePermission = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        toast({
          variant: "destructive",
          title: "浏览器不支持",
          description: "您的浏览器不支持音频录制功能",
        })
        return false
      }

      await navigator.mediaDevices.getUserMedia({ audio: true })
      return true
    } catch (err) {
      if (err instanceof Error) {
        const message = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? "请在浏览器设置中允许麦克风访问权限"
          : "访问麦克风时出现错误"

        toast({
          variant: "destructive",
          title: "麦克风访问被拒绝",
          description: message,
        })
      }
      return false
    }
  }, [toast])

  // 清理函数
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isRecording])

  return {
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
  }
}