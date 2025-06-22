'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/lib/auth'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

/**
 * 장바구니 페이지 컴포넌트
 * 
 * 주요 기능:
 * - 장바구니에 담긴 상품 목록 표시
 * - 상품 수량 조절 (증가/감소/직접 입력)
 * - 개별 상품 삭제 및 전체 삭제
 * - 선택된 옵션 표시 (색상, 사이즈 등)
 * - 총 가격 계산 및 표시
 * - 주문하기 버튼 (로그인 확인)
 * - 반응형 디자인 지원
 * 
 * 상태 관리:
 * - useCart 훅을 통한 장바구니 상태 관리
 * - useAuth 훅을 통한 사용자 인증 확인
 * 
 * @returns 장바구니 페이지 JSX
 */
export default function CartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { 
    items, 
    isLoading, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getFormattedTotalPrice 
  } = useCart()

  const [isProcessing, setIsProcessing] = useState(false)

  /**
   * 주문 페이지로 이동
   */
  const handleCheckout = () => {
    if (!user) {
      // 로그인이 필요한 경우 로그인 페이지로 이동
      router.push('/auth/login?redirect=/cart')
      return
    }
    
    router.push('/checkout')
  }

  /**
   * 수량 증가
   */
  const handleIncreaseQuantity = (itemId: string, currentQuantity: number) => {
    updateQuantity(itemId, currentQuantity + 1)
  }

  /**
   * 수량 감소
   */
  const handleDecreaseQuantity = (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1)
    }
  }

  /**
   * 개별 상품 가격 계산
   */
  const getItemPrice = (price: string, quantity: number) => {
    const numericPrice = parseInt(price.replace(/[^0-9]/g, ''))
    return (numericPrice * quantity).toLocaleString() + '원'
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">장바구니를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">장바구니</h1>
          <p className="text-muted-foreground mt-1">
            선택하신 상품들을 확인해보세요
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        /* 빈 장바구니 */
        <Card className="text-center py-16">
          <CardContent>
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">장바구니가 비어있어요</h2>
            <p className="text-muted-foreground mb-6">
              미나가 추천하는 다양한 상품들을 만나보세요!
            </p>
            <Button asChild>
              <Link href="/shop">쇼핑하러 가기</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 장바구니 상품 목록 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                상품 목록 ({getTotalItems()}개)
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                전체 삭제
              </Button>
            </div>

            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* 상품 이미지 */}
                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.product.description}
                          </p>
                          
                          {/* 선택된 옵션 표시 */}
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {Object.entries(item.selectedOptions).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-pink-600">
                              {getItemPrice(item.product.price, item.quantity)}
                            </div>
                            
                            {/* 수량 조절 */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value) || 1
                                  updateQuantity(item.id, newQuantity)
                                }}
                                className="w-16 h-8 text-center"
                                min="1"
                                max="99"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* 삭제 버튼 */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 주문 요약 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>주문 요약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>상품 금액</span>
                    <span>{getFormattedTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>배송비</span>
                    <span className="text-green-600">무료</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>총 결제 금액</span>
                  <span className="text-pink-600">{getFormattedTotalPrice()}</span>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? '처리 중...' : '주문하기'}
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  asChild
                >
                  <Link href="/shop">쇼핑 계속하기</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
} 