import { NextRequest, NextResponse } from 'next/server'

// 환경 변수에서 API 키 로드
let GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
let D_ID_API_KEY = process.env.D_ID_API_KEY
let GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

// config.js에서 API 키 로드 시도 (서버 측에서는 작동하지 않을 수 있음)
try {
  const config = require('../../../config.js')
  if (config) {
    GOOGLE_API_KEY = GOOGLE_API_KEY || config.GOOGLE_API_KEY
    D_ID_API_KEY = D_ID_API_KEY || config.D_ID_API_KEY
    GEMINI_MODEL = GEMINI_MODEL || config.GEMINI_MODEL
  }
} catch (error) {
  console.warn('config.js를 로드할 수 없습니다:', error)
}

/**
 * API 설정 정보 제공
 * 
 * @returns API 키 및 설정 정보
 */
export async function GET() {
  // 실제 배포 환경에서는 API 키를 클라이언트에 직접 노출하지 않도록 주의
  // 개발 환경이나 데모 목적으로만 사용
  
  return NextResponse.json({
    // 실제 API 키가 없는 경우 데모 키 반환
    GOOGLE_API_KEY: GOOGLE_API_KEY || 'DEMO_KEY',
    D_ID_API_KEY: D_ID_API_KEY || 'DEMO_KEY',
    GEMINI_MODEL: GEMINI_MODEL,
    
    // 로컬루언서 설정
    LOCALUENCER: {
      name: '미나',
      location: '경주',
      expertise: ['역사', '문화', '관광', '맛집']
    },
    
    // 환경 정보
    environment: process.env.NODE_ENV || 'development',
    isDemo: !GOOGLE_API_KEY || !D_ID_API_KEY
  })
}

/**
 * API 키 설정 (관리자용)
 * 
 * @param request - API 키 설정 정보를 포함한 POST 요청
 * @returns 설정 결과
 */
export async function POST(request: NextRequest) {
  try {
    // 실제 구현에서는 인증 및 권한 검사 필요
    // 여기서는 데모 목적으로 간단히 구현
    
    const { GOOGLE_API_KEY: newGoogleKey, D_ID_API_KEY: newDIdKey } = await request.json()
    
    // 실제 구현에서는 환경 변수나 데이터베이스에 저장
    // 여기서는 메모리에만 저장 (서버 재시작 시 초기화됨)
    if (newGoogleKey) GOOGLE_API_KEY = newGoogleKey
    if (newDIdKey) D_ID_API_KEY = newDIdKey
    
    return NextResponse.json({
      success: true,
      message: 'API 키가 설정되었습니다.'
    })
    
  } catch (error: any) {
    console.error('API 키 설정 오류:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'API 키 설정 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
} 