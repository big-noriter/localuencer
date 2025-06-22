"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Settings
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
      content: '안녕하세요! 저는 경주 전문 가이드 미나예요 😊 경주 여행에 대해 궁금한 것이 있으시면 언제든 물어보세요! 지도에서 관광지를 클릭하시면 더 자세한 정보를 알려드릴게요!',
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
   * 텍스트 메시지 전송
   */
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // AI 가이드 API 호출
      const response = await fetch('/api/ai-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
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

        // 개발 모드 알림
        if (result.isDevelopmentMode) {
          toast.info("개발 환경에서는 목업 응답을 제공합니다.")
        }

        // TTS 음성 재생 (선택적)
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(result.message)
          utterance.lang = 'ko-KR'
          utterance.rate = 0.9
          utterance.pitch = 1.1
          // speechSynthesis.speak(utterance) // 자동 재생 비활성화
        }
      }

    } catch (error) {
      console.error('메시지 전송 오류:', error)
      toast.error('메시지 전송에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 음성 녹음 시작/중지
   */
  const toggleRecording = async () => {
    if (isRecording) {
      // 녹음 중지
      if (mediaRecorder) {
        mediaRecorder.stop()
        setIsRecording(false)
      }
    } else {
      // 녹음 시작
      try {
        // 먼저 마이크 권한 확인
        const permissionStatus = await checkMediaPermissions();
        
        if (!permissionStatus.audio) {
          // 마이크 권한이 없는 경우 사용자에게 안내
          showPermissionInstructions({ video: true, audio: false });
          return;
        }
        
        // 사용 가능한 마이크 확인
        const devices = await listMediaDevices();
        if (!devices.hasMicrophone) {
          toast.error('마이크 장치를 찾을 수 없습니다.');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setAudioChunks(prev => [...prev, event.data])
          }
        }

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
          await processVoiceMessage(audioBlob)
          setAudioChunks([])
          
          // 스트림 정리
          stream.getTracks().forEach(track => track.stop())
        }

        recorder.start()
        setMediaRecorder(recorder)
        setIsRecording(true)
        toast.info("음성 녹음을 시작합니다. 다시 클릭하면 전송됩니다.")

      } catch (error: any) {
        console.error('음성 녹음 오류:', error)
        
        // 더 구체적인 오류 메시지 제공
        if (error.name === 'NotAllowedError') {
          toast.error('마이크 접근 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
        } else if (error.name === 'NotFoundError') {
          toast.error('마이크를 찾을 수 없습니다. 장치가 연결되어 있는지 확인해주세요.');
        } else if (error.name === 'NotReadableError') {
          toast.error('마이크에 접근할 수 없습니다. 다른 앱에서 사용 중인지 확인해주세요.');
        } else {
          toast.error('음성 녹음 시작에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
        }
      }
    }
  }

  /**
   * 음성 메시지 처리
   */
  const processVoiceMessage = async (audioBlob: Blob) => {
    setIsLoading(true)

    try {
      // STT (Speech to Text)
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice.wav')

      const sttResponse = await fetch('/api/ai-guide', {
        method: 'PUT',
        body: formData,
      })

      if (!sttResponse.ok) {
        throw new Error('음성 인식에 실패했습니다.')
      }

      const sttResult = await sttResponse.json()

      if (sttResult.success) {
        // 음성으로 인식된 텍스트를 메시지로 전송
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: sttResult.text,
          timestamp: new Date(),
          type: 'voice'
        }

        setMessages(prev => [...prev, userMessage])
        
        // AI 응답 요청
        const chatResponse = await fetch('/api/ai-guide', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: sttResult.text,
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

            // 음성으로 응답 재생
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(chatResult.message)
              utterance.lang = 'ko-KR'
              utterance.rate = 0.9
              utterance.pitch = 1.1
              speechSynthesis.speak(utterance)
            }
          }
        }

        if (sttResult.isDevelopmentMode) {
          toast.info("개발 환경에서는 목업 음성 인식을 제공합니다.")
        }
      }

    } catch (error) {
      console.error('음성 메시지 처리 오류:', error)
      toast.error('음성 메시지 처리에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * WebRTC 화상 통화 시작
   */
  const startVideoCall = async () => {
    try {
      // 먼저 디바이스 권한 상태 확인
      const permissionStatus = await checkMediaPermissions();
      
      if (!permissionStatus.video || !permissionStatus.audio) {
        // 권한이 없는 경우 사용자에게 안내
        showPermissionInstructions(permissionStatus);
        return;
      }

      // 사용 가능한 디바이스 확인
      const devices = await listMediaDevices();
      if (!devices.hasCamera || !devices.hasMicrophone) {
        toast.error(`${!devices.hasCamera ? '카메라' : ''}${!devices.hasCamera && !devices.hasMicrophone ? '와 ' : ''}${!devices.hasMicrophone ? '마이크' : ''} 장치를 찾을 수 없습니다.`);
        return;
      }

      // 권한이 있고 디바이스가 있는 경우 미디어 스트림 요청
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        
        // 비디오 요소에 로드 이벤트 리스너 추가
        localVideoRef.current.onloadedmetadata = () => {
          if (localVideoRef.current) {
            localVideoRef.current.play().catch(e => {
              console.error('비디오 재생 오류:', e);
              toast.error('비디오 재생에 실패했습니다. 브라우저 설정을 확인해주세요.');
            });
          }
        };
      }

      setWebrtcState(prev => ({
        ...prev,
        isConnected: true,
        isVideoEnabled: true,
        isAudioEnabled: true
      }));

      toast.success("화상 통화가 시작되었습니다!");
      
      // 실제 WebRTC 연결 로직은 여기에 구현
      // 현재는 로컬 비디오만 표시

    } catch (error: any) {
      console.error('화상 통화 시작 오류:', error);
      
      // 더 구체적인 오류 메시지 제공
      if (error.name === 'NotAllowedError') {
        toast.error('카메라/마이크 접근 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
      } else if (error.name === 'NotFoundError') {
        toast.error('카메라 또는 마이크를 찾을 수 없습니다. 장치가 연결되어 있는지 확인해주세요.');
      } else if (error.name === 'NotReadableError') {
        toast.error('카메라/마이크에 접근할 수 없습니다. 다른 앱에서 사용 중인지 확인해주세요.');
      } else {
        toast.error('화상 통화 시작에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
      }
    }
  };

  /**
   * 미디어 장치 권한 상태 확인
   */
  const checkMediaPermissions = async () => {
    const result = { video: false, audio: false };
    
    try {
      // 권한 상태 확인 (navigator.permissions API 사용)
      if (navigator.permissions) {
        // 카메라 권한 확인
        try {
          const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          result.video = cameraPermission.state === 'granted';
        } catch (e) {
          console.log('카메라 권한 확인 불가:', e);
        }
        
        // 마이크 권한 확인
        try {
          const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          result.audio = micPermission.state === 'granted';
        } catch (e) {
          console.log('마이크 권한 확인 불가:', e);
        }
      }
      
      // permissions API가 지원되지 않거나 권한이 없는 경우, getUserMedia로 권한 요청 시도
      if (!result.video || !result.audio) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: !result.video, 
            audio: !result.audio 
          });
          
          // 스트림을 얻었다면 권한이 있는 것
          if (!result.video) result.video = true;
          if (!result.audio) result.audio = true;
          
          // 테스트용 스트림 정리
          stream.getTracks().forEach(track => track.stop());
        } catch (e) {
          // 권한 요청 실패 - 상태는 이미 false로 설정되어 있음
          console.log('미디어 권한 요청 실패:', e);
        }
      }
    } catch (e) {
      console.error('권한 확인 중 오류:', e);
    }
    
    return result;
  };

  /**
   * 사용 가능한 미디어 장치 확인
   */
  const listMediaDevices = async () => {
    const result = { hasCamera: false, hasMicrophone: false };
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log('미디어 장치 목록을 지원하지 않는 브라우저입니다.');
        return result;
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      result.hasCamera = devices.some(device => device.kind === 'videoinput');
      result.hasMicrophone = devices.some(device => device.kind === 'audioinput');
      
    } catch (e) {
      console.error('미디어 장치 목록 조회 오류:', e);
    }
    
    return result;
  };

  /**
   * 권한 설정 안내 표시
   */
  const showPermissionInstructions = (permissions: { video: boolean; audio: boolean }) => {
    const missingPermissions = [];
    if (!permissions.video) missingPermissions.push('카메라');
    if (!permissions.audio) missingPermissions.push('마이크');
    
    toast.error(
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="font-medium">{missingPermissions.join('/')} 접근 권한이 필요합니다</span>
        </div>
        <ul className="text-sm space-y-1 list-disc pl-5">
          <li>브라우저의 주소 표시줄에서 권한 설정을 확인하세요</li>
          <li>Windows 설정 &gt; 개인 정보 &gt; 카메라/마이크에서 권한을 확인하세요</li>
          <li>다른 앱에서 카메라/마이크를 사용 중인지 확인하세요</li>
          <li>장치가 올바르게 연결되어 있는지 확인하세요</li>
        </ul>
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full mt-1"
          onClick={() => {
            window.open('ms-settings:privacy-webcam', '_blank');
            setTimeout(() => window.open('ms-settings:privacy-microphone', '_blank'), 500);
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          Windows 권한 설정 열기
        </Button>
      </div>
    , { duration: 10000 });
  };

  /**
   * WebRTC 화상 통화 종료
   */
  const endVideoCall = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      localVideoRef.current.srcObject = null
    }

    setWebrtcState({
      isConnected: false,
      isVideoEnabled: false,
      isAudioEnabled: false,
      isMuted: false
    })

    toast.info("화상 통화가 종료되었습니다.")
  }

  /**
   * 비디오 토글
   */
  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setWebrtcState(prev => ({
          ...prev,
          isVideoEnabled: videoTrack.enabled
        }))
      }
    }
  }

  /**
   * 오디오 토글
   */
  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setWebrtcState(prev => ({
          ...prev,
          isMuted: !audioTrack.enabled
        }))
      }
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
    
    // AI에게 해당 관광지에 대한 정보 요청
    const attractionMessage = `${attraction.name}에 대해 자세히 알려주세요.`
    setInputMessage(attractionMessage)
    
    // 채팅 탭으로 전환
    setActiveTab('chat')
    
    // 자동으로 메시지 전송
    setTimeout(() => {
      sendMessage()
    }, 100)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Sparkles className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold">미나의 경주 AI 여행 가이드</h1>
      </div>
      <p className="text-lg text-muted-foreground">
        경주 여행 계획부터 현지 정보까지, 미나가 여러분의 스마트한 여행 동반자가 되어 드립니다. 실시간 음성/화상
        채팅으로 궁금증을 해결하고, 지도에서 관광지를 확인하며 맞춤형 경주 여행 추천을 받아보세요!
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            AI 채팅
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            화상 통화
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            지도 가이드
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 실시간 채팅 영역 */}
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MessageSquare className="mr-2 h-6 w-6 text-primary" />
                    실시간 AI 채팅
                  </span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    온라인
                  </Badge>
                </CardTitle>
                <CardDescription>미나와 텍스트 또는 음성으로 대화하세요.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* 메시지 영역 */}
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-2 max-w-[80%] ${
                          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <Avatar className="w-8 h-8">
                            {message.role === 'assistant' ? (
                              <>
                                <AvatarImage src="/mina-active.png" alt="미나" />
                                <AvatarFallback>미나</AvatarFallback>
                              </>
                            ) : (
                              <>
                                <AvatarImage src="/placeholder-user.jpg" alt="사용자" />
                                <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                              </>
                            )}
                          </Avatar>
                          <div className={`rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center mt-1 space-x-1">
                              <span className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString('ko-KR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {message.type === 'voice' && (
                                <Volume2 className="w-3 h-3 opacity-70" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="/mina-active.png" alt="미나" />
                            <AvatarFallback>미나</AvatarFallback>
                          </Avatar>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">미나가 답변을 준비하고 있어요...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* 입력 영역 */}
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="경주 여행에 대해 궁금한 것을 물어보세요..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    disabled={isLoading}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 빠른 질문 및 추천 */}
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Compass className="mr-2 h-6 w-6 text-primary" />
                  빠른 질문 & 추천
                </CardTitle>
                <CardDescription>자주 묻는 질문이나 추천 코스를 선택해보세요.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">🏛️ 역사 유적지</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="outline" 
                        className="justify-start text-left h-auto p-3"
                        onClick={() => setInputMessage("불국사와 석굴암을 하루에 둘 다 볼 수 있나요?")}
                      >
                        불국사와 석굴암을 하루에 둘 다 볼 수 있나요?
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start text-left h-auto p-3"
                        onClick={() => setInputMessage("첨성대와 대릉원 관람 시간은 얼마나 걸리나요?")}
                      >
                        첨성대와 대릉원 관람 시간은 얼마나 걸리나요?
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">🍽️ 맛집 & 음식</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="outline" 
                        className="justify-start text-left h-auto p-3"
                        onClick={() => setInputMessage("경주 대표 음식과 맛집을 추천해주세요")}
                      >
                        경주 대표 음식과 맛집을 추천해주세요
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start text-left h-auto p-3"
                        onClick={() => setInputMessage("황남빵은 어디서 사는 게 가장 좋나요?")}
                      >
                        황남빵은 어디서 사는 게 가장 좋나요?
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">🚗 교통 & 이동</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="outline" 
                        className="justify-start text-left h-auto p-3"
                        onClick={() => setInputMessage("경주 시내 교통편과 이동 방법을 알려주세요")}
                      >
                        경주 시내 교통편과 이동 방법을 알려주세요
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start text-left h-auto p-3"
                        onClick={() => setInputMessage("경주역에서 불국사까지 가는 방법은?")}
                      >
                        경주역에서 불국사까지 가는 방법은?
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">📅 여행 일정</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="outline" 
                        className="justify-start text-left h-auto p-3"
                        onClick={() => setInputMessage("1박 2일 경주 여행 코스를 추천해주세요")}
                      >
                        1박 2일 경주 여행 코스를 추천해주세요
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start text-left h-auto p-3"
                        onClick={() => setInputMessage("당일치기 경주 여행 코스는 어떻게 짜야 할까요?")}
                      >
                        당일치기 경주 여행 코스는 어떻게 짜야 할까요?
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
              {/* 비디오 영역 */}
              <div className="flex-1 bg-muted rounded-lg overflow-hidden relative">
                {webrtcState.isConnected ? (
                  <>
                    {/* 로컬 비디오 (사용자) */}
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {/* 원격 비디오 (미나) - 오버레이 */}
                    <div className="absolute top-4 right-4 w-32 h-24 bg-black rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">미나 (AI)</span>
                      </div>
                    </div>
                    {!webrtcState.isVideoEnabled && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <VideoOff className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">화상 통화를 시작하려면 아래 버튼을 클릭하세요</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 통화 컨트롤 */}
              <div className="flex justify-center space-x-2 pt-4 border-t">
                {!webrtcState.isConnected ? (
                  <Button onClick={startVideoCall} className="bg-green-600 hover:bg-green-700">
                    <Phone className="mr-2 h-4 w-4" />
                    화상 통화 시작
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={toggleVideo}
                      variant={webrtcState.isVideoEnabled ? "default" : "destructive"}
                      size="icon"
                    >
                      {webrtcState.isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={toggleAudio}
                      variant={webrtcState.isMuted ? "destructive" : "default"}
                      size="icon"
                    >
                      {webrtcState.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Button onClick={endVideoCall} variant="destructive">
                      <PhoneOff className="mr-2 h-4 w-4" />
                      통화 종료
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          {/* 지도 가이드 영역 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="mr-2 h-6 w-6 text-primary" />
                경주 관광지 지도
              </CardTitle>
              <CardDescription>
                지도에서 관광지를 클릭하면 미나가 자세한 정보를 알려드려요! 길찾기와 가상 투어도 이용하실 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleMaps 
                selectedAttraction={selectedAttraction}
                onAttractionSelect={handleAttractionSelect}
                height="500px"
              />
            </CardContent>
          </Card>

          {/* 가상 투어 기능 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-6 w-6 text-primary" />
                가상 투어 (구현 예정)
              </CardTitle>
              <CardDescription>
                Google Earth를 활용한 360도 가상 투어 기능입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Google Earth 가상 투어</p>
                  <p className="text-sm text-muted-foreground">곧 업데이트될 예정입니다</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" disabled>
                  <Route className="mr-2 h-4 w-4" />
                  추천 경로 투어
                </Button>
                <Button variant="outline" disabled>
                  <Camera className="mr-2 h-4 w-4" />
                  360도 파노라마
                </Button>
                <Button variant="outline" disabled>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AR 가이드
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 추가 서비스 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-6 w-6 text-primary" />
            여행 편의 서비스
          </CardTitle>
          <CardDescription>경주 여행 할인 쿠폰, 관광 상품 예약 등 다양한 혜택을 확인하세요.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" className="h-20 flex-col" disabled>
            <Ticket className="h-6 w-6 mb-1 text-primary" />
            경주 할인 쿠폰 (구현 예정)
          </Button>
          <Button variant="outline" className="h-20 flex-col" disabled>
            <ShoppingCart className="h-6 w-6 mb-1 text-primary" />
            경주 관광 상품 (구현 예정)
          </Button>
          <Button variant="outline" className="h-20 flex-col" disabled>
            <Sparkles className="h-6 w-6 mb-1 text-primary" />
            AI 추천 경주 맛집/숙소 (구현 예정)
          </Button>
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">💡 사용 팁</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>AI 채팅:</strong> 경주 관광지, 맛집, 숙박 등 궁금한 것을 자유롭게 물어보세요</li>
          <li>• <strong>음성 채팅:</strong> 마이크 버튼을 눌러 음성으로 질문하고 AI 음성 답변을 들어보세요</li>
          <li>• <strong>화상 통화:</strong> 실시간으로 미나와 대화하며 더욱 생생한 여행 정보를 얻으세요</li>
          <li>• <strong>지도 가이드:</strong> 관광지 마커를 클릭하면 상세 정보와 길찾기를 이용할 수 있어요</li>
          <li>• <strong>빠른 질문:</strong> 자주 묻는 질문 버튼을 클릭하면 즉시 답변을 받을 수 있어요</li>
        </ul>
      </div>
    </div>
  )
}
