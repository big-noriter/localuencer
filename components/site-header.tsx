"use client"
// Next.js의 클라이언트 사이드 네비게이션을 위한 링크 컴포넌트
import Link from "next/link"
import { useState } from "react"
// UI 컴포넌트들 가져오기
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
// 드롭다운 메뉴 컴포넌트들
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// 아이콘 라이브러리에서 필요한 아이콘들 가져오기
import {
  Map,
  Sparkles,
  ImageIcon,
  MessageCircle,
  ShoppingBag,
  Home,
  Video,
  Rss,
  Youtube,
  Instagram,
  Twitter,
  Newspaper,
  Book,
  ChevronDown,
  ShoppingCart,
} from "lucide-react"
// 사용자 메뉴 컴포넌트
import { UserMenu } from "@/components/auth/user-menu"
// 알림 벨 컴포넌트
import { NotificationBell } from "@/components/notifications/notification-bell"
// 다크모드 테마 훅
import { useTheme } from "next-themes"
// 테마 토글 버튼용 아이콘
import { Sun, Moon } from "lucide-react"
// 장바구니 훅
import { useCart } from "@/hooks/use-cart"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
// 다국어 지원
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'

/**
 * 사이트 헤더 컴포넌트
 * 전체 사이트의 상단 네비게이션 바를 렌더링합니다.
 * 
 * 주요 구성 요소:
 * - 로고 (미나 캐릭터 이미지 + 사이트명)
 * - 메인 네비게이션 메뉴 (소개, 브이로그, 가상여행 등)
 * - SNS 드롭다운 메뉴 (YouTube, Instagram, X, Blog, News)
 * - 장바구니 아이콘 (아이템 수 뱃지 포함)
 * - 팔로우 버튼
 * - 테마 토글 버튼 (라이트/다크 모드)
 * - 사용자 메뉴 (로그인/로그아웃)
 * 
 * 반응형 디자인:
 * - 모바일에서는 아이콘만 표시
 * - 데스크톱에서는 텍스트 + 아이콘 표시
 * 
 * 접근성:
 * - aria-label 속성으로 스크린 리더 지원
 * - 키보드 네비게이션 지원
 */
export function SiteHeader() {
  const t = useTranslations('navigation')
  const [isOpen, setIsOpen] = useState(false)
  const { items } = useCart()
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const navigation = [
    {
      title: t('vlogs'),
      href: "/vlogs",
      description: "미나의 경주 여행 브이로그를 만나보세요"
    },
    {
      title: t('shop'),
      href: "/shop",
      description: "경주 특산품과 기념품을 만나보세요"
    },
    {
      title: t('aiGuide'),
      href: "/ai-guide",
      description: "미나와 함께하는 실시간 여행 가이드"
    },
    {
      title: t('photoPostcard'),
      href: "/photo-postcard",
      description: "AI로 만드는 특별한 경주 사진엽서"
    },
    {
      title: t('virtualTravel'),
      href: "/virtual-travel",
      description: "집에서 즐기는 경주 가상 여행"
    },
    {
      title: t('qa'),
      href: "/qa",
      description: "경주 여행에 대한 모든 궁금증을 해결해보세요"
    }
  ]

  const snsLinks = [
    {
      title: "YouTube",
      href: "/sns/youtube",
      description: "미나의 유튜브 채널"
    },
    {
      title: "Instagram",
      href: "/sns/instagram",
      description: "미나의 인스타그램"
    },
    {
      title: "X (Twitter)",
      href: "/sns/x",
      description: "미나의 X 계정"
    },
    {
      title: "Blog",
      href: "/sns/blogspot",
      description: "미나의 블로그"
    },
    {
      title: "News",
      href: "/sns/news",
      description: "미나 관련 뉴스"
    }
  ]

  // 테마 상태 관리 (다크/라이트 모드)
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* 로고 */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"></div>
              <span className="hidden font-bold sm:inline-block">로컬루언서 미나</span>
            </div>
          </Link>
        </div>

        {/* 데스크톱 네비게이션 */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>서비스</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          로컬루언서 미나
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          AI 인플루언서 미나와 함께하는 특별한 경주 여행 경험
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  {navigation.slice(0, 3).map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>더 보기</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {navigation.slice(3).map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>SNS</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {snsLinks.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* 모바일 메뉴 */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <svg
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
              >
                <path
                  d="M3 5h18M3 12h18m-9 7h9"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only">메뉴 토글</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={() => setIsOpen(false)}
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"></div>
              <span className="font-bold">로컬루언서 미나</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    {item.title}
                  </Link>
                ))}
                <div className="pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">SNS</p>
                  {snsLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block text-sm transition-colors hover:text-primary py-1"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* 모바일 로고 */}
          <div className="flex md:hidden">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"></div>
              <span className="font-bold">미나</span>
            </Link>
          </div>

          {/* 우측 액션 버튼들 */}
          <div className="flex items-center space-x-2">
            {/* 언어 선택기 */}
            <LanguageSwitcher />

            {/* 알림 벨 */}
            <NotificationBell />

            {/* 장바구니 버튼 */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M17 18a2 2 0 11-4 0 2 2 0 014 0zM9 18a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
                <span className="sr-only">{t('cart')}</span>
              </Link>
            </Button>

            {/* 사용자 메뉴 */}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}

const ListItem = ({
  className,
  title,
  children,
  href,
  ...props
}: {
  className?: string
  title: string
  children: React.ReactNode
  href: string
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
