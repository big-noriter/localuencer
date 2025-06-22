"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Sparkles, 
  MessageSquare, 
  Video, 
  MapPin, 
  Ticket, 
  ShoppingCart, 
  Mic, 
  MicOff, 
  Send, 
  VideoOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Loader2,
  User,
  Map,
  Globe,
  Route,
  Compass,
  Camera,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { toast } from "sonner"
import GoogleMaps from "@/components/maps/google-maps"

/**
 * 채팅 메시지 인터페이스
 */
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'voice'
}

/**
 * WebRTC 연결 상태
 */
interface WebRTCState {
  isConnected: boolean
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isMuted: boolean
}

/**
 * 음성 설정 인터페이스
 */
interface VoiceSettings {
  rate: number      // 속도 (0.1 - 2.0)
  pitch: number     // 음높이 (0.0 - 2.0)
  volume: number    // 음량 (0.0 - 1.0)
  voice: string     // 음성 종류
  autoPlay: boolean // 자동 재생 여부
}

/**
 * AI 가이드 실시간 채팅 페이지
 * OpenAI API를 활용한 텍스트/음성 채팅과 WebRTC 화상 통화 기능 제공
 * Google Maps 연동으로 지도 기반 가이드 서비스 추가
 */
export default function AiGuidePage() {
  // 채팅 상태 관리
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '안녕하세요! 저는 경주 전문 가이드 미나예요 😊\n\n경주 여행에 대해 궁금한 것이 있으시면 언제든 물어보세요!\n\n🗺️ 지도에서 관광지를 클릭하시면 더 자세한 정보를 알려드릴게요!\n🎤 음성으로도 질문하실 수 있어요!',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 음성 인식 상태
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [isListening, setIsListening] = useState(false)

  // 음성 설정
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 1.2,        // 조금 빠르게
    pitch: 1.3,       // 조금 높게 (젊은 여성 목소리)
    volume: 0.8,      // 적당한 음량
    voice: '',        // 기본 음성
    autoPlay: false   // 자동 재생 비활성화
  })

  // TTS 상태
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  // UI 상태
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false)

  // WebRTC 상태
  const [webrtcState, setWebrtcState] = useState<WebRTCState>({
    isConnected: false,
    isVideoEnabled: false,
    isAudioEnabled: false,
    isMuted: false
  })

  // 지도 상태
  const [selectedAttraction, setSelectedAttraction] = useState<string>('')
  const [activeTab, setActiveTab] = useState('chat')

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * 메시지 스크롤을 맨 아래로 이동
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /**
   * 음성 합성 초기화 및 음성 목록 로드
   */
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      setAvailableVoices(voices)
      
      if (voices.length > 0 && !voiceSettings.voice) {
        // 한국어 여성 음성 우선 선택
        const koreanFemaleVoice = voices.find(voice => 
          voice.lang.includes('ko') && (
            voice.name.includes('Female') || 
            voice.name.includes('여성') ||
            voice.name.includes('Yuna') ||
            voice.name.includes('Sora')
          )
        )
        
        const koreanVoice = koreanFemaleVoice || voices.find(voice => voice.lang.includes('ko'))
        
        if (koreanVoice) {
          setVoiceSettings(prev => ({ ...prev, voice: koreanVoice.name }))
        }
      }
    }

    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  /**
   * 마크다운 및 특수 문자 제거 함수
   */
  const cleanTextForSpeech = (text: string): string => {
    return text
      // 마크다운 헤더 제거 (# ## ### 등)
      .replace(/#{1,6}\s*/g, '')
      // 마크다운 강조 제거 (**bold**, *italic*, __underline__)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // 마크다운 링크 제거 [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // 마크다운 코드 블록 제거
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // 마크다운 리스트 마커 제거
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // HTML 태그 제거
      .replace(/<[^>]*>/g, '')
      // 특수 문자 정리
      .replace(/[#*_`~\[\](){}]/g, '')
      // 연속된 공백 정리
      .replace(/\s+/g, ' ')
      // 앞뒤 공백 제거
      .trim()
  }

  /**
   * 마이크 권한 및 디바이스 확인
   */
  const checkMicrophoneAccess = async (): Promise<boolean> => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      
      if (permissionStatus.state === 'denied') {
        toast.error('마이크 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.')
        return false
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasAudioInput = devices.some(device => device.kind === 'audioinput')
      
      if (!hasAudioInput) {
        toast.error('마이크 장치를 찾을 수 없습니다.')
        return false
      }

      return true
    } catch (error) {
      console.error('마이크 접근 확인 오류:', error)
      toast.error('마이크 접근 권한을 확인할 수 없습니다.')
      return false
    }
  }

  /**
   * 텍스트 메시지 전송
   */
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('AI 응답을 받아오는데 실패했습니다.')
      }

      const result = await response.json()

      if (result.success) {
        const aiMessage: ChatMessage = {
          id: result.conversationId || Date.now().toString(),
          role: 'assistant',
          content: result.message,
          timestamp: new Date(result.timestamp),
          type: 'text'
        }

        setMessages(prev => [...prev, aiMessage])

        if (result.isDevelopmentMode) {
          toast.info("개발 환경에서는 목업 응답을 제공합니다.")
        }

        // 자동 재생이 켜져있으면 음성 재생
        if (voiceSettings.autoPlay) {
          setTimeout(() => speakMessage(result.message), 500)
        }
      }

    } catch (error) {
      console.error('메시지 전송 오류:', error)
      toast.error('메시지 전송에 실패했습니다.')
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  /**
   * 음성 재생 (마크다운 제거 버전)
   */
  const speakMessage = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('이 브라우저는 음성 합성을 지원하지 않습니다.')
      return
    }

    // 기존 음성 중지
    if (isSpeaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
      setCurrentUtterance(null)
      return
    }

    // 마크다운 및 특수문자 제거
    const cleanText = cleanTextForSpeech(text)
    
    if (!cleanText.trim()) {
      toast.warning('읽을 내용이 없습니다.')
      return
    }

    const utterance = new SpeechSynthesisUtterance(cleanText)
    
    // 음성 설정 적용
    utterance.rate = voiceSettings.rate
    utterance.pitch = voiceSettings.pitch
    utterance.volume = voiceSettings.volume
    utterance.lang = 'ko-KR'

    // 선택된 음성 적용
    if (voiceSettings.voice) {
      const selectedVoice = availableVoices.find(voice => voice.name === voiceSettings.voice)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    }

    // 이벤트 리스너
    utterance.onstart = () => {
      setIsSpeaking(true)
      setCurrentUtterance(utterance)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setCurrentUtterance(null)
    }

    utterance.onerror = (event) => {
      console.error('음성 합성 오류:', event)
      setIsSpeaking(false)
      setCurrentUtterance(null)
      toast.error('음성 재생에 실패했습니다.')
    }

    speechSynthesis.speak(utterance)
  }

  /**
   * 음성 녹음 시작/중지
   */
  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
        setIsRecording(false)
        setIsListening(false)
        toast.info("음성 녹음을 중지하고 처리 중입니다...")
      }
      return
    }

    try {
      const hasAccess = await checkMicrophoneAccess()
      if (!hasAccess) return

      setIsListening(true)
      toast.info("마이크 접근 권한을 요청합니다...")

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })

      const options: MediaRecorderOptions = {
        mimeType: 'audio/webm;codecs=opus'
      }

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm'
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'audio/mp4'
        }
      }

      const recorder = new MediaRecorder(stream, options)
      const chunks: Blob[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: recorder.mimeType })
        await processVoiceMessage(audioBlob)
        
        stream.getTracks().forEach(track => track.stop())
        setIsListening(false)
      }

      recorder.onerror = (event) => {
        console.error('MediaRecorder 오류:', event)
        toast.error('음성 녹음 중 오류가 발생했습니다.')
        setIsRecording(false)
        setIsListening(false)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start(1000)
      setMediaRecorder(recorder)
      setIsRecording(true)
      setIsListening(false)
      
      toast.success("🎤 음성 녹음을 시작합니다. 다시 클릭하면 전송됩니다.")

    } catch (error: any) {
      console.error('음성 녹음 시작 오류:', error)
      setIsRecording(false)
      setIsListening(false)
      
      switch (error.name) {
        case 'NotAllowedError':
          toast.error('🚫 마이크 접근 권한이 거부되었습니다.\n브라우저 주소창 옆의 🔒 아이콘을 클릭하여 마이크 권한을 허용해주세요.')
          break
        case 'NotFoundError':
          toast.error('🎤 마이크를 찾을 수 없습니다.\n마이크가 연결되어 있는지 확인해주세요.')
          break
        case 'NotReadableError':
          toast.error('🔧 마이크에 접근할 수 없습니다.\n다른 앱에서 마이크를 사용 중인지 확인해주세요.')
          break
        case 'OverconstrainedError':
          toast.error('⚙️ 마이크 설정에 문제가 있습니다.\n다른 마이크를 시도해보세요.')
          break
        default:
          toast.error(`❌ 음성 녹음 시작 실패: ${error.message || '알 수 없는 오류'}`)
      }
    }
  }

  /**
   * 음성 메시지 처리
   */
  const processVoiceMessage = async (audioBlob: Blob) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice.wav')

      toast.info("🔄 음성을 텍스트로 변환 중...")

      const sttResponse = await fetch('/api/ai-guide', {
        method: 'PUT',
        body: formData,
      })

      if (!sttResponse.ok) {
        throw new Error('음성 인식에 실패했습니다.')
      }

      const sttResult = await sttResponse.json()

      if (sttResult.success && sttResult.text.trim()) {
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: sttResult.text.trim(),
          timestamp: new Date(),
          type: 'voice'
        }

        setMessages(prev => [...prev, userMessage])
        
        toast.success(`🎯 음성 인식 완료: "${sttResult.text.slice(0, 30)}${sttResult.text.length > 30 ? '...' : ''}"`)
        
        const chatResponse = await fetch('/api/ai-guide', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: sttResult.text.trim(),
            conversationHistory: messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          }),
        })

        if (chatResponse.ok) {
          const chatResult = await chatResponse.json()
          
          if (chatResult.success) {
            const aiMessage: ChatMessage = {
              id: chatResult.conversationId || Date.now().toString(),
              role: 'assistant',
              content: chatResult.message,
              timestamp: new Date(chatResult.timestamp),
              type: 'text'
            }

            setMessages(prev => [...prev, aiMessage])

            if (voiceSettings.autoPlay) {
              setTimeout(() => speakMessage(chatResult.message), 500)
            }
          }
        }

        if (sttResult.isDevelopmentMode) {
          toast.info("🔧 개발 환경에서는 목업 음성 인식을 제공합니다.")
        }
      } else {
        toast.warning("🤔 음성을 인식하지 못했습니다. 다시 시도해주세요.")
      }

    } catch (error) {
      console.error('음성 메시지 처리 오류:', error)
      toast.error('음성 메시지 처리에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Enter 키 처리
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  /**
   * 관광지 선택 처리
   */
  const handleAttractionSelect = (attraction: any) => {
    setSelectedAttraction(attraction.id)
    
    const attractionMessage = `${attraction.name}에 대해 자세히 알려주세요.`
    setInputMessage(attractionMessage)
    
    setActiveTab('chat')
    
    setTimeout(() => {
      sendMessage()
    }, 100)
  }

  /**
   * 메시지 포맷팅
   */
  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl pb-24">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI 가이드 미나
          </h1>
          <p className="text-xl text-muted-foreground">
            경주 여행의 모든 것을 미나와 함께 알아보세요! 🏛️✨
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              채팅
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              화상 채팅
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              지도
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            {/* 채팅 영역 */}
            <Card className="flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Sparkles className="mr-2 h-6 w-6 text-primary" />
                    미나와 채팅
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={isLoading ? "secondary" : "default"}>
                      {isLoading ? "응답 중..." : "온라인"}
                    </Badge>
                    {isSpeaking && (
                      <Badge variant="outline" className="animate-pulse">
                        🔊 음성 재생 중
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  텍스트나 음성으로 경주 여행에 대해 무엇이든 물어보세요!
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-col p-0">
                {/* 음성 설정 (접을 수 있는 형태) */}
                <div className="px-6 pb-4 border-b">
                  <Collapsible open={isVoiceSettingsOpen} onOpenChange={setIsVoiceSettingsOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          음성 설정
                        </span>
                        {isVoiceSettingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      {/* 컴팩트한 음성 설정 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">속도: {voiceSettings.rate.toFixed(1)}x</Label>
                          <Slider
                            value={[voiceSettings.rate]}
                            onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, rate: value }))}
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">음높이: {voiceSettings.pitch.toFixed(1)}</Label>
                          <Slider
                            value={[voiceSettings.pitch]}
                            onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, pitch: value }))}
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs">음성 선택</Label>
                        <Select value={voiceSettings.voice} onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, voice: value }))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="음성을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableVoices.filter(voice => voice.lang.includes('ko')).map((voice) => (
                              <SelectItem key={voice.name} value={voice.name}>
                                {voice.name} ({voice.lang})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">자동 재생</Label>
                        <Button
                          variant={voiceSettings.autoPlay ? "default" : "outline"}
                          size="sm"
                          onClick={() => setVoiceSettings(prev => ({ ...prev, autoPlay: !prev.autoPlay }))}
                        >
                          {voiceSettings.autoPlay ? "켜짐" : "꺼짐"}
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* 메시지 영역 */}
                <div className="relative">
                  <ScrollArea className="h-[60vh] min-h-[400px] max-h-[600px] px-6">
                    <div className="space-y-6 pb-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start space-x-3 max-w-[85%] ${
                            message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              {message.role === 'assistant' ? (
                                <>
                                  <AvatarImage src="/mina-active.png" alt="미나" />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                                    미나
                                  </AvatarFallback>
                                </>
                              ) : (
                                <>
                                  <AvatarImage src="/placeholder-user.jpg" alt="사용자" />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                                    <User className="w-5 h-5" />
                                  </AvatarFallback>
                                </>
                              )}
                            </Avatar>
                            
                            <div className="flex flex-col space-y-2">
                              {/* 시간과 플레이 버튼을 메시지 위쪽으로 이동 */}
                              <div className={`flex items-center gap-2 text-xs text-muted-foreground ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                              }`}>
                                <span>
                                  {message.timestamp.toLocaleTimeString('ko-KR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                {message.type === 'voice' && (
                                  <Badge variant="outline" className="h-5 px-1.5">
                                    <Volume2 className="w-3 h-3 mr-1" />
                                    음성
                                  </Badge>
                                )}
                                {message.role === 'assistant' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs hover:bg-accent"
                                    onClick={() => speakMessage(message.content)}
                                    disabled={isLoading}
                                  >
                                    {isSpeaking && currentUtterance ? (
                                      <Pause className="w-3 h-3" />
                                    ) : (
                                      <Play className="w-3 h-3" />
                                    )}
                                  </Button>
                                )}
                              </div>
                              
                              <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                                message.role === 'user' 
                                  ? 'bg-primary text-primary-foreground ml-auto' 
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                  {formatMessage(message.content)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="flex items-start space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src="/mina-active.png" alt="미나" />
                              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                                미나
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-2xl px-4 py-3 shadow-sm">
                              <div className="flex items-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">
                                  미나가 답변을 준비하고 있어요...
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* 입력 영역 */}
                <div className="border-t bg-background/95 backdrop-blur-sm p-4 sticky bottom-0">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Input
                        ref={inputRef}
                        placeholder="경주에 대해 궁금한 것을 물어보세요... (Enter로 전송)"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="resize-none min-h-[44px] bg-background"
                      />
                    </div>
                    
                    <Button
                      onClick={toggleRecording}
                      variant={isRecording ? "destructive" : "outline"}
                      size="icon"
                      disabled={isLoading || isListening}
                      className={`h-[44px] w-[44px] ${isRecording ? 'animate-pulse' : ''}`}
                    >
                      {isListening ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isRecording ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button 
                      onClick={sendMessage} 
                      disabled={!inputMessage.trim() || isLoading}
                      className="h-[44px] px-6"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      전송
                    </Button>
                  </div>
                  
                  {isRecording && (
                    <div className="mt-2 text-center">
                      <Badge variant="destructive" className="animate-pulse">
                        🎤 녹음 중... 다시 클릭하면 전송됩니다
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video" className="space-y-6">
            {/* 화상 통화 영역 */}
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Video className="mr-2 h-6 w-6 text-primary" />
                    화상 통화
                  </span>
                  <Badge variant={webrtcState.isConnected ? "default" : "secondary"}>
                    {webrtcState.isConnected ? "연결됨" : "대기중"}
                  </Badge>
                </CardTitle>
                <CardDescription>미나와 화상으로 대화하며 경주 여행 정보를 얻으세요.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 bg-muted rounded-lg overflow-hidden relative">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">화상 통화 기능은 준비 중입니다</p>
                      <p className="text-sm text-muted-foreground mt-2">현재는 텍스트/음성 채팅을 이용해주세요</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            {/* 지도 영역 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-6 w-6 text-primary" />
                  경주 관광지 지도
                </CardTitle>
                <CardDescription>
                  지도에서 관광지를 클릭하면 미나가 자세한 정보를 알려드려요!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[60vh] min-h-[400px] max-h-[600px] rounded-lg overflow-hidden">
                  <GoogleMaps
                    onAttractionSelect={handleAttractionSelect}
                    selectedAttraction={selectedAttraction}
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
