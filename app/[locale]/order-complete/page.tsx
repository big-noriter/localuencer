'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Package, Truck, Home } from 'lucide-react'
import Link from 'next/link'

/**
 * 주문 완료 페이지 컴포넌트
 * 
 * 주요 기능:
 * - 주문 완료 성공 메시지 표시
 * - 주문 정보 요약 (주문번호, 주문일시, 결제상태)
 * - 배송 안내 및 진행 상황 표시
 * - 추가 서비스 안내 (이메일, SMS 알림)
 * - 고객 서비스 연결 링크
 * - 쇼핑 계속하기 및 홈으로 이동 버튼
 * 
 * 사용자 경험:
 * - 주문 완료에 대한 안심감 제공
 * - 다음 단계 안내 (배송, 고객 서비스)
 * - 추가 구매 유도
 * 
 * @returns 주문 완료 페이지 JSX
 */
export default function OrderCompletePage() {
  // 실제로는 URL 파라미터나 상태에서 주문 ID를 가져와야 함
  const orderId = "ORD-" + Date.now().toString().slice(-8)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* 성공 메시지 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">주문이 완료되었습니다!</h1>
          <p className="text-muted-foreground">
            미나가 선별한 특별한 상품들을 곧 만나보실 수 있어요 ✨
          </p>
        </div>

        {/* 주문 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>주문 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">주문번호</span>
              <span className="font-mono font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">주문일시</span>
              <span>{new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">결제상태</span>
              <span className="text-green-600 font-medium">결제완료</span>
            </div>
          </CardContent>
        </Card>

        {/* 배송 안내 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              배송 안내
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">상품 준비 중</h4>
                  <p className="text-sm text-muted-foreground">
                    주문하신 상품을 정성스럽게 포장하고 있어요
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">배송 예정</h4>
                  <p className="text-sm text-muted-foreground">
                    1-2일 내에 배송을 시작할 예정입니다
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Home className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">배송 완료</h4>
                  <p className="text-sm text-muted-foreground">
                    배송 완료 시 SMS로 알려드려요
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 추가 안내 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-blue-500">📧</span>
                <span>주문 확인 이메일을 발송했습니다. 스팸함도 확인해주세요.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">📱</span>
                <span>배송 상태는 SMS와 카카오톡으로 실시간 알림을 받으실 수 있어요.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-500">💝</span>
                <span>미나의 특별한 메시지와 함께 정성스럽게 포장해서 보내드려요.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1">
            <Link href="/shop">계속 쇼핑하기</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>

        {/* 고객 서비스 안내 */}
        <div className="mt-8 p-4 bg-muted rounded-lg text-center">
          <h3 className="font-medium mb-2">궁금한 점이 있으신가요?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            주문이나 배송에 관한 문의사항이 있으시면 언제든 연락해주세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/qa">Q&A 남기기</Link>
            </Button>
            <Button variant="outline" size="sm">
              카카오톡 문의
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 