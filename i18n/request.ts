import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale을 await해야 함 (Next.js 15 준비)
  let locale = await requestLocale;

  // 지원하는 locales 목록
  const locales = ['ko', 'en', 'ja', 'zh'];
  const defaultLocale = 'ko';

  // locale이 유효하지 않으면 기본값 사용
  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale, // 중요: locale을 반드시 반환해야 함
    messages: (await import(`../messages/${locale}.json`)).default
  };
}); 