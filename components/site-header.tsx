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
  MapPin,
  Brain,
  Calendar,
  Route,
  Camera,
  Bot,
  Globe,
  User,
  HelpCircle
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
 * 새로운 메뉴 구조:
 * 1. 인플루언서 미나 (브이로그, YouTube, Instagram, X, Blog, News)
 * 2. 미나와 경주여행 (여행계획, 추천일정, 지도여행, 챗봇가이드, 가상여행, 사진엽서)
 * 3. 지역상품
 * 4. Q&A
 */
export function SiteHeader() {
  const t = useTranslations('navigation')
  const [isOpen, setIsOpen] = useState(false)
  const { items } = useCart()
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // 1. 인플루언서 미나 메뉴
  const influencerMenuItems = [
    {
      title: "브이로그",
      href: "/vlogs",
      description: "미나의 경주 여행 브이로그를 만나보세요",
      icon: Video
    },
    {
      title: "YouTube",
      href: "/sns/youtube",
      description: "미나의 유튜브 채널",
      icon: Youtube
    },
    {
      title: "Instagram",
      href: "/sns/instagram",
      description: "미나의 인스타그램",
      icon: Instagram
    },
    {
      title: "X (Twitter)",
      href: "/sns/x",
      description: "미나의 X 계정",
      icon: Twitter
    },
    {
      title: "Blog",
      href: "/sns/blogspot",
      description: "미나의 블로그",
      icon: Rss
    },
    {
      title: "News",
      href: "/sns/news",
      description: "미나 관련 뉴스",
      icon: Newspaper
    }
  ]

  // 2. 미나와 경주여행 메뉴
  const travelMenuItems = [
    {
      title: "여행계획",
      href: "/ai-travel-planner",
      description: "AI가 추천하는 맞춤형 여행 계획 수립",
      icon: Calendar
    },
    {
      title: "추천일정",
      href: "/recommended-itinerary",
      description: "생성된 여행 일정 확인 및 관리",
      icon: Route
    },
    {
      title: "지도여행",
      href: "/map-travel",
      description: "모든 관광지를 지도와 360도 뷰로 탐험",
      icon: Map
    },
    {
      title: "챗봇가이드",
      href: "/ai-guide",
      description: "미나와 함께하는 실시간 여행 가이드",
      icon: Bot
    },
    {
      title: "가상여행",
      href: "/virtual-travel",
      description: "집에서 즐기는 경주 가상 여행",
      icon: Globe
    },
    {
      title: "사진엽서",
      href: "/photo-postcard",
      description: "AI로 만드는 특별한 경주 사진엽서",
      icon: Camera
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
            {/* 1. 인플루언서 미나 */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="flex items-center gap-2">
                <User className="w-4 h-4" />
                인플루언서 미나
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[500px] lg:w-[600px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-6">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md relative overflow-hidden"
                        href="/vlogs"
                      >
                        {/* 과잠바 입은 미나의 반투명 배경 이미지 */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                          style={{
                            backgroundImage: 'url(/mina-casual.png)',
                            backgroundPosition: 'center bottom'
                          }}
                        />
                        <div className="relative z-10">
                          <div className="mb-2 mt-4 text-lg font-medium">
                            인플루언서 미나
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            경주의 매력을 전하는 AI 인플루언서 미나의 다양한 콘텐츠를 만나보세요
                          </p>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  {influencerMenuItems.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                      icon={item.icon}
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* 2. 미나와 경주여행 */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                미나와 경주여행
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[600px] lg:w-[700px] lg:grid-cols-2">
                  {travelMenuItems.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                      icon={item.icon}
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* 3. 지역상품 */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link 
                  href="/shop"
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  지역상품
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* 4. Q&A */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link 
                  href="/qa"
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Q&A
                </Link>
              </NavigationMenuLink>
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
              <div className="flex flex-col space-y-4">
                {/* 모바일: 인플루언서 미나 */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    인플루언서 미나
                  </p>
                  <div className="flex flex-col space-y-2 ml-6">
                    {influencerMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 text-sm transition-colors hover:text-primary"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 모바일: 미나와 경주여행 */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    미나와 경주여행
                  </p>
                  <div className="flex flex-col space-y-2 ml-6">
                    {travelMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 text-sm transition-colors hover:text-primary"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 모바일: 지역상품 */}
                <Link
                  href="/shop"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>지역상품</span>
                </Link>

                {/* 모바일: Q&A */}
                <Link
                  href="/qa"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Q&A</span>
                </Link>
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
  icon: Icon,
  ...props
}: {
  className?: string
  title: string
  children: React.ReactNode
  href: string
  icon?: React.ComponentType<any>
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
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="h-4 w-4" />}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
