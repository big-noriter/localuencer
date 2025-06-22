"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { RequireAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import Link from "next/link"

// 목업 주문 데이터
const MOCK_ORDERS = [
  {
    id: "ORD-2024-001",
    date: "2024-12-15",
    status: "delivered",
    total: 45000,
    items: [
      {
        id: "1",
        name: "경주 황남빵 선물세트",
        price: 25000,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80&text=황남빵"
      },
      {
        id: "2", 
        name: "신라 천년 차 세트",
        price: 20000,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80&text=차세트"
      }
    ]
  },
  {
    id: "ORD-2024-002",
    date: "2024-12-10",
    status: "shipping",
    total: 35000,
    items: [
      {
        id: "3",
        name: "불국사 기념품 세트",
        price: 35000,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80&text=기념품"
      }
    ]
  },
  {
    id: "ORD-2024-003",
    date: "2024-12-05",
    status: "preparing",
    total: 28000,
    items: [
      {
        id: "4",
        name: "경주 대추 선물세트",
        price: 28000,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80&text=대추"
      }
    ]
  }
]

export default function OrdersPage() {
  const { user } = useAuth()

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'preparing':
        return '준비중'
      case 'shipping':
        return '배송중'
      case 'delivered':
        return '배송완료'
      case 'cancelled':
        return '취소됨'
      default:
        return status
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'secondary'
      case 'shipping':
        return 'default'
      case 'delivered':
        return 'success'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const handleTrackOrder = (orderId: string) => {
    toast.info(`주문 ${orderId} 배송 추적 기능은 개발 중입니다.`)
  }

  const handleReorder = (orderId: string) => {
    toast.info(`주문 ${orderId} 재주문 기능은 개발 중입니다.`)
  }

  const handleCancelOrder = (orderId: string) => {
    toast.info(`주문 ${orderId} 취소 기능은 개발 중입니다.`)
  }

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">주문 내역</h1>
          <p className="text-muted-foreground mt-2">
            {user?.name}님의 주문 내역을 확인하실 수 있습니다.
          </p>
        </div>

        {MOCK_ORDERS.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="mb-4">
                <Icons.package className="w-16 h-16 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">주문 내역이 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                아직 주문하신 상품이 없습니다. 쇼핑몰에서 다양한 상품을 둘러보세요!
              </p>
              <Button asChild>
                <Link href="/shop">쇼핑하러 가기</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {MOCK_ORDERS.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">주문번호: {order.id}</CardTitle>
                      <CardDescription>
                        주문일: {new Date(order.date).toLocaleDateString('ko-KR')}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusVariant(order.status) as any} className="mb-2">
                        {getStatusLabel(order.status)}
                      </Badge>
                      <p className="text-lg font-semibold">
                        총 ₩{order.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 주문 상품 목록 */}
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ₩{item.price.toLocaleString()} × {item.quantity}개
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ₩{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* 주문 액션 버튼들 */}
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'shipping' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTrackOrder(order.id)}
                        >
                          <Icons.truck className="w-4 h-4 mr-2" />
                          배송 추적
                        </Button>
                      )}
                      {order.status === 'delivered' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReorder(order.id)}
                          >
                            <Icons.repeat className="w-4 h-4 mr-2" />
                            재주문
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.info('리뷰 작성 기능은 개발 중입니다.')}
                          >
                            <Icons.star className="w-4 h-4 mr-2" />
                            리뷰 작성
                          </Button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <Icons.x className="w-4 h-4 mr-2" />
                          주문 취소
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info('주문 상세 정보는 개발 중입니다.')}
                      >
                        <Icons.eye className="w-4 h-4 mr-2" />
                        상세 보기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 주문 관련 도움말 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">주문 관련 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">배송 정보</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 평일 오후 2시 이전 주문시 당일 발송</li>
                  <li>• 주말/공휴일 주문은 다음 영업일 발송</li>
                  <li>• 제주도/도서산간 지역은 추가 배송일 소요</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">교환/환불</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 상품 수령 후 7일 이내 교환/환불 가능</li>
                  <li>• 식품류는 개봉 후 교환/환불 불가</li>
                  <li>• 고객센터: 1588-0000</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  )
}

// 아이콘 컴포넌트
const Icons = {
  package: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  truck: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  repeat: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  star: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  x: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  eye: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
} 