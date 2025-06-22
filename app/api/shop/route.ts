import { NextResponse } from 'next/server'
import { mockProducts } from '@/lib/data'

export async function GET() {
  try {
    return NextResponse.json({
      products: mockProducts,
      success: true
    })
  } catch (error) {
    console.error('상품 API 오류:', error)
    return NextResponse.json(
      { error: '상품을 불러오는데 실패했습니다', success: false },
      { status: 500 }
    )
  }
} 