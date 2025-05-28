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

  // 重置所有状态
  const resetStates = useCallback(() => {
    setIsRecording(false)
    setAudioBlob(null)
    setTranscript("")
    setIsProcessing(false)
    setHasError(false)
  }, [])

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      // 重置之前的状态
      resetStates()
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        })
        setAudioBlob(audioBlob)
        
        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop())
        
        // 处理音频识别
        await processAudio(audioBlob)
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
      setIsProcessing(true)
      
      toast({
        title: "录音结束",
        description: "正在处理音频，请稍候...",
      })
    }
  }, [isRecording, toast])

  // 处理音频识别
  const processAudio = useCallback(async (audioBlob: Blob) => {
    try {
      // 获取用户语言偏好
      const userLanguage = navigator.language || 'en-US'
      
      // 首先尝试真实的语音识别API
      let response = await fetch('/api/speech', {
        method: 'POST',
        body: audioBlob,
        headers: {
          'Content-Type': 'audio/webm',
          'Accept-Language': userLanguage
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
            'Accept-Language': userLanguage
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
      
      setTranscript(result.transcript || "")
      
      if (result.transcript) {
        const detectedLang = result.detectedLanguage || userLanguage
        const isChineseDetected = detectedLang.includes('zh')
        
        toast({
          title: isChineseDetected ? "识别完成" : "Recognition Complete",
          description: isChineseDetected 
            ? `识别到：${result.transcript.substring(0, 50)}${result.transcript.length > 50 ? '...' : ''}`
            : `Recognized: ${result.transcript.substring(0, 50)}${result.transcript.length > 50 ? '...' : ''}`,
        })
      } else {
        // 识别到空内容也算作错误
        setHasError(true)
        toast({
          variant: "destructive", 
          title: "音频识别失败，请重试！",
          description: "未能识别到有效的语音内容",
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
    checkMicrophonePermission,
    resetStates
  }
}