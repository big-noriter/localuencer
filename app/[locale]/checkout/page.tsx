'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/components/auth/auth-provider'
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

/**
 * 주문/체크아웃 페이지 컴포넌트
 * 
 * 주요 기능:
 * - 배송 정보 입력 (이름, 연락처, 주소, 배송 메시지)
 * - 결제 방법 선택 (신용카드, 계좌이체, 카카오페이)
 * - 이용약관 동의 체크
 * - 주문 상품 목록 및 가격 요약 표시
 * - 주문 정보 검증 및 처리
 * - 주문 완료 후 장바구니 초기화
 * 
 * 보안 및 검증:
 * - 로그인 사용자만 접근 가능
 * - 필수 입력 항목 검증
 * - 약관 동의 확인
 * 
 * 상태 관리:
 * - 배송 정보, 결제 방법, 약관 동의 상태 관리
 * - 주문 처리 중 로딩 상태 관리
 * 
 * @returns 주문/체크아웃 페이지 JSX
 */
export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { 
    items, 
    getTotalPrice, 
    getFormattedTotalPrice, 
    clearCart 
  } = useCart()
  const { toast } = useToast()

  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    detailAddress: '',
    zipCode: '',
    message: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [agreeTerms, setAgreeTerms] = useState(false)

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!user) {
    router.push('/auth/login?redirect=/checkout')
    return null
  }

  // 장바구니가 비어있는 경우
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">주문할 상품이 없습니다</h2>
          <p className="text-muted-foreground mb-6">
            장바구니에 상품을 담고 주문해주세요.
          </p>
          <Button asChild>
            <Link href="/shop">쇼핑하러 가기</Link>
          </Button>
        </div>
      </div>
    )
  }

  /**
   * 입력 폼 변경 핸들러
   */
  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  /**
   * 주문 처리 핸들러
   */
  const handleOrder = async () => {
    // 필수 정보 검증
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      toast({
        title: "배송 정보를 입력해주세요",
        description: "이름, 연락처, 주소는 필수 입력 항목입니다.",
        variant: "destructive"
      })
      return
    }

    if (!agreeTerms) {
      toast({
        title: "약관에 동의해주세요",
        description: "주문을 진행하려면 이용약관에 동의해야 합니다.",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    try {
      // 실제로는 API를 통해 주문 정보를 서버에 전송
      await new Promise(resolve => setTimeout(resolve, 2000)) // 시뮬레이션

      // 주문 완료 후 장바구니 비우기
      clearCart()

      toast({
        title: "주문이 완료되었습니다!",
        description: "주문 확인 메일을 발송했습니다. 빠른 시일 내에 배송해드리겠습니다.",
      })

      // 주문 완료 페이지로 이동 (실제로는 주문 ID와 함께)
      router.push('/order-complete')
    } catch (error) {
      toast({
        title: "주문 처리 중 오류가 발생했습니다",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * 개별 상품 가격 계산
   */
  const getItemPrice = (price: string, quantity: number) => {
    const numericPrice = parseInt(price.replace(/[^0-9]/g, ''))
    return (numericPrice * quantity).toLocaleString() + '원'
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
          <h1 className="text-3xl font-bold">주문하기</h1>
          <p className="text-muted-foreground mt-1">
            배송 정보를 입력하고 주문을 완료해주세요
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 주문 정보 입력 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 배송 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                배송 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">받는 분 이름 *</Label>
                  <Input
                    id="name"
                    value={shippingInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="이름을 입력해주세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">연락처 *</Label>
                  <Input
                    id="phone"
                    value={shippingInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="010-0000-0000"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="zipCode">우편번호</Label>
                <div className="flex gap-2">
                  <Input
                    id="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="12345"
                    className="flex-1"
                  />
                  <Button variant="outline">우편번호 찾기</Button>
                </div>
              </div>

              <div>
                <Label htmlFor="address">주소 *</Label>
                <Input
                  id="address"
                  value={shippingInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="기본 주소를 입력해주세요"
                  required
                />
              </div>

              <div>
                <Label htmlFor="detailAddress">상세 주소</Label>
                <Input
                  id="detailAddress"
                  value={shippingInfo.detailAddress}
                  onChange={(e) => handleInputChange('detailAddress', e.target.value)}
                  placeholder="상세 주소를 입력해주세요"
                />
              </div>

              <div>
                <Label htmlFor="message">배송 메시지</Label>
                <Textarea
                  id="message"
                  value={shippingInfo.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="배송 시 요청사항이 있으시면 입력해주세요"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 결제 방법 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                결제 방법
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="card" 
                    checked={paymentMethod === 'card'}
                    onCheckedChange={(checked) => checked && setPaymentMethod('card')}
                  />
                  <Label htmlFor="card">신용카드</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="transfer" 
                    checked={paymentMethod === 'transfer'}
                    onCheckedChange={(checked) => checked && setPaymentMethod('transfer')}
                  />
                  <Label htmlFor="transfer">계좌이체</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="kakao" 
                    checked={paymentMethod === 'kakao'}
                    onCheckedChange={(checked) => checked && setPaymentMethod('kakao')}
                  />
                  <Label htmlFor="kakao">카카오페이</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 약관 동의 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                약관 동의
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm">
                  <span className="text-red-500">*</span> 개인정보 수집·이용 및 제3자 제공, 쇼핑몰 이용약관에 동의합니다.
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 주문 요약 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>주문 상품</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 상품 목록 */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.product.name}
                      </h4>
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.selectedOptions).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {item.quantity}개
                        </span>
                        <span className="text-sm font-medium">
                          {getItemPrice(item.product.price, item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* 가격 정보 */}
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
                onClick={handleOrder}
                disabled={isProcessing}
              >
                {isProcessing ? '주문 처리 중...' : `${getFormattedTotalPrice()} 결제하기`}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                주문 완료 후 취소/변경이 어려우니 신중히 확인해주세요.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 