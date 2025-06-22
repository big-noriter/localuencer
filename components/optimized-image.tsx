'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { 
  useLazyImage, 
  generateResponsiveSizes, 
  generateBlurDataURL,
  supportsWebP,
  supportsAVIF
} from '@/lib/image-optimization'

/**
 * 최적화된 이미지 컴포넌트
 * 지연 로딩, 반응형 이미지, WebP/AVIF 지원, 블러 플레이스홀더
 */

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  lazy?: boolean
  responsive?: boolean
  aspectRatio?: number
  fallbackSrc?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 80,
  sizes,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  lazy = true,
  responsive = true,
  aspectRatio,
  fallbackSrc = '/placeholder.jpg'
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [supportedFormat, setSupportedFormat] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)

  // 지연 로딩 훅 사용
  const { imgRef, src: lazySrc, isInView } = useLazyImage(
    currentSrc,
    { threshold: 0.1, rootMargin: '50px' }
  )

  /**
   * 지원되는 이미지 형식 확인
   */
  useEffect(() => {
    const checkFormats = async () => {
      if (await supportsAVIF()) {
        setSupportedFormat('avif')
      } else if (await supportsWebP()) {
        setSupportedFormat('webp')
      } else {
        setSupportedFormat('jpeg')
      }
    }

    checkFormats()
  }, [])

  /**
   * 최적화된 이미지 URL 생성
   */
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc.startsWith('/') && !originalSrc.startsWith('http')) {
      return originalSrc
    }

    const params = new URLSearchParams()
    params.set('q', quality.toString())
    
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    if (supportedFormat) params.set('f', supportedFormat)

    return `${originalSrc}?${params.toString()}`
  }

  /**
   * 반응형 sizes 생성
   */
  const getResponsiveSizes = () => {
    if (sizes) return sizes
    if (!responsive) return undefined

    if (width && height) {
      return generateResponsiveSizes({
        mobile: Math.min(width, 640),
        tablet: Math.min(width, 768),
        desktop: Math.min(width, 1024),
        largeDesktop: width
      })
    }

    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  }

  /**
   * 블러 플레이스홀더 생성
   */
  const getBlurDataURL = () => {
    if (blurDataURL) return blurDataURL
    if (placeholder === 'empty') return undefined

    return generateBlurDataURL(10, 10, '#f3f4f6')
  }

  /**
   * 이미지 로드 핸들러
   */
  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  /**
   * 이미지 에러 핸들러
   */
  const handleError = () => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(true)
    } else {
      onError?.()
    }
  }

  /**
   * 컨테이너 스타일 계산
   */
  const getContainerStyle = () => {
    const style: React.CSSProperties = {}

    if (aspectRatio && !fill) {
      style.aspectRatio = aspectRatio.toString()
    }

    if (width && height && !fill) {
      style.width = width
      style.height = height
    }

    return style
  }

  /**
   * 실제 사용할 src 결정
   */
  const finalSrc = lazy && !priority ? (isInView ? lazySrc : undefined) : currentSrc
  const optimizedSrc = finalSrc ? getOptimizedSrc(finalSrc) : undefined

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        !fill && 'inline-block',
        className
      )}
      style={getContainerStyle()}
    >
      {/* 로딩 상태 */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {/* 에러 상태 */}
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-500">
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">이미지를 불러올 수 없습니다</span>
        </div>
      )}

      {/* 실제 이미지 */}
      {optimizedSrc && (
        <Image
          ref={lazy ? imgRef : undefined}
          src={optimizedSrc}
          alt={alt}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          fill={fill}
          sizes={getResponsiveSizes()}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={getBlurDataURL()}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            objectFit && `object-${objectFit}`,
            objectPosition && `object-${objectPosition}`
          )}
          style={{
            objectFit: fill ? objectFit : undefined,
            objectPosition: fill ? objectPosition : undefined
          }}
          onLoad={handleLoad}
          onError={handleError}
          unoptimized={false}
        />
      )}

      {/* 로딩 오버레이 */}
      {!isLoaded && optimizedSrc && (
        <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm" />
      )}
    </div>
  )
}

/**
 * 아바타용 최적화된 이미지
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  fallbackSrc = '/placeholder-user.jpg'
}: {
  src: string
  alt: string
  size?: number
  className?: string
  fallbackSrc?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      quality={90}
      priority={false}
      lazy={true}
      responsive={false}
      fallbackSrc={fallbackSrc}
      aspectRatio={1}
    />
  )
}

/**
 * 히어로 이미지용 최적화된 컴포넌트
 */
export function OptimizedHeroImage({
  src,
  alt,
  className,
  priority = true
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill={true}
      className={cn('w-full h-full', className)}
      quality={85}
      priority={priority}
      lazy={!priority}
      responsive={true}
      objectFit="cover"
      objectPosition="center"
      sizes="100vw"
    />
  )
}

/**
 * 썸네일용 최적화된 이미지
 */
export function OptimizedThumbnail({
  src,
  alt,
  width = 300,
  height = 200,
  className,
  aspectRatio = 3/2
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  aspectRatio?: number
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('rounded-lg', className)}
      quality={75}
      priority={false}
      lazy={true}
      responsive={true}
      aspectRatio={aspectRatio}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  )
}

/**
 * 갤러리용 최적화된 이미지
 */
export function OptimizedGalleryImage({
  src,
  alt,
  className,
  onClick
}: {
  src: string
  alt: string
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      className={cn(
        'cursor-pointer transition-transform hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill={true}
        className="rounded-lg"
        quality={80}
        priority={false}
        lazy={true}
        responsive={true}
        objectFit="cover"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
    </div>
  )
}

/**
 * 제품 이미지용 최적화된 컴포넌트
 */
export function OptimizedProductImage({
  src,
  alt,
  width = 400,
  height = 400,
  className,
  zoom = false
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  zoom?: boolean
}) {
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg',
        zoom && 'cursor-zoom-in',
        className
      )}
      onClick={() => zoom && setIsZoomed(!isZoomed)}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-transform duration-300',
          isZoomed && 'scale-150'
        )}
        quality={90}
        priority={false}
        lazy={true}
        responsive={true}
        aspectRatio={1}
        objectFit="cover"
      />
    </div>
  )
} 