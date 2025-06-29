"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from 'next-intl'
import Script from 'next/script'
import Head from 'next/head'
import Link from 'next/link'

// D-ID API 관련 타입 정의
interface DIdStreamState {
  streamId: string | null
  videoElement: HTMLVideoElement | null
  peerConnection: RTCPeerConnection | null
  isActive: boolean
}

// 채팅 메시지 타입 정의
interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

/**
 * AI Studio - 가상 인플루언서 화상 채팅 페이지
 */
export default function AIStudioPage() {
  const t = useTranslations('AIStudio')
  
  // 상태 관리
  const [isLoaded, setIsLoaded] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'ai',
      content: '안녕하세요! 저는 경주 로컬루언서 미나입니다. 경주 여행에 대해 어떤 이야기를 나눠볼까요?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // D-ID 관련 상태
  const [dIdState, setDIdState] = useState<DIdStreamState>({
    streamId: null,
    videoElement: null,
    peerConnection: null,
    isActive: false
  })
  
  // 사용자 미디어 관련 상태
  const [isUserVideoEnabled, setIsUserVideoEnabled] = useState(false)
  const [isUserAudioEnabled, setIsUserAudioEnabled] = useState(false)
  const [isAIMuted, setIsAIMuted] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  // 모달 상태
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const userVideoRef = useRef<HTMLVideoElement>(null)
  const influencerCanvasRef = useRef<HTMLCanvasElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  
  // API 키 상태
  const [apiKeys, setApiKeys] = useState({
    GOOGLE_API_KEY: '',
    D_ID_API_KEY: ''
  })
  
  // 스크롤 맨 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  // 메시지가 변경될 때마다 스크롤 이동
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // API 키 설정
    const loadApiKeys = async () => {
      try {
        const response = await fetch('/api/config')
        const data = await response.json()
        
        if (data.GOOGLE_API_KEY && data.D_ID_API_KEY) {
          setApiKeys({
            GOOGLE_API_KEY: data.GOOGLE_API_KEY,
            D_ID_API_KEY: data.D_ID_API_KEY
          })
          setIsLoaded(true)
        }
      } catch (error) {
        console.error('API 키 로드 오류:', error)
        // 개발 환경에서 데모 키 사용
        setApiKeys({
          GOOGLE_API_KEY: 'DEMO_KEY',
          D_ID_API_KEY: 'DEMO_KEY'
        })
        setIsLoaded(true)
      }
    }
    
    loadApiKeys()
    initUserCamera()
    
    // D-ID 스트리밍 자동 시작 (2초 후)
    const timer = setTimeout(() => {
      initDIdStreaming()
    }, 2000)
    
    return () => {
      clearTimeout(timer)
      // 컴포넌트 언마운트 시 D-ID 스트림 정리
      destroyDIdStream()
    }
  }, [])
  
  // 사용자 카메라 초기화
  const initUserCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream
      }
      
      setIsUserVideoEnabled(true)
      setIsUserAudioEnabled(true)
    } catch (error) {
      console.error('카메라 초기화 오류:', error)
    }
  }
  
  // D-ID 스트리밍 초기화
  const initDIdStreaming = async () => {
    // 실제 구현에서는 D-ID API 연동 코드 추가
    console.log('D-ID 스트리밍 초기화')
    setDIdState(prev => ({ ...prev, isActive: true }))
  }
  
  // D-ID 스트림 정리
  const destroyDIdStream = () => {
    // 실제 구현에서는 D-ID API 연결 해제 코드 추가
    console.log('D-ID 스트림 정리')
    setDIdState({
      streamId: null,
      videoElement: null,
      peerConnection: null,
      isActive: false
    })
  }
  
  // 메시지 전송 처리
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return
    
    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    
    try {
      // API 호출
      const response = await fetch('/api/ai-studio/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          history: messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // AI 응답 메시지 추가
        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'ai',
          content: data.message,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, aiMessage])
        
        // D-ID로 음성 합성 및 애니메이션 처리
        if (dIdState.isActive && !isAIMuted) {
          streamDIdTalk(data.message)
        }
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error)
      // 오류 시 데모 응답
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'ai',
        content: '죄송합니다, 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } finally {
      setIsLoading(false)
    }
  }
  
  // D-ID 음성 합성 및 애니메이션 스트리밍
  const streamDIdTalk = (text: string) => {
    // 실제 구현에서는 D-ID API 호출 코드 추가
    console.log('D-ID 음성 합성:', text)
    setIsSpeaking(true)
    
    // 말하는 애니메이션 시뮬레이션
    setTimeout(() => {
      setIsSpeaking(false)
    }, 3000)
  }
  
  // 키보드 이벤트 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  
  return (
    <div className="container">
      <header className="app-header">
        <div className="logo">
          <i className="fas fa-robot"></i>
          <h1>로컬루언서 AI 가이드</h1>
        </div>
        <div className="header-actions">
          <button 
            className="btn-compare" 
            onClick={() => setIsCompareModalOpen(true)}
          >
            <i className="fas fa-code-compare"></i>
            <span>API 비교</span>
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* 중앙 메인 채팅 영역 */}
        <div className="chat-area">
          <div className="chat-container">
            <div className="welcome-message">
              <h2>Gemini와 실시간으로 대화하세요</h2>
            </div>
            
            <div className="chat-messages" id="chatMessages">
              {messages.map(message => (
                <div key={message.id} className={`message ${message.role}`}>
                  <div className="message-avatar">
                    <img 
                      src={message.role === 'ai' ? "/mina-casual.png" : "/placeholder-user.jpg"} 
                      alt={message.role === 'ai' ? "가상 인플루언서" : "사용자"} 
                      className="avatar-img"
                    />
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-name">
                        {message.role === 'ai' ? '로컬루언서 미나' : '나'}
                      </span>
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="message-text">{message.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message ai">
                  <div className="message-avatar">
                    <img src="/mina-casual.png" alt="가상 인플루언서" className="avatar-img" />
                  </div>
                  <div className="message-content">
                    <div className="message-text">
                      <span className="loading-dots">
                        <span>.</span><span>.</span><span>.</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="chat-input-container">
            <div className="chat-input">
              <textarea 
                ref={messageInputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="메시지를 입력하세요..."
              />
              <button className="btn-action">
                <i className="fas fa-image"></i>
              </button>
              <button 
                className="btn-send"
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
            
            <div className="input-actions">
              <button className="action-btn">
                <i className="fas fa-microphone"></i>
                <span>음성 입력</span>
              </button>
              <button className="action-btn">
                <i className="fas fa-camera"></i>
                <span>웹캠</span>
              </button>
              <button className="action-btn">
                <i className="fas fa-desktop"></i>
                <span>화면 공유</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* 오른쪽 영상 패널 */}
        <div className="video-panel">
          {/* 상단: 가상 인플루언서 비디오 */}
          <div className="influencer-container">
            <div className="influencer-media">
              <div className="influencer-canvas-container">
                <canvas ref={influencerCanvasRef}></canvas>
                <img 
                  src="/mina-casual.png" 
                  alt="가상 인플루언서" 
                  style={{ display: 'none' }}
                />
              </div>
              <div className={`speaking-indicator ${isSpeaking ? 'active' : ''}`}>
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
              </div>
            </div>
            <div className="media-controls">
              <button 
                className={`btn-media-control ${isAIMuted ? 'muted' : ''}`}
                onClick={() => setIsAIMuted(!isAIMuted)}
              >
                <i className={`fas ${isAIMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
              </button>
            </div>
          </div>
          
          {/* 하단: 사용자 비디오 */}
          <div className="user-video-container">
            <video 
              ref={userVideoRef}
              autoPlay 
              muted 
              playsInline
            />
            <div className="user-video-controls">
              <button 
                className={`btn-video-control ${!isUserAudioEnabled ? 'muted' : ''}`}
                onClick={() => setIsUserAudioEnabled(!isUserAudioEnabled)}
              >
                <i className={`fas ${isUserAudioEnabled ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
              </button>
              <button 
                className={`btn-video-control ${!isUserVideoEnabled ? 'video-off' : ''}`}
                onClick={() => setIsUserVideoEnabled(!isUserVideoEnabled)}
              >
                <i className={`fas ${isUserVideoEnabled ? 'fa-video' : 'fa-video-slash'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 비교 모달 */}
      {isCompareModalOpen && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>API 비교</h2>
              <button 
                className="close-btn"
                onClick={() => setIsCompareModalOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="comparison-container">
                <div className="comparison-item">
                  <h3>일반 API (Gemini Pro)</h3>
                  <div className="comparison-content">
                    <ul>
                      <li><i className="fas fa-check"></i> 텍스트 기반 대화</li>
                      <li><i className="fas fa-check"></i> 기본 응답 생성</li>
                      <li><i className="fas fa-times"></i> 멀티모달 입력 제한적</li>
                      <li><i className="fas fa-times"></i> 이미지 분석 기능 제한적</li>
                      <li><i className="fas fa-times"></i> 음성 인식 통합 어려움</li>
                    </ul>
                    <div className="code-sample">
                      <pre><code>// 기본 API 호출 예시
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: message }] }] })
  }
);</code></pre>
                    </div>
                  </div>
                </div>
                <div className="comparison-item">
                  <h3>AI Studio</h3>
                  <div className="comparison-content">
                    <ul>
                      <li><i className="fas fa-check"></i> 텍스트 기반 대화</li>
                      <li><i className="fas fa-check"></i> 고급 응답 생성</li>
                      <li><i className="fas fa-check"></i> 멀티모달 입력 지원</li>
                      <li><i className="fas fa-check"></i> 이미지 분석 및 처리</li>
                      <li><i className="fas fa-check"></i> 음성 인식 및 합성 통합</li>
                    </ul>
                    <div className="code-sample">
                      <pre><code>// AI Studio API 호출 예시
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

// 멀티모달 입력 처리
const result = await model.generateContent({
  contents: [
    {
      role: "user",
      parts: [
        { text: message },
        { inlineData: { mimeType: "image/jpeg", data: imageData } }
      ]
    }
  ]
});</code></pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Font Awesome 스크립트 로드 */}
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js" 
        strategy="afterInteractive"
      />
    </div>
  )
} 