import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import tourData from '@/tour.json'

/**
 * 오감 기반 여행지 추천 인터페이스
 */
interface TravelRecommendationRequest {
  theme: 'visual' | 'taste' | 'smell' | 'touch' | 'sound' | 'mixed'
  duration: number // 여행 일수
  interests?: string[] // 추가 관심사
  budget?: 'low' | 'medium' | 'high'
  travelStyle?: 'relaxed' | 'active' | 'cultural' | 'adventure'
}

interface RecommendedSpot {
  id: number
  name: string
  description: string
  category: string
  sense: string
  coordinates: {
    lat: number
    lng: number
  }
  google_maps: string
  google_earth: string
  visitDuration: string
  bestTime: string
  tips: string[]
}

interface TravelItinerary {
  theme: string
  totalDays: number
  spots: RecommendedSpot[]
  route: {
    lat: number
    lng: number
    name: string
  }[]
  totalDistance: string
  estimatedCost: string
  aiRecommendation: string
}

/**
 * 오감별 테마 매핑
 */
const senseMapping = {
  visual: '시각',
  taste: '미각', 
  smell: '후각',
  touch: '촉각',
  sound: '청각',
  mixed: '종합'
}

/**
 * 좌표 추출 함수 (Google Maps URL에서)
 */
function extractCoordinates(googleMapsUrl: string): { lat: number, lng: number } {
  // 기본 좌표 (경주 중심)
  const defaultCoords = { lat: 35.8356, lng: 129.2194 }
  
  try {
    // Google Maps URL에서 좌표 추출 로직
    // 실제로는 더 정교한 파싱이 필요하지만, 여기서는 기본값 사용
    return defaultCoords
  } catch {
    return defaultCoords
  }
}

/**
 * AI 기반 여행 일정 추천 API
 */
