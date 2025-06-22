// 지원하는 언어 목록
export const locales = ['ko', 'en', 'ja', 'zh'] as const
export type Locale = (typeof locales)[number]

// 기본 언어
export const defaultLocale: Locale = 'ko'

// 언어별 메타데이터
export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日본語',
  zh: '中문'
} 