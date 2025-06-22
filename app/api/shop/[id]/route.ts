import { NextResponse } from 'next/server';
import { mockProducts, Product } from '@/lib/data';

/**
 * 상품 상세 정보를 조회하는 API 엔드포인트
 * GET /api/shop/[id]
 * 
 * @param request - 요청 객체
 * @param params - 경로 파라미터 (id 포함)
 * @returns 상품 상세 정보 또는 에러 응답
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // URL에서 상품 ID 추출
    const { id } = params;

    // 모의 데이터에서 해당 ID의 상품 찾기
    const product = mockProducts.find((p) => p.id === id);

    // 상품을 찾지 못한 경우 404 에러 반환
    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 상품 정보 반환 (2초 지연 시뮬레이션)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // 상품 정보 반환
    return NextResponse.json(product);
  } catch (error) {
    console.error('상품 조회 중 오류 발생:', error);
    
    // 서버 에러 응답
    return NextResponse.json(
      { error: '상품 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
