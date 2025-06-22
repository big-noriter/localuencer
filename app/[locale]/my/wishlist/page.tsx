"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { RequireAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import Link from "next/link"

// 목업 찜한 상품 데이터
const MOCK_WISHLIST = [
  {
    id: "1",
    name: "경주 황남빵 선물세트",
    price: 25000,
    originalPrice: 30000,
    image: "/placeholder.svg?height=200&width=200&text=황남빵",
    category: "전통과자",
    rating: 4.8,
    reviewCount: 124,
    isOnSale: true,
    discount: 17,
    description: "경주의 대표 전통과자 황남빵을 정성스럽게 담은 선물세트입니다."
  },
  {
    id: "2",
    name: "신라 천년 차 세트",
    price: 20000,
    originalPrice: 20000,
    image: "/placeholder.svg?height=200&width=200&text=차세트",
    category: "차류",
    rating: 4.6,
    reviewCount: 89,
    isOnSale: false,
    discount: 0,
    description: "신라 시대부터 전해내려오는 전통 차를 현대적으로 재해석한 프리미엄 차 세트입니다."
  },
  {
    id: "3",
    name: "불국사 기념품 세트",
    price: 35000,
    originalPrice: 40000,
    image: "/placeholder.svg?height=200&width=200&text=기념품",
    category: "기념품",
    rating: 4.9,
    reviewCount: 156,
    isOnSale: true,
    discount: 13,
    description: "불국사의 아름다운 건축미를 담은 특별한 기념품 세트입니다."
  },
  {
    id: "4",
    name: "경주 대추 선물세트",
    price: 28000,
    originalPrice: 28000,
    image: "/placeholder.svg?height=200&width=200&text=대추",
    category: "건강식품",
    rating: 4.7,
    reviewCount: 93,
    isOnSale: false,
    discount: 0,
    description: "경주 지역에서 재배한 프리미엄 대추로 만든 건강한 선물세트입니다."
  }
]

export default function WishlistPage() {
  const { user } = useAuth()
  const { addItem } = useCart()
  const [wishlistItems, setWishlistItems] = useState(MOCK_WISHLIST)

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId))
    toast.success('찜 목록에서 제거되었습니다.')
  }

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    })
    toast.success('장바구니에 추가되었습니다.')
  }

  const handleMoveAllToCart = () => {
    wishlistItems.forEach(item => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1
      })
    })
    setWishlistItems([])
    toast.success('모든 상품이 장바구니에 추가되었습니다.')
  }

  const handleClearWishlist = () => {
    setWishlistItems([])
    toast.success('찜 목록이 모두 삭제되었습니다.')
  }

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">찜한 상품</h1>
            <p className="text-muted-foreground mt-2">
              {user?.name}님이 관심있어 하는 상품들입니다. ({wishlistItems.length}개)
            </p>
          </div>
          
          {wishlistItems.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleMoveAllToCart}
              >
                모두 장바구니에 담기
              </Button>
              <Button
                variant="outline"
                onClick={handleClearWishlist}
              >
                전체 삭제
              </Button>
            </div>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="mb-4">
                <Icons.heart className="w-16 h-16 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">찜한 상품이 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                마음에 드는 상품을 찜해보세요! 나중에 쉽게 찾아볼 수 있습니다.
              </p>
              <Button asChild>
                <Link href="/shop">쇼핑하러 가기</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {item.isOnSale && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      {item.discount}% 할인
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => handleRemoveFromWishlist(item.id)}
                  >
                    <Icons.heartFilled className="w-5 h-5 text-red-500" />
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                    
                    <h3 className="font-semibold text-lg leading-tight">
                      {item.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Icons.star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(item.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.rating} ({item.reviewCount})
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">
                          ₩{item.price.toLocaleString()}
                        </span>
                        {item.isOnSale && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₩{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <div className="p-4 pt-0 space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleAddToCart(item)}
                  >
                    <Icons.cart className="w-4 h-4 mr-2" />
                    장바구니 담기
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href={`/shop/${item.id}`}>
                      상품 보기
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 추천 상품 섹션 */}
        {wishlistItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">이런 상품은 어떠세요?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 추천 상품 목업 */}
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <img
                    src={`/placeholder.svg?height=150&width=200&text=추천상품${i}`}
                    alt={`추천 상품 ${i}`}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">추천 상품 {i}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      경주의 특별한 상품입니다.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">₩15,000</span>
                      <Button size="sm" variant="outline">
                        보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 찜하기 팁 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">찜하기 활용 팁</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Icons.heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <h4 className="font-semibold mb-1">관심 상품 저장</h4>
                <p className="text-muted-foreground">
                  마음에 드는 상품을 찜해두고 나중에 구매하세요
                </p>
              </div>
              <div className="text-center">
                <Icons.bell className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-semibold mb-1">할인 알림</h4>
                <p className="text-muted-foreground">
                  찜한 상품이 할인될 때 알림을 받아보세요
                </p>
              </div>
              <div className="text-center">
                <Icons.gift className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <h4 className="font-semibold mb-1">선물 아이디어</h4>
                <p className="text-muted-foreground">
                  찜한 상품을 선물 아이디어로 활용하세요
                </p>
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
  heart: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  heartFilled: ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  star: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  cart: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M17 18a2 2 0 11-4 0 2 2 0 014 0zM9 18a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  bell: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  gift: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
} 