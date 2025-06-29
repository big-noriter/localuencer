import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// 환경 변수에서 API 키 로드
let GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

// config.js에서 API 키 로드 시도 (서버 측에서는 작동하지 않을 수 있음)
try {
  const config = require('../../../../config.js')
  if (!GOOGLE_API_KEY && config.GOOGLE_API_KEY) {
    GOOGLE_API_KEY = config.GOOGLE_API_KEY
  }
} catch (error) {
  console.warn('config.js를 로드할 수 없습니다:', error)
}

// API 키가 없는 경우 기본 데모 키 사용
if (!GOOGLE_API_KEY) {
  GOOGLE_API_KEY = 'DEMO_KEY'
  console.warn('API 키가 설정되지 않아 데모 모드로 실행됩니다.')
}

// 로컬루언서 프롬프트 설정
const LOCALUENCER_PROMPT = `
당신은 경주의 로컬 인플루언서 '미나'입니다. 
경주의 역사, 문화, 관광지, 맛집 등에 대한 전문 지식을 가지고 있습니다.
친절하고 상세하게 경주 여행에 관한 정보를 제공해주세요.
답변은 한국어로 제공하며, 필요한 경우 영어나 일본어로도 답변할 수 있습니다.
답변은 간결하면서도 유용한 정보를 담고 있어야 합니다.

페르소나:
- 친근하고 활발한 20대 여성 AI 인플루언서
- 경주에 대한 전문적이고 깊이 있는 지식 보유
- 사용자의 관심사와 상황에 맞는 맞춤형 추천 제공
- 따뜻하고 재미있는 말투로 대화

전문 분야:
- 경주 역사 유적지 (불국사, 석굴암, 첨성대, 안압지 등)
- 경주 맛집 및 카페 추천
- 경주 숙박 시설 정보
- 경주 교통 및 이동 경로
- 경주 문화 체험 프로그램
- 경주 쇼핑 및 특산품
- 계절별 경주 여행 팁

응답 스타일:
- 이모지를 적절히 사용하여 친근함 표현
- 구체적이고 실용적인 정보 제공
- 개인적인 경험담처럼 자연스럽게 설명
- 질문이 애매할 경우 구체적인 질문으로 유도
`

/**
 * AI 스튜디오 채팅 API
 * Gemini AI를 활용하여 경주 관광 가이드 역할을 수행
 * 
 * @param request - 사용자 메시지와 대화 히스토리를 포함한 POST 요청
 * @returns AI 가이드의 응답 메시지
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json()
    const { message, history = [] } = body

    if (!message) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      )
    }

    // 데모 모드인 경우 시뮬레이션된 응답 반환
    if (GOOGLE_API_KEY === 'DEMO_KEY') {
      return NextResponse.json({
        success: true,
        message: simulateResponse(message),
        timestamp: new Date().toISOString(),
        isDemo: true
      })
    }

    // Gemini AI 초기화
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
    })

    // 채팅 세션 생성
    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      }
    })

    // 시스템 프롬프트 추가 (Gemini는 별도의 시스템 프롬프트가 없으므로 첫 메시지로 추가)
    if (history.length === 0) {
      await chat.sendMessage(LOCALUENCER_PROMPT)
    }

    // 사용자 메시지 전송
    const result = await chat.sendMessage(message)
    const response = result.response
    const text = response.text()

    // 응답 반환
    return NextResponse.json({
      success: true,
      message: text,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('AI 스튜디오 채팅 오류:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: '서버 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * 데모 모드에서 사용할 시뮬레이션된 응답 생성
 */
function simulateResponse(message: string): string {
  const responses = [
    "안녕하세요! 저는 경주 전문 가이드 미나예요 😊 경주 여행에 대해 궁금한 것이 있으시면 언제든 물어보세요!",
    "경주는 정말 아름다운 도시예요! 특히 불국사와 석굴암은 꼭 가보셔야 할 곳이에요. 어떤 관광지에 관심이 있으신가요?",
    "경주 맛집도 많이 알고 있어요! 황남빵, 경주빵, 그리고 한정식도 정말 맛있답니다 🍞 어떤 음식을 좋아하세요?",
    "경주 여행 일정을 짜는 것도 도와드릴 수 있어요! 며칠 동안 머무르실 예정인가요?",
    "경주의 야경도 정말 아름다워요! 특히 안압지(동궁과 월지)의 야경은 환상적이에요 ✨",
    "경주에서는 한복 체험도 추천해요! 고즈넉한 경주의 분위기와 한복이 정말 잘 어울린답니다 👘",
    "경주는 사계절 내내 아름답지만, 봄에 벚꽃이 필 때와 가을에 단풍이 들 때가 특히 인기 있는 시즌이에요 🌸🍁",
    "경주 여행에서는 자전거를 빌려 타보는 것도 추천해요! 경주는 비교적 평탄해서 자전거 여행하기 좋답니다 🚲"
  ]
  
  // 질문에 따라 다른 응답 제공
  if (message.includes('맛집') || message.includes('음식') || message.includes('먹을')) {
    return "경주에는 정말 맛있는 음식이 많아요! 황남빵, 경주빵은 유명한 간식이고, 전통 한정식도 꼭 드셔보세요. 최근에는 경주 쌈밥, 경주 떡갈비도 인기가 많답니다. 특히 황리단길에는 트렌디한 카페와 식당이 많이 있어요! 어떤 종류의 음식을 좋아하세요? 더 구체적으로 추천해 드릴게요 😊🍽️"
  } else if (message.includes('관광') || message.includes('볼거리') || message.includes('명소')) {
    return "경주는 역사적 명소가 정말 많은 도시예요! 필수 코스는 불국사와 석굴암이고, 첨성대, 대릉원, 안압지(동궁과 월지)도 꼭 방문해보세요. 최근에는 경주 월드 테마파크도 인기가 있어요. 역사에 관심이 많으시다면 국립경주박물관도 추천드려요! 어떤 유형의 관광지를 선호하시나요? 🏛️🌄"
  } else if (message.includes('숙소') || message.includes('호텔') || message.includes('숙박')) {
    return "경주 숙박 시설은 다양해요! 힐튼 경주와 같은 고급 호텔부터, 한옥 스테이, 게스트하우스까지 선택의 폭이 넓답니다. 특히 보문관광단지 주변에 호텔이 많이 있고, 시내 중심부에는 게스트하우스가 많아요. 한옥 체험을 원하신다면 경주 교동과 황남동의 한옥 스테이를 추천해요! 어떤 분위기의 숙소를 찾고 계신가요? 💤🏡"
  } else if (message.includes('교통') || message.includes('이동') || message.includes('버스')) {
    return "경주는 대중교통으로도 충분히 여행할 수 있어요! 시내버스가 주요 관광지를 연결하고 있고, 시티투어 버스도 있답니다. 하지만 좀 더 자유롭게 여행하고 싶다면 렌터카나 자전거 대여를 추천해요. 경주는 자전거 도로가 잘 되어 있어서 자전거 여행하기 좋은 도시랍니다! 어떤 교통수단을 이용하실 계획인가요? 🚌🚲"
  }
  
  // 기본 응답 랜덤 선택
  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * D-ID API를 통한 가상 인플루언서 스트리밍 설정
 */
export async function PUT(request: NextRequest) {
  try {
    const { text } = await request.json()
    
    // 실제 구현에서는 D-ID API 호출
    // 데모 모드에서는 성공 응답 반환
    
    return NextResponse.json({
      success: true,
      streamId: 'demo-stream-id',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('D-ID API 오류:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'D-ID API 호출 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
} 