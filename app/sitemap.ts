import { MetadataRoute } from 'next'
import { locales } from '@/i18n'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://localuencer-mina.com'
  
  // 기본 페이지들
  const routes = [
    '',
    '/vlogs',
    '/shop',
    '/ai-guide',
    '/photo-postcard',
    '/virtual-travel',
    '/qa',
    '/sns',
    '/auth/login',
    '/auth/signup',
  ]

  // 각 언어별로 사이트맵 생성
  const sitemapEntries: MetadataRoute.Sitemap = []

  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((lang) => [lang, `${baseUrl}/${lang}${route}`])
          ),
        },
      })
    })
  })

  // 추가적인 동적 페이지들 (예: 브이로그 상세 페이지)
  const vlogIds = ['1', '2', '3', '4', '5'] // 실제로는 DB에서 가져와야 함
  const shopIds = ['1', '2', '3', '4', '5'] // 실제로는 DB에서 가져와야 함

  locales.forEach((locale) => {
    // 브이로그 상세 페이지
    vlogIds.forEach((id) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/vlogs/${id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    })

    // 쇼핑 상품 상세 페이지
    shopIds.forEach((id) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/shop/${id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })
  })

  return sitemapEntries
} 
