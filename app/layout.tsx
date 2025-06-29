import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { PWAProvider } from "@/components/pwa/pwa-provider"

/**
 * 폰트 설정
 * 
 * Inter 폰트를 사용하며, 라틴 문자만 포함하여 폰트 크기를 최적화합니다.
 */
const inter = Inter({ subsets: ["latin"] })

/**
 * 메타데이터 설정
 * 
 * 웹사이트의 기본 메타데이터를 정의합니다.
 * SEO 및 소셜 미디어 공유를 위한 정보가 포함되어 있습니다.
 */
export const metadata: Metadata = {
  // 기본 메타데이터
  title: "로컬루언서 미나",
  description: "AI 인플루언서 미나와 함께하는 경주 여행",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  
  // 애플 웹앱 설정
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "로컬루언서 미나",
  },
  
  // 뷰포트 설정
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  
  // 기타 메타데이터
  other: {
    "mobile-web-app-capable": "yes",
  },
  
  // 키워드
  keywords: "경주, 여행, AI 인플루언서, 미나, 브이로그, 쇼핑, 가이드, 사진엽서",
  
  // 작성자 정보
  authors: [{ name: "로컬루언서 미나" }],
  creator: "로컬루언서 미나",
  publisher: "로컬루언서 미나",
  
  // 연락처 감지 비활성화
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // 기본 URL 설정
  metadataBase: new URL('https://localuencer-mina.com'),
  
  // 대체 URL 설정
  alternates: {
    canonical: '/',
    languages: {
      'ko-KR': '/ko',
      'en-US': '/en',
    },
  },
  
  // 오픈 그래프 설정 (소셜 미디어 공유)
  openGraph: {
    title: "로컬루언서 미나 | AI 인플루언서와 함께하는 경주 여행",
    description: "AI 인플루언서 미나와 함께 경주의 숨겨진 매력을 발견하세요.",
    url: 'https://localuencer-mina.com',
    siteName: '로컬루언서 미나',
    images: [
      {
        url: '/mina-hero.png',
        width: 1200,
        height: 630,
        alt: '로컬루언서 미나',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  
  // 트위터 카드 설정
  twitter: {
    card: 'summary_large_image',
    title: "로컬루언서 미나 | AI 인플루언서와 함께하는 경주 여행",
    description: "AI 인플루언서 미나와 함께 경주의 숨겨진 매력을 발견하세요.",
    images: ['/mina-hero.png'],
    creator: '@localuencer_mina',
  },
  
  // 검색 엔진 설정
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // 사이트 인증 코드
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-site-verification-code',
  },
}

/**
 * 루트 레이아웃 컴포넌트
 * 
 * 모든 페이지의 기본 레이아웃을 정의합니다.
 * 테마, 인증, 알림, PWA 기능을 제공하는 프로바이더가 포함되어 있습니다.
 * 
 * @param children 자식 컴포넌트
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 앱 아이콘 및 파비콘 설정 */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {/* 테마 프로바이더 - 다크/라이트 모드 지원 */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 인증 프로바이더 - 사용자 인증 관리 */}
          <AuthProvider>
            {/* 알림 프로바이더 - 사용자 알림 관리 */}
            <NotificationProvider>
              {/* PWA 프로바이더 - 프로그레시브 웹 앱 기능 */}
              <PWAProvider>
                {children}
              </PWAProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
