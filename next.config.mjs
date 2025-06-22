/**
 * Next.js 설정 파일
 * 성능 최적화, 이미지 최적화, 코드 스플리팅 등의 설정
 */

import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 서버 외부 패키지 설정
  serverExternalPackages: ['sharp'],

  // 실험적 기능 활성화
  experimental: {
    // 메모리 최적화
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // 이미지 최적화 설정
  images: {
    // 지원할 이미지 형식 (WebP, AVIF 우선)
    formats: ['image/avif', 'image/webp'],
    // 외부 이미지 도메인 허용
    domains: [
      'localhost',
      'localuencer-mina.com',
      'maps.googleapis.com',
      'maps.gstatic.com',
      'streetviewpixels-pa.googleapis.com',
      'earth.google.com',
      'www.gstatic.com'
    ],
    // 이미지 크기 설정
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 지연 로딩 기본 활성화
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 압축 설정
  compress: true,

  // 웹팩 설정 커스터마이징
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 프로덕션 환경에서 번들 분석기 활성화
    if (!dev && !isServer) {
      // 번들 분석기 (선택적)
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        )
      }
    }

    // SVG 파일을 React 컴포넌트로 처리
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://www.gstatic.com https://earth.google.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: blob: https: http:;
              connect-src 'self' https://api.openai.com https://maps.googleapis.com https://earth.google.com;
              frame-src 'self' https://www.google.com https://earth.google.com https://maps.google.com;
              media-src 'self' blob: data:;
              worker-src 'self' blob:;
            `.replace(/\s+/g, ' ').trim()
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
      // 정적 자산 캐싱
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 이미지 캐싱
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      // www 없는 도메인으로 리다이렉트
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.localuencer-mina.com',
          },
        ],
        destination: 'https://localuencer-mina.com/:path*',
        permanent: true,
      },
    ]
  },

  // TypeScript 설정
  typescript: {
    // 빌드 시 타입 에러 무시 (개발 시에만 사용)
    ignoreBuildErrors: false,
  },

  // ESLint 설정
  eslint: {
    // 빌드 시 린트 에러 무시 (개발 시에만 사용)
    ignoreDuringBuilds: false,
  },

  // 런타임 설정
  poweredByHeader: false,

  // 트레일링 슬래시 설정
  trailingSlash: false,

  // 페이지 확장자 설정
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // 개발 서버 설정
  devIndicators: {
    position: 'bottom-right',
  },

  // 성능 모니터링
  productionBrowserSourceMaps: false,

  // 국제화 설정
  i18n: undefined, // next-intl을 사용하므로 비활성화

  // 환경 변수 설정
  env: {
    CUSTOM_KEY: 'my-value',
  },
}

export default withNextIntl(nextConfig)
