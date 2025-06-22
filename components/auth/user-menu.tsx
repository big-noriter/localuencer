"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "./auth-provider"
import { toast } from "sonner"
import Link from "next/link"

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth()
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const router = useRouter()

  /**
   * 로그아웃 처리
   */
  const handleLogout = () => {
    logout()
    router.push('/')
  }

  /**
   * 프로필 이미지 업로드 처리 (시뮬레이션)
   */
  const handleProfileImageUpload = () => {
    toast.info('프로필 이미지 업로드 기능은 개발 중입니다.')
  }

  // 로그인하지 않은 경우 로그인 버튼 표시
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="outline" asChild>
          <Link href="/auth/login">로그인</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signup">회원가입</Link>
        </Button>
      </div>
    )
  }

  // 역할별 배지 색상
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'moderator':
        return 'secondary'
      case 'vip':
        return 'default'
      default:
        return 'outline'
    }
  }

  // 역할별 한국어 표시
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자'
      case 'moderator':
        return '운영자'
      case 'vip':
        return 'VIP'
      default:
        return '일반'
    }
  }

  // 상태별 한국어 표시
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '활성'
      case 'inactive':
        return '비활성'
      case 'suspended':
        return '정지'
      default:
        return '알 수 없음'
    }
  }

  // 로그인 방식별 한국어 표시
  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'google':
        return '구글'
      case 'naver':
        return '네이버'
      case 'kakao':
        return '카카오'
      case 'email':
        return '이메일'
      default:
        return provider
    }
  }

  return (
    <div className="flex items-center space-x-4">
      {/* 알림 버튼 */}
      <Button variant="ghost" size="icon" className="relative">
        <Icons.bell className="h-5 w-5" />
        {user.preferences.notifications && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        )}
      </Button>

      {/* 사용자 드롭다운 메뉴 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
          {/* 사용자 정보 헤더 */}
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                  {getRoleLabel(user.role)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getProviderLabel(user.provider)}
                </Badge>
                <Badge 
                  variant={user.status === 'active' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {getStatusLabel(user.status)}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />

          {/* 통계 정보 */}
          <DropdownMenuLabel className="font-normal">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-semibold">{user.stats.totalOrders}</div>
                <div className="text-muted-foreground">주문</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-semibold">{user.stats.wishlistCount}</div>
                <div className="text-muted-foreground">찜</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-semibold">{user.stats.totalLikes}</div>
                <div className="text-muted-foreground">좋아요</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-semibold">₩{user.stats.totalSpent.toLocaleString()}</div>
                <div className="text-muted-foreground">총 결제</div>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* 메뉴 항목들 */}
          <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Icons.user className="mr-2 h-4 w-4" />
                <span>내 프로필</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>내 프로필</DialogTitle>
                <DialogDescription>
                  프로필 정보를 확인하고 수정할 수 있습니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* 프로필 이미지 */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" onClick={handleProfileImageUpload}>
                    사진 변경
                  </Button>
                </div>

                {/* 기본 정보 */}
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium">이름</label>
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">이메일</label>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  {user.phone && (
                    <div>
                      <label className="text-sm font-medium">전화번호</label>
                      <p className="text-sm text-muted-foreground">{user.phone}</p>
                    </div>
                  )}
                  {user.profile.location && (
                    <div>
                      <label className="text-sm font-medium">지역</label>
                      <p className="text-sm text-muted-foreground">{user.profile.location}</p>
                    </div>
                  )}
                  {user.profile.bio && (
                    <div>
                      <label className="text-sm font-medium">소개</label>
                      <p className="text-sm text-muted-foreground">{user.profile.bio}</p>
                    </div>
                  )}
                </div>

                {/* 관심사 */}
                {user.profile.interests.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">관심사</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.profile.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 즐겨찾는 관광지 */}
                {user.profile.favoriteSpots.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">즐겨찾는 관광지</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.profile.favoriteSpots.map((spot, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                    닫기
                  </Button>
                  <Button onClick={() => toast.info('프로필 편집 기능은 개발 중입니다.')}>
                    편집
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenuItem asChild>
            <Link href="/my/orders">
              <Icons.package className="mr-2 h-4 w-4" />
              <span>주문 내역</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/my/wishlist">
              <Icons.heart className="mr-2 h-4 w-4" />
              <span>찜한 상품</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/my/reviews">
              <Icons.star className="mr-2 h-4 w-4" />
              <span>내 리뷰</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => toast.info('설정 페이지는 개발 중입니다.')}>
            <Icons.settings className="mr-2 h-4 w-4" />
            <span>설정</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* 관리자 메뉴 */}
          {(user.role === 'admin' || user.role === 'moderator') && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <Icons.shield className="mr-2 h-4 w-4" />
                  <span>관리자 대시보드</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onClick={handleLogout}>
            <Icons.logOut className="mr-2 h-4 w-4" />
            <span>로그아웃</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// 아이콘 컴포넌트 (임시)
const Icons = {
  bell: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  user: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  package: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  heart: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  star: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  settings: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  shield: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  logOut: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
}