export async function POST(request: NextRequest) {
  try {
    const { theme, duration, interests = [], budget = 'medium', travelStyle = 'cultural' }: TravelRecommendationRequest = await request.json()

    if (!theme || !duration) {
      return NextResponse.json(
        { error: '테마와 여행 일수는 필수입니다.' },
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

    // 오감별 필터링
    const senseKeyword = senseMapping[theme]
    let filteredSpots = tourData.filter(spot => {
      if (theme === 'mixed') {
        return true // 모든 오감 포함
      }
      return spot.sense === senseKeyword
    })

    // 추가 관심사로 필터링
    if (interests.length > 0) {
      filteredSpots = filteredSpots.filter(spot => 
        interests.some(interest => 
          spot.category.includes(interest) || 
          spot.description.includes(interest) ||
          spot.name.includes(interest)
        )
      )
    }

    // 여행 일수에 맞게 스팟 수 조정
    const spotsPerDay = theme === 'mixed' ? 3 : 2
    const maxSpots = duration * spotsPerDay
    const selectedSpots = filteredSpots.slice(0, maxSpots)

    if (selectedSpots.length === 0) {
      return NextResponse.json(
        { error: '선택한 조건에 맞는 여행지를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // OpenAI로 개인화된 추천 생성
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    })

    const prompt = `당신은 경주 여행 전문가입니다. 다음 조건에 맞는 ${duration}일 여행 일정을 추천해주세요:

테마: ${theme} (${senseKeyword})
여행 스타일: ${travelStyle}
예산: ${budget}
관심사: ${interests.join(', ') || '없음'}

선택된 관광지들:
${selectedSpots.map(spot => `- ${spot.name}: ${spot.description.slice(0, 100)}...`).join('\n')}

다음 형식으로 추천해주세요:
1. 전체 여행 테마 설명 (2-3문장)
2. 일차별 상세 일정 (각 관광지별 방문 시간, 소요시간, 특별한 팁)
3. 오감 체험 포인트 강조
4. 예상 비용 및 준비물
5. 계절별/시간대별 추천사항

친근하고 전문적인 톤으로 작성해주세요.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const aiRecommendation = completion.choices[0]?.message?.content || '추천을 생성하지 못했습니다.'

    // 좌표 및 경로 정보 생성
    const recommendedSpots: RecommendedSpot[] = selectedSpots.map(spot => ({
      id: spot.id,
      name: spot.name,
      description: spot.description,
      category: spot.category,
      sense: spot.sense,
      coordinates: extractCoordinates(spot.google_maps),
      google_maps: spot.google_maps,
      google_earth: spot.google_earth,
      visitDuration: getDurationBySense(spot.sense),
      bestTime: getBestTimeBySense(spot.sense),
      tips: generateTipsBySense(spot.sense, spot.category)
    }))

    // 경로 생성 (방문 순서 최적화)
    const route = recommendedSpots.map(spot => ({
      lat: spot.coordinates.lat,
      lng: spot.coordinates.lng,
      name: spot.name
    }))

    // 응답 데이터 구성
    const itinerary: TravelItinerary = {
      theme: `${senseKeyword} 중심 여행`,
      totalDays: duration,
      spots: recommendedSpots,
      route: route,
      totalDistance: `약 ${Math.round(recommendedSpots.length * 5.5)}km`,
      estimatedCost: getEstimatedCost(budget, duration, recommendedSpots.length),
      aiRecommendation: aiRecommendation
    }

    return NextResponse.json({
      success: true,
      data: itinerary,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('여행 추천 생성 오류:', error)
    
    // 개발 환경에서는 목업 데이터 반환
    if (process.env.NODE_ENV === 'development') {
      const mockItinerary = generateMockItinerary(theme, duration)
      return NextResponse.json({
        success: true,
        data: mockItinerary,
        timestamp: new Date().toISOString(),
        isDevelopmentMode: true,
      })
    }

    return NextResponse.json(
      { error: '여행 추천 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * 오감별 방문 소요시간 추천
 */
function getDurationBySense(sense: string): string {
  const durations = {
    '시각': '1-2시간',
    '미각': '1-1.5시간', 
    '후각': '30분-1시간',
    '촉각': '2-3시간',
    '청각': '1-2시간'
  }
  return durations[sense as keyof typeof durations] || '1-2시간'
}

/**
 * 오감별 최적 방문 시간 추천
 */
function getBestTimeBySense(sense: string): string {
  const bestTimes = {
    '시각': '오전 9-11시, 오후 4-6시 (황금시간)',
    '미각': '점심시간 11-14시, 저녁시간 17-20시',
    '후각': '오전 시간 (공기가 맑을 때)',
    '촉각': '오후 시간 (체험 활동에 적합)',
    '청각': '조용한 오전 시간대'
  }
  return bestTimes[sense as keyof typeof bestTimes] || '오전-오후 언제나'
}

/**
 * 오감별 팁 생성
 */
function generateTipsBySense(sense: string, category: string): string[] {
  const tipsByCategory = {
    '시각': [
      '사진 촬영을 위해 삼각대 준비',
      '황금시간대(일출/일몰) 방문 추천',
      '날씨 좋은 날 방문',
      '다양한 각도에서 관찰해보기'
    ],
    '미각': [
      '현지 특색 음식 꼭 시도',
      '식사 시간 여유롭게 계획',
      '알레르기 정보 미리 확인',
      '포장 가능 여부 문의'
    ],
    '후각': [
      '꽃이 피는 계절 방문 추천',
      '바람이 적은 날 방문',
      '향기를 충분히 음미할 시간 확보',
      '알레르기 주의사항 확인'
    ],
    '촉각': [
      '체험 가능한 복장 착용',
      '손 씻을 수 있는 준비물',
      '체험 시간 충분히 확보',
      '안전 수칙 준수'
    ],
    '청각': [
      '조용한 시간대 방문',
      '이어폰/헤드폰 준비',
      '주변 소음 최소화',
      '음향 가이드 활용'
    ]
  }
  
  return tipsByCategory[sense as keyof typeof tipsByCategory]?.slice(0, 3) || [
    '편안한 복장 착용',
    '충분한 시간 확보',
    '날씨 확인 후 방문'
  ]
}

/**
 * 예상 비용 계산
 */
function getEstimatedCost(budget: string, days: number, spotCount: number): string {
  const baseCosts = {
    low: 30000,
    medium: 50000,
    high: 80000
  }
  
  const dailyCost = baseCosts[budget as keyof typeof baseCosts]
  const totalCost = dailyCost * days
  
  return `${totalCost.toLocaleString()}원 (${days}일, 입장료 및 식사 포함)`
}

/**
 * 개발용 목업 데이터 생성
 */
function generateMockItinerary(theme: string, duration: number): TravelItinerary {
  const mockSpots: RecommendedSpot[] = [
    {
      id: 1,
      name: '불국사',
      description: '신라 불교문화의 정수를 보여주는 유네스코 세계문화유산',
      category: '관광지',
      sense: '시각',
      coordinates: { lat: 35.7898, lng: 129.3320 },
      google_maps: 'https://goo.gl/maps/816ZK7KW1FVqYQmR8',
      google_earth: 'https://earth.google.com/web/@35.7905495,129.3310156,28.238999',
      visitDuration: '2-3시간',
      bestTime: '오전 9-11시',
      tips: ['이른 아침 방문 추천', '편한 신발 착용', '사진 촬영 허용 구역 확인']
    },
    {
      id: 3,
      name: '황리단길',
      description: '전통 한옥과 현대 감성이 어우러진 문화거리',
      category: '핫플레이스',
      sense: '후각',
      coordinates: { lat: 35.8327, lng: 129.2263 },
      google_maps: 'https://goo.gl/maps/JR3GkmGpb4wzyDQU9',
      google_earth: 'https://earth.google.com/web/@35.8327303,129.2263293,15.000000',
      visitDuration: '1-2시간',
      bestTime: '오후 2-5시',
      tips: ['카페 투어 추천', '사진 촬영 명소', '주말 혼잡 주의']
    }
  ]

  return {
    theme: `${senseMapping[theme as keyof typeof senseMapping]} 중심 여행`,
    totalDays: duration,
    spots: mockSpots.slice(0, duration * 2),
    route: mockSpots.slice(0, duration * 2).map(spot => ({
      lat: spot.coordinates.lat,
      lng: spot.coordinates.lng,
      name: spot.name
    })),
    totalDistance: `약 ${Math.round(duration * 11)}km`,
    estimatedCost: `${(50000 * duration).toLocaleString()}원`,
    aiRecommendation: `${senseMapping[theme as keyof typeof senseMapping]} 중심의 ${duration}일 경주 여행을 추천드립니다! 

🎯 **여행 테마**: ${senseMapping[theme as keyof typeof senseMapping]}을 중심으로 한 감성 여행
📅 **일정**: ${duration}일간의 여유로운 탐방
💰 **예상 비용**: 1일 약 5만원 (입장료, 식사, 교통비 포함)

**주요 포인트**:
- 각 관광지에서 ${senseMapping[theme as keyof typeof senseMapping]} 체험에 집중
- 충분한 시간을 두고 여유롭게 관람
- 현지 음식과 문화 체험 병행
- 사진 촬영과 기념품 구매 시간 확보

**준비물**: 편한 신발, 카메라, 여유로운 마음가짐
**팁**: 각 장소마다 고유한 매력을 천천히 음미하며 즐기세요!`
  }
} 