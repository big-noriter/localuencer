'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, Check } from 'lucide-react'
import { locales, localeNames, type Locale } from '@/i18n'

/**
 * 언어 선택 컴포넌트
 * 사용자가 웹사이트의 언어를 변경할 수 있는 드롭다운 메뉴
 */
export function LanguageSwitcher() {
  const t = useTranslations('language')
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale() as Locale
  const [isOpen, setIsOpen] = useState(false)

  /**
   * 언어 변경 핸들러
   */
  const handleLanguageChange = (newLocale: Locale) => {
    // 현재 경로에서 언어 부분을 새로운 언어로 교체
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    
    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 hover:bg-accent/50"
          aria-label="언어 선택"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {localeNames[currentLocale]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{localeNames[locale]}</span>
            {currentLocale === locale && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 