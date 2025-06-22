import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "로컬루언서 미나 | AI 인플루언서와 함께하는 경주 여행",
  description: "AI 인플루언서 미나와 함께 경주의 숨겨진 매력을 발견하세요. 브이로그, 쇼핑, AI 가이드, 사진엽서 등 다양한 서비스를 제공합니다.",
  keywords: "경주, 여행, AI 인플루언서, 미나, 브이로그, 쇼핑, 가이드, 사진엽서",
  authors: [{ name: "로컬루언서 미나" }],
  creator: "로컬루언서 미나",
  publisher: "로컬루언서 미나",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://localuencer-mina.com'),
  alternates: {
    canonical: '/',
    languages: {
      'ko-KR': '/ko',
      'en-US': '/en',
    },
  },
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
  twitter: {
    card: 'summary_large_image',
    title: "로컬루언서 미나 | AI 인플루언서와 함께하는 경주 여행",
    description: "AI 인플루언서 미나와 함께 경주의 숨겨진 매력을 발견하세요.",
    images: ['/mina-hero.png'],
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
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
