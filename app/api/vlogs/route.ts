import { NextResponse } from 'next/server'
import { mockVlogs } from '@/lib/data'

export async function GET() {
  try {
    return NextResponse.json({
      vlogs: mockVlogs,
      success: true
    })
  } catch (error) {
    console.error('브이로그 API 오류:', error)
    return NextResponse.json(
      { error: '브이로그를 불러오는데 실패했습니다', success: false },
      { status: 500 }
    )
  }
} 