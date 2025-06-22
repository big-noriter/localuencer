import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

/**
 * AI 가이드 채팅 API
 * OpenAI GPT를 활용하여 경주 관광 가이드 역할을 수행
 * 
 * @param request - 사용자 메시지와 대화 히스토리를 포함한 POST 요청
 * @returns AI 가이드의 응답 메시지
 */
export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [], language = 'ko' } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      )
    }

    // OpenAI API 키 확인
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI 서비스 설정이 필요합니다.' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    })

    // 미나의 페르소나 및 경주 관광 가이드 시스템 프롬프트
    const systemPrompt = `당신은 '미나'라는 이름의 경주 전문 AI 관광 가이드입니다.

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

주의사항:
- 경주와 관련 없는 질문에는 정중히 경주 관련 주제로 유도
- 정확하지 않은 정보는 제공하지 않고 확인이 필요하다고 안내
- 사용자의 안전과 편의를 최우선으로 고려`

    // 대화 히스토리 구성
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('AI 응답 생성에 실패했습니다.')
    }

    // 응답 반환
    return NextResponse.json({
      success: true,
      message: aiResponse,
      timestamp: new Date().toISOString(),
      conversationId: `conv_${Date.now()}`,
    })

  } catch (error) {
    console.error('AI 가이드 채팅 오류:', error)
    
    // 개발 환경에서는 목업 응답 제공
    if (process.env.NODE_ENV === 'development') {
      const mockResponses = [
        "안녕하세요! 저는 경주 전문 가이드 미나예요 😊 경주 여행에 대해 궁금한 것이 있으시면 언제든 물어보세요!",
        "경주는 정말 아름다운 도시예요! 특히 불국사와 석굴암은 꼭 가보셔야 할 곳이에요. 어떤 관광지에 관심이 있으신가요?",
        "경주 맛집도 많이 알고 있어요! 황남빵, 경주빵, 그리고 한정식도 정말 맛있답니다 🍞 어떤 음식을 좋아하세요?",
        "경주 여행 일정을 짜는 것도 도와드릴 수 있어요! 며칠 동안 머무르실 예정인가요?",
        "경주의 야경도 정말 아름다워요! 특히 안압지(동궁과 월지)의 야경은 환상적이에요 ✨"
      ]
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      
      return NextResponse.json({
        success: true,
        message: randomResponse,
        timestamp: new Date().toISOString(),
        conversationId: `mock_conv_${Date.now()}`,
        isDevelopmentMode: true,
      })
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * 음성 텍스트 변환 API (STT - Speech to Text)
 * OpenAI Whisper를 활용한 음성 인식
 */
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: '음성 파일이 필요합니다.' },
        { status: 400 }
      )
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI 서비스 설정이 필요합니다.' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    })

    // Whisper를 사용한 음성 인식
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ko',
    })

    return NextResponse.json({
      success: true,
      text: transcription.text,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('음성 인식 오류:', error)
    
    // 개발 환경에서는 목업 응답
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        text: "안녕하세요, 경주 여행에 대해 궁금한 것이 있어요.",
        timestamp: new Date().toISOString(),
        isDevelopmentMode: true,
      })
    }

    return NextResponse.json(
      { error: '음성 인식에 실패했습니다.' },
      { status: 500 }
    )
  }
} 