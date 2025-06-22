// Next.js의 클라이언트 사이드 네비게이션을 위한 링크 컴포넌트
import Link from "next/link"
// 아바타 UI 컴포넌트
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// 소셜 미디어 아이콘
import { Instagram, Youtube, Twitter } from "lucide-react"
// 다국어 지원
import { useTranslations } from 'next-intl'

/**
 * 사이트 푸터 컴포넌트
 * 웹사이트 하단에 표시되는 푸터 영역을 렌더링합니다.
 * - 로고 및 소개
 * - 콘텐츠 링크
 * - 소통 채널 링크
 * - 쇼핑 카테고리 링크
 * - 저작권 정보
 */
export default function SiteFooter() {
  const t = useTranslations('navigation')
  const tFooter = useTranslations('footer')
  
  // 콘텐츠 관련 링크 목록
  const contentLinks = [
    { href: "/vlogs", label: t('vlogs') },
    { href: "/photo-postcard", label: t('photoPostcard') },
    { href: "/ai-guide", label: t('aiGuide') },
    { href: "/virtual-travel", label: t('virtualTravel') },
  ]

  // 소통 관련 링크 목록
  const communicationLinks = [
    { href: "/qa", label: t('qa') },
    { href: "/", label: t('home') },
  ]

  // 쇼핑 카테고리 링크 목록
  const shoppingLinks = [
    { href: "/shop", label: "Fashion" },
    { href: "/shop?category=beauty", label: "Beauty" },
    { href: "/shop?category=lifestyle", label: "Lifestyle" },
  ]

  return (
    <footer className="bg-footer-bg text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* 푸터 상단 그리드 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* 왼쪽: 로고 및 소개 */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2" aria-label="홈으로 이동">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/mina-casual.png" alt="미나 로컬루언서 로고" />
                <AvatarFallback className="text-black">미나</AvatarFallback>
              </Avatar>
              <span className="font-bold text-xl text-white">로컬루언서 미나</span>
            </Link>
            <p className="text-sm">AI 로컬루언서 미나가 소개하는 아름다운 경주 이야기.</p>
            
            {/* 소셜 미디어 링크 */}
            <div className="flex space-x-3">
              <Link href="#" className="hover:text-white" aria-label="인스타그램으로 이동">
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link href="#" className="hover:text-white" aria-label="유튜브로 이동">
                <Youtube className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link href="#" className="hover:text-white" aria-label="트위터로 이동">
                <Twitter className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* 콘텐츠 링크 섹션 */}
          <div>
            <h5 className="font-semibold text-white mb-3">{tFooter('services')}</h5>
            <ul className="space-y-2">
              {contentLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="hover:text-white text-sm transition-colors"
                    aria-label={`${link.label}로 이동`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 소통 링크 섹션 */}
          <div>
            <h5 className="font-semibold text-white mb-3">{tFooter('quickLinks')}</h5>
            <ul className="space-y-2">
              {communicationLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="hover:text-white text-sm transition-colors"
                    aria-label={`${link.label}로 이동`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 쇼핑 링크 섹션 */}
          <div>
            <h5 className="font-semibold text-white mb-3">{t('shop')}</h5>
            <ul className="space-y-2">
              {shoppingLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="hover:text-white text-sm transition-colors"
                    aria-label={`${link.label} 카테고리로 이동`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 저작권 정보 */}
        <div className="border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {tFooter('copyright')}</p>
          <p className="text-xs mt-1">
            {tFooter('description')}
          </p>
        </div>
      </div>
    </footer>
  )
}

// Named export도 추가
export { SiteFooter }
