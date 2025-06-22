import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import { SiteHeader } from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Toaster } from "@/components/ui/sonner"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales } from '@/i18n'
import { notFound } from 'next/navigation'
import SchemaOrg, { combineSchemas } from "@/components/schema-org"
import { 
  createWebSiteSchema, 
  createOrganizationSchema, 
  createPersonSchema 
} from "@/lib/schema"

const inter = Inter({ subsets: ["latin"] })

// 기본 구조화 데이터 생성
const getBaseSchemas = (locale: string) => {
  const baseUrl = 'https://localuencer-mina.com'
  const localeUrl = `${baseUrl}/${locale}`

  // 웹사이트 스키마
  const websiteSchema = createWebSiteSchema({
    name: locale === 'ko' ? '로컬루언서 미나' : 'Localuencer Mina',
    url: localeUrl,
    description: locale === 'ko' 
      ? 'AI 인플루언서 미나와 함께 경주의 숨겨진 매력을 발견하세요.' 
      : 'Discover the hidden charms of Gyeongju with AI influencer Mina.',
    inLanguage: locale === 'ko' ? 'ko-KR' : locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'zh-CN',
    searchUrl: `${localeUrl}/search`
  })

  // 조직 스키마
  const organizationSchema = createOrganizationSchema({
    name: locale === 'ko' ? '로컬루언서 미나' : 'Localuencer Mina',
    url: localeUrl,
    logo: `${baseUrl}/placeholder-logo.png`,
    description: locale === 'ko' 
      ? '경주 지역 AI 인플루언서 미나를 통한 관광 플랫폼' 
      : 'Tourism platform through Gyeongju local AI influencer Mina',
    sameAs: [
      'https://www.youtube.com/channel/localuencer-mina',
      'https://www.instagram.com/localuencer.mina',
      'https://twitter.com/localuencer_mina'
    ],
    contactPoints: [
      {
        telephone: '+82-10-1234-5678',
        email: 'contact@localuencer-mina.com',
        contactType: 'customer service'
      }
    ]
  })

  // 인플루언서(사람) 스키마
  const personSchema = createPersonSchema({
    name: '미나',
    url: localeUrl,
    image: `${baseUrl}/mina-hero.png`,
    description: locale === 'ko' 
      ? '경주를 사랑하는 AI 인플루언서' 
      : 'AI influencer who loves Gyeongju',
    jobTitle: locale === 'ko' ? 'AI 인플루언서' : 'AI Influencer',
    sameAs: [
      'https://www.youtube.com/channel/localuencer-mina',
      'https://www.instagram.com/localuencer.mina',
      'https://twitter.com/localuencer_mina'
    ]
  })

  return combineSchemas(websiteSchema, organizationSchema, personSchema)
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const { locale } = params
  const messages = await getMessages({ locale })
  
  const titles = {
    ko: "로컬루언서 미나 | AI 인플루언서와 함께하는 경주 여행",
    en: "Localuencer Mina | Gyeongju Travel with AI Influencer",
    ja: "ローカルインフルエンサー ミナ | AIインフルエンサーと慶州旅行",
    zh: "本地影响者美娜 | 与AI影响者一起的庆州旅行"
  }
  
  const descriptions = {
    ko: "AI 인플루언서 미나와 함께 경주의 숨겨진 매력을 발견하세요. 브이로그, 쇼핑, AI 가이드, 사진엽서 등 다양한 서비스를 제공합니다.",
    en: "Discover the hidden charms of Gyeongju with AI influencer Mina. We provide various services including vlogs, shopping, AI guide, and photo postcards.",
    ja: "AIインフルエンサーのミナと一緒に慶州の隠れた魅力を発見しましょう。ブログ、ショッピング、AIガイド、写真はがきなど様々なサービスを提供します。",
    zh: "与AI影响者美娜一起发现庆州的隐藏魅力。我们提供包括视频博客、购物、AI导游、照片明信片等各种服务。"
  }

  return {
    title: titles[locale as keyof typeof titles] || titles.ko,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.ko,
    authors: [{ name: "로컬루언서 미나" }],
    creator: "로컬루언서 미나",
    publisher: "로컬루언서 미나",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://localuencer-mina.com'),
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: '미나',
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'ko-KR': '/ko',
        'en-US': '/en',
        'ja-JP': '/ja',
        'zh-CN': '/zh',
      },
    },
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.ko,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.ko,
      url: `https://localuencer-mina.com/${locale}`,
      siteName: '로컬루언서 미나',
      locale: locale,
      alternateLocale: locales.filter(l => l !== locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.ko,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.ko,
      creator: '@localuencer_mina',
    },
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
    icons: {
      icon: [
        { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
        { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
      ],
    },
  }
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params
  
  // 지원하지 않는 언어인 경우 404 처리
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // locale을 명시적으로 넘겨줌
  const messages = await getMessages({ locale })

  // 현재 로케일에 맞는 구조화 데이터 생성
  const baseSchemas = getBaseSchemas(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <SchemaOrg schema={baseSchemas} />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <NotificationProvider>
                <PWAProvider>
                  <div className="relative flex min-h-screen flex-col">
                    <SiteHeader />
                    <main className="flex-1">{children}</main>
                    <SiteFooter />
                  </div>
                  <Toaster />
                </PWAProvider>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
} 